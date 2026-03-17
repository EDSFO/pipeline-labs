#!/usr/bin/env python3
"""
Generate infographics using OpenRouter API with Gemini image generation.
"""

import os
import sys
import json
import base64
import argparse
import requests
from pathlib import Path

def generate_infographic(prompt, api_key=None, output_path=None):
    """
    Generate an infographic using OpenRouter API.

    Args:
        prompt: Description of the infographic to generate
        api_key: OpenRouter API key (or use OPENROUTER_API_KEY env var)
        output_path: Path to save the generated image

    Returns:
        Path to the saved image file
    """
    api_key = api_key or os.environ.get('OPENROUTER_API_KEY')

    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not found. Set it as environment variable or pass as parameter.")

    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "google/gemini-3-pro-image-preview",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "modalities": ["image", "text"]
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()

        result = response.json()

        # Extract base64 image from response
        # The exact structure may vary, adjust as needed
        image_data = None

        if 'choices' in result and len(result['choices']) > 0:
            choice = result['choices'][0]

            # Check for image in reasoning_details (Gemini format)
            if 'message' in choice and 'reasoning_details' in choice['message']:
                reasoning_details = choice['message']['reasoning_details']
                if isinstance(reasoning_details, list):
                    for detail in reasoning_details:
                        if isinstance(detail, dict) and detail.get('format') == 'google-gemini-v1':
                            # Look for base64 image in data or text field
                            if 'data' in detail:
                                image_data = detail['data']
                                break
                            text = detail.get('text', '')
                            if len(text) > 1000:  # Base64 images are long
                                image_data = text
                                break

            # Check for image in message content
            if not image_data and 'message' in choice and 'content' in choice['message']:
                content = choice['message']['content']

                # If content is a list (multimodal response)
                if isinstance(content, list):
                    for item in content:
                        if isinstance(item, dict) and item.get('type') == 'image':
                            image_data = item.get('data') or item.get('image')
                            break
                # If content contains base64 directly
                elif isinstance(content, str) and len(content) > 100:
                    image_data = content

        if not image_data:
            raise ValueError(f"No image data found in response. Response: {json.dumps(result, indent=2)}")

        # Remove data URI prefix if present
        if image_data.startswith('data:image'):
            image_data = image_data.split(',', 1)[1]

        # Clean the base64 string - remove any whitespace
        image_data = image_data.strip().replace('\n', '').replace('\r', '').replace(' ', '')

        # Fix padding if needed
        padding = len(image_data) % 4
        if padding:
            image_data += '=' * (4 - padding)

        # Decode base64
        image_bytes = base64.b64decode(image_data)

        # Save to file
        if not output_path:
            output_path = "infographic.png"

        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, 'wb') as f:
            f.write(image_bytes)

        print(f"Infographic saved to: {output_file}")
        return str(output_file)

    except requests.exceptions.RequestException as e:
        raise Exception(f"API request failed: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to generate infographic: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description='Generate infographics using OpenRouter API')
    parser.add_argument('prompt', help='Description of the infographic to generate')
    parser.add_argument('--output', '-o', default='infographic.png', help='Output file path')
    parser.add_argument('--api-key', '-k', help='OpenRouter API key (or use OPENROUTER_API_KEY env var)')

    args = parser.parse_args()

    try:
        output_file = generate_infographic(args.prompt, args.api_key, args.output)
        print(f"Success! Infographic saved to: {output_file}")
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
