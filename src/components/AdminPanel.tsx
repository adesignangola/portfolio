import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Save, Plus, Trash2, LogIn, LogOut, Loader2, 
  User, Briefcase, Layers, BarChart3, Users, Mail, 
  Globe, Search, Bell, Settings, LayoutDashboard, ChevronRight,
  FileDown, FileUp, Database, FileJson, FileType, FileText, FileSpreadsheet, Copy,
  CheckCircle, AlertCircle, List, Flag, Cpu, Image as ImageIcon, Upload, Building2
} from 'lucide-react';
import { auth, db, login, logout, subscribeToCollection } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import Papa from 'papaparse';
import * as mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [itemsCount, setItemsCount] = useState<any>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const adminDoc = await getDoc(doc(db, 'admins', u.uid));
        setIsAdmin(adminDoc.exists() || u.email === 'adilsonamado.aa@gmail.com');
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Count items for dashboard stats
    const collectionsCount = ['servicos', 'projectos', 'metricas', 'depoimentos', 'contactos', 'sectores', 'paises', 'ferramentas', 'parceiros'];
    const unsubs = collectionsCount.map(col => 
      subscribeToCollection(col, (list) => {
        setItemsCount((prev: any) => ({ ...prev, [col]: list.length }));
      })
    );
    return () => unsubs.forEach(unsub => unsub());
  }, []);

  if (loading) return <div className="fixed inset-0 bg-white z-[200] flex items-center justify-center"><Loader2 className="animate-spin text-brand-orange" /></div>;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 text-center">
        <button onClick={onClose} className="absolute top-10 right-10"><X /></button>
        <h2 className="text-2xl sm:text-4xl font-display font-bold mb-8 uppercase tracking-tighter">Acesso Restrito CMS</h2>
        <button 
          onClick={login}
          className="flex items-center gap-4 bg-brand-dark text-white px-6 sm:px-10 py-4 sm:py-6 font-bold uppercase tracking-widest hover:bg-brand-orange transition-all rounded-xl"
        >
          <LogIn className="h-5 w-5" />
          <span>Entrar com Google</span>
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 text-center">
        <button onClick={onClose} className="absolute top-10 right-10"><X /></button>
        <h2 className="text-3xl font-display font-bold mb-4 uppercase">Acesso Negado</h2>
        <p className="max-w-xs opacity-60 mb-8">O seu email ({user.email}) não tem permissões de administrador. Contacte o suporte.</p>
        <button onClick={logout} className="text-brand-orange font-bold underline">Sair</button>
      </div>
    );
  }

  const menuItems = [
    { id: 'slides', label: 'Slides', icon: LayoutDashboard, category: 'Menu' },
    { id: 'quemSou', label: 'Quem Sou Eu', icon: User, category: 'Menu' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Menu' },
    { id: 'perfil', label: 'Perfil', icon: User, category: 'Menu' },
    { id: 'servicos', label: 'Serviços', icon: Briefcase, category: 'Menu' },
    { id: 'projectos', label: 'Projectos', icon: Layers, category: 'Menu' },
    { id: 'metricas', label: 'Estatísticas', icon: BarChart3, category: 'Menu' },
    { id: 'depoimentos', label: 'Testemunhos', icon: Users, category: 'Social' },
    { id: 'contactos', label: 'Contactos', icon: Mail, category: 'Social' },
    { id: 'parceiros', label: 'Parceiros', icon: Building2, category: 'Social' },
    { id: 'sectores', label: 'Sectores', icon: List, category: 'Social' },
    { id: 'paises', label: 'Países', icon: Flag, category: 'Social' },
    { id: 'ferramentas', label: 'Ferramentas', icon: Cpu, category: 'Social' },
    { id: 'config', label: 'Configs', icon: Globe, category: 'Social' },
    { id: 'dados', label: 'Dados', icon: Database, category: 'Sistema' },
  ];

  const showStatus = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-[#F5F7FB] z-[200] flex overflow-hidden font-sans text-brand-dark">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-white flex flex-col shrink-0 border-r border-zinc-100 shadow-sm">
        <div className="p-6 pb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-orange/20">
             <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="font-display font-bold text-lg uppercase tracking-tighter hidden lg:block">Admin<span className="text-brand-orange">Panel</span></span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-6">
           <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-30 mb-4 px-3 hidden lg:block">Navegação</p>
              <nav className="space-y-1">
                {menuItems.filter(i => i.category === 'Menu').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
                      activeTab === item.id 
                      ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                      : 'text-zinc-400 hover:bg-zinc-50 hover:text-brand-orange'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="font-bold text-[12px] hidden lg:block">{item.label}</span>
                    {activeTab === item.id && (
                      <motion.div layoutId="active" className="absolute right-3 lg:block hidden">
                         <ChevronRight className="h-3 w-3" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </nav>
           </div>

           <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-30 mb-4 px-3 hidden lg:block">Integrações</p>
              <nav className="space-y-1">
                {menuItems.filter(i => i.category === 'Social').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
                      activeTab === item.id 
                      ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                      : 'text-zinc-400 hover:bg-zinc-50 hover:text-brand-orange'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="font-bold text-[12px] hidden lg:block">{item.label}</span>
                  </button>
                ))}
              </nav>
           </div>

           <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-30 mb-4 px-3 hidden lg:block">Sistema</p>
              <nav className="space-y-1">
                {menuItems.filter(i => i.category === 'Sistema').map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
                      activeTab === item.id 
                      ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                      : 'text-zinc-400 hover:bg-zinc-50 hover:text-brand-orange'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="font-bold text-[12px] hidden lg:block">{item.label}</span>
                  </button>
                ))}
              </nav>
           </div>
        </div>

        <div className="p-3 border-t border-zinc-100">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all group"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="font-bold text-[12px] hidden lg:block">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white flex items-center justify-between px-6 lg:px-10 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-6 flex-1 max-w-xl">
             <div className="relative w-full hidden sm:block">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
               <input 
                 type="text" 
                 placeholder="Pesquisar no sistema..." 
                 className="w-full bg-[#F5F7FB] border-none rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-medium focus:ring-1 focus:ring-brand-orange focus:bg-white transition-all outline-none"
               />
             </div>
             <button onClick={() => setActiveTab('config')} className="p-2.5 bg-[#F5F7FB] rounded-xl text-zinc-400 hover:text-brand-orange transition-all">
                <Settings className="h-4 w-4" />
             </button>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
               <div className="relative p-2.5 bg-[#F5F7FB] rounded-xl text-zinc-400">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-orange rounded-full border-2 border-white"></span>
               </div>
               <div className="hidden lg:flex flex-col text-right">
                  <span className="text-[11px] font-bold truncate max-w-[150px]">{user.displayName || 'Admin'}</span>
                  <span className="text-[9px] font-bold text-brand-orange uppercase tracking-widest leading-none">Super Admin</span>
               </div>
               <div className="w-9 h-9 rounded-xl overflow-hidden bg-brand-cream border-2 border-white shadow-sm">
                 <img src={user.photoURL} className="w-full h-full object-cover" />
               </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-brand-orange transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-1 px-1">
               <div>
                  <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{activeTab}</h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mt-1">Visão Geral e Gestão</p>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl shadow-zinc-200/40 border border-zinc-100 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'dashboard' && <DashboardOverview counts={itemsCount} setTab={setActiveTab} />}
                  {activeTab === 'slides' && <EditorSlides />}
                  {activeTab === 'quemSou' && <EditorQuemSou />}
                  {activeTab === 'perfil' && <EditorPerfil />}
                  {activeTab === 'servicos' && <CollectionManager colName="servicos" title="Serviços" />}
                  {activeTab === 'projectos' && <CollectionManager colName="projectos" title="Projectos" />}
                  {activeTab === 'metricas' && <CollectionManager colName="metricas" title="Estatísticas" />}
                  {activeTab === 'depoimentos' && <CollectionManager colName="depoimentos" title="Testemunhos" />}
                  {activeTab === 'contactos' && <CollectionManager colName="contactos" title="Contactos" />}
                  {activeTab === 'sectores' && <CollectionManager colName="sectores" title="Sectores de Actuação" />}
                  {activeTab === 'paises' && <CollectionManager colName="paises" title="Países de Atuação" />}
                  {activeTab === 'ferramentas' && <CollectionManager colName="ferramentas" title="Ferramentas" />}
                  {activeTab === 'parceiros' && <CollectionManager colName="parceiros" title="Parceiros" />}
                  {activeTab === 'config' && <EditorConfig />}
                  {activeTab === 'dados' && <ImportExportManager showStatus={showStatus} onClose={onClose} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
      
      {status && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-10 right-10 bg-brand-dark text-white p-4 rounded-2xl shadow-2xl text-[10px] uppercase font-bold tracking-[0.2em] z-[300]"
        >
          {status}
        </motion.div>
      )}
    </div>
  );
}

const compressImage = (file: File, maxWidth = 1200): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compressing to keep Firestore doc < 1MB
      };
    };
  });
};

const defaultSlides = [
  { id: 'slide-01', titulo: 'QUEM SOU', eyebrow: 'Quem Sou' },
  { id: 'slide-02', titulo: 'O QUE FAÇO', eyebrow: 'Expertise' },
  { id: 'slide-03', titulo: 'NÚMEROS QUE FALAM', eyebrow: 'Performance' },
  { id: 'slide-04', titulo: 'PROJETOS', eyebrow: 'Trabalhos' },
  { id: 'slide-05', titulo: 'CLIENTES E SECTORES', eyebrow: 'Global' },
  { id: 'slide-06', titulo: 'PARCEIROS', eyebrow: 'Parcerias' },
  { id: 'slide-07', titulo: 'TESTEMUNHOS', eyebrow: 'Depoimentos' },
  { id: 'slide-08', titulo: 'FERRAMENTAS', eyebrow: 'Tecnologias' },
  { id: 'slide-09', titulo: 'CONTACTOS', eyebrow: 'Fale Comigo' },
];

function EditorSlides() {
  const [slides, setSlides] = useState<any[]>(defaultSlides);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSlides = async () => {
      const snap = await getDocs(collection(db, 'slides'));
      if (snap.docs.length > 0) {
        setSlides(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    };
    loadSlides();
  }, []);

  const updateSlide = async (id: string, field: string, value: string) => {
    const updated = slides.map(s => s.id === id ? { ...s, [field]: value } : s);
    setSlides(updated);
    await setDoc(doc(db, 'slides', id), { [field]: value, updatedAt: new Date().toISOString() }, { merge: true });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-zinc-50 p-5 rounded-xl">
        <div>
          <h3 className="text-lg font-display font-bold uppercase tracking-tight leading-none">Títulos dos Slides</h3>
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">Personalize o título e eyebrow de cada slide</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="p-6 bg-white border border-zinc-100 rounded-2xl flex flex-col gap-4 hover:border-brand-orange/20 transition-all shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold text-brand-orange">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{slide.id}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400">Título</label>
                <input 
                  type="text" 
                  value={slide.titulo} 
                  onChange={e => updateSlide(slide.id, 'titulo', e.target.value)}
                  className="w-full bg-zinc-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-brand-orange transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400">Eyebrow</label>
                <input 
                  type="text" 
                  value={slide.eyebrow} 
                  onChange={e => updateSlide(slide.id, 'eyebrow', e.target.value)}
                  className="w-full bg-zinc-50 rounded-lg p-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-brand-orange transition-all"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorQuemSou() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'quemsou', 'principal')).then(s => {
      if (s.exists()) setData(s.data());
      else setData({ 
        nomePrimeiraLinha: 'Adilson',
        nomeDestaque: 'Pinto',
        biografia: 'Designer com mais de 5 anos de experiência especializado em identidade visual e comunicação criativa. Apaixonado por transformar conceitos em marcas poderosas.',
        fotografia: '',
        tags: ['IDENTIDADE VISUAL', 'BRANDING', 'DESIGN']
      });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await setDoc(doc(db, 'quemsou', 'principal'), data);
    setSaving(false);
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...(data.tags || [])];
    newTags[index] = value;
    setData({...data, tags: newTags});
  };

  const addTag = () => {
    setData({...data, tags: [...(data.tags || []), 'NOVA TAG']});
  };

  const removeTag = (index: number) => {
    const newTags = (data.tags || []).filter((_: any, i: number) => i !== index);
    setData({...data, tags: newTags});
  };

  if (!data) return <div className="space-y-6 animate-pulse"><div className="h-32 bg-zinc-100 rounded-xl" /><div className="h-32 bg-zinc-100 rounded-xl" /></div>;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Nome (Primeira Linha)</label>
          <input type="text" value={data.nomePrimeiraLinha} onChange={e => setData({...data, nomePrimeiraLinha: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Nome em Destaque (Laranja)</label>
          <input type="text" value={data.nomeDestaque} onChange={e => setData({...data, nomeDestaque: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="md:col-span-2 space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Biografia</label>
          <textarea value={data.biografia} onChange={e => setData({...data, biografia: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none h-32 transition-all font-medium leading-relaxed text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Fotografia do Perfil</label>
          <div className="flex items-center gap-4">
            {data.fotografia && (
              <div className="w-16 h-16 rounded-xl overflow-hidden grayscale border border-zinc-100">
                <img src={data.fotografia} className="w-full h-full object-cover" />
              </div>
            )}
            <label className="flex-1 bg-zinc-100 p-4 rounded-xl border border-dashed border-zinc-300 hover:bg-zinc-200 transition-all cursor-pointer flex flex-col items-center justify-center">
              <Upload className="h-4 w-4 text-zinc-400 mb-1" />
              <span className="text-[9px] font-bold uppercase text-zinc-500">Alterar Foto</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={async (e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     const base64 = await compressImage(file, 800);
                     setData({...data, fotografia: base64});
                   }
                }}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Tags de Competências</label>
          <button onClick={addTag} className="text-[9px] font-bold text-brand-orange hover:text-brand-dark transition-all">+ Adicionar Tag</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.tags || []).map((tag: string, index: number) => (
            <div key={index} className="flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/20 rounded-full px-4 py-2">
              <input 
                type="text" 
                value={tag} 
                onChange={e => updateTag(index, e.target.value)}
                className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none w-32"
              />
              <button onClick={() => removeTag(index)} className="text-zinc-400 hover:text-red-500 transition-all">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <button 
        onClick={save} 
        disabled={saving}
        className="flex items-center justify-center gap-3 bg-brand-orange text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50 rounded-xl shadow-lg shadow-brand-orange/10"
      >
        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
        <span className="text-[11px]">Guardar Quem Sou</span>
      </button>
    </div>
  );
}

function ImportExportManager({ showStatus, onClose }: { showStatus: (m: string) => void, onClose: () => void }) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [targetCol, setTargetCol] = useState('projectos');
  const [inputText, setInputText] = useState('');
  const [lastImport, setLastImport] = useState<{ count: number, collection: string, items: any[] } | null>(null);

  const copyAIPrompt = () => {
    const schemas: any = {
      projectos: "{ id, titulo, categoria, nomeCliente, ano, imagemDestaque, emDestaque (bool), ordem (num) }",
      servicos: "{ id, titulo, descricao, corFundo ('azul-escuro' ou 'laranja'), ordem (num), ativo (bool) }",
      metricas: "{ id, valor, sufixo, legenda, ordem (num) }",
      depoimentos: "{ id, texto, autor, cargo, organizacao, iniciais, emDestaque (bool), ordem (num) }",
      contactos: "{ id, tipo ('email','whatsapp','instagram'), etiqueta, valor, link, ordem (num) }",
      sectores: "{ id, nome, ordem (num) }",
      paises: "{ id, nome, bandeira (emoji), descricao, ordem (num) }",
      ferramentas: "{ id, nome, grupo ('adobe' ou 'outras'), ordem (num) }",
      parceiros: "{ id, nome, logo, link, ordem (num) }"
    };

    const prompt = `Aja como um engenheiro de dados especialista. Gere uma lista de dados no formato JSON puro para o meu portfólio.
Coleção Alvo: '${targetCol}'

Estrutura JSON esperada por item:
${schemas[targetCol] || '{ id, titulo, descricao, ordem }'}

INSTRUÇÕES:
1. Gere 5 registros realistas e profissionais.
2. Retorne APENAS o array JSON [{}, {}...].
3. NÃO use blocos de código markdown ou explicações.
4. Para URLs de imagem, use links do Unsplash relevantes.
5. Use Português de Angola/Portugal para os textos.`;

    navigator.clipboard.writeText(prompt);
    showStatus('Prompt Copiado! Use-o no ChatGPT/Gemini para gerar os dados.');
  };

  const processData = async (data: any[], col: string) => {
    if (data.length > 0) {
      const batch = writeBatch(db);
      data.forEach(item => {
        const newDocRef = doc(collection(db, col));
        batch.set(newDocRef, { ...item, updatedAt: new Date().toISOString() });
      });
      await batch.commit();
      setLastImport({ count: data.length, collection: col, items: data.slice(0, 3) });
      showStatus(`${data.length} itens importados em ${col}!`);
      return true;
    }
    showStatus('Nenhum dado válido encontrado.');
    return false;
  };

  const handleTextImport = async () => {
    if (!inputText.trim()) return;
    setImporting(true);
    try {
      const data = JSON.parse(inputText);
      await processData(Array.isArray(data) ? data : [data], targetCol);
      setInputText('');
    } catch (e) {
      showStatus('Erro: O texto não é um JSON válido.');
    }
    setImporting(false);
  };

  const seedFromConstants = async () => {
    setImporting(true);
    showStatus('A carregar dados padrão do sistema...');
    try {
      const batch = writeBatch(db);

      const PERFIL_DATA = {
        fotografia: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
        nomeCompleto: 'ADILSON PINTO AMADO',
        destaqueNome: 'PINTO',
        eyebrowEntrada: 'DESIGNER, LUANDA, ANGOLA',
        tagline: 'Criador de identidades visuais que comunicam, vendem e ficam na memória. Mais de 5 anos a transformar marcas em Angola, Portugal e Alemanha.',
        biografia: 'Designer com mais de 5 anos de experiência especializado em identidade visual e comunicação criativa. Apaixonado por transformar conceitos em marcas poderosas.',
        labelBotaoInicio: 'Começar',
        labelBotaoAcaoFinal: 'Solicitar Orçamento',
        anoPortfolio: '2025'
      };

      const CONFIG_GLOBALS = {
        nomeAgencia: 'A-DESIGN ANGOLA',
        servicosRodape: 'Identidade Visual • Branding • Design Gráfico • Redes Sociais',
        processoTrabalho: 'Processo de trabalho: Briefing, Conceito, Desenvolvimento, Revisão e Entrega. Comunicação transparente em cada etapa.',
        etiquetaRodapeContacto: 'VAMOS TRABALHAR JUNTOS'
      };

      const listMappings: any = {
        servicos: [
          { id: '1', titulo: 'IDENTIDADE VISUAL', descricao: 'Criação de logos, paletas de cor, tipografia e manual de marca.', corFundo: 'azul-escuro', ordem: 1, ativo: true },
          { id: '2', titulo: 'DESIGN GRÁFICO', descricao: 'Artes para redes sociais, cartazes, flyers e materiais.', corFundo: 'laranja', ordem: 2, ativo: true }
        ],
        projectos: [
          { id: '1', imagemDestaque: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800', titulo: 'IDENTIDADE KERO', nomeCliente: 'KERO', categoria: 'BRANDING', descricao: 'Redesign completo da identidade visual.', ano: '2024', emDestaque: true, ordem: 1, ativo: true }
        ],
        metricas: [
          { id: '1', valor: '5', sufixo: '+', legenda: 'Anos de\nExperiência', ordem: 1, ativo: true },
          { id: '2', valor: '50', sufixo: '+', legenda: 'Projetos\nConcluídos', ordem: 2, ativo: true },
          { id: '3', valor: '3', sufixo: '', legenda: 'Países de\nAtuação', ordem: 3, ativo: true },
          { id: '4', valor: '100', sufixo: '%', legenda: 'Satisfação\nTotal', ordem: 4, ativo: true }
        ],
        depoimentos: [
          { id: '1', texto: 'O Adilson conseguiu captar exatamente a essência da nossa marca.', autor: 'Helena Santos', cargo: 'Diretora de Marketing', organizacao: 'Kero', iniciais: 'HS', emDestaque: true, ordem: 1, ativo: true }
        ],
        contactos: [
          { id: '1', etiqueta: 'Email', valor: 'contato@adesign.ao', tipo: 'email', link: 'mailto:contato@adesign.ao', ordem: 1, ativo: true },
          { id: '2', etiqueta: 'WhatsApp', valor: '+244 9XX XXX XXX', tipo: 'whatsapp', link: 'https://wa.me/244900000000', ordem: 2, ativo: true }
        ],
        sectores: [
          { id: '1', nome: 'Retalho', ordem: 1, ativo: true },
          { id: '2', nome: 'Energia', ordem: 2, ativo: true },
          { id: '3', nome: 'Telecomunicações', ordem: 3, ativo: true }
        ],
        paises: [
          { id: '1', nome: 'Angola', bandeira: '🇦🇴', descricao: 'Mercado Principal', ordem: 1, ativo: true },
          { id: '2', nome: 'Portugal', bandeira: '🇵🇹', descricao: 'Presença Internacional', ordem: 2, ativo: true }
        ],
        ferramentas: [
          { id: '1', nome: 'Adobe Illustrator', grupo: 'adobe', ordem: 1, ativo: true },
          { id: '2', nome: 'Figma', grupo: 'outras', ordem: 2, ativo: true }
        ],
        parceiros: [
          { id: '1', nome: 'KERO', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop', link: 'https://kero.com.ao', ordem: 1, ativo: true }
        ],
        slides: [
          { id: 'slide-01', titulo: 'QUEM SOU', eyebrow: 'Quem Sou' },
          { id: 'slide-02', titulo: 'O QUE FAÇO', eyebrow: 'Expertise' },
          { id: 'slide-03', titulo: 'NÚMEROS QUE FALAM', eyebrow: 'Performance' },
          { id: 'slide-04', titulo: 'PROJETOS', eyebrow: 'Trabalhos' },
          { id: 'slide-05', titulo: 'CLIENTES E SECTORES', eyebrow: 'Global' },
          { id: 'slide-06', titulo: 'PARCEIROS', eyebrow: 'Parcerias' },
          { id: 'slide-07', titulo: 'TESTEMUNHOS', eyebrow: 'Confiança' },
          { id: 'slide-08', titulo: 'FERRAMENTAS', eyebrow: 'Toolkit' },
          { id: 'slide-09', titulo: 'CONTACTOS', eyebrow: 'Vamos Conversar' }
        ]
      };

      batch.set(doc(db, 'perfil', 'principal'), { ...PERFIL_DATA, updatedAt: new Date().toISOString() });
      batch.set(doc(db, 'configuracoes', 'global'), { ...CONFIG_GLOBALS, updatedAt: new Date().toISOString() });
      batch.set(doc(db, 'quemsou', 'principal'), { 
        nomePrimeiraLinha: 'Adilson',
        nomeDestaque: 'Pinto',
        biografia: 'Designer com mais de 5 anos de experiência especializado em identidade visual e comunicação criativa. Apaixonado por transformar conceitos em marcas poderosas.',
        fotografia: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
        tags: ['IDENTIDADE VISUAL', 'BRANDING', 'DESIGN'],
        updatedAt: new Date().toISOString()
      });

      for (const [col, data] of Object.entries(listMappings)) {
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const docId = item.id?.toString() || undefined;
            const docRef = docId ? doc(db, col, docId) : doc(collection(db, col));
            batch.set(docRef, { ...item, updatedAt: new Date().toISOString() });
          });
        }
      }

      await batch.commit();
      showStatus('Base de dados inicializada com os mocks!');
    } catch (e) {
      console.error(e);
      showStatus('Erro ao inicializar dados.');
    }
    setImporting(false);
  };

  const exportPDF = async () => {
    setExporting(true);
    showStatus('Gerando PDF do design atual...');
    
    // Fechar o painel de admin temporariamente para captura limpa
    // Mas antes, precisamos de uma referência ao elemento. 
    // Como o adminPanel é um overlay, vamos tentar capturar o conteúdo por baixo.
    
    try {
      const element = document.body; // Capturar tudo ou um elemento específico
      // Ocultar o admin panel para a foto
      const adminOverlay = document.querySelector('.fixed.inset-0.z-\\[200\\]');
      if (adminOverlay) (adminOverlay as HTMLElement).style.display = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        onclone: (clonedDoc) => {
          // Robust fix for modern colors (oklab, oklch) that html2canvas fails to parse.
          // We target both style tags and the overall head/body content in the clone.
          const stripModernColors = (text: string) => {
            return text
              .replace(/oklch\([^)]+\)/g, '#FE5516')
              .replace(/oklab\([^)]+\)/g, '#FE5516')
              .replace(/--[\w-]+\s*:\s*okl(?:a?b|c?h)\([^;}]+\)/g, '--void: #000'); // Variable fix
          };

          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            const style = styleTags[i];
            if (style.textContent) {
              style.textContent = stripModernColors(style.textContent);
            }
          }

          // Check for any inline styles on elements
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.getAttribute && htmlEl.getAttribute('style')) {
              const inlineStyle = htmlEl.getAttribute('style') || '';
              if (inlineStyle.includes('oklch') || inlineStyle.includes('oklab')) {
                htmlEl.setAttribute('style', stripModernColors(inlineStyle));
              }
            }
            
            // For computed properties already resolved by the browser in the clone
            if (htmlEl.style) {
              ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'].forEach(prop => {
                const val = (htmlEl.style as any)[prop];
                if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                  (htmlEl.style as any)[prop] = ''; 
                }
              });
            }
          });
        }
      });

      if (adminOverlay) (adminOverlay as HTMLElement).style.display = 'flex';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`portfolio-export-${new Date().getTime()}.pdf`);
      showStatus('PDF Exportado com sucesso!');
    } catch (error) {
      console.error(error);
      showStatus('Erro ao exportar PDF.');
    }
    setExporting(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    showStatus(`Processando arquivo para ${targetCol}...`);

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      let dataToImport: any[] = [];

      if (extension === 'json') {
        const text = await file.text();
        dataToImport = JSON.parse(text);
        if (!Array.isArray(dataToImport)) dataToImport = [dataToImport];
      } else if (extension === 'csv') {
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        dataToImport = result.data;
      } else if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        // Parsing rudimentar de tabelas Word convertidas para HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = result.value;
        const rows = Array.from(tempDiv.querySelectorAll('tr'));
        const headers = Array.from(rows[0]?.querySelectorAll('td') || []).map(td => td.textContent?.trim() || '');
        
        dataToImport = rows.slice(1).map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          const obj: any = {};
          headers.forEach((h, i) => {
            if (h) obj[h] = cells[i]?.textContent?.trim() || '';
          });
          return obj;
        });
      }

      if (dataToImport.length > 0) {
        await processData(dataToImport, targetCol);
      } else {
        showStatus('Nenhum dado válido encontrado.');
      }
    } catch (error) {
      console.error(error);
      showStatus('Erro na importação: Verifique o formato.');
    }
    setImporting(false);
    e.target.value = '';
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-end">
        <button 
          onClick={seedFromConstants}
          disabled={importing}
          className="bg-brand-dark text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-brand-orange transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
        >
          {importing ? <Loader2 className="animate-spin h-3 w-3" /> : <Database className="h-3 w-3" />}
          Inicializar Dados Base
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bulk Image Upload Section */}
        <div className="p-8 bg-brand-orange/5 rounded-2xl border border-brand-orange/10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange mb-6">
                <Upload className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-display font-bold uppercase mb-2">Upload de Imagens em Massa</h3>
            <p className="text-[11px] opacity-60 uppercase tracking-widest font-bold max-w-xs mb-8">
              Selecione múltiplas imagens para criar automaticamente novos registos na coleção seleccionada.
            </p>
            
            <label className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-dark transition-all cursor-pointer flex items-center justify-center gap-3 shadow-lg shadow-brand-orange/10">
              <ImageIcon className="h-4 w-4" />
              {importing ? 'Processando...' : 'Seleccionar Imagens'}
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                disabled={importing}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []) as File[];
                  if (files.length === 0) return;
                  
                  setImporting(true);
                  showStatus(`Comprimindo e enviando ${files.length} imagens...`);
                  
                  try {
                    const batch = writeBatch(db);
                    for (const file of files) {
                      const base64 = await compressImage(file);
                      const newDocRef = doc(collection(db, targetCol));
                      
                      // Pre-fill based on collection
                      const data: any = {
                        ordem: 99,
                        updatedAt: new Date().toISOString()
                      };

                      if (targetCol === 'projectos') {
                        data.titulo = (file as File).name.replace(/\.[^/.]+$/, "");
                        data.imagemDestaque = base64;
                        data.categoria = 'Design';
                      } else if (targetCol === 'servicos') {
                        data.titulo = (file as File).name.replace(/\.[^/.]+$/, "");
                        data.descricao = 'Descrição da imagem';
                      } else if (targetCol === 'parceiros') {
                        data.nome = (file as File).name.replace(/\.[^/.]+$/, "");
                        data.logo = base64;
                      } else {
                        data.fotografia = base64;
                      }

                      batch.set(newDocRef, data);
                    }
                    await batch.commit();
                    showStatus(`${files.length} imagens carregadas com sucesso!`);
                  } catch (err) {
                    showStatus('Erro ao carregar imagens.');
                  }
                  setImporting(false);
                }}
              />
            </label>
        </div>

        {/* Export Section */}
        <div className="p-8 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange mb-6">
                <FileDown className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-display font-bold uppercase mb-2">Exportar Design Real</h3>
            <p className="text-[11px] opacity-60 uppercase tracking-widest font-bold max-w-xs mb-8">
              Gera um PDF capturando exatamente o que está sendo exibido no site agora (Design Pixel-Perfect).
            </p>
            <button 
              onClick={exportPDF} 
              disabled={exporting}
              className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-orange transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-zinc-200"
            >
              {exporting ? <Loader2 className="animate-spin h-4 w-4" /> : <FileType className="h-4 w-4" />}
              {exporting ? 'Exportando...' : 'Descarregar PDF'}
            </button>
        </div>

        {/* Import Section */}
        <div className="p-8 bg-white rounded-2xl border border-zinc-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-6">
                <FileUp className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-display font-bold uppercase mb-2">Importar Dados</h3>
            <p className="text-[11px] opacity-60 uppercase tracking-widest font-bold max-w-xs mb-6">
              Sincronize listas via JSON, CSV ou tabelas de Word para populá-lo instantaneamente.
            </p>
            
            <div className="w-full space-y-4">
              <select 
                value={targetCol} 
                onChange={(e) => setTargetCol(e.target.value)}
                className="w-full bg-zinc-50 border-none rounded-xl p-3 text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-orange"
              >
                <option value="projectos">Projectos</option>
                <option value="servicos">Serviços</option>
                <option value="depoimentos">Testemunhos</option>
                <option value="metricas">Estatísticas</option>
                <option value="contactos">Contactos</option>
                <option value="sectores">Sectores</option>
                <option value="paises">Países</option>
                <option value="ferramentas">Ferramentas</option>
                <option value="parceiros">Parceiros</option>
              </select>

              <button 
                onClick={copyAIPrompt}
                className="w-full bg-zinc-100 text-zinc-500 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 border border-dashed border-zinc-300"
              >
                <Copy className="h-3 w-3" />
                Copiar Prompt para IA
              </button>

              <div className="pt-4 border-t border-zinc-100 w-full text-left">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Colar JSON da IA</label>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="[{ ... }, { ... }]"
                  className="w-full h-24 bg-zinc-50 rounded-xl p-3 text-[10px] font-mono border-none outline-none focus:ring-1 focus:ring-brand-orange mb-3 resize-none"
                />
                <button 
                  onClick={handleTextImport}
                  disabled={importing || !inputText.trim()}
                  className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-brand-dark transition-all disabled:opacity-30"
                >
                  Importar Texto
                </button>
              </div>

              <div className="relative w-full">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                  <span className="bg-white px-3 text-[8px] font-bold text-zinc-300 uppercase tracking-[0.3em]">OU</span>
                </div>
                <hr className="border-zinc-50" />
              </div>

              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-100 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-all">
                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                  {importing ? <Loader2 className="animate-spin h-5 w-5 text-brand-orange mb-1" /> : <FileSpreadsheet className="h-5 w-5 text-zinc-300 mb-1" />}
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                    Importar Ficheiro
                  </p>
                </div>
                <input type="file" className="hidden" accept=".json,.csv,.docx" onChange={handleFileUpload} disabled={importing} />
              </label>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {lastImport && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-brand-orange text-white rounded-3xl shadow-xl shadow-brand-orange/20 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-bold uppercase leading-none">Importação Concluída</h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mt-1.5">Resumo de Atividade de Dados</p>
                  </div>
                </div>
                <button onClick={() => setLastImport(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all"><X className="h-4 w-4" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] uppercase font-bold opacity-60 mb-1">Itens Adicionados</p>
                    <p className="text-3xl font-display font-bold">{lastImport.count}</p>
                 </div>
                 <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] uppercase font-bold opacity-60 mb-1">Coleção Alvo</p>
                    <p className="text-xl font-display font-bold uppercase tracking-tight">{lastImport.collection}</p>
                 </div>
                 <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] uppercase font-bold opacity-60 mb-1">Estado do Site</p>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                       <span className="text-[10px] uppercase font-bold">Atualizado</span>
                    </div>
                 </div>
              </div>

              <div className="bg-brand-dark/30 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-4 w-4 text-white" />
                  <h5 className="text-[10px] uppercase font-bold tracking-widest">Próximos Passos Obrigatórios:</h5>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-[11px] font-medium opacity-90">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>Verifique o módulo <strong className="uppercase">{lastImport.collection}</strong> para ajustar as ordens de exibição.</span>
                  </li>
                  <li className="flex items-center gap-3 text-[11px] font-medium opacity-90">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>Navegue até à página pública para validar o layout dos novos conteúdos.</span>
                  </li>
                  {lastImport.items.length > 0 && (
                    <li className="flex items-center gap-3 text-[11px] font-medium opacity-90">
                      <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                      <span>Exemplo de dados inseridos: "{Object.values(lastImport.items[0])[0]}"</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            <List className="absolute right-0 bottom-0 h-64 w-64 text-white opacity-5 translate-x-12 translate-y-12 rotate-12" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center bg-brand-cream/20 p-6 rounded-2xl border border-brand-orange/10">
         <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-brand-orange opacity-40 shrink-0" />
            <div>
               <h4 className="text-[11px] font-bold uppercase tracking-tighter">Formatos Suportados</h4>
               <p className="text-[9px] opacity-50 uppercase font-bold tracking-[0.2em]">JSON Config, CSV Lists, Word Tables (.docx)</p>
            </div>
         </div>
         <div className="flex gap-2">
            <span className="px-3 py-1 bg-white rounded-full text-[8px] font-bold border border-zinc-100">JSON</span>
            <span className="px-3 py-1 bg-white rounded-full text-[8px] font-bold border border-zinc-100">CSV</span>
            <span className="px-3 py-1 bg-white rounded-full text-[8px] font-bold border border-zinc-100">WORD</span>
         </div>
      </div>
    </div>
  );
}

function DashboardOverview({ counts, setTab }: { counts: any, setTab: (t: string) => void }) {
  const cards = [
    { id: 'projectos', label: 'Projetos Realizados', count: counts.projectos || 0, icon: Layers, color: 'bg-brand-orange' },
    { id: 'servicos', label: 'Serviços Ativos', count: counts.servicos || 0, icon: Briefcase, color: 'bg-brand-dark' },
    { id: 'contactos', label: 'Canais de Contacto', count: counts.contactos || 0, icon: Mail, color: 'bg-zinc-500' },
    { id: 'depoimentos', label: 'Testemunhos', count: counts.depoimentos || 0, icon: Users, color: 'bg-brand-cream' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setTab(card.id)}
            className="flex flex-col p-6 bg-[#F5F7FB] border border-zinc-100 rounded-xl hover:border-brand-orange transition-all group text-left"
          >
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white mb-4 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
               <card.icon className="h-5 w-5" />
            </div>
            <span className="text-2xl font-display font-bold leading-none mb-1">{card.count}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{card.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-12 p-8 bg-brand-dark rounded-xl text-white relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-xl font-display font-bold uppercase mb-2">Bem-vindo, Administrador</h3>
               <p className="text-[11px] opacity-60 uppercase tracking-widest font-bold max-w-sm mb-6">Explore o painel lateral para atualizar o seu portfólio em tempo real. Cada mudança será reflectida instantaneamente para os seus clientes.</p>
               <button onClick={() => setTab('perfil')} className="bg-brand-orange px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">Configurar Perfil</button>
            </div>
            <LayoutDashboard className="absolute right-0 bottom-0 h-48 w-48 text-white opacity-5 -translate-x-12 translate-y-12" />
         </div>
      </div>
    </div>
  );
}

function EditorPerfil() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'perfil', 'principal')).then(s => {
      if (s.exists()) setData(s.data());
      else setData({ 
        nomeCompleto: 'Adilson Pinto Amado', 
        destaqueNome: 'PINTO',
        eyebrowEntrada: 'DESIGNER, LUANDA, ANGOLA',
        tagline: '', 
        biografia: '', 
        fotografia: '', 
        labelBotaoInicio: 'Começar', 
        labelBotaoAcaoFinal: 'Solicitar Orçamento',
        anoPortfolio: '2025'
      });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await setDoc(doc(db, 'perfil', 'principal'), data);
    setSaving(false);
  };

  if (!data) return <div className="space-y-6 animate-pulse"><div className="h-32 bg-zinc-100 rounded-xl" /><div className="h-32 bg-zinc-100 rounded-xl" /></div>;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Nome Completo</label>
          <input type="text" value={data.nomeCompleto} onChange={e => setData({...data, nomeCompleto: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Sobrenome em Destaque (Laranja)</label>
          <input type="text" value={data.destaqueNome} onChange={e => setData({...data, destaqueNome: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Eyebrow (Texto topo topo)</label>
          <input type="text" value={data.eyebrowEntrada} onChange={e => setData({...data, eyebrowEntrada: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Tagline de Impacto</label>
          <input type="text" value={data.tagline} onChange={e => setData({...data, tagline: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="md:col-span-2 space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Biografia Curta</label>
          <textarea value={data.biografia} onChange={e => setData({...data, biografia: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none h-32 transition-all font-medium leading-relaxed text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Fotografia do Perfil</label>
          <div className="flex items-center gap-4">
            {data.fotografia && (
              <div className="w-16 h-16 rounded-xl overflow-hidden grayscale border border-zinc-100">
                <img src={data.fotografia} className="w-full h-full object-cover" />
              </div>
            )}
            <label className="flex-1 bg-zinc-100 p-4 rounded-xl border border-dashed border-zinc-300 hover:bg-zinc-200 transition-all cursor-pointer flex flex-col items-center justify-center">
              <Upload className="h-4 w-4 text-zinc-400 mb-1" />
              <span className="text-[9px] font-bold uppercase text-zinc-500">Alterar Foto</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={async (e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     const base64 = await compressImage(file, 800);
                     setData({...data, fotografia: base64});
                   }
                }}
              />
            </label>
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Ano do Portfolio</label>
          <input type="text" value={data.anoPortfolio} onChange={e => setData({...data, anoPortfolio: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Label Botão Iniciar</label>
          <input type="text" value={data.labelBotaoInicio} onChange={e => setData({...data, labelBotaoInicio: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Label Ação Final</label>
          <input type="text" value={data.labelBotaoAcaoFinal} onChange={e => setData({...data, labelBotaoAcaoFinal: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
      </div>
      <button 
        onClick={save} 
        disabled={saving}
        className="flex items-center justify-center gap-3 bg-brand-orange text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50 rounded-xl shadow-lg shadow-brand-orange/10"
      >
        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
        <span className="text-[11px]">Guardar Perfil</span>
      </button>
    </div>
  );
}

function EditorConfig() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'configuracoes', 'global')).then(s => {
      if (s.exists()) setData(s.data());
      else setData({ 
        nomeAgencia: 'A-DESIGN', 
        anoPortfolio: '2025', 
        servicosRodape: '',
        processoTrabalho: '', 
        etiquetaRodapeContacto: 'Vamos Conversar' 
      });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await setDoc(doc(db, 'configuracoes', 'global'), data);
    setSaving(false);
  };

  if (!data) return <div className="animate-pulse h-32 bg-zinc-100 rounded-xl" />;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Nome da Marca/Agência</label>
          <input type="text" value={data.nomeAgencia} onChange={e => setData({...data, nomeAgencia: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Etiqueta Contacto</label>
          <input type="text" value={data.etiquetaRodapeContacto} onChange={e => setData({...data, etiquetaRodapeContacto: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="md:col-span-2 space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Serviços do Rodapé (Separados por vírgula)</label>
          <input type="text" value={data.servicosRodape} onChange={e => setData({...data, servicosRodape: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none transition-all font-bold text-sm" />
        </div>
        <div className="md:col-span-2 space-y-3">
          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Processo de Trabalho (Impacto)</label>
          <textarea value={data.processoTrabalho} onChange={e => setData({...data, processoTrabalho: e.target.value})} className="w-full bg-zinc-50 rounded-xl p-3.5 focus:ring-1 focus:ring-brand-orange outline-none h-32 transition-all font-medium text-sm" />
        </div>
      </div>
      <button 
        onClick={save} 
        disabled={saving}
        className="flex items-center justify-center gap-3 bg-brand-orange text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-50 rounded-xl shadow-lg shadow-brand-orange/10"
      >
        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
        <span className="text-[11px]">Guardar Configurações</span>
      </button>
    </div>
  );
}

function CollectionManager({ colName, title }: { colName: string, title: string }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    return subscribeToCollection(colName, setItems);
  }, [colName]);

  const addItem = async () => {
    const defaultData: any = { 
      ordem: items.length + 1,
      updatedAt: new Date().toISOString(),
      ativo: true
    };

    if (colName === 'servicos') {
      defaultData.titulo = 'Novo Serviço';
      defaultData.descricao = '';
      defaultData.corFundo = 'azul-escuro';
    } else if (colName === 'projectos') {
      defaultData.titulo = 'Novo Projecto';
      defaultData.categoria = 'Design';
      defaultData.nomeCliente = '';
      defaultData.ano = '2025';
      defaultData.emDestaque = false;
    } else if (colName === 'metricas') {
      defaultData.valor = '0';
      defaultData.sufixo = '';
      defaultData.legenda = 'Nova Métrica';
    } else if (colName === 'depoimentos') {
      defaultData.texto = '';
      defaultData.autor = 'Nome do Autor';
      defaultData.cargo = '';
    } else if (colName === 'contactos') {
      defaultData.tipo = 'email';
      defaultData.etiqueta = 'Novo Canal';
      defaultData.valor = '';
      defaultData.link = '';
    } else if (colName === 'parceiros') {
      defaultData.nome = 'Empresa';
      defaultData.logo = '';
      defaultData.link = '';
    } else if (colName === 'sectores') {
      defaultData.nome = 'Novo Sector';
    } else if (colName === 'paises') {
      defaultData.nome = 'Novo País';
      defaultData.bandeira = '🌍';
      defaultData.descricao = '';
    } else if (colName === 'ferramentas') {
      defaultData.nome = 'Nova Ferramenta';
      defaultData.grupo = 'outras';
    }

    await addDoc(collection(db, colName), defaultData);
  };

  const deleteItem = async (id: string) => {
    if (confirm('Eliminar permanentemente?')) await deleteDoc(doc(db, colName, id));
  };

  const updateItem = async (id: string, field: string, value: any) => {
    await updateDoc(doc(db, colName, id), { [field]: value });
  };

  const itemField = (item: any) => {
    if (item.titulo !== undefined) return 'titulo';
    if (item.valor !== undefined) return 'valor';
    if (item.texto !== undefined) return 'texto';
    if (item.nome !== undefined) return 'nome';
    return 'titulo';
  };

  const isImageField = (key: string) => {
    return ['fotografia', 'imagemDestaque', 'bandeira', 'logo'].includes(key);
  };

  const getFields = (col: string) => {
    const schemas: any = {
      projectos: ['titulo', 'categoria', 'nomeCliente', 'imagemDestaque', 'emDestaque'],
      servicos: ['titulo', 'descricao', 'corFundo', 'ativo'],
      metricas: ['valor', 'sufixo', 'legenda'],
      depoimentos: ['texto', 'autor', 'cargo', 'organizacao', 'iniciais'],
      contactos: ['tipo', 'etiqueta', 'valor', 'link'],
      sectores: ['nome'],
      paises: ['nome', 'bandeira', 'descricao'],
      ferramentas: ['nome', 'grupo'],
      parceiros: ['nome', 'logo', 'link']
    };
    return schemas[col] || [];
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-zinc-50 p-5 rounded-xl">
        <div>
           <h3 className="text-lg font-display font-bold uppercase tracking-tight leading-none">{title}</h3>
           <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">{items.length} Itens em exibição</p>
        </div>
        <button onClick={addItem} className="p-3 bg-brand-orange text-white rounded-lg hover:bg-brand-dark transition-all shadow-md shadow-brand-orange/10"><Plus className="h-4 w-4" /></button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <div key={item.id} className="p-6 bg-white border border-zinc-100 rounded-2xl flex flex-col gap-6 group hover:border-brand-orange/20 transition-all overflow-hidden relative shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold text-zinc-300">
                  #{item.ordem || '0'}
                </div>
                <h4 className="text-sm font-bold uppercase tracking-tight">{item[itemField(item)] || 'Sem Título'}</h4>
              </div>
              <button onClick={() => deleteItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-all">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFields(colName).map((field: string) => (
                <div key={field} className="space-y-1.5">
                  <label className="block text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400">{field}</label>
                  {isImageField(field) ? (
                    <div className="flex items-center gap-3">
                      {item[field] && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100 grayscale hover:grayscale-0 transition-all">
                           <img src={item[field]} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label className="flex-1 bg-zinc-50 px-3 py-2 rounded-lg border border-dashed border-zinc-200 hover:bg-zinc-100 cursor-pointer flex items-center justify-center gap-2">
                        <Upload className="h-3 w-3 text-zinc-400" />
                        <span className="text-[9px] font-bold uppercase text-zinc-400">Upload</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const base64 = await compressImage(file, 800);
                              updateItem(item.id, field, base64);
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : typeof item[field] === 'boolean' ? (
                    <button 
                      onClick={() => updateItem(item.id, field, !item[field])}
                      className={`w-full py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${item[field] ? 'bg-brand-orange text-white' : 'bg-zinc-100 text-zinc-400'}`}
                    >
                      {item[field] ? 'Activo' : 'Inactivo'}
                    </button>
                  ) : (
                    <input 
                      type="text" 
                      value={item[field] || ''} 
                      onChange={e => updateItem(item.id, field, e.target.value)}
                      className="w-full bg-zinc-50 rounded-lg p-2.5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-brand-orange transition-all"
                    />
                  )}
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="block text-[8px] font-bold uppercase tracking-[0.1em] text-zinc-400">Ordem</label>
                <input 
                  type="number" 
                  value={item.ordem || 0} 
                  onChange={e => updateItem(item.id, 'ordem', parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-50 rounded-lg p-2.5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-brand-orange transition-all"
                />
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center opacity-10 text-center grayscale">
             <LayoutDashboard className="h-16 w-16 mb-4" />
             <p className="font-bold uppercase tracking-widest text-[10px]">Sem dados</p>
          </div>
        )}
      </div>
    </div>
  );
}
