/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { useTenant, useTenantData } from './hooks/useAtendly';
import BookingFlow from './components/BookingFlow';
import AdminDashboard from './components/AdminDashboard';
import ChatWidget from './components/ChatWidget';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Simple routing logic for MVP
  // / -> Landing (Demo Selector)
  // /:slug -> Booking Page
  // /:slug/admin -> Admin Dashboard
  
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  if (path === '/') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (path === '/new-company') {
    return <CreateCompany onNavigate={navigate} />;
  }

  const parts = path.split('/').filter(Boolean);
  const slug = parts[0];
  const isAdmin = parts[1] === 'admin';

  return <TenantApp slug={slug} isAdmin={isAdmin} onNavigate={navigate} />;
}

function LandingPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tenants')
      .then(res => res.json())
      .then(data => setTenants(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Atendly AI</h1>
          <p className="text-xl text-gray-600">Plataforma de agendamento inteligente para seu negócio.</p>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={() => onNavigate('/new-company')} 
            className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
          >
            + Criar Nova Empresa
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map(tenant => (
              <div 
                key={tenant.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all text-left flex flex-col h-full"
              >
                <div 
                  className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: tenant.theme_color || '#000' }}
                >
                  {tenant.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{tenant.name}</h3>
                <p className="text-gray-500 text-sm mb-4 flex-1">/{tenant.slug}</p>
                
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => onNavigate(`/${tenant.slug}`)}
                    className="flex-1 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 py-2 rounded-md transition-colors"
                  >
                    Agendar
                  </button>
                  <button 
                    onClick={() => onNavigate(`/${tenant.slug}/admin`)}
                    className="flex-1 text-center text-sm font-medium text-gray-600 hover:bg-gray-50 py-2 rounded-md transition-colors"
                  >
                    Admin
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateCompany({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [segment, setSegment] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, segment, theme_color: '#000000' })
      });
      if (res.ok) {
        onNavigate(`/${slug}/admin`);
      } else {
        alert('Erro ao criar empresa. Verifique se o slug já existe.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar Nova Empresa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
            <input 
              required
              className="w-full p-2 border rounded-lg"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL (Slug)</label>
            <input 
              required
              className="w-full p-2 border rounded-lg bg-gray-50"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
            <select 
              className="w-full p-2 border rounded-lg"
              value={segment}
              onChange={e => setSegment(e.target.value)}
            >
              <option value="general">Geral</option>
              <option value="beauty">Beleza / Estética</option>
              <option value="health">Saúde</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Empresa'}
          </button>
          <button 
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full text-gray-500 text-sm hover:text-gray-900"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

function TenantApp({ slug, isAdmin, onNavigate }: { slug: string, isAdmin: boolean, onNavigate: (p: string) => void }) {
  const { tenant, loading } = useTenant(slug);
  const { services, professionals, appointments, refreshAppointments } = useTenantData(tenant?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Empresa não encontrada</h2>
        <button onClick={() => onNavigate('/')} className="text-blue-600 hover:underline">Voltar ao início</button>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminDashboard tenant={tenant} appointments={appointments} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <BookingFlow 
        tenant={tenant} 
        services={services} 
        professionals={professionals} 
        onSuccess={refreshAppointments}
      />
      <ChatWidget tenant={tenant} />
      <div className="text-center mt-8">
        <button onClick={() => onNavigate('/')} className="text-sm text-gray-500 hover:text-gray-900">
          &larr; Voltar para demos
        </button>
      </div>
    </div>
  );
}
