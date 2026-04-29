import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Download,
  Flag,
  Globe,
  ImageOff,
  ImagePlus,
  Layers,
  LayoutDashboard,
  List,
  Loader2,
  LogOut,
  LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Palette,
  Phone,
  Plus,
  Search,
  Settings,
  Settings2,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Sun,
  Trash2,
  TrendingUp,
  Triangle,
  Trophy,
  User,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AnalyticsDashboard from './AnalyticsDashboard';
import type {
  CodeVersion,
  Configuracao,
  Contacto,
  DeployHistory,
  Depoimento,
  Ferramenta,
  Metrica,
  Pais,
  Parceiro,
  PerfilData,
  Projecto,
  QuemSouData,
  Sector,
  Servico,
  SlideConfig,
} from '../lib/supabase-db';
import {
  addContacto,
  addCodeVersion,
  addDepoimento,
  addFerramenta,
  addMensagem,
  addMetrica,
  addPais,
  addParceiro,
  addProjecto,
  addSector,
  addServico,
  deleteContacto,
  deleteDepoimento,
  deleteFerramenta,
  deleteMensagem,
  deleteMetrica,
  deletePais,
  deleteParceiro,
  deleteProjecto,
  deleteSector,
  deleteServico,
  deployCodeVersion,
  getCodeVersions,
  getDeployHistory,
  getMensagens,
  getMensagensNaoLidas,
  markMensagemAsRead,
  markMensagemAsResponded,
  markVersionReviewed,
  rollbackCodeVersion,
  saveConfig,
  saveContacto,
  saveDepoimento,
  saveFerramenta,
  saveMetrica,
  savePais,
  saveParceiro,
  savePerfil,
  saveProjecto,
  saveQuemSou,
  saveSector,
  saveServico,
  saveSlide,
  normalizeTableRow,
  normalizeTableRows,
} from '../lib/supabase-db';
import {
  getCmsAccessStatus,
  onCmsAuthStateChange,
  signInCms,
  signOutCms,
} from '../lib/cms-api';

type CountsMap = Record<string, number>;

type TabConfig = {
  id: string;
  label: string;
  description: string;
  group: 'General' | 'Library' | 'System';
  icon: LucideIcon;
  statKey?: string;
};

const TAB_CONFIG: TabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Command center for portfolio content, status, and quick jumps.',
    group: 'General',
    icon: LayoutDashboard,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Monitor portfolio performance and user engagement.',
    group: 'General',
    icon: BarChart3,
  },
  {
    id: 'slides',
    label: 'Slides',
    description: 'Control the chapter titles and flow of the presentation.',
    group: 'General',
    icon: Sparkles,
  },
  {
    id: 'perfil',
    label: 'Home',
    description: 'Edit the cover story, signature copy, and hero CTAs.',
    group: 'General',
    icon: User,
  },
  {
    id: 'quemSou',
    label: 'Quem Sou',
    description: 'Shape the personal narrative, photo, and expertise tags.',
    group: 'General',
    icon: Palette,
  },
  {
    id: 'servicos',
    label: 'Servicos',
    description: 'Manage the offer stack and service descriptions.',
    group: 'Library',
    icon: Briefcase,
    statKey: 'servicos',
  },
  {
    id: 'projectos',
    label: 'Projectos',
    description: 'Curate highlighted case studies and visual proof.',
    group: 'Library',
    icon: Layers,
    statKey: 'projectos',
  },
  {
    id: 'metricas',
    label: 'Metricas',
    description: 'Maintain authority metrics and headline proof points.',
    group: 'Library',
    icon: BarChart3,
    statKey: 'metricas',
  },
  {
    id: 'depoimentos',
    label: 'Depoimentos',
    description: 'Publish client quotes, names, roles, and emphasis.',
    group: 'Library',
    icon: Users,
    statKey: 'depoimentos',
  },
  {
    id: 'contactos',
    label: 'Contactos',
    description: 'Set up all conversion channels and closing prompts.',
    group: 'System',
    icon: Mail,
    statKey: 'contactos',
  },
  {
    id: 'parceiros',
    label: 'Parceiros',
    description: 'Present associated brands and authority signals.',
    group: 'System',
    icon: Building2,
    statKey: 'parceiros',
  },
  {
    id: 'mensagens',
    label: 'Mensagens',
    description: 'Receber e gerir mensagens do formulario de contacto.',
    group: 'System',
    icon: MessageCircle,
    statKey: 'mensagens',
  },
  {
    id: 'sectores',
    label: 'Sectores',
    description: 'Define industries covered by the portfolio.',
    group: 'System',
    icon: List,
    statKey: 'sectores',
  },
  {
    id: 'paises',
    label: 'Paises',
    description: 'Map countries, symbols, and presence notes.',
    group: 'System',
    icon: Flag,
    statKey: 'paises',
  },
  {
    id: 'ferramentas',
    label: 'Ferramentas',
    description: 'Organize creative stack and grouped tools.',
    group: 'System',
    icon: Cpu,
    statKey: 'ferramentas',
  },
  {
    id: 'config',
    label: 'Configuracoes',
    description: 'Adjust system copy, footer language, and base settings.',
    group: 'System',
    icon: Globe,
  },
  {
    id: 'updates',
    label: 'Updates',
    description: 'Gerir versões e atualizações do código.',
    group: 'System',
    icon: Sparkles,
  },
];

const COUNT_COLLECTIONS = [
  'servicos',
  'projectos',
  'metricas',
  'depoimentos',
  'contactos',
  'sectores',
  'paises',
  'ferramentas',
  'parceiros',
  'mensagens',
] as const;

const FIELD_OPTIONS: Record<string, string[]> = {
  corFundo: ['azul-escuro', 'laranja'],
  grupo: ['adobe', 'outras'],
  tipo: ['email', 'whatsapp', 'instagram'],
};

const LONG_TEXT_FIELDS = new Set(['descricao', 'texto', 'biografia', 'processoTrabalho', 'servicosRodape', 'tagline', 'concepto']);

const COLLECTION_DEFAULTS: Record<string, Record<string, unknown>> = {
  servicos: { titulo: 'Novo Servico', descricao: '', corFundo: 'azul-escuro', ordem: 1, ativo: true },
  projectos: {
    titulo: 'Novo Projecto',
    categoria: 'Design',
    nomeCliente: '',
    ano: '2026',
    imagemDestaque: [],
    emDestaque: false,
    ordem: 1,
    activo: true,
    concepto: '',
    duracao: '',
    ferramentas: [],
    cores: [],
    agencia: '',
  },
  metricas: { valor: '0', sufixo: '+', legenda: 'Nova Metrica', ordem: 1, ativo: true },
  depoimentos: {
    texto: '',
    autor: 'Nome',
    cargo: '',
    organizacao: '',
    iniciais: 'NA',
    emDestaque: false,
    ordem: 1,
    ativo: true,
  },
  contactos: { tipo: 'email', etiqueta: 'Novo Canal', valor: '', link: '', ordem: 1, ativo: true },
  sectores: { nome: 'Novo Sector', ordem: 1, ativo: true },
  paises: { nome: 'Novo Pais', bandeira: 'AO', descricao: '', ordem: 1, ativo: true },
  ferramentas: { nome: 'Nova Ferramenta', grupo: 'outras', ordem: 1, ativo: true },
  parceiros: { nome: 'Empresa', logo: '', link: '', ordem: 1, ativo: true },
};

const addFunctions: Record<string, (data: any) => Promise<string>> = {
  servicos: addServico,
  projectos: addProjecto,
  metricas: addMetrica,
  depoimentos: addDepoimento,
  contactos: addContacto,
  sectores: addSector,
  paises: addPais,
  ferramentas: addFerramenta,
  parceiros: addParceiro,
};

const updateFunctions: Record<string, (id: string, data: any) => Promise<void>> = {
  servicos: saveServico,
  projectos: saveProjecto,
  metricas: saveMetrica,
  depoimentos: saveDepoimento,
  contactos: saveContacto,
  sectores: saveSector,
  paises: savePais,
  ferramentas: saveFerramenta,
  parceiros: saveParceiro,
};

const deleteFunctions: Record<string, (id: string) => Promise<void>> = {
  servicos: deleteServico,
  projectos: deleteProjecto,
  metricas: deleteMetrica,
  depoimentos: deleteDepoimento,
  contactos: deleteContacto,
  sectores: deleteSector,
  paises: deletePais,
  ferramentas: deleteFerramenta,
  parceiros: deleteParceiro,
};

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuQuery, setMenuQuery] = useState('');
  const [status, setStatus] = useState('');
  const [counts, setCounts] = useState<CountsMap>({});
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const loadCounts = async () => {
      const nextCounts: CountsMap = {};
      for (const collection of COUNT_COLLECTIONS) {
        const { count } = await supabase.from(collection).select('*', { count: 'exact', head: true });
        nextCounts[collection] = count || 0;
      }
      setCounts(nextCounts);
    };
    void loadCounts();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadUnread = async () => {
      const { count } = await supabase.from('mensagens').select('*', { count: 'exact', head: true }).eq('lida', false);
      setUnreadCount(count || 0);
    };
    void loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      const { data } = await supabase.from('mensagens').select('*').eq('lida', false).order('created_at', { ascending: false }).limit(5);
      if (data?.length) {
        setLastUpdate(`${data.length} nova${data.length > 1 ? 's' : ''}`);
        setTimeout(() => setLastUpdate(null), 8000);
      }
    };
    void fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const filteredTabs = useMemo(() => {
    const query = menuQuery.trim().toLowerCase();
    if (!query) return TAB_CONFIG;

    return TAB_CONFIG.filter((tab) => {
      return (
        tab.label.toLowerCase().includes(query) ||
        tab.description.toLowerCase().includes(query) ||
        tab.group.toLowerCase().includes(query)
      );
    });
  }, [menuQuery]);

  const currentTab = TAB_CONFIG.find((tab) => tab.id === activeTab) || TAB_CONFIG[0];
  const totalManagedItems = (Object.values(counts) as number[]).reduce((sum, count) => sum + count, 0);

  const showStatus = (message: string) => {
      setStatus(message);
      window.setTimeout(() => setStatus(''), 2600);
  };

  useEffect(() => {
    let active = true;

    const syncAccess = async () => {
      try {
        const access = await getCmsAccessStatus();

        if (!active) return;

        setIsAuthenticated(access.authenticated && access.isAdmin);
        setAdminEmail(access.email ?? '');

        if (access.authenticated && !access.isAdmin) {
          setStatus('Conta autenticada sem permissao de admin CMS.');
        }
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'Nao foi possivel validar a sessao CMS.';
        setStatus(message);
        setIsAuthenticated(false);
      } finally {
        if (active) {
          setIsAuthReady(true);
        }
      }
    };

    void syncAccess();

    const {
      data: { subscription },
    } = onCmsAuthStateChange(() => {
      void syncAccess();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    if (!emailInput.trim() || !passwordInput.trim()) {
      showStatus('Preenche email e password.');
      return;
    }

    setAuthLoading(true);

    try {
      await signInCms(emailInput, passwordInput);

      const access = await getCmsAccessStatus();

      if (!access.isAdmin) {
        await signOutCms();
        throw new Error('Conta autenticada, mas sem permissao de admin CMS.');
      }

      setIsAuthenticated(true);
      setAdminEmail(access.email ?? emailInput.trim().toLowerCase());
      setPasswordInput('');
      setStatus('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao autenticar no CMS.';
      showStatus(message);
    } finally {
      setAuthLoading(false);
      setIsAuthReady(true);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);

    try {
      await signOutCms();
      setIsAuthenticated(false);
      setAdminEmail('');
      setPasswordInput('');
      showStatus('Sessao terminada.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao terminar a sessao.';
      showStatus(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStudio counts={counts} setTab={setActiveTab} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'slides':
        return <SlidesStudio showStatus={showStatus} />;
      case 'perfil':
        return <PerfilStudio showStatus={showStatus} />;
      case 'quemSou':
        return <QuemSouStudio showStatus={showStatus} />;
      case 'config':
        return <ConfigStudio showStatus={showStatus} />;
      case 'updates':
        return <UpdatesStudio showStatus={showStatus} />;
      case 'servicos':
      case 'projectos':
      case 'metricas':
      case 'depoimentos':
      case 'contactos':
      case 'sectores':
      case 'paises':
      case 'ferramentas':
      case 'parceiros':
        return (
          <CollectionStudio
            colName={activeTab}
            title={currentTab.label}
            defaultItem={COLLECTION_DEFAULTS[activeTab]}
            showStatus={showStatus}
          />
        );
      case 'mensagens':
        return <MensagensStudio showStatus={showStatus} />;
      default:
        return <DashboardStudio counts={counts} setTab={setActiveTab} />;
    }
  };

  if (!isAuthReady || !isAuthenticated) {
    return (
      <CmsLoginScreen
        onClose={onClose}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        onSubmit={handleSignIn}
        status={status}
        loading={!isAuthReady || authLoading}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-[#F3F4F7] text-[#09090B]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,91,255,0.08),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,91,255,0.05),_transparent_24%)]" />

      <div className="relative flex h-full">
        <CmsSidebar
          activeTab={activeTab}
          filteredTabs={filteredTabs}
          counts={counts}
          totalManagedItems={totalManagedItems}
          adminEmail={adminEmail}
          onSelect={setActiveTab}
          onSignOut={handleSignOut}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <CmsTopbar
            currentTab={currentTab}
            menuQuery={menuQuery}
            setMenuQuery={setMenuQuery}
            filteredTabs={filteredTabs}
            activeTab={activeTab}
            onSelect={setActiveTab}
            onClose={onClose}
            notificationsOpen={notificationsOpen}
            setNotificationsOpen={setNotificationsOpen}
            unreadCount={unreadCount}
            lastUpdate={lastUpdate}
          />

          <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[1320px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  {renderCurrentTab()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[300] rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#FE5516]">Update</div>
            <div className="mt-2 text-sm font-semibold text-[#111827]">{status}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CmsLoginScreen({
  onClose,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  onSubmit,
  status,
  loading,
}: {
  onClose: () => void;
  emailInput: string;
  setEmailInput: React.Dispatch<React.SetStateAction<string>>;
  passwordInput: string;
  setPasswordInput: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  status: string;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[220] overflow-hidden bg-[#F6F7FB] text-[#09090B]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,91,255,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(99,91,255,0.08),_transparent_26%)]" />

      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#111827] transition hover:bg-white"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative mx-auto grid h-full max-w-[1460px] lg:grid-cols-[minmax(0,1.1fr)_460px]">
        <div className="hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FE5516] text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#6B7280]">Portfolio CMS</div>
              <div className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#111827]">New Control Room</div>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#F5F5DC] bg-white/75 px-4 py-2 text-xs font-medium text-[#FE5516]">
              <Shield className="h-4 w-4" />
              Private access
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[0.95] tracking-[-0.05em] text-[#111827]">
              Interface nova.
              <br />
              Sem herdar o CMS antigo.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#4B5563]">
              Este acesso abre um painel totalmente reconstruido com shell, overview, navegacao e formularios em
              linguagem visual nova.
            </p>
          </div>

          <div className="grid max-w-3xl grid-cols-3 gap-4">
            {[
              { label: 'Visual', value: 'Rebuild' },
              { label: 'Flow', value: 'Dashboard' },
              { label: 'Data', value: 'Supabase' },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9CA3AF]">{item.label}</div>
                <div className="mt-3 text-[28px] font-bold tracking-[-0.04em] text-[#111827]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[420px] rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.14)] sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#FE5516]">Access</div>
                <h2 className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-[#111827]">Unlock CMS</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5DC] text-[#FE5516]">
                <Shield className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-6 text-[#6B7280]">
              Inicia sessao com um utilizador do Supabase Auth que esteja autorizado na allowlist do CMS.
            </p>

            <div className="mt-6 space-y-3">
              <input
                type="email"
                autoComplete="email"
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                placeholder="admin@teudominio.com"
                className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#F5F5DC] focus:bg-white focus:ring-2 focus:ring-[#F5F5DC]"
              />
              <input
                type="password"
                autoComplete="current-password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void onSubmit();
                  }
                }}
                placeholder="Password"
                className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#F5F5DC] focus:bg-white focus:ring-2 focus:ring-[#F5F5DC]"
              />
            </div>

            <button
              onClick={onSubmit}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-between rounded-xl bg-[#FE5516] px-4 py-3.5 text-left text-white transition hover:bg-[#E44A15]"
            >
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.32em] text-white/60">Authentication</div>
                <div className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                  {loading ? 'A validar sessao...' : 'Entrar no workspace'}
                </div>
              </div>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            </button>

            <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6B7280]">
              Auth + allowlist protegida
            </div>

            {status && <div className="mt-5 text-sm font-semibold text-[#DC2626]">{status}</div>}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function CmsSidebar({
  activeTab,
  filteredTabs,
  counts,
  totalManagedItems,
  adminEmail,
  onSelect,
  onSignOut,
}: {
  activeTab: string;
  filteredTabs: TabConfig[];
  counts: CountsMap;
  totalManagedItems: number;
  adminEmail: string;
  onSelect: (tab: string) => void;
  onSignOut: () => void;
}) {
  return (
    <aside className="hidden h-full w-[258px] shrink-0 border-r border-[#E5E7EB] bg-[#F9FAFB] xl:flex xl:flex-col">
      <div className="flex items-center justify-between px-5 pb-5 pt-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FE5516]">
            <div className="grid grid-cols-2 gap-0.5 p-1.5">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-2 w-2 rounded-[2px] bg-white" />
              ))}
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#09090B]">Portfolio</div>
            <div className="text-xs text-[#71717A]">Rebuilt CMS</div>
          </div>
        </div>
        <button className="text-[#A1A1AA] transition hover:text-[#09090B]">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      
      <div className="flex-1 space-y-7 overflow-y-auto px-4 pb-5">
        {(['General', 'Library', 'System'] as const).map((group) => {
          const items = filteredTabs.filter((tab) => tab.group === group);
          if (!items.length) return null;

          return (
            <div key={group}>
              <div className="px-2 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">{group}</div>
              <div className="mt-2 space-y-1">
                {items.map((tab) => (
                  <div key={tab.id}>
                    <SidebarTab
                      tab={tab}
                      active={tab.id === activeTab}
                      count={tab.statKey ? Number(counts[tab.statKey] ?? 0) : undefined}
                      onClick={() => onSelect(tab.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-[#E5E7EB] px-4 py-4">
        <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827] text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#111827]">Admin Portfolio</div>
              <div className="truncate text-xs text-[#71717A]">{adminEmail || 'admin@portfolio.local'}</div>
            </div>
            <button
              onClick={onSignOut}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#71717A] transition hover:border-[#F5F5DC] hover:text-[#FE5516]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarTab({
  tab,
  active,
  count,
  onClick,
}: {
  tab: TabConfig;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition ${
        active
          ? 'border border-[#E5E7EB] bg-white shadow-[0_10px_22px_rgba(15,23,42,0.04)]'
          : 'text-[#71717A] hover:bg-white hover:text-[#09090B]'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
            active ? 'bg-[#F5F5DC] text-[#FE5516]' : 'bg-[#F0F2F5] text-[#71717A]'
          }`}
        >
          <tab.icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className={`truncate text-[11px] font-medium ${active ? 'text-[#09090B]' : 'text-inherit'}`}>{tab.label}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {typeof count === 'number' && (
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${active ? 'bg-[#F5F5DC] text-[#FE5516]' : 'bg-[#F0F2F5] text-[#71717A]'}`}>{count}</span>
        )}
        <ChevronRight className={`h-3.5 w-3.5 ${active ? 'text-[#FE5516]' : 'text-[#D1D5DB]'}`} />
      </div>
    </button>
  );
}

function CmsTopbar({
  currentTab,
  menuQuery,
  setMenuQuery,
  filteredTabs,
  activeTab,
  onSelect,
  onClose,
  notificationsOpen,
  setNotificationsOpen,
  unreadCount,
  lastUpdate,
}: {
  currentTab: TabConfig;
  menuQuery: string;
  setMenuQuery: (value: string) => void;
  filteredTabs: TabConfig[];
  activeTab: string;
  onSelect: (tab: string) => void;
  onClose: () => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  unreadCount: number;
  lastUpdate: string | null;
}) {
  return (
    <header className="border-b border-[#E5E7EB] bg-[#F3F4F7]/90 px-4 py-3.5 backdrop-blur sm:px-6 lg:px-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#71717A]">
            <button 
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#71717A] sm:flex hover:bg-[#F9FAFB] hover:text-[#635BFF]"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#71717A] sm:flex hover:bg-[#F9FAFB] hover:text-[#635BFF]"
              onClick={() => window.history.forward()}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span>Pages</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-[#09090B]">{currentTab.label}</span>
          </div>
                  </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              value={menuQuery}
              onChange={(event) => setMenuQuery(event.target.value)}
              placeholder="Search sections, content or settings..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[13px] text-[#111827] outline-none transition focus:border-[#F5F5DC] focus:ring-2 focus:ring-[#F5F5DC]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <IconButton onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#DC2626] text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </IconButton>
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-[#E5E7EB] bg-white shadow-lg z-50 overflow-hidden">
                  <div className="border-b border-[#E5E7EB] px-3 py-2">
                    <span className="text-xs font-semibold text-[#111827]">Notificações</span>
                    {unreadCount > 0 && (
                      <span className="ml-2 text-[10px] text-[#635BFF]">{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {lastUpdate ? (
                      <div className="px-3 py-2 text-xs text-[#6B7280]">
                        <span className="text-brand-orange">●</span> {lastUpdate}
                      </div>
                    ) : (
                      <div className="px-3 py-4 text-xs text-[#9CA3AF] text-center">
                        Sem notificações novas
                      </div>
                    )}
                    <button 
                      onClick={() => { setNotificationsOpen(false); onSelect('mensagens'); }}
                      className="w-full px-3 py-2 text-xs text-[#635BFF] hover:bg-[#F5F3FF] text-center border-t border-[#E5E7EB]"
                    >
                      Ver todas →
                    </button>
                  </div>
                </div>
              )}
            </div>
            <IconButton onClick={() => onSelect('config')}>
              <Settings2 className="h-4 w-4" />
            </IconButton>
            <IconButton onClick={onClose} className="xl:hidden">
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
        {filteredTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-medium transition ${
              activeTab === tab.id ? 'border-[#F5F5DC] bg-[#F5F5DC]/10 text-[#FE5516]' : 'border-[#E5E7EB] bg-white text-[#71717A]'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function DashboardStudio({ counts, setTab }: { counts: CountsMap; setTab: (tab: string) => void }) {
  const cards = [
    {
      id: 'projectos',
      label: 'Projectos',
      value: counts.projectos || 0,
      helper: 'case studies live',
      icon: Layers,
    },
    {
      id: 'servicos',
      label: 'Servicos',
      value: counts.servicos || 0,
      helper: 'offer blocks ready',
      icon: Briefcase,
    },
    {
      id: 'metricas',
      label: 'Metricas',
      value: counts.metricas || 0,
      helper: 'proof points active',
      icon: BarChart3,
    },
    {
      id: 'contactos',
      label: 'Contactos',
      value: counts.contactos || 0,
      helper: 'conversion channels',
      icon: Mail,
    },
  ];

  const series = [
    { label: 'Serv', value: counts.servicos || 0 },
    { label: 'Proj', value: counts.projectos || 0 },
    { label: 'Met', value: counts.metricas || 0 },
    { label: 'Dep', value: counts.depoimentos || 0 },
    { label: 'Cont', value: counts.contactos || 0 },
    { label: 'Sec', value: counts.sectores || 0 },
    { label: 'Pais', value: counts.paises || 0 },
    { label: 'Ferr', value: counts.ferramentas || 0 },
    { label: 'Par', value: counts.parceiros || 0 },
  ];

  const tableRows = [
    {
      id: 'slides',
      section: 'Slides',
      items: 9,
      focus: 'Headlines and sequence',
      owner: 'Narrative',
      status: 'Ready',
    },
    {
      id: 'projectos',
      section: 'Projectos',
      items: counts.projectos || 0,
      focus: 'Cases and thumbnails',
      owner: 'Library',
      status: counts.projectos ? 'Active' : 'Empty',
    },
    {
      id: 'depoimentos',
      section: 'Depoimentos',
      items: counts.depoimentos || 0,
      focus: 'Proof and trust',
      owner: 'Social proof',
      status: counts.depoimentos ? 'Active' : 'Pending',
    },
    {
      id: 'contactos',
      section: 'Contactos',
      items: counts.contactos || 0,
      focus: 'Closing channels',
      owner: 'Conversion',
      status: counts.contactos ? 'Active' : 'Pending',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[12px] bg-[linear-gradient(90deg,#FE5516_0%,#FF6B35_48%,#FF8A5B_100%)] p-4 text-white shadow-[0_20px_48px_rgba(254,85,22,0.24)]">
        <div className="relative z-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/15 px-2 py-0.5 text-[11px] font-medium">
              <Sparkles className="h-2.5 w-2.5" />
              New CMS shell applied
            </div>
            <h3 className="mt-3 text-[16px] font-bold leading-tight tracking-[-0.04em]">
              Overview rebuilt around the dashboard interface from the attachments.
            </h3>
          </div>
          <button
            onClick={() => setTab('slides')}
            className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-[10px] font-semibold text-[#FE5516] transition hover:bg-[#F9F9FB]"
          >
            Open Slides
          </button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[340px] translate-x-16 opacity-25">
          <svg viewBox="0 0 400 400" className="h-full w-full fill-white">
            <circle cx="180" cy="200" r="88" />
            <circle cx="290" cy="100" r="84" />
            <circle cx="280" cy="300" r="120" />
          </svg>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h3 className="text-[26px] font-bold tracking-[-0.04em] text-[#09090B]">Overview</h3>
        <div className="hidden items-center gap-2 lg:flex">
          <ToolbarButton>
            25 Apr 2026
            <Calendar className="h-4 w-4 text-[#A1A1AA]" />
          </ToolbarButton>
          <ToolbarButton>
            Last 30 days
            <Calendar className="h-4 w-4 text-[#A1A1AA]" />
          </ToolbarButton>
          <ToolbarButton>
            <Download className="h-4 w-4" />
            Export
          </ToolbarButton>
        </div>
      </div>

      <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setTab(card.id)}
            className="rounded-[12px] border border-[#E5E7EB] bg-white p-2 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#F5F5DC]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F5F5DC] text-[#FE5516]">
                <card.icon className="h-3.5 w-3.5" />
              </div>
              <span className="rounded-full bg-[#F0FDF4] px-1.5 py-0.5 text-[9px] font-medium text-[#16A34A]">Live</span>
            </div>
            <div className="mt-2 text-xs font-medium text-[#6B7280]">{card.label}</div>
            <div className="mt-0.5 text-[1.1rem] font-bold tracking-[-0.04em] text-[#111827]">{card.value}</div>
            <p className="mt-0.5 text-[10px] text-[#16A34A]">{card.helper}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Panel title="" description="">
          <DashboardBars values={series} />
        </Panel>
        <Panel title="" description="">
          <DashboardLine values={series} />
        </Panel>
      </div>

      <Panel title="Section activity" description="Quick access to the main areas that need editorial attention.">
        <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB]">
          <div className="grid grid-cols-[1.1fr_0.55fr_1fr_0.85fr_0.75fr_56px] gap-4 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs font-medium text-[#6B7280]">
            <div>Section</div>
            <div>Items</div>
            <div>Focus</div>
            <div>Owner</div>
            <div>Status</div>
            <div className="text-right">...</div>
          </div>

          <div className="divide-y divide-[#E5E7EB] bg-white">
            {tableRows.map((row) => (
              <div key={row.id} className="grid grid-cols-[1.1fr_0.55fr_1fr_0.85fr_0.75fr_56px] items-center gap-4 px-4 py-3.5 text-[13px]">
                <div className="font-semibold text-[#111827]">{row.section}</div>
                <div className="text-[#6B7280]">{row.items}</div>
                <div className="text-[#6B7280]">{row.focus}</div>
                <div className="text-[#6B7280]">{row.owner}</div>
                <div>
                  <DashboardStatus status={row.status} />
                </div>
                <div className="text-right">
                  <button
                    onClick={() => setTab(row.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#A1A1AA] transition hover:bg-[#F9FAFB] hover:text-[#FE5516]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function DashboardBars({ values }: { values: Array<{ label: string; value: number }> }) {
  const total = values.reduce((sum, item) => sum + item.value, 0);
  const sortedValues = [...values].sort((left, right) => right.value - left.value);
  let currentAngle = -90;
  const slices = sortedValues.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0;
    const angle = percentage * 360;
    const endAngle = currentAngle + angle;
    const startAngleRad = (currentAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    const x1 = 50 + 34 * Math.cos(startAngleRad);
    const y1 = 50 + 34 * Math.sin(startAngleRad);
    const x2 = 50 + 34 * Math.cos(endAngleRad);
    const y2 = 50 + 34 * Math.sin(endAngleRad);
    const largeArcFlag = angle > 180 ? 1 : 0;
    const color = ['#FE5516', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6', '#F97316', '#14B8A6', '#A855F7'][index % 9];
    const path = angle === 0
      ? ''
      : `M 50 50 L ${x1} ${y1} A 34 34 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    currentAngle = endAngle;

    return {
      ...item,
      color,
      percentage: percentage * 100,
      path
    };
  });

  return (
    <div className="rounded-[24px] border border-[#EEF0F6] bg-[linear-gradient(180deg,#FCFCFF_0%,#F6F7FB_100%)] p-4">
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="flex justify-center rounded-[22px] bg-white/80 p-1">
            <div className="relative">
              <svg viewBox="0 0 100 100" className="h-[220px] w-[220px]">
                {slices.map((slice) => (
                  slice.path ? <path key={slice.label} d={slice.path} fill={slice.color} /> : null
                ))}
                <circle cx="50" cy="50" r="16" fill="white" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9CA3AF]">Managed</div>
                  <div className="mt-1 text-2xl font-bold tracking-[-0.05em] text-[#111827]">{total}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {slices.map((slice) => (
              <div key={slice.label} className="rounded-[8px] border border-white/80 bg-white/92 px-1.5 py-1 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="text-[7px] font-semibold text-[#111827]">{slice.label}</span>
                  </div>
                  <span className="text-[7px] font-bold text-[#111827]">{slice.value}</span>
                </div>
                <div className="text-[6px] text-[#6B7280]">{slice.percentage.toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}

function DashboardLine({ values }: { values: Array<{ label: string; value: number }> }) {
  const max = Math.max(...values.map((item) => item.value), 1);
  const total = values.reduce((sum, item) => sum + item.value, 0);
  const strongest = [...values].sort((left, right) => right.value - left.value)[0];
  const points = values.map((item, index) => {
    const x = values.length === 1 ? 50 : 8 + (index * 84) / (values.length - 1);
    const y = 82 - (item.value / max) * 54;
    return { item, x, y };
  });
  const pointString = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="rounded-[24px] border border-[#EEF0F6] bg-[linear-gradient(180deg,#FBFBFF_0%,#F3F4FB_100%)] p-4">
        <div className="space-y-4">
          <div className="rounded-[22px] bg-white/88 p-2">
            <svg viewBox="0 0 100 100" className="h-[120px] w-full" preserveAspectRatio="none">
              <line x1="8" y1="82" x2="92" y2="82" stroke="#E4E7F0" strokeWidth="1.2" />
              <line x1="8" y1="56" x2="92" y2="56" stroke="#EEF1F6" strokeWidth="1" strokeDasharray="2 3" />
              <line x1="8" y1="30" x2="92" y2="30" stroke="#EEF1F6" strokeWidth="1" strokeDasharray="2 3" />
              <path d={`M 8 82 L ${pointString} L 92 82 Z`} fill="rgba(254,85,22,0.10)" />
              <polyline fill="none" stroke="#FE5516" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" points={pointString} />
              {points.map((point) => (
                <g key={point.item.label}>
                  <circle cx={point.x} cy={point.y} r="1" fill="#FFFFFF" stroke="#FE5516" strokeWidth="0.8" />
                  <text x={point.x} y="92" textAnchor="middle" className="fill-[#6B7280] text-[3px] font-medium">
                    {point.item.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {values.map((item) => {
                const share = total > 0 ? (item.value / total) * 100 : 0;

                return (
                  <div key={item.label} className="rounded-[8px] border border-white/80 bg-white/92 px-1.5 py-1 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[7px] font-semibold text-[#111827]">{item.label}</span>
                      <span className="text-[7px] font-bold text-[#FE5516]">{item.value}</span>
                    </div>
                    <div className="text-[6px] text-[#6B7280]">{share.toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
        </div> 
      </div>
  );
}

function DashboardStatus({ status }: { status: string }) {
  const className =
    status === 'Ready' || status === 'Active'
      ? 'bg-[#ECFDF3] text-[#039855]'
      : status === 'Pending'
        ? 'bg-[#FFF7ED] text-[#EA580C]'
        : 'bg-[#FEF2F2] text-[#DC2626]';

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>{status}</span>;
}

function SlidesStudio({ showStatus }: { showStatus: (message: string) => void }) {
  const [slides, setSlides] = useState<SlideConfig[]>([]);
  const [savedSlides, setSavedSlides] = useState<SlideConfig[]>([]);
  const [savingSlideIds, setSavingSlideIds] = useState<string[]>([]);

  useEffect(() => {
    const loadSlides = async () => {
      const { data } = await supabase.from('slides').select('*').order('id');
      const normalizedSlides = normalizeTableRows<SlideConfig>('slides', data);
      const initialSlides = normalizedSlides.length ? normalizedSlides : getDefaultSlides();
      setSlides(initialSlides);
      setSavedSlides(initialSlides);
    };
    void loadSlides();
  }, []);

  const updateSlideField = (id: string, field: 'titulo' | 'eyebrow', value: string) => {
    setSlides((current) => current.map((slide) => (slide.id === id ? { ...slide, [field]: value } : slide)));
  };

  const isSlideDirty = (id: string) => {
    const draftSlide = slides.find((slide) => slide.id === id);
    const savedSlide = savedSlides.find((slide) => slide.id === id);
    if (!draftSlide || !savedSlide) return false;
    return draftSlide.titulo !== savedSlide.titulo || draftSlide.eyebrow !== savedSlide.eyebrow;
  };

  const saveSlideCard = async (id: string) => {
    const draftSlide = slides.find((slide) => slide.id === id);
    if (!draftSlide) return;

    setSavingSlideIds((current) => (current.includes(id) ? current : [...current, id]));

    try {
      await saveSlide(id, {
        titulo: draftSlide.titulo,
        eyebrow: draftSlide.eyebrow,
      });
      setSavedSlides((current) =>
        current.map((slide) =>
          slide.id === id ? { ...slide, titulo: draftSlide.titulo, eyebrow: draftSlide.eyebrow } : slide,
        ),
      );
      showStatus('Alteracoes do slide guardadas');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel guardar as alteracoes do slide.';
      showStatus(message);
      console.error('Erro ao guardar slide:', error);
    } finally {
      setSavingSlideIds((current) => current.filter((slideId) => slideId !== id));
    }
  };

  return (
    <EditorScene
      eyebrow="Story flow"
      title="Edit the slide narrative in a new workspace"
      description="Each card maps to one chapter of the deck. Update the title and eyebrow directly to reshape the story."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {slides.map((slide, index) => (
          <div key={slide.id}>
            <Panel title={`${String(index + 1).padStart(2, '0')} / ${slide.id}`} description="Narrative controls">
              <div className="grid gap-4">
                <div className="flex flex-col gap-3 rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className={`text-[12px] font-medium ${isSlideDirty(slide.id) ? 'text-[#B45309]' : 'text-[#6B7280]'}`}>
                    {isSlideDirty(slide.id) ? 'Alteracoes por guardar' : 'Sem alteracoes pendentes'}
                  </span>
                  <PrimaryButton
                    type="button"
                    onClick={() => void saveSlideCard(slide.id)}
                    loading={savingSlideIds.includes(slide.id)}
                    disabled={!isSlideDirty(slide.id) || savingSlideIds.includes(slide.id)}
                    className="w-full sm:w-auto"
                  >
                    Guardar alteracoes
                  </PrimaryButton>
                </div>
                <Field label="Titulo">
                  <TextInput value={slide.titulo} onChange={(event) => updateSlideField(slide.id, 'titulo', event.target.value)} />
                </Field>
                <Field label="Eyebrow">
                  <TextInput value={slide.eyebrow} onChange={(event) => updateSlideField(slide.id, 'eyebrow', event.target.value)} />
                </Field>
              </div>
            </Panel>
          </div>
        ))}
      </div>
    </EditorScene>
  );
}

function QuemSouStudio({ showStatus }: { showStatus: (message: string) => void }) {
  const [data, setData] = useState<QuemSouData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: result } = await supabase.from('quemsou').select('*').single();
      setData(
        normalizeTableRow<QuemSouData>('quemsou', result) || {
          nomePrimeiraLinha: 'Adilson',
          nomeDestaque: 'Pinto',
          biografia: '',
          fotografia: '',
          tags: [],
        },
      );
    };
    void loadData();
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    await saveQuemSou(data);
    setSaving(false);
    showStatus('Secao Quem Sou guardada');
  };

  if (!data) return <LoadingPanel />;

  return (
    <EditorScene
      eyebrow="Personal layer"
      title="Build the human side of the portfolio"
      description="This section needs a strong photo, clean bio, and a short set of tags that define expertise."
      action={<PrimaryButton onClick={save} loading={saving}>Guardar</PrimaryButton>}
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Narrative" description="Name structure and story copy.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primeira linha">
              <TextInput value={data.nomePrimeiraLinha || ''} onChange={(event) => setData({ ...data, nomePrimeiraLinha: event.target.value })} />
            </Field>
            <Field label="Nome em destaque">
              <TextInput value={data.nomeDestaque || ''} onChange={(event) => setData({ ...data, nomeDestaque: event.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Biografia">
                <TextArea value={data.biografia || ''} onChange={(event) => setData({ ...data, biografia: event.target.value })} />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="Photo and tags" description="Visual identity and quick descriptors.">
          <ImageUpload
            value={data.fotografia}
            onChange={(value) => setData({ ...data, fotografia: value as string })}
            label="Fotografia"
          />

          <div className="mt-5 overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB]">
            {data.fotografia ? (
              <img src={data.fotografia} className="h-72 w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-72 items-center justify-center text-[#A1A1AA]">
                <ImagePlus className="h-10 w-10" />
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="text-[13px] font-medium text-[#374151]">Tags</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.tags.map((tag, index) => (
                <div key={`${tag}-${index}`} className="rounded-full border border-[#DDD9FF] bg-[#F5F3FF] px-4 py-2">
                  <input
                    value={tag}
                    onChange={(event) => {
                      const nextTags = [...data.tags];
                      nextTags[index] = event.target.value;
                      setData({ ...data, tags: nextTags });
                    }}
                    className="w-28 bg-transparent text-[11px] font-medium text-[#635BFF] outline-none"
                  />
                </div>
              ))}
              <button
                onClick={() => setData({ ...data, tags: [...data.tags, 'NOVA TAG'] })}
                className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[11px] font-medium text-[#374151] transition hover:border-[#D8D4FE] hover:text-[#635BFF]"
              >
                + Tag
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </EditorScene>
  );
}

function PerfilStudio({ showStatus }: { showStatus: (message: string) => void }) {
  const [data, setData] = useState<PerfilData | null>(null);
  const [saving, setSaving] = useState(false);
  const [legacyOpen, setLegacyOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: result } = await supabase.from('perfil').select('*').single();
      setData(normalizeTableRow<PerfilData>('perfil', result));
    };
    void loadData();
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    await savePerfil(data);
    setSaving(false);
    showStatus('Alterações guardadas');
  };

  if (!data) return <LoadingPanel />;

  return (
    <EditorScene
      eyebrow="Editor da Home"
      title="Primeira impressão do portfólio"
      description="Aqui defines o que os visitantes veem ao entrar no teu portfólio."
      action={<PrimaryButton onClick={save} loading={saving}>Guardar alterações</PrimaryButton>}
    >
      {/* Preview ao vivo - Sempre no topo */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-[#374151]">Preview ao vivo</span>
        </div>
        <div className="relative rounded-2xl bg-brand-cream p-8 overflow-hidden shadow-lg">
          <div className="absolute inset-0 flex items-center justify-end gap-1 opacity-25 pointer-events-none">
            <div className="w-[100px] h-[240px] border-4 border-brand-orange/60 rounded-full -rotate-45" />
            <div className="w-[100px] h-[240px] border-4 border-brand-dark/60 rounded-full rotate-45" />
          </div>
          <div className="relative z-10">
            <div className="text-6xl font-display font-bold leading-[0.9] text-brand-dark mb-4">
              Portfolio
            </div>
            <p className="max-w-md text-lg leading-relaxed text-brand-dark/80 font-medium mb-6">
              {data.tagline || 'A tua tagline aqui...'}
            </p>
            <div className="flex gap-3">
              <div className="inline-flex items-center bg-brand-orange px-6 py-3 rounded-full">
                <span className="font-bold uppercase tracking-[0.2em] text-[10px] text-white">
                  {data.labelBotaoInicio || 'Começar'}
                </span>
              </div>
              <div className="inline-flex items-center bg-brand-dark px-6 py-3 rounded-full">
                <span className="font-bold uppercase tracking-[0.2em] text-[10px] text-white">
                  Orçamento
                </span>
              </div>
            </div>
          </div>
          <div className="absolute right-8 bottom-0 w-[180px] h-[220px]">
            {data.fotografia ? (
              <img 
                src={data.fotografia} 
                className="w-full h-full object-cover rounded-t-full" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="w-full h-full bg-brand-dark/10 rounded-t-full flex items-center justify-center text-xs text-brand-dark/30">
                Adicionar foto
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campos principais - Grid simples */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Secção 1: Mensagem principal */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <span className="text-brand-orange text-sm font-bold">1</span>
            </div>
            <h3 className="font-semibold text-[#111827]">Mensagem principal</h3>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">A tagline que aparece no início do portfólio.</p>
          <TextArea 
            value={data.tagline || ''} 
            onChange={(event) => setData({ ...data, tagline: event.target.value })} 
            rows={3}
            placeholder="Ex: Criador de identidades visuais que comunicam, vendem e ficam na memória."
          />
        </div>

        {/* Secção 2: Botões de ação */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <span className="text-brand-orange text-sm font-bold">2</span>
            </div>
            <h3 className="font-semibold text-[#111827]">Botões de ação</h3>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">Os textos dos botões principais.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Botão do início</label>
              <TextInput 
                value={data.labelBotaoInicio || ''} 
                onChange={(event) => setData({ ...data, labelBotaoInicio: event.target.value })} 
                placeholder="Começar"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Botão final</label>
              <TextInput 
                value={data.labelBotaoAcaoFinal || ''} 
                onChange={(event) => setData({ ...data, labelBotaoAcaoFinal: event.target.value })} 
                placeholder="Solicitar orçamento"
              />
            </div>
          </div>
        </div>

        {/* Secção 3: Fotografia */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <span className="text-brand-orange text-sm font-bold">3</span>
            </div>
            <h3 className="font-semibold text-[#111827]">Fotografia</h3>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">A tua foto de perfil.</p>
          <ImageUpload
            value={data.fotografia || ''}
            onChange={(value) => setData({ ...data, fotografia: value as string })}
            label="Fotografia"
          />
          {data.fotografia && (
            <div className="mt-4 h-40 rounded-xl overflow-hidden">
              <img src={data.fotografia} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>

        {/* Secção 4: Conteúdo adicional */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-dark/10 flex items-center justify-center">
              <span className="text-brand-dark text-sm font-bold">4</span>
            </div>
            <h3 className="font-semibold text-[#111827]">Conteúdo adicional</h3>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">Informações opcionais para uso futuro.</p>
          <div className="space-y-3">
            <TextInput 
              value={data.nomeCompleto || ''} 
              onChange={(event) => setData({ ...data, nomeCompleto: event.target.value })} 
              placeholder="Nome completo"
            />
            <TextInput 
              value={data.destaqueNome || ''} 
              onChange={(event) => setData({ ...data, destaqueNome: event.target.value })} 
              placeholder="Nome de destaque"
            />
          </div>
        </div>

        {/* Campos legados - Collapsible */}
        <div className="bg-gray-50 rounded-2xl border border-dashed border-[#D1D5DB] p-5 lg:col-span-2">
          <button 
            onClick={() => setLegacyOpen(!legacyOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                <ChevronRight className={`h-3 w-3 transition-transform ${legacyOpen ? 'rotate-90' : ''}`} />
              </div>
              <span className="text-sm font-medium text-[#6B7280]">Campos legados</span>
            </div>
            <span className="text-xs text-[#9CA3AF]">eyebrowEntrada, anoPortfolio</span>
          </button>
          {legacyOpen && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <TextInput 
                value={data.eyebrowEntrada || ''} 
                onChange={(event) => setData({ ...data, eyebrowEntrada: event.target.value })} 
                placeholder="Eyebrow de entrada (legado)"
              />
              <TextInput 
                value={data.anoPortfolio || ''} 
                onChange={(event) => setData({ ...data, anoPortfolio: event.target.value })} 
                placeholder="Ano do portfólio (legado)"
              />
            </div>
          )}
        </div>
      </div>
    </EditorScene>
  );
}

function MensagensStudio({ showStatus }: { showStatus: (message: string) => void }) {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMensagem, setSelectedMensagem] = useState<any | null>(null);

  useEffect(() => {
    const loadMensagens = async () => {
      const data = await getMensagens();
      setMensagens(data);
      setLoading(false);
    };
    void loadMensagens();
  }, []);

  const marcarComoLida = async (id: string) => {
    await markMensagemAsRead(id);
    setMensagens(prev => prev.map(m => m.id === id ? { ...m, lida: true } : m));
    showStatus('Mensagem marcada como lida');
  };

  const marcarComoRespondida = async (id: string) => {
    await markMensagemAsResponded(id);
    setMensagens(prev => prev.map(m => m.id === id ? { ...m, responded: true } : m));
    showStatus('Mensagem marcada como respondida');
  };

  const eliminarMensagem = async (id: string) => {
    if (!window.confirm('Eliminar esta mensagem?')) return;
    await deleteMensagem(id);
    setMensagens(prev => prev.filter(m => m.id !== id));
    setSelectedMensagem(null);
    showStatus('Mensagem eliminada');
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const mensagensNaoLidas = mensagens.filter(m => !m.lida).length;

  if (loading) {
    return <LoadingPanel />;
  }

  return (
    <EditorScene
      eyebrow="Mensagens"
      title="Caixa de Entrada"
      description={`${mensagensNaoLidas} mensagem${mensagensNaoLidas !== 1 ? 's' : ''} não lida${mensagensNaoLidas !== 1 ? 's' : ''}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de mensagens */}
        <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto">
          {mensagens.length === 0 ? (
            <div className="text-center py-12 text-[#6B7280]">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Sem mensagens</p>
            </div>
          ) : (
            mensagens.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMensagem(m);
                  if (!m.lida) {
                    marcarComoLida(m.id);
                  }
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedMensagem?.id === m.id
                    ? 'border-[#635BFF] bg-[#F5F3FF]'
                    : m.lida
                    ? 'border-[#E5E7EB] bg-white hover:border-[#CBC5FF]'
                    : 'border-[#635BFF]/30 bg-[#F5F3FF] hover:border-[#635BFF]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={`font-semibold text-sm ${!m.lida ? 'text-[#635BFF]' : 'text-[#111827]'}`}>
                    {m.nome}
                  </span>
                  {!m.lida && <span className="w-2 h-2 bg-[#635BFF] rounded-full shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-[#6B7280] truncate">{m.mensagem}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1">{formatarData(m.created_at)}</p>
              </button>
            ))
          )}
        </div>

        {/* Detalhes da mensagem */}
        <div className="lg:col-span-2">
          {selectedMensagem ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 h-full">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">{selectedMensagem.nome}</h3>
                  <p className="text-sm text-[#6B7280]">{formatarData(selectedMensagem.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  {selectedMensagem.responded ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ECFDF3] text-[#027A48] text-xs font-semibold rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Respondida
                    </span>
                  ) : (
                    <button
                      onClick={() => marcarComoRespondida(selectedMensagem.id)}
                      className="px-3 py-1 bg-[#635BFF] text-white text-xs font-semibold rounded-full hover:bg-[#5447F6] transition-colors"
                    >
                      Marcar como respondida
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {selectedMensagem.email && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Email</span>
                    <p className="text-sm text-[#111827]">{selectedMensagem.email}</p>
                  </div>
                )}
                {selectedMensagem.telefone && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Telefone</span>
                    <p className="text-sm text-[#111827]">{selectedMensagem.telefone}</p>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Mensagem</span>
                  <p className="text-sm text-[#111827] whitespace-pre-wrap mt-1">{selectedMensagem.mensagem}</p>
                </div>
              </div>

              <div className="border-t border-[#E5E7EB] pt-4 flex justify-between">
                <button
                  onClick={() => {
                    if (selectedMensagem.telefone) {
                      window.open(`https://wa.me/${selectedMensagem.telefone.replace(/\D/g, '')}?text=Olá ${selectedMensagem.nome}`, '_blank');
                    } else if (selectedMensagem.email) {
                      window.open(`mailto:${selectedMensagem.email}`, '_blank');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-sm font-semibold rounded-xl hover:bg-[#128C7E] transition-colors"
                >
                  <Phone className="h-4 w-4" /> Responder WhatsApp
                </button>
                <button
                  onClick={() => eliminarMensagem(selectedMensagem.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] text-sm font-semibold rounded-xl hover:bg-[#FEE2E2] transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-[#E5E7EB] rounded-2xl">
              <p className="text-[#9CA3AF]">Selecione uma mensagem para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </EditorScene>
  );
}

function ConfigStudio({ showStatus }: { showStatus: (message: string) => void }) {
  const [data, setData] = useState<Configuracao | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: result } = await supabase.from('configuracoes').select('*').single();
      setData(normalizeTableRow<Configuracao>('configuracoes', result));
    };
    void loadData();
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    await saveConfig(data);
    setSaving(false);
    showStatus('Configuracoes guardadas');
  };

  if (!data) return <LoadingPanel />;

  return (
    <EditorScene
      eyebrow="Sistema"
      title="Configuracoes"
      description="Labels globais do portfólio."
      action={<PrimaryButton onClick={save} loading={saving}>Guardar</PrimaryButton>}
    >
      <div className="space-y-4 max-w-xl">
        <Field label="Nome da agencia">
          <TextInput value={data.nomeAgencia || ''} onChange={(event) => setData({ ...data, nomeAgencia: event.target.value })} />
        </Field>
        <Field label="Etiqueta de contacto">
          <TextInput value={data.etiquetaRodapeContacto || ''} onChange={(event) => setData({ ...data, etiquetaRodapeContacto: event.target.value })} />
        </Field>
        <Field label="Servicos do rodape">
          <TextArea value={data.servicosRodape || ''} onChange={(event) => setData({ ...data, servicosRodape: event.target.value })} />
        </Field>
        <Field label="Processo de trabalho">
          <TextArea value={data.processoTrabalho || ''} onChange={(event) => setData({ ...data, processoTrabalho: event.target.value })} />
        </Field>
      </div>
    </EditorScene>
  );
}

function UpdatesStudio({ showStatus }: { showStatus: (message: string) => void }) {
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [history, setHistory] = useState<DeployHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newVersion, setNewVersion] = useState({ version: '', changelog: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [v, h] = await Promise.all([getCodeVersions(), getDeployHistory()]);
    setVersions(v);
    setHistory(h);
    setLoading(false);
  };

  useEffect(() => { void loadData(); }, []);

  const createVersion = async () => {
    if (!newVersion.version.trim()) return;
    setSubmitting(true);
    await addCodeVersion(newVersion);
    await loadData();
    setIsCreateModalOpen(false);
    setNewVersion({ version: '', changelog: '' });
    showStatus(`Versão ${newVersion.version} criada`);
    setSubmitting(false);
  };

  const deploy = async (id: string, version: string) => {
    setSubmitting(true);
    await deployCodeVersion(id);
    await loadData();
    showStatus(`Versão ${version} aplicada em produção`);
    setSubmitting(false);
  };

  const rollback = async (id: string, version: string, notes: string) => {
    setSubmitting(true);
    await rollbackCodeVersion(id, notes);
    await loadData();
    showStatus(`Versão ${version} revertida`);
    setSubmitting(false);
  };

  const markReviewed = async (id: string) => {
    setSubmitting(true);
    await markVersionReviewed(id);
    await loadData();
    showStatus('Versão marcada como revisada');
    setSubmitting(false);
  };

  if (loading) return <LoadingPanel />;

  const activeVersion = versions.find(v => v.is_deployed);

  return (
    <EditorScene
      eyebrow="Codigo"
      title="Updates"
      description="Controlar versões e atualizações do código."
      action={
        <PrimaryButton onClick={() => setIsCreateModalOpen(true)}>
          Nova Versão
        </PrimaryButton>
      }
    >
      <div className="space-y-6">
        {activeVersion && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Versão em produção: {activeVersion.version}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">Versões</h3>
          {versions.length === 0 ? (
            <p className="text-gray-500">Nenhuma versão criada.</p>
          ) : (
            versions.map(v => (
              <div key={v.id} className="bg-black/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{v.version}</span>
                    {v.is_deployed && <CheckCircle className="h-4 w-4 text-green-400" />}
                    {v.is_active && !v.is_deployed && <Clock className="h-4 w-4 text-yellow-400" />}
                  </div>
                  <div className="flex gap-2">
                    {!v.is_deployed && (
                      <Button size="sm" onClick={() => deploy(v.id, v.version)}>
                        Aplicar
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => markReviewed(v.id)}>
                      Revisar
                    </Button>
                  </div>
                </div>
                {v.changelog && <p className="text-sm text-gray-400">{v.changelog}</p>}
                <div className="text-xs text-gray-500">
                  {new Date(v.created_at).toLocaleString('pt-PT')}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">Histórico</h3>
          {history.length === 0 ? (
            <p className="text-gray-500">Sem histórico.</p>
          ) : (
            history.slice(0, 10).map(h => (
              <div key={h.id} className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  h.action === 'deployed' ? 'bg-green-500/20 text-green-400' :
                  h.action === 'rolled_back' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {h.action}
                </span>
                <span className="text-gray-400">{h.performed_by}</span>
                <span className="text-gray-500">{new Date(h.created_at).toLocaleString('pt-PT')}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <ModalShell onClose={() => setIsCreateModalOpen(false)} title="Nova Versão">
          <div className="space-y-4">
            <Field label="Versão">
              <TextInput
                value={newVersion.version}
                onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                placeholder="1.0.1"
              />
            </Field>
            <Field label="Changelog">
              <TextArea
                value={newVersion.changelog}
                onChange={(e) => setNewVersion({ ...newVersion, changelog: e.target.value })}
                placeholder="O que mudou?"
              />
            </Field>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
              <PrimaryButton onClick={createVersion} loading={submitting}>Criar</PrimaryButton>
            </div>
          </div>
        </ModalShell>
      )}
    </EditorScene>
  );
}

function CollectionStudio({
  colName,
  title,
  defaultItem,
  showStatus,
}: {
  colName: string;
  title: string;
  defaultItem: Record<string, unknown>;
  showStatus: (message: string) => void;
}) {
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftItem, setDraftItem] = useState<Record<string, unknown>>(createCollectionDraft(defaultItem, []));
  const isCompactCollection = ['servicos', 'projectos', 'metricas', 'depoimentos', 'contactos', 'parceiros', 'sectores', 'paises', 'ferramentas'].includes(colName);

  useEffect(() => {
    const loadItems = async () => {
      const { data, error } = await supabase.from(colName).select('*').order('ordem');
      if (error) {
        console.error(`Erro ao carregar ${colName}:`, error);
        return;
      }
      const validItems = normalizeTableRows(colName, data).filter((item: Record<string, unknown>) => item && item.id);
      setItems(sortCollectionItems(validItems));
    };
    void loadItems();
  }, [colName]);

  const fields = Object.keys(defaultItem).filter((field) => !['id'].includes(field));
  const selectedItem = items.find((item) => item.id === selectedItemId) || null;

  const openCreateModal = () => {
    setDraftItem(createCollectionDraft(defaultItem, items));
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setDraftItem(createCollectionDraft(defaultItem, items));
  };

  useEffect(() => {
    if (!isCreateModalOpen && !selectedItemId) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCreateModalOpen) {
          e.preventDefault();
          closeCreateModal();
        }
        if (selectedItemId) {
          e.preventDefault();
          closeDetailsModal();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isCreateModalOpen, selectedItemId, items]);

  const openDetailsModal = (item: Record<string, any>) => {
    setSelectedItemId(item.id);
    setDraftItem({ ...item });
    setIsEditingDetails(false);
  };

  const closeDetailsModal = () => {
    setSelectedItemId(null);
    setIsEditingDetails(false);
    setDraftItem(createCollectionDraft(defaultItem, items));
  };

  const addItem = async (itemData: Record<string, unknown>) => {
    const payload = { ...itemData };
    setIsSubmitting(true);

    try {
      const id = await addFunctions[colName](payload);
      setItems((current) => sortCollectionItems([...current, { id, ...payload }]));
      closeCreateModal();
      showStatus('Item guardado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel guardar este item.';
      showStatus(message);
      console.error(`Falha ao criar item em ${colName}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteItem = async (id: string, options?: { confirmFirst?: boolean }) => {
    if (options?.confirmFirst && !window.confirm('Eliminar este item?')) return;
    
    try {
      await deleteFunctions[colName](id);
      setItems((current) => current.filter((item) => item.id !== id));
      closeDetailsModal();
      showStatus('Item eliminado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao eliminar item.';
      showStatus(message);
      console.error('Erro ao eliminar item:', error);
    }
  };

  const updateItem = async (id: string, data: Record<string, unknown>) => {
    const previousItems = items;
    const nextItems = sortCollectionItems(items.map((item) => (item.id === id ? { ...item, ...data } : item)));

    setItems(nextItems);
    setIsSubmitting(true);

    try {
      await updateFunctions[colName](id, data);
      showStatus('Alteracao guardada');
    } catch (error) {
      setItems(previousItems);
      const message = error instanceof Error ? error.message : 'Nao foi possivel guardar a alteracao.';
      showStatus(message);
      console.error(`Falha ao atualizar item em ${colName}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateItemField = async (id: string, field: string, value: unknown) => {
    await updateItem(id, { [field]: value });
  };

  return (
    <EditorScene
      eyebrow={title}
      title={`Gerir ${title.toLowerCase()}`}
      description={
        isCompactCollection
          ? 'Gerir itens da coleção.'
          : 'Every card is fully editable. Add, delete, reorder, and toggle items directly in place.'
      }
      action={
        <button
          onClick={isCompactCollection ? openCreateModal : () => void addItem(createCollectionDraft(defaultItem, items))}
          className="inline-flex items-center gap-3 rounded-2xl bg-[#635BFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5447F6]"
        >
          <Plus className="h-4 w-4" />
          Novo item
        </button>
      }
    >
      {items.length > 0 ? (
        isCompactCollection ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openDetailsModal(item)}
                  className="group rounded-[24px] border border-[#E5E7EB] bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-[#CBC5FF] hover:shadow-[0_18px_40px_rgba(99,91,255,0.10)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#635BFF]">{getCollectionEntityLabel(colName, title)}</div>
                      <h4 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[#111827]">
                        {String(item.titulo || 'Item sem titulo')}
                      </h4>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        item.ativo ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}
                    >
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 min-h-[60px] text-[13px] leading-6 text-[#6B7280]">
                    {getItemSummary(item, fields)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <CompactBadge>{String(item.corFundo || 'Sem cor')}</CompactBadge>
                    <CompactBadge>Ordem {String(item.ordem ?? '-')}</CompactBadge>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-[12px] font-medium text-[#6B7280]">
                    <span>Resumo rapido</span>
                    <span className="text-[#635BFF] transition group-hover:translate-x-0.5">Ver detalhes</span>
                  </div>
                </button>
              ))}
            </div>

{selectedItemId && (
            <ModalShell
              onClose={closeDetailsModal}
              title={
                isEditingDetails
                  ? `Editar ${getCollectionEntityLabel(colName, title)}`
                  : String(selectedItem?.titulo || 'Detalhes do item')
              }
              description={
                isEditingDetails
                  ? 'Atualize os campos abaixo e guarde as alteracoes.'
                  : 'Resumo completo do item selecionado, com acoes rapidas de gestao.'
              }
            >
              {selectedItem && !isEditingDetails ? (
                <div className="space-y-3">
                  <div className="rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <CompactBadge>{selectedItem.ativo ? 'Ativo' : 'Inativo'}</CompactBadge>
                      {'corFundo' in selectedItem && <CompactBadge>{String(selectedItem.corFundo)}</CompactBadge>}
                      {'ordem' in selectedItem && <CompactBadge>Ordem {String(selectedItem.ordem)}</CompactBadge>}
                    </div>
                    <p className="mt-2 text-[12px] leading-5 text-[#4B5563]">{getItemSummary(selectedItem, fields, true)}</p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {fields.map((field) => (
                      <div
                        key={field}
                        className={`rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 ${
                          LONG_TEXT_FIELDS.has(field) ? 'sm:col-span-2' : ''
                        }`}
                      >
                        <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#9CA3AF]">
                          {formatFieldLabel(field)}
                        </div>
                        <div className="mt-1 text-[11px] leading-4 text-[#111827]">
                          {formatFieldValue(selectedItem[field])}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 border-t border-[#E5E7EB] pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => void deleteItem(selectedItem.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-[11px] font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Apagar
                    </button>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={closeDetailsModal}
                        className="inline-flex items-center justify-center rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[11px] font-semibold text-[#374151] transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                      >
                        Cancelar
                      </button>
                      <PrimaryButton
                        type="button"
                        onClick={() => {
                          setDraftItem({ ...selectedItem });
                          setIsEditingDetails(true);
                        }}
                      >
                        Editar
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              ) : selectedItem ? (
                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void updateItem(selectedItem.id, draftItem);
                    setIsEditingDetails(false);
                    setSelectedItemId(selectedItem.id);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map((field) => (
                      <div key={field} className={LONG_TEXT_FIELDS.has(field) ? 'sm:col-span-2' : ''}>
                        <Field label={formatFieldLabel(field)}>
                          {renderFieldControl({
                            field,
                            value: draftItem[field],
                            onChange: (value) => setDraftItem((current) => ({ ...current, [field]: value })),
                          })}
                        </Field>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeDetailsModal}
                      className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-semibold text-[#374151] transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                    >
                      Cancelar
                    </button>
                    <PrimaryButton type="submit" loading={isSubmitting} disabled={isSubmitting}>Guardar</PrimaryButton>
                  </div>
                </form>
              ) : null}
            </ModalShell>
            )}
          </>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id}>
                <Panel
                  title={String(item.titulo || item.nome || item.autor || item.valor || 'Item sem titulo')}
                  description={`Registro #${item.id}`}
                >
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    {'ativo' in item && (
                      <TogglePill active={Boolean(item.ativo)} onClick={() => void updateItemField(item.id, 'ativo', !item.ativo)}>
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </TogglePill>
                    )}
                    {'emDestaque' in item && (
                      <TogglePill active={Boolean(item.emDestaque)} onClick={() => void updateItemField(item.id, 'emDestaque', !item.emDestaque)}>
                        {item.emDestaque ? 'Destaque' : 'Normal'}
                      </TogglePill>
                    )}
                    <button
                      onClick={() => void deleteItem(item.id, { confirmFirst: true })}
                      className="inline-flex items-center gap-2 rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-[11px] font-semibold text-[#DC2626] transition hover:bg-[#DC2626] hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map((field) => (
                      <div key={field} className={LONG_TEXT_FIELDS.has(field) ? 'sm:col-span-2' : ''}>
                        <Field label={formatFieldLabel(field)}>
                          {renderFieldControl({
                            field,
                            value: item[field],
                            onChange: (value) => {
                              void updateItemField(item.id, field, value);
                            },
                          })}
                        </Field>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-[24px] border border-dashed border-[#D1D5DB] bg-white px-6 py-14 text-center shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F5F3FF] text-[#635BFF]">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <h4 className="mt-6 text-2xl font-bold tracking-[-0.04em] text-[#111827]">Sem dados ainda</h4>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6B7280]">
            Crie o primeiro item desta colecao para comecar a preencher o painel novo.
          </p>
        </div>
      )}

      {isCompactCollection && isCreateModalOpen && (
        <ModalShell
          onClose={closeCreateModal}
          title={`Novo ${getCollectionEntityLabel(colName, title)}`}
          description="Preencha os dados e guarde para criar um novo item na colecao."
        >
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void addItem(draftItem);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field} className={LONG_TEXT_FIELDS.has(field) ? 'sm:col-span-2' : ''}>
                  <Field label={formatFieldLabel(field)}>
                    {renderFieldControl({
                      field,
                      value: draftItem[field],
                      onChange: (value) => setDraftItem((current) => ({ ...current, [field]: value })),
                    })}
                  </Field>
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCreateModal}
                className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-semibold text-[#374151] transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
              >
                Cancelar
              </button>
              <PrimaryButton type="submit" loading={isSubmitting} disabled={isSubmitting}>Guardar</PrimaryButton>
            </div>
          </form>
        </ModalShell>
      )}
    </EditorScene>
  );
}

function CompactBadge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#4B5563]">{children}</span>;
}

function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[260] flex items-center justify-center bg-[#09090B]/55 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-md max-h-[70vh] overflow-hidden rounded-[16px] border border-white/50 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.28)]"
        >
          <div className="flex items-start justify-between gap-2 mb-4">
            <h3 className="text-lg font-bold">{title}</h3>
            <IconButton onClick={onClose}>
              <X className="h-4 w-4" />
            </IconButton>
          </div>
          <div className="overflow-y-auto max-h-[calc(70vh-80px)]">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ModalShell({
  onClose,
  title,
  description,
  children,
}: {
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      <motion.div
          className="fixed inset-0 z-[260] flex items-center justify-center bg-[#09090B]/55 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-3xl max-h-[70vh] overflow-hidden rounded-[16px] border border-white/50 bg-white p-3 shadow-[0_28px_80px_rgba(15,23,42,0.28)] sm:p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[8px] font-semibold uppercase tracking-[0.32em] text-[#635BFF]">CMS modal</div>
                <h3 className="mt-1 text-[16px] font-bold tracking-[-0.05em] text-[#111827]">{title}</h3>
                <p className="mt-0.5 text-[11px] leading-4 text-[#6B7280]">{description}</p>
              </div>
              <IconButton onClick={onClose} className="shrink-0">
                <X className="h-3.5 w-3.5" />
              </IconButton>
            </div>

            <div className="mt-3 overflow-y-auto max-h-[calc(70vh-80px)]">{children}</div>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
}

function createCollectionDraft(defaultItem: Record<string, unknown>, items: Record<string, any>[]) {
  const nextDraft = { ...defaultItem };

  if ('ordem' in nextDraft) {
    const nextOrder = items.reduce((highest, item) => {
      const currentOrder = Number(item.ordem);
      return Number.isFinite(currentOrder) ? Math.max(highest, currentOrder) : highest;
    }, 0);
    nextDraft.ordem = nextOrder + 1;
  }

  return nextDraft;
}

function sortCollectionItems(items: Record<string, any>[]) {
  return [...items].sort((left, right) => {
    const leftOrder = Number(left.ordem);
    const rightOrder = Number(right.ordem);

    if (Number.isFinite(leftOrder) && Number.isFinite(rightOrder) && leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return String(left.titulo || left.nome || left.autor || left.valor || left.id).localeCompare(
      String(right.titulo || right.nome || right.autor || right.valor || right.id),
    );
  });
}

function getCollectionEntityLabel(colName: string, title: string) {
  const labels: Record<string, string> = {
    servicos: 'servico',
    projectos: 'projecto',
    metricas: 'metrica',
    depoimentos: 'depoimento',
    contactos: 'contacto',
    sectores: 'sector',
    paises: 'pais',
    ferramentas: 'ferramenta',
    parceiros: 'parceiro',
  };

  return labels[colName] || title.toLowerCase().replace(/s$/, '');
}

function getItemSummary(item: Record<string, any>, fields: string[], expanded = false) {
  const candidates = ['descricao', 'texto', 'tagline', 'categoria', 'legenda', 'cargo', 'valor']
    .map((field) => item[field])
    .find((value) => typeof value === 'string' && value.trim().length > 0);

  if (candidates) return String(candidates);

  const fallback = fields
    .filter((field) => typeof item[field] === 'string' && item[field] && !['titulo'].includes(field))
    .map((field) => String(item[field]).trim())
    .find(Boolean);

  if (fallback) return fallback;

  return expanded ? 'Sem descricao adicional para este item.' : 'Clique para ver os detalhes completos deste item.';
}

function formatFieldValue(value: unknown) {
  if (typeof value === 'boolean') return value ? 'Sim' : 'Nao';
  if (Array.isArray(value)) return value.length > 0 ? `${value.length} imagem(ns)` : 'Sem informacao';
  if (value === null || value === undefined || value === '') return 'Sem informacao';
  return String(value);
}

function renderFieldControl({
  field,
  value,
  onChange,
}: {
  field: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (typeof value === 'boolean') {
    return (
      <button
        onClick={() => onChange(!value)}
        className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
          value ? 'border-[#D8D4FE] bg-[#F5F3FF] text-[#635BFF]' : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]'
        }`}
      >
        {value ? 'Sim' : 'Nao'}
      </button>
    );
  }

  if (FIELD_OPTIONS[field]) {
    return (
      <SelectInput value={String(value ?? '')} onChange={(event) => onChange(event.target.value)}>
        {FIELD_OPTIONS[field].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectInput>
    );
  }

  if (LONG_TEXT_FIELDS.has(field)) {
    return <TextArea value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
  }

  if (field === 'ordem') {
    return <TextInput type="number" value={String(value ?? 0)} onChange={(event) => onChange(Number.parseInt(event.target.value, 10) || 0)} />;
  }

  // Campos de imagem
  if (['imagemDestaque', 'logo', 'bandeira', 'fotografia'].includes(field)) {
    const isMultiple = field === 'imagemDestaque';
    return (
      <ImageUpload
        value={isMultiple ? (Array.isArray(value) ? value : []) : String(value ?? '')}
        onChange={(newValue) => onChange(newValue)}
        multiple={isMultiple}
        label={formatFieldLabel(field)}
        accept="image/*"
      />
    );
  }

  // Campos de array (ferramentas, cores)
  if (['ferramentas', 'cores'].includes(field)) {
    const arrValue = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        <TextInput 
          value={arrValue.join(', ')} 
          onChange={(event) => onChange(event.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
          placeholder="Separar por vírgulas"
        />
        <div className="flex flex-wrap gap-1">
          {arrValue.map((item, idx) => (
            <span key={idx} className="bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded text-xs">{item}</span>
          ))}
        </div>
      </div>
    );
  }

  return <TextInput value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
}

function EditorScene({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#635BFF]">{eyebrow}</div>
            <h3 className="mt-2.5 text-[1.8rem] font-bold leading-tight tracking-[-0.05em] text-[#111827]">{title}</h3>
            <p className="mt-2.5 text-[13px] leading-6 text-[#6B7280]">{description}</p>
          </div>
          {action}
        </div>
      </section>
      {children}
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      {(title || description) && (
        <div className="mb-4 border-b border-[#E5E7EB] pb-3.5">
          {title && <h4 className="text-[17px] font-semibold tracking-[-0.03em] text-[#111827]">{title}</h4>}
          {description && <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

function ImagePreviewWithError({ url, alt }: { url: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="h-12 w-12 rounded bg-red-50 flex items-center justify-center">
        <ImageOff className="h-5 w-5 text-red-400" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="h-12 w-12 rounded object-cover"
      onError={() => setHasError(true)}
    />
  );
}

function ImageUpload({
  value,
  onChange,
  accept = 'image/*',
  multiple = false,
  label = 'Imagem',
}: {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetFiles = event.target.files;
    if (!targetFiles || targetFiles.length === 0) return;
    
    const selectedFiles = Array.from(targetFiles) as File[];
    const oversizedFile = selectedFiles.find((file) => file.size > 15 * 1024 * 1024);
    if (oversizedFile) {
      alert(`O ficheiro "${oversizedFile.name}" deve ter menos de 15MB`);
      return;
    }

    setUploading(true);
    
    try {
      const bucket = supabase.storage.from('portfolio-images');
      const uploadedUrls: string[] = [];
      
      for (const file of selectedFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
        const filePath = `fotografia/${fileName}`;

        const { error: uploadError } = await bucket.upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error('Erro no armazenamento: ' + uploadError.message);
        }
      
      const { data } = bucket.getPublicUrl(filePath);
      
        if (!data?.publicUrl) {
          throw new Error('Nao foi possivel obter o URL da imagem');
        }

        uploadedUrls.push(data.publicUrl);
      }

      if (multiple) {
        const currentValue = Array.isArray(value) ? value : [];
        onChange([...currentValue, ...uploadedUrls]);
      } else if (uploadedUrls[0]) {
        onChange(uploadedUrls[0]);
      }
      /*
      }
        throw new Error('Não foi possível obter o URL da imagem');
      }
      */
    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMessage = error?.message || 'Falha no upload';
      alert('Erro ao carregar: ' + errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index?: number) => {
    if (multiple && typeof index === 'number') {
      const newImages = Array.isArray(value) ? [...value] : [];
      newImages.splice(index, 1);
      onChange(newImages);
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-[12px] font-medium text-[#374151]">{label}</div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#374151] transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB] disabled:opacity-50"
      >
        {uploading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#635BFF] border-t-transparent" />
            A fazer upload...
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" />
            {multiple ? 'Adicionar imagens' : 'Carregar imagem'}
          </>
        )}
      </button>

      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="space-y-2">
          {value.map((url, index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-2">
              <ImagePreviewWithError url={url} alt={`Imagem ${index + 1}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] text-[#6B7280]">{url}</div>
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-1.5 text-[#DC2626] transition hover:bg-[#FEE2E2]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!multiple && value && typeof value === 'string' && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-2">
            <ImagePreviewWithError url={value} alt="Imagem" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] text-[#6B7280]">{value}</div>
            </div>
            <button
              type="button"
              onClick={() => removeImage()}
              className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-1.5 text-[#DC2626] transition hover:bg-[#FEE2E2]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
            {value && typeof value === 'string' && (
              <img src={value} alt="Preview" className="h-32 w-full object-cover" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="text-[12px] font-medium text-[#374151]">{label}</div>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#CBC5FF] focus:ring-2 focus:ring-[#EEEAFE] ${
        props.className || ''
      }`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[104px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#CBC5FF] focus:ring-2 focus:ring-[#EEEAFE] ${
        props.className || ''
      }`}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#CBC5FF] focus:ring-2 focus:ring-[#EEEAFE] ${
        props.className || ''
      }`}
    />
  );
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary'; size?: 'sm' | 'md'; loading?: boolean }) {
  if (variant === 'secondary') {
    return (
      <button
        {...props}
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-55 ${props.className || ''}`}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      {...props}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#635BFF] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#5447F6] disabled:cursor-not-allowed disabled:opacity-55 ${size === 'sm' ? 'px-3 py-1.5 text-xs' : ''} ${props.className || ''}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

function PrimaryButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#635BFF] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#5447F6] disabled:cursor-not-allowed disabled:opacity-55 ${
        props.className || ''
      }`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      {children}
    </button>
  );
}

function TogglePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold transition ${
        active ? 'border-[#DDD9FF] bg-[#F5F3FF] text-[#635BFF]' : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]'
      }`}
    >
      {active && <CheckCircle2 className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function ToolbarButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#09090B]">{children}</div>;
}

function ToolbarPill({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#374151] transition hover:border-[#D8D4FE] hover:text-[#635BFF]"
    >
      {children}
    </button>
  );
}

function IconButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#71717A] transition hover:border-[#D8D4FE] hover:text-[#635BFF] ${className || ''}`}
    >
      {children}
    </button>
  );
}

function LoadingPanel() {
  return (
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="h-5 w-40 animate-pulse rounded-full bg-[#EEF2F7]" />
      <div className="mt-5 h-40 animate-pulse rounded-[24px] bg-[#F5F7FB]" />
    </div>
  );
}

function getDefaultSlides(): SlideConfig[] {
  return [
    { id: 'slide-01', titulo: 'QUEM SOU', eyebrow: 'Quem Sou' },
    { id: 'slide-02', titulo: 'O QUE FACO', eyebrow: 'Expertise' },
    { id: 'slide-03', titulo: 'NUMEROS QUE FALAM', eyebrow: 'Performance' },
    { id: 'slide-04', titulo: 'PROJETOS', eyebrow: 'Trabalhos' },
    { id: 'slide-05', titulo: 'CLIENTES E SECTORES', eyebrow: 'Global' },
    { id: 'slide-06', titulo: 'PARCEIROS', eyebrow: 'Parcerias' },
    { id: 'slide-07', titulo: 'TESTEMUNHOS', eyebrow: 'Depoimentos' },
    { id: 'slide-08', titulo: 'FERRAMENTAS', eyebrow: 'Tecnologias' },
    { id: 'slide-09', titulo: 'CONTACTOS', eyebrow: 'Fale Comigo' },
  ];
}

function formatFieldLabel(field: string) {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}
