import { db } from "./db";
import { handleChat, handleMultiAgentChat } from "./ai";

const BASE_URL = process.env.MEGAAPI_URL || "https://apibusiness1.megaapi.com.br";

export async function sendMessage(instanceKey: string, to: string, message: string) {
  try {
    const url = `${BASE_URL}/rest/sendMessage/${instanceKey}/textMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        phone: to,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send WhatsApp message: ${response.status} ${errorText}`);
      // Don't throw here to avoid crashing the webhook handler loop
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return null;
  }
}

export async function configureWebhook(instanceKey: string, webhookUrl: string) {
  try {
    const url = `${BASE_URL}/rest/webhook/${instanceKey}/configWebhook`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhookUrl: webhookUrl,
        webhookEnabled: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to configure webhook: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error configuring webhook:", error);
    throw error;
  }
}

export async function getQrCode(instanceKey: string) {
  try {
    const url = `${BASE_URL}/rest/instance/qrcode_base64/${instanceKey}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get QR Code: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting QR Code:", error);
    throw error;
  }
}

export async function getInstanceStatus(instanceKey: string) {
  try {
    const url = `${BASE_URL}/rest/instance/${instanceKey}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get instance status: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting instance status:", error);
    throw error;
  }
}

export async function handleIncomingMessage(payload: any) {
  console.log("Received WhatsApp Webhook Payload:", JSON.stringify(payload, null, 2));

  try {
    // 1. Extract Info
    // MegaAPI structure usually puts data in 'data' or at root depending on event type
    // Assuming 'message' event structure
    const data = payload.data || payload;
    
    // Ignore status updates or messages from me
    if (!data || !data.key || data.key.fromMe) {
      return { ignored: true };
    }

    const instanceKey = payload.instance_key;
    const remoteJid = data.key.remoteJid; // e.g., 5511999999999@s.whatsapp.net
    const pushName = data.pushName || "Cliente";
    
    // Extract text content
    let messageContent = "";
    if (data.message) {
      messageContent = 
        data.message.conversation || 
        data.message.extendedTextMessage?.text || 
        data.message.imageMessage?.caption || 
        "";
    }

    if (!messageContent || !instanceKey || !remoteJid) {
      console.log("Missing required fields in webhook payload");
      return { error: "Missing fields" };
    }

    // 2. Identify Tenant
    const tenantRes = await db.query("SELECT tenant_id FROM whatsapp_config WHERE instance_key = $1", [instanceKey]);
    if (tenantRes.rows.length === 0) {
      console.error(`No tenant found for instance key: ${instanceKey}`);
      return { error: "Tenant not found" };
    }
    const tenantId = tenantRes.rows[0].tenant_id;

    // 3. Save User Message
    await db.query(
      "INSERT INTO messages (tenant_id, contact_id, role, content, platform) VALUES ($1, $2, 'user', $3, 'whatsapp')",
      [tenantId, remoteJid, messageContent]
    );

    // 4. Get Chat History
    // Limit to last 10 messages for context
    const historyRes = await db.query(
      "SELECT role, content FROM messages WHERE tenant_id = $1 AND contact_id = $2 ORDER BY created_at DESC LIMIT 10",
      [tenantId, remoteJid]
    );
    
    // Reverse to chronological order
    const history = historyRes.rows.reverse().map(row => ({
      role: row.role === 'user' ? 'user' : 'model',
      text: row.content
    }));

    // 5. Generate AI Response (Multi-Agent with Auto-Routing)
    let aiResponse: string;
    let agentInfo = '';

    // Check if there are active agents for this tenant
    const agentsRes = await db.query(
      "SELECT id, name, agent_type FROM agents WHERE tenant_id = $1 AND is_active = true LIMIT 1",
      [tenantId]
    );

    if (agentsRes.rows.length > 0) {
      // Use multi-agent chat with auto-routing
      const result = await handleMultiAgentChat(messageContent, tenantId, history, {
        auto_route: true
      });
      aiResponse = result.response;
      if (result.routed && result.agent_type_detected) {
        agentInfo = `\n\n[Atendendo como: ${result.agent_type_detected}]`;
      }
    } else {
      // Fallback to legacy single-agent
      aiResponse = await handleChat(messageContent, tenantId, history);
    }

    // Append agent info if applicable
    if (agentInfo) {
      aiResponse += agentInfo;
    }

    // 6. Save AI Response
    await db.query(
      "INSERT INTO messages (tenant_id, contact_id, role, content, platform) VALUES ($1, $2, 'assistant', $3, 'whatsapp')",
      [tenantId, remoteJid, aiResponse]
    );

    // 7. Send Response via WhatsApp
    // Clean up JID if needed (usually API expects just the number or JID)
    // MegaAPI usually takes the phone number (e.g., 5511999999999)
    const phone = remoteJid.replace('@s.whatsapp.net', '');
    
    await sendMessage(instanceKey, phone, aiResponse);

    return { success: true };

  } catch (error) {
    console.error("Error handling incoming message:", error);
    return { error: "Internal error" };
  }
}
