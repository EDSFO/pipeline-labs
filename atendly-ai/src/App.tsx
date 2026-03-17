/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { useTenant, useTenantData } from './hooks/useAtendly';
import AdminDashboard from './components/AdminDashboard';
import ChatWidget from './components/ChatWidget';
import { Loader2 } from 'lucide-react';

// Material Symbols Icons
const MaterialIcon = ({ icon, filled = false, className = '' }: { icon: string; filled?: boolean; className?: string }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
  >
    {icon}
  </span>
);

const SmartToy = () => <MaterialIcon icon="smart_toy" className="w-5 h-5" />;
const Bolt = () => <MaterialIcon icon="bolt" className="w-4 h-4" />;

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [loggedInTenant, setLoggedInTenant] = useState<any>(null);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  const handleLogin = (tenant: any) => {
    setLoggedInTenant(tenant);
    navigate(`/${tenant.slug}`);
  };

  const handleLogout = () => {
    setLoggedInTenant(null);
    navigate('/');
  };

  if (path === '/') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (path === '/new-company') {
    return <CreateCompany onNavigate={navigate} />;
  }

  if (path === '/home' && loggedInTenant) {
    return <TenantApp tenant={loggedInTenant} onNavigate={navigate} onLogout={handleLogout} />;
  }

  const parts = path.split('/').filter(Boolean);
  const slug = parts[0];

  if (!slug) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <TenantApp slug={slug} onNavigate={navigate} onLogout={handleLogout} />;
}

function LoginPage({ onLogin }: { onLogin: (tenant: any) => void }) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  useEffect(() => {
    fetch('/api/tenants')
      .then(res => res.json())
      .then(data => setTenants(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = () => {
    if (selectedTenant) {
      onLogin(selectedTenant);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0"></div>

      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <div className="max-w-md w-full space-y-12">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="size-12 bg-[#F97316] flex items-center justify-center text-black">
                <SmartToy />
              </div>
            </div>
            <h1 className="text-white text-4xl font-bold tracking-tighter uppercase">Atendly AI</h1>
            <p className="text-[#F97316] text-[10px] font-mono uppercase tracking-[0.2em]">Intelligence</p>
          </div>

          {/* Login Card */}
          <div className="relative">
            {/* Beam effect on left */}
            <div className="beam-border-v h-full -left-6 top-0"></div>

            <div className="bg-[#0A0A0A] border border-white/10 p-8">
              <h2 className="text-white text-xs font-mono uppercase tracking-[0.2em] mb-6">
                Selecione sua empresa
              </h2>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-3">Empresa</label>
                    <select
                      value={selectedTenant?.id || ''}
                      onChange={(e) => {
                        const tenant = tenants.find(t => t.id === parseInt(e.target.value));
                        setSelectedTenant(tenant);
                      }}
                      className="w-full p-4 input-dark text-sm bg-[#0A0A0A]"
                    >
                      <option value="" className="bg-[#0A0A0A]">Selecione uma empresa...</option>
                      {tenants.map(tenant => (
                        <option key={tenant.id} value={tenant.id} className="bg-[#0A0A0A]">
                          {tenant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={!selectedTenant}
                    className="w-full btn-beam py-4 px-6 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="btn-inner"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Bolt />
                      Entrar
                    </span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => window.location.href = '/new-company'}
                      className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 hover:text-[#F97316] transition-colors"
                    >
                      + Criar nova empresa
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
        body: JSON.stringify({ name, slug, segment, theme_color: '#F97316' })
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
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0"></div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Beam effect */}
          <div className="beam-border-v h-full -left-6 top-0"></div>

          <div className="bg-[#0A0A0A] border border-white/10 p-8">
            <h2 className="text-white text-2xl font-medium uppercase tracking-tight mb-2">
              Nova Empresa
            </h2>
            <p className="text-neutral-500 text-sm mb-8">Configure sua empresa no Atendly AI</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-3">
                  Nome da Empresa
                </label>
                <input
                  required
                  className="w-full p-4 input-dark text-white text-sm"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                  }}
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-3">
                  URL (Slug)
                </label>
                <input
                  required
                  className="w-full p-4 input-dark text-white text-sm bg-[#050505]"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="sua-empresa"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-3">
                  Segmento
                </label>
                <select
                  className="w-full p-4 input-dark text-white text-sm bg-[#0A0A0A]"
                  value={segment}
                  onChange={e => setSegment(e.target.value)}
                >
                  <option value="general" className="bg-[#0A0A0A]">Geral</option>
                  <option value="beauty" className="bg-[#0A0A0A]">Beleza / Estética</option>
                  <option value="health" className="bg-[#0A0A0A]">Saúde</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-beam py-4 px-6 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
              >
                <div className="btn-inner"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Bolt />
                  {loading ? 'Criando...' : 'Criar Empresa'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="w-full text-center text-[10px] font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors py-2"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function TenantApp({ slug, onNavigate, onLogout, loggedInTenant }: {
  slug?: string;
  onNavigate: (p: string) => void;
  onLogout?: () => void;
  tenant?: any;
  loggedInTenant?: any;
}) {
  const directTenant = loggedInTenant;
  const { tenant: fetchedTenant, loading } = useTenant(slug || directTenant?.slug);
  const tenant = directTenant || fetchedTenant;
  const { services, professionals, appointments, refreshAppointments } = useTenantData(tenant?.id);

  if (loading && !tenant) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <h2 className="text-white text-xl font-medium uppercase tracking-tight mb-4">Empresa não encontrada</h2>
        <button onClick={() => onNavigate('/')} className="text-[#F97316] hover:underline text-sm font-mono uppercase tracking-widest">
          Voltar ao início
        </button>
      </div>
    );
  }

  const isAdmin = window.location.pathname.includes('/admin');

  if (isAdmin) {
    return <AdminDashboard tenant={tenant} appointments={appointments} onLogout={onLogout} />;
  }

  const tenantSlug = slug || tenant?.slug;
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0"></div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-white/5 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-white text-base font-medium uppercase tracking-tight flex items-center gap-3">
            <div className="w-2 h-2 bg-[#F97316]"></div>
            {tenant.name}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate(`/${tenantSlug}/admin`)}
              className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 hover:text-white px-4 py-2 border border-white/10 hover:border-[#F97316]/50 transition-all"
            >
              Configurar Agentes
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 hover:text-red-500 px-4 py-2 border border-white/10 hover:border-red-500/50 transition-all"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </header>
      <ChatWidget tenant={tenant} />
    </div>
  );
}
