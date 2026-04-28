/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, X, Mail, Phone, Instagram, Quote, CheckCircle2, FileDown, RefreshCw } from 'lucide-react';
import { usePortfolio } from './hooks/usePortfolio';
import { supabase } from './lib/supabase';
import { analytics } from './lib/analytics';
import AdminPanel from './components/AdminPanel';
import adPortrait from './assets/ad.png';

export default function App() {
  const { perfil, servicos, metricas, projectos, contactos, sectores, paises, ferramentas, depoimentos, parceiros, config, slides, quemSou, lastUpdate, loading } = usePortfolio();
  const [view, setView] = useState<'entry' | 'presentation'>('entry');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const totalSlides = 9;

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 1024);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.code === 'KeyA') {
        e.preventDefault();
        setShowAdmin(prev => !prev);
      }

      if (view === 'presentation') {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'Escape') {
            setView('entry');
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            }
          }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  // Rastrear visualizações de slides
  useEffect(() => {
    if (view === 'presentation') {
      analytics.trackSlideView(currentSlide);
    }
  }, [currentSlide, view]);

  // Real-time code version check
  const [currentCodeVersion, setCurrentCodeVersion] = useState<string>('');
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<string | null>(null);

  useEffect(() => {
    const checkCodeVersion = async () => {
      const { data } = await supabase
        .from('code_versions')
        .select('version, is_deployed')
        .eq('is_deployed', true)
        .single();
      if (data?.version) {
        if (!currentCodeVersion) {
          setCurrentCodeVersion(data.version);
        } else if (data.version !== currentCodeVersion) {
          setPendingVersion(data.version);
          setShowUpdatePrompt(true);
        }
      }
    };
    checkCodeVersion();

    const channel = supabase
      .channel('code_version_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'code_versions' }, (payload) => {
        if (payload.new?.is_deployed === true && payload.new.version !== currentCodeVersion) {
          setPendingVersion(payload.new.version);
          setShowUpdatePrompt(true);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentCodeVersion]);

  const handleUpdateApp = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest text-brand-dark/40">A carregar...</p>
        </div>
      </div>
    );
  }

  if (showUpdatePrompt) {
    return (
      <div className="fixed inset-0 bg-brand-dark z-[200] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <RefreshCw className="h-16 w-16 text-brand-orange mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-white mb-2">Atualização Disponivel</h1>
          <p className="text-gray-400 mb-6">
            Nova versão {currentCodeVersion} está disponível. Clique para aplicar.
          </p>
          <button
            onClick={handleUpdateApp}
            className="bg-brand-orange text-white font-bold py-3 px-8 rounded-full hover:bg-brand-orange/90 transition-colors"
          >
            Atualizar Agora
          </button>
        </div>
      </div>
    );
  }

  const handleStart = async () => {
    setView('presentation');
    setCurrentSlide(0);
    
    // Aplicar tela cheia
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.body.requestFullscreen) {
      document.body.requestFullscreen().catch(() => {});
    }
  };

  const handleLogoClick = () => {
    setAdminClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowAdmin(true);
        return 0;
      }
      return next;
    });
    setTimeout(() => setAdminClicks(0), 2000);
  };

  return (
    <div className="relative min-h-screen w-full bg-brand-cream text-brand-dark selection:bg-brand-orange selection:text-white font-sans">
      <AnimatePresence mode="wait">
        {view === 'entry' ? (
          <EntryScreen 
            key="entry" 
            onStart={handleStart} 
            perfil={perfil} 
            config={config} 
            metricas={metricas}
            onLogoClick={handleLogoClick}
            showContactForm={showContactForm}
            setShowContactForm={setShowContactForm}
          />
        ) : (
          <>
            {isPortrait && (
              <div className="fixed inset-0 z-[100] bg-brand-dark flex flex-col items-center justify-center text-white p-10 text-center">
                <motion.div
                  animate={{ rotate: 90 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="mb-8"
                >
                  <ArrowRight className="h-16 w-16 text-brand-orange" />
                </motion.div>
                <h3 className="text-2xl font-display font-bold uppercase mb-4">Gire o seu dispositivo</h3>
                <p className="text-sm opacity-60 max-w-xs">Para uma melhor experiência de apresentação, utilize o telemóvel na horizontal.</p>
              </div>
            )}
            <PresentationMode 
              key="presentation" 
              currentSlide={currentSlide} 
              totalSlides={totalSlides}
              onPrev={prevSlide}
              onNext={nextSlide}
              onClose={() => {
                setView('entry');
                if (document.exitFullscreen) {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              perfil={perfil}
              servicos={servicos}
              metricas={metricas}
              projectos={projectos}
              contactos={contactos}
              sectores={sectores}
              paises={paises}
              ferramentas={ferramentas}
              depoimentos={depoimentos}
              parceiros={parceiros}
              config={config}
              slideConfigs={slides}
              quemSou={quemSou}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      </AnimatePresence>

      {/* Notificação de atualizações em tempo real */}
      <AnimatePresence>
        {lastUpdate && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 right-4 z-[150] bg-brand-dark text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm"
          >
            <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider opacity-60">Atualização CMS</p>
              <p className="text-sm font-medium">{lastUpdate}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Versão do código em execução */}
      {currentCodeVersion && (
        <div className="fixed bottom-2 left-2 z-[100] text-[10px] text-brand-dark/20 font-mono">
          v{currentCodeVersion}
        </div>
      )}
      
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        1.5. ANIMATED PORTFOLIO TITLE                     */
/* -------------------------------------------------------------------------- */

function AnimatedPortfolio() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<'variant' | 'official'>('variant');
  const [isDeleting, setIsDeleting] = useState(false);
  const [styleIndex, setStyleIndex] = useState(0);
  const fullText = "Portfolio";

  const styleVariants = [
    { port: "font-display tracking-tight", folio: "font-aktura italic tracking-normal" },
    { port: "font-display tracking-tight", folio: "font-barett tracking-tight" },
    { port: "font-aktura tracking-tight", folio: "font-display italic tracking-tight" },
    { port: "font-ghitalk tracking-normal", folio: "font-display tracking-tight" }
  ];

  useEffect(() => {
    if (mode === 'official') {
      if (!isDeleting && text === fullText) {
        const holdTimeout = setTimeout(() => setIsDeleting(true), 10000);
        return () => clearTimeout(holdTimeout);
      }

      if (isDeleting && text.length === 0) {
        setMode('variant');
        setStyleIndex(0);
        setIsDeleting(false);
        return;
      }

      const officialTimeout = setTimeout(() => {
        if (isDeleting) {
          setText((current) => current.slice(0, -1));
          return;
        }

        setText(fullText.slice(0, text.length + 1));
      }, isDeleting ? 45 : 110);

      return () => clearTimeout(officialTimeout);
    }

    if (!isDeleting && text === fullText) {
      const pauseTimeout = setTimeout(() => setIsDeleting(true), 1400);
      return () => clearTimeout(pauseTimeout);
    }

    if (isDeleting && text.length === 0) {
      if (styleIndex === styleVariants.length - 1) {
        setMode('official');
        setIsDeleting(false);
        return;
      }

      setStyleIndex((prev) => prev + 1);
      setIsDeleting(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setText((current) => current.slice(0, -1));
        return;
      }

      setText(fullText.slice(0, text.length + 1));
    }, isDeleting ? 45 : 110);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, mode, styleIndex, styleVariants.length, fullText]);

  const splitIndex = 4;
  const currentVariant = mode === 'official'
    ? { port: "font-display tracking-tight", folio: "font-display tracking-tight" }
    : styleVariants[styleIndex];
  const portText = text.slice(0, splitIndex);
  const folioText = text.slice(splitIndex);
  const showCursor = !(mode === 'official' && !isDeleting && text === fullText);

  return (
    <div className="inline-flex items-baseline whitespace-nowrap leading-none">
      <span className={`text-brand-dark transition-all duration-500 ${currentVariant.port}`}>
        {portText}
      </span>
      <span className={`text-brand-orange transition-all duration-500 ${currentVariant.folio}`}>
        {folioText}
      </span>
      {showCursor && (
        <motion.span 
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="ml-2 text-brand-orange font-display"
        >
          |
        </motion.span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               2. TELA DE ENTRADA                            */
/* -------------------------------------------------------------------------- */

function EntryScreen({ 
  onStart, 
  perfil, 
  config, 
  metricas,
  onLogoClick,
  showContactForm,
  setShowContactForm
}: { 
  onStart: () => void, 
  perfil: any, 
  config: any, 
  metricas: any[],
  onLogoClick: () => void,
  showContactForm: boolean,
  setShowContactForm: (show: boolean) => void,
  key?: string
}) {
  const nomePartes = (perfil?.nomeCompleto || 'Adilson Pinto Amado').split(' ');
  const sobrenomeDestaque = perfil?.destaqueNome || (nomePartes.length > 2 ? nomePartes[1] : nomePartes[nomePartes.length - 1]);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simular envio do formulário
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSending(false);
    setSent(true);
    setTimeout(() => {
      setShowContactForm(false);
      setSent(false);
      setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full overflow-hidden bg-brand-cream"
    >
      
      {/* Conteúdo Principal */}
      <main className="relative mx-auto flex h-full w-full max-w-7xl items-center px-6 py-6 lg:px-24 lg:py-8">
        <div className="relative w-full">
          {/* Lado Esquerdo: Texto e Ação */}
<div className="relative z-10 flex w-full max-w-2xl flex-col text-left lg:pl-16 xl:pl-20 pt-16 lg:pt-24">
            <motion.div 
              initial={{ x: -25, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="mb-4 lg:mb-8"
            >
                            
              <div className="text-8xl sm:text-9xl lg:text-[10.5rem] font-display font-bold leading-[0.9] text-brand-dark mb-3">
                <AnimatedPortfolio />
              </div>

              <p className="max-w-md text-sm lg:text-base leading-relaxed text-brand-dark/80 font-medium mb-6">
                {perfil?.tagline || 'Criador de identidades visuais que comunicam, vendem e ficam na memoria.'}
              </p>
              <div className="flex flex-row gap-4 mb-6">
                <motion.button
                  onClick={onStart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center bg-brand-orange px-8 py-3 lg:px-10 lg:py-4 text-white transition-all hover:opacity-90 shadow-lg rounded-full"
                >
                  <span className="font-bold uppercase tracking-[0.2em] text-[9px] lg:text-[10px]">{perfil?.labelBotaoInicio || 'Começar'}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowContactForm(true)}
                  className="flex items-center justify-center bg-brand-dark px-8 py-3 lg:px-10 lg:py-4 text-white transition-all hover:bg-brand-orange shadow-lg rounded-full"
                >
                  <span className="font-bold uppercase tracking-[0.2em] text-[9px] lg:text-[10px]">Orçamento</span>
                </motion.button>
              </div>
            </motion.div>

                      </div>

          {/* Lado Direito: Espaço Vazio */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[min(42vw,520px)] items-center justify-end lg:flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
transition={{ delay: 0.3 }}
              className="relative flex h-[72vh] max-h-[760px] min-h-[520px] w-full max-w-[520px] items-center justify-end gap-2 overflow-visible"
            >
              <div className="pointer-events-none absolute bottom-[-400px] right-[-200px] z-10 h-[140vh] max-h-[1400px] min-h-[1000px] w-[1400px]">
                <div className="absolute inset-x-[10%] bottom-8 h-20 rounded-full bg-brand-dark/15 blur-2xl" />
<img
                  src={perfil?.fotografia || adPortrait}
                  alt={perfil?.nomeCompleto || 'Retrato principal'}
                  className="absolute -bottom-36 -right-12 h-full w-auto max-w-none origin-bottom-right scale-[1.18] object-contain object-[center_30%] drop-shadow-[0_30px_45px_rgba(13,21,32,0.22)]"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 22%, rgba(0,0,0,0.98) 28%, rgba(0,0,0,0.68) 34%, rgba(0,0,0,0.18) 42%, transparent 52%)',
                    maskImage: 'linear-gradient(to bottom, black 0%, black 22%, rgba(0,0,0,0.98) 28%, rgba(0,0,0,0.68) 34%, rgba(0,0,0,0.18) 42%, transparent 52%)',
                  }}
                  draggable={false}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Visual Identity Tags - Bottom Left */}
      <button
        type="button"
        onClick={onLogoClick}
        className="fixed bottom-4 left-12 z-20 flex flex-col items-start text-left"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-0.5 bg-brand-orange" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[6px] lg:text-[7px] font-bold tracking-widest uppercase text-brand-dark">IDENTIDADE VISUAL</span>
          <span className="text-[6px] lg:text-[7px] font-bold tracking-widest uppercase text-brand-dark">BRANDING</span>
          <span className="text-[6px] lg:text-[7px] font-bold tracking-widest uppercase text-brand-dark">DESIGN</span>
        </div>
      </button>

      {/* Modal Formulário de Contacto */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 lg:p-8"
              onClick={e => e.stopPropagation()}
            >
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-2">Mensagem Enviada!</h3>
                  <p className="text-brand-dark/60">Obrigado pelo contacto. Vou responder em breve.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl lg:text-2xl font-display font-bold uppercase text-brand-dark">Solicitar Orçamento</h3>
                    <button onClick={() => setShowContactForm(false)} className="p-2 hover:bg-brand-cream rounded-full">
                      <X className="h-5 w-5 text-brand-dark" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-1">Nome *</label>
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:outline-none focus:border-brand-orange"
                        placeholder="O seu nome"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:outline-none focus:border-brand-orange"
                          placeholder="seu@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-1">Telefone</label>
                        <input
                          type="tel"
                          value={formData.telefone}
                          onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:outline-none focus:border-brand-orange"
                          placeholder="+244 900 000 000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-1">Mensagem *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.mensagem}
                        onChange={e => setFormData({ ...formData, mensagem: e.target.value })}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:outline-none focus:border-brand-orange resize-none"
                        placeholder="Conte-me mais sobre o seu projeto..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-brand-orange text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {sending ? 'A enviar...' : 'Enviar Mensagem'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        3. MODO DE APRESENTAÇÃO - MOTOR                      */
/* -------------------------------------------------------------------------- */

function PresentationMode({ 
  currentSlide, 
  totalSlides, 
  onPrev, 
  onNext, 
  onClose,
  perfil,
  servicos,
  metricas,
  projectos,
  contactos,
  sectores,
  paises,
  ferramentas,
  depoimentos,
  parceiros,
  config,
  slideConfigs,
  quemSou
}: { 
  currentSlide: number; 
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  perfil: any;
  servicos: any[];
  metricas: any[];
  projectos: any[];
  contactos: any[];
  sectores: any[];
  paises: any[];
  ferramentas: any[];
  depoimentos: any[];
  parceiros: any[];
  config: any;
  slideConfigs: any[];
  quemSou: any;
  key?: string;
}) {
  const slides = [
    <Slide01WhoIAm quemSou={quemSou} slideConfig={slideConfigs[0]} />,
    <Slide02WhatIDo servicos={servicos} slideConfig={slideConfigs[1]} />,
    <Slide03Results metricas={metricas} slideConfig={slideConfigs[2]} />,
    <Slide04Portfolio projectos={projectos} slideConfig={slideConfigs[3]} />,
    <Slide05Markets sectores={sectores} paises={paises} slideConfig={slideConfigs[4]} />,
    <Slide09Partners parceiros={parceiros} slideConfig={slideConfigs[5]} />,
    <Slide06Testimonials depoimentos={depoimentos} slideConfig={slideConfigs[6]} />,
    <Slide07Tools ferramentas={ferramentas} config={config} slideConfig={slideConfigs[7]} />,
    <Slide08Contact contactos={contactos} config={config} perfil={perfil} slideConfig={slideConfigs[8]} />
  ];

  const bgColorMap = [
    'bg-brand-dark',   // 01
    'bg-white',        // 02
    'bg-brand-orange', // 03
    'bg-white',        // 04
    'bg-brand-cream',  // 05
    'bg-white',        // 09 (Parceiros)
    'bg-brand-dark',   // 06
    'bg-white',        // 07
    'bg-brand-orange'  // 08
  ];

  const bgColor = bgColorMap[currentSlide];
  const isAlt = ['bg-brand-dark', 'bg-brand-orange'].includes(bgColor);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`relative h-screen w-full transition-colors duration-700 ${bgColor} overflow-hidden`}
    >
      {/* 3.1 Cabeçalho Fixo */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 lg:p-10 pointer-events-none`}>
        <div className={`text-[10px] font-bold tracking-[0.4em] uppercase transition-colors duration-500 pointer-events-auto ${isAlt ? 'text-white/60' : 'text-brand-dark/40'}`}>
          {(currentSlide + 1).toString().padStart(2, '0')} / {totalSlides.toString().padStart(2, '0')}
        </div>
        <button 
          onClick={onClose}
          className={`flex items-center gap-2 uppercase tracking-[0.3em] font-bold text-[9px] pointer-events-auto transition-all hover:scale-110 ${isAlt ? 'text-white' : 'text-brand-dark'}`}
        >
          <span>Sair</span>
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* 4-11 Conteúdo do Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full"
        >
          {slides[currentSlide]}
        </motion.div>
      </AnimatePresence>

      {/* 3.2 Rodapé de Navegação */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between p-6 lg:p-10 pointer-events-none">
        <button 
          onClick={onPrev}
          disabled={currentSlide === 0}
          className={`p-3 bg-black/5 hover:bg-black/10 rounded-full disabled:opacity-0 transition-all pointer-events-auto ${isAlt ? 'text-white' : 'text-brand-dark'}`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex gap-2 lg:gap-3 items-center pointer-events-auto">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-8 lg:w-12 bg-brand-orange' : `w-1.5 lg:w-2 ${isAlt ? 'bg-white/20' : 'bg-brand-dark/10'}`}`}
            />
          ))}
        </div>

        <button 
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className={`p-3 bg-black/5 hover:bg-black/10 rounded-full disabled:opacity-0 transition-all pointer-events-auto ${isAlt ? 'text-white' : 'text-brand-dark'}`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               REGRAS DOS SLIDES                             */
/* -------------------------------------------------------------------------- */

function SlideWrapper({ 
  children, 
  eyebrow, 
  title, 
  isDark = false, 
  isOrange = false
}: { 
  children: React.ReactNode, 
  eyebrow: string, 
  title: string | React.ReactNode, 
  isDark?: boolean, 
  isOrange?: boolean
}) {
  const textColor = (isDark || isOrange) ? 'text-white' : 'text-brand-dark';
  const eyebrowColor = isOrange ? 'text-white/60' : 'text-brand-orange';
  const sepColor = isOrange ? 'bg-white' : 'bg-brand-orange';

  return (
    <div className="flex h-screen w-full flex-col px-6 lg:px-24 pt-16 lg:pt-24 pb-20 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 items-start mb-4 lg:mb-12 shrink-0">
          <div className="lg:col-span-12">
            <div className={`mb-1 lg:mb-3 text-[8px] lg:text-[10px] font-bold tracking-[0.4em] lg:tracking-[0.6em] uppercase ${eyebrowColor}`}>
              {eyebrow}
            </div>
            <h2 className={`text-2xl lg:text-7xl font-display font-bold uppercase leading-[0.9] tracking-tighter ${textColor} max-w-[85%]`}>
              {title}
            </h2>
            <div className={`w-12 lg:w-24 h-1 lg:h-1.5 mt-3 lg:mt-6 ${sepColor}`} />
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden touch-pan-y">
          {children}
        </div>
      </div>
    </div>
  );
}

/* SLIDE 01 - QUEM SOU */
function Slide01WhoIAm({ quemSou, slideConfig }: { quemSou: any, slideConfig?: any }) {
  const titleText = slideConfig?.titulo || 'QUEM SOU';
  const eyebrowText = slideConfig?.eyebrow || 'Quem Sou';
  return (
    <SlideWrapper eyebrow={eyebrowText} title={<>{quemSou?.nomePrimeiraLinha || 'Adilson'} {quemSou?.nomeDestaque || 'Pinto'}</>} isDark>
      <div className="relative h-full w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 items-start lg:items-center flex-1 h-full mt-2 lg:mt-4">
          <div className="lg:col-span-1 border-l border-white/20 h-full hidden lg:block" />
          <div className="lg:col-span-6 text-white flex flex-col justify-center">
            <p className="text-[10px] lg:text-lg lg:opacity-90 leading-relaxed font-normal text-justify">
               {quemSou?.biografia || 'Designer com experiência em identidade visual e comunicação criativa.'}
            </p>
            <div className="mt-4 lg:mt-12 flex gap-2 lg:gap-3 flex-wrap">
              {(quemSou?.tags || ['IDENTIDADE VISUAL', 'BRANDING', 'DESIGN']).map(t => (
                <span key={t} className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-3 lg:px-6 py-1.5 lg:py-2.5 font-bold text-[7px] lg:text-[10px] tracking-widest uppercase rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="fixed top-1/2 -translate-y-2/3 -translate-y-24 lg:-translate-y-32 right-18 lg:right-36 z-50">
          <div className="w-full max-w-[140px] sm:max-w-[320px] aspect-[4/5] overflow-hidden grayscale border border-white/10 shadow-2xl brightness-105 p-2 rounded-lg bg-brand-cream">
            {quemSou?.fotografia ? (
              <img src={quemSou?.fotografia} className="w-full h-full object-cover object-center scale-120 translate-y-[60px] lg:translate-y-[70px]" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-brand-dark/50 flex items-center justify-center text-white/30">Sem foto</div>
            )}
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}

/* 5. SLIDE 02 - O QUE FAÇO */
function Slide02WhatIDo({ servicos, slideConfig }: { servicos: any[], slideConfig?: any }) {
  const titleText = slideConfig?.titulo || 'O QUE FAÇO';
  const eyebrowText = slideConfig?.eyebrow || 'Expertise';
  return (
    <SlideWrapper eyebrow={eyebrowText} title={titleText}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 flex-1">
        {servicos.map((s) => (
          <div 
            key={s.id || s.titulo} 
            className={`flex flex-col p-6 lg:p-10 justify-between transition-all hover:scale-[1.01] ${s.corFundo === 'azul-escuro' ? 'bg-brand-dark text-white' : 'bg-brand-orange text-white'}`}
          >
             <div className="flex items-center justify-between mb-4 lg:mb-8">
               <div className="text-[8px] lg:text-[10px] font-bold tracking-[0.4em] lg:tracking-[0.5em] opacity-40 uppercase">SERVICE {String(s.id || '').padStart(2, '0')}</div>
               <div className={`h-1 lg:h-1.5 w-8 lg:w-10 ${s.corFundo === 'azul-escuro' ? 'bg-brand-orange' : 'bg-white'}`} />
             </div>
             <div>
               <h3 className="text-xl lg:text-4xl font-display font-bold mb-2 lg:mb-4 uppercase tracking-tighter leading-none">{s.titulo}</h3>
               <p className="text-xs lg:text-lg opacity-80 leading-relaxed max-w-sm font-medium line-clamp-3 lg:line-clamp-none">{s.descricao}</p>
             </div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}

/* 6. SLIDE 03 - NÚMEROS QUE FALAM */
function Slide03Results({ metricas, slideConfig }: { metricas: any[], slideConfig?: any }) {
  const titleText = slideConfig?.titulo || 'NÚMEROS QUE FALAM';
  const eyebrowText = slideConfig?.eyebrow || 'Performance';
  return (
    <SlideWrapper eyebrow={eyebrowText} title={<>{titleText.split(' ').slice(0, 2).join(' ')} <br /> {titleText.split(' ').slice(2).join(' ')}</>} isOrange>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 flex-1">
        {metricas.map(m => (
          <div key={m.id || m.legenda} className="bg-black/10 p-5 lg:p-10 flex flex-col justify-between border border-white/10 group hover:bg-black/20 transition-all">
            <div className="text-[8px] lg:text-[10px] font-bold tracking-[0.3em] lg:tracking-[0.4em] text-white uppercase mb-4 lg:mb-8">{m.legenda}</div>
            <div>
              <span className="block text-2xl lg:text-6xl font-display font-bold text-white mb-1 lg:mb-2 leading-none whitespace-nowrap">{m.valor}{m.sufixo}</span>
            </div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}

/* 7. SLIDE 04 - PORTFÓLIO */
function Slide04Portfolio({ projectos, slideConfig }: { projectos: any[], slideConfig?: any }) {
  const titleText = slideConfig?.titulo || 'PROJETOS';
  const eyebrowText = slideConfig?.eyebrow || 'Trabalhos';
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openProjectModal = (project: any) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    analytics.trackProjectClick(project.id || project.titulo);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    const images = getProjectImages(selectedProject);
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    const images = getProjectImages(selectedProject);
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getProjectImages = (project: any) => {
    if (project?.imagens && Array.isArray(project.imagens)) {
      return project.imagens;
    }
    if (project?.imagemDestaque) {
      return Array.isArray(project.imagemDestaque) ? project.imagemDestaque : [project.imagemDestaque];
    }
    return [];
  };

  const getImageSrc = (url: string, index: number) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_t=${index}-${Date.now()}`;
  };

  return (
    <>
      <SlideWrapper eyebrow={eyebrowText} title={titleText}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 bg-black/5 border border-black/5 flex-1">
          {projectos.slice(0, 4).map((p, idx) => (
            <div 
              key={p.id || p.titulo} 
              className={`group bg-white flex flex-col justify-between p-4 lg:p-10 transition-all hover:bg-brand-orange hover:text-white cursor-pointer relative overflow-hidden h-full ${idx > 1 ? 'hidden lg:flex' : 'flex'}`}
              onClick={() => openProjectModal(p)}
            >
              <div className="absolute top-0 right-0 p-3 lg:p-6 text-[8px] lg:text-[10px] font-bold tracking-[0.2em] lg:tracking-[0.3em] opacity-20 uppercase">
                {String(p.id || '').padStart(2, '0')}
              </div>
              
              <div className="mb-2">
                <p className="text-brand-orange text-[7px] lg:text-[9px] font-bold tracking-widest uppercase mb-1 lg:mb-2 group-hover:text-white transition-colors truncate">{p.categoria}</p>
                <h4 className="text-base lg:text-3xl font-display font-bold uppercase mb-2 lg:mb-4 tracking-tighter leading-none truncate">{p.titulo}</h4>
                <div className="w-6 lg:w-8 h-[1px] lg:h-0.5 bg-black/10 group-hover:bg-white/40 transition-colors" />
              </div>

              <div className="aspect-[3/4] w-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                {(() => {
                  const imageUrl = Array.isArray(p.imagemDestaque) ? p.imagemDestaque[0] : p.imagemDestaque;

                  if (!imageUrl) {
                    return <div className="flex h-full w-full items-center justify-center bg-black/5 text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">Sem imagem</div>;
                  }

                  return (
                    <img
                      src={imageUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  );
                })()}
              </div>

              <div className="mt-2 lg:mt-8 hidden sm:block">
                 <p className="text-[8px] lg:text-xs opacity-50 font-bold uppercase tracking-widest truncate">{p.nomeClient || p.nomeCliente}</p>
              </div>
            </div>
          ))}
        </div>
      </SlideWrapper>

      {/* Modal de Detalhes do Projeto */}
      <AnimatePresence>
        {selectedProject && (
<motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white w-full h-[98vh] sm:h-[95vh] max-w-7xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho do Modal */}
              <div className="bg-brand-dark text-white p-2 sm:p-3 lg:p-4 flex items-center justify-between shrink-0">
                <div className="min-w-0 flex-1">
                  <p className="text-brand-orange text-[6px] sm:text-[7px] lg:text-[9px] font-bold tracking-widest uppercase mb-0.5 truncate">{selectedProject.categoria}</p>
                  <h3 className="text-base sm:text-xl lg:text-3xl font-display font-bold uppercase tracking-tighter leading-none truncate">{selectedProject.titulo}</h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm opacity-80 truncate">{selectedProject.nomeClient || selectedProject.nomeCliente}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 sm:p-1.5 hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Conteúdo do Modal - Sem scroll */}
              <div className="flex flex-col lg:flex-row flex-1 min-h-0">
                {/* Carrossel de Imagens - Completo sem scroll */}
                <div className="lg:w-3/5 bg-black relative flex items-center justify-center h-[40vh] sm:h-[50vh] lg:h-auto">
                  {getProjectImages(selectedProject).length > 0 ? (
                    <>
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={getImageSrc(getProjectImages(selectedProject)[currentImageIndex], currentImageIndex)}
                          alt={`${selectedProject.titulo} - Imagem ${currentImageIndex + 1}`}
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Controles do Carrossel */}
                        {getProjectImages(selectedProject).length > 1 && (
                          <>
                            <button
                              aria-label="Imagem anterior"
                              onClick={prevImage}
                              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors"
                            >
                              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              aria-label="Próxima imagem"
                              onClick={nextImage}
                              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors"
                            >
                              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            
                            {/* Indicadores */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                              {getProjectImages(selectedProject).map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`h-1.5 sm:h-2 rounded-full transition-all ${
                                    index === currentImageIndex ? 'bg-brand-orange w-6 sm:w-8' : 'bg-white/50 w-1.5 sm:w-2'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/20">
                      <p className="text-white/50 text-sm">Sem imagens disponíveis</p>
                    </div>
                  )}
                </div>

{/* Painel de Informações - Layout organizado em grid */}
                <div className="lg:w-2/5 p-2 sm:p-3 lg:p-4 flex flex-col">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-3 content-start">
                    {/* Cliente */}
                    {selectedProject.nomeCliente && (
                      <div className="col-span-2">
                        <h4 className="text-brand-orange text-[6px] sm:text-[7px] lg:text-[8px] font-bold tracking-widest uppercase mb-0.5">CLIENTE</h4>
                        <p className="text-brand-dark text-xs sm:text-sm font-medium">{selectedProject.nomeCliente}</p>
                      </div>
                    )}

                    {/* Ano e Agência lado a lado */}
                    <div className="flex gap-3 col-span-2">
                      {selectedProject.ano && (
                        <div className="flex-1">
                          <h4 className="text-brand-orange text-[6px] sm:text-[7px] lg:text-[8px] font-bold tracking-widest uppercase mb-0.5">ANO</h4>
                          <p className="text-brand-dark text-xs sm:text-sm font-medium">{selectedProject.ano}</p>
                        </div>
                      )}
                      {selectedProject.agencia && (
                        <div className="flex-1">
                          <h4 className="text-brand-orange text-[6px] sm:text-[7px] lg:text-[8px] font-bold tracking-widest uppercase mb-0.5">AGÊNCIA</h4>
                          <p className="text-brand-dark text-xs sm:text-sm font-medium">{selectedProject.agencia}</p>
                        </div>
                      )}
                    </div>

                    {/* Duração */}
                    {selectedProject.duracao && (
                      <div>
                        <h4 className="text-brand-orange text-[6px] sm:text-[7px] lg:text-[8px] font-bold tracking-widest uppercase mb-0.5">DURAÇÃO</h4>
                        <p className="text-brand-dark text-xs sm:text-sm font-medium">{selectedProject.duracao}</p>
                      </div>
                    )}

                    {/* Concepto - ocupa largura total */}
                    {selectedProject.concepto && (
                      <div className="col-span-2">
                        <h4 className="text-brand-orange text-[6px] sm:text-[7px] lg:text-[8px] font-bold tracking-widest uppercase mb-0.5">CONCEPTO</h4>
                        <p className="text-brand-dark text-xs sm:text-sm leading-relaxed">{selectedProject.concepto}</p>
                      </div>
                    )}

                    {/* Ferramentas - ocupa largura total */}
                    {selectedProject.ferramentas && selectedProject.ferramentas.length > 0 && (
                      <div className="col-span-2">
                        <h4 className="text-brand-orange text-[6px] sm:text-[7px] lg:text-[8px] font-bold tracking-widest uppercase mb-1">FERRAMENTAS</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedProject.ferramentas.map((ferramenta: string, index: number) => (
                            <span key={index} className="bg-brand-dark text-white px-2 py-0.5 font-bold text-[5px] sm:text-[6px] lg:text-[7px] tracking-widest uppercase rounded-full">
                              {ferramenta}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cores - ocupa largura total */}
                    {selectedProject.cores && selectedProject.cores.length > 0 && (
                      <div className="col-span-2">
                        <h4 className="text-brand-orange text-[6px] sm:text-[7px] lg:text-[8px] font-bold tracking-widest uppercase mb-1">PALETA DE CORES</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProject.cores.map((cor: string, index: number) => (
                            <div key={index} className="flex items-center gap-1 bg-brand-cream/50 px-2 py-1 rounded">
                              <div 
                                className="w-3 h-3 rounded-full border border-black/10" 
                                style={{ backgroundColor: cor }}
                              />
                              <span className="text-brand-dark text-[5px] sm:text-[6px] lg:text-[7px] font-medium uppercase">{cor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* 8. SLIDE 05 - CLIENTES E SECTORES */
function Slide05Markets({ sectores, paises, slideConfig }: { sectores: any[], paises: any[], slideConfig?: any }) {
  const displaySectores = sectores.length > 0 ? sectores : [{ id: '1', nome: 'Sectores em Breve' }];
  const displayPaises = paises.length > 0 ? paises : [
    { id: '1', nome: 'Angola', bandeira: '🇦🇴', descricao: 'Mercado Principal' },
    { id: '2', nome: 'Portugal', bandeira: '🇵🇹', descricao: 'Presença Internacional' }
  ];
  const titleText = slideConfig?.titulo || 'CLIENTES E SECTORES';
  const eyebrowText = slideConfig?.eyebrow || 'Global';
  const titleParts = titleText.split(' ');
  const halfIdx = Math.ceil(titleParts.length / 2);
  const titleLine1 = titleParts.slice(0, halfIdx).join(' ');
  const titleLine2 = titleParts.slice(halfIdx).join(' ');

  return (
    <SlideWrapper eyebrow={eyebrowText} title={<>{titleLine1}<br />{titleLine2}</>}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 flex-1">
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-8">
            <h4 className="text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.3em] lg:tracking-[0.4em] text-brand-dark/30 whitespace-nowrap">Sectores de Actuação</h4>
            <div className="h-[1px] w-full bg-black/5" />
          </div>
          <div className="flex flex-wrap gap-1.5 lg:gap-2">
            {displaySectores.map(s => (
              <span key={s.id || s.nome} className="bg-brand-dark text-white px-3 lg:px-5 py-2 lg:py-3 font-bold text-[8px] lg:text-[10px] tracking-widest uppercase hover:bg-brand-orange transition-colors cursor-default">
                {s.nome}
              </span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-8">
            <h4 className="text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.3em] lg:tracking-[0.4em] text-brand-dark/30 whitespace-nowrap">Países de Atuação</h4>
            <div className="h-[1px] w-full bg-black/5" />
          </div>
          <div className="grid grid-cols-1 gap-2 lg:gap-4">
            {displayPaises.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 lg:p-6 bg-brand-cream/30 border border-black/5 hover:border-brand-orange transition-colors group">
                <div className="flex items-center gap-3 lg:gap-6">
                  <span className="text-xl lg:text-3xl grayscale group-hover:grayscale-0 transition-all">{p.bandeira || '📍'}</span>
                  <div>
                    <h4 className="font-bold text-sm lg:text-lg uppercase tracking-tight leading-none mb-1">{p.nome}</h4>
                    <p className="text-[8px] lg:text-[10px] opacity-40 uppercase tracking-widest font-bold truncate">{p.descricao}</p>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all text-brand-orange hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}

/* 9. SLIDE 06 - DEPOIMENTOS */
function Slide06Testimonials({ depoimentos, slideConfig }: { depoimentos: any[], slideConfig?: any }) {
  const displayDepoimentos = depoimentos.length > 0 ? depoimentos : [
    { id: 1, autor: 'Cliente Alpha', cargo: 'CEO', organizacao: 'Empresa X', texto: 'Experiência incrível e profissionalismo de alto nível.', iniciais: 'CA' },
    { id: 2, autor: 'Cliente Beta', cargo: 'Fundador', organizacao: 'Startup Y', texto: 'A identidade visual criada mudou o nosso negócio.', iniciais: 'CB' }
  ];
  const titleText = slideConfig?.titulo || 'TESTEMUNHOS';
  const eyebrowText = slideConfig?.eyebrow || 'Confiança';

  return (
    <SlideWrapper eyebrow={eyebrowText} title={titleText} isDark>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-4 flex-1">
        {displayDepoimentos.map(d => (
          <div key={d.id} className="bg-white/5 border border-white/10 p-6 lg:p-12 relative text-white flex flex-col justify-between group hover:bg-white/10 transition-all">
            <Quote className="absolute top-10 right-10 h-6 w-6 lg:h-10 lg:w-10 text-brand-orange opacity-20" />
            <p className="text-xs lg:text-xl italic mb-8 lg:mb-12 text-white/90 leading-relaxed font-light">
              "{d.texto}"
            </p>
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="h-8 w-8 lg:h-12 lg:w-12 bg-brand-orange flex items-center justify-center rounded-full font-bold text-[10px] lg:text-base shrink-0">
                {d.iniciais}
              </div>
              <div className="border-l border-white/20 pl-4 lg:pl-6 overflow-hidden">
                <span className="block font-bold text-[10px] lg:text-base uppercase leading-none mb-1 lg:mb-2 truncate text-white">{d.autor}</span>
                <span className="block text-[7px] lg:text-[10px] text-brand-orange font-bold uppercase tracking-widest truncate">{d.cargo} / {d.organizacao}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}

/* 10. SLIDE 07 - FERRAMENTAS */
function Slide07Tools({ ferramentas, config, slideConfig }: { ferramentas: any[], config: any, slideConfig?: any }) {
  const adobeSuite = ferramentas.filter(f => f.grupo === 'adobe');
  const outrasPlataformas = ferramentas.filter(f => f.grupo === 'outras');

  const displayAdobe = adobeSuite.length > 0 ? adobeSuite : [{ id: 1, nome: 'Adobe Suite' }];
  const displayOutras = outrasPlataformas.length > 0 ? outrasPlataformas : [{ id: 1, nome: 'Outras Ferramentas' }];
  const titleText = slideConfig?.titulo || 'FERRAMENTAS';
  const eyebrowText = slideConfig?.eyebrow || 'Toolkit';

  return (
    <SlideWrapper eyebrow={eyebrowText} title={titleText}>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 flex-1">
          <div>
              <div className="flex items-center gap-4 mb-6 lg:mb-10">
                <h4 className="text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.3em] lg:tracking-[0.4em] text-brand-dark/30 whitespace-nowrap">Adobe Creative Suite</h4>
                <div className="h-[1px] w-full bg-black/5" />
              </div>
              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                {displayAdobe.map(f => (
                  <span key={f.id} className="bg-brand-dark text-white px-4 lg:px-8 py-2 lg:py-4 font-bold text-[8px] lg:text-[10px] tracking-[0.1em] lg:tracking-[0.2em] uppercase hover:bg-brand-orange transition-colors">
                      {f.nome}
                  </span>
                ))}
              </div>
          </div>
          <div>
              <div className="flex items-center gap-4 mb-6 lg:mb-10">
                <h4 className="text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.3em] lg:tracking-[0.4em] text-brand-dark/30 whitespace-nowrap">Outras Plataformas</h4>
                <div className="h-[1px] w-full bg-black/5" />
              </div>
              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                {displayOutras.map(f => (
                  <span key={f.id} className="bg-brand-orange text-white px-4 lg:px-8 py-2 lg:py-4 font-bold text-[8px] lg:text-[10px] tracking-[0.1em] lg:tracking-[0.2em] uppercase hover:bg-brand-dark transition-colors">
                      {f.nome}
                  </span>
                ))}
              </div>
          </div>
       </div>

       <div className="mt-8 lg:mt-16 relative p-6 lg:p-10 border-l-8 border-brand-orange bg-brand-cream/30">
          <div className="flex items-center gap-8 mb-4">
            <div className="text-[10px] font-bold tracking-[0.5em] text-brand-orange uppercase">Processo de Trabalho</div>
          </div>
          <p className="text-xs lg:text-xl font-bold uppercase tracking-[0.1em] text-brand-dark leading-tight max-w-3xl">
            {config?.processoTrabalho || 'Processo de trabalho: Briefing, Conceito, Desenvolvimento, Revisao e Entrega.'}
          </p>
       </div>
    </SlideWrapper>
  );
}

/* 12. SLIDE 09 - PARCEIROS */
function Slide09Partners({ parceiros, slideConfig }: { parceiros: any[], slideConfig?: any }) {
  const displayParceiros = parceiros.length > 0 ? parceiros : [
    { id: 1, nome: 'Empresa A', logo: 'https://via.placeholder.com/150' },
    { id: 2, nome: 'Empresa B', logo: 'https://via.placeholder.com/150' },
    { id: 3, nome: 'Empresa C', logo: 'https://via.placeholder.com/150' },
    { id: 4, nome: 'Empresa D', logo: 'https://via.placeholder.com/150' }
  ];
  const titleText = slideConfig?.titulo || 'PARCEIROS';
  const eyebrowText = slideConfig?.eyebrow || 'Parcerias';

  return (
    <SlideWrapper eyebrow={eyebrowText} title={titleText}>
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
           {displayParceiros.map(p => (
             <motion.div 
               key={p.id}
               whileHover={{ scale: 1.04 }}
               transition={{ type: 'spring', stiffness: 260, damping: 18 }}
               className="bg-zinc-50 border border-zinc-100 p-8 lg:p-12 flex items-center justify-center transition-transform group"
             >
                {p.logo ? (
                  <img 
                    src={p.logo} 
                    alt={p.nome} 
                    className="max-h-12 lg:max-h-20 w-auto transition-transform"
                    style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(0%) saturate(0%) hue-rotate(179deg) brightness(96%) contrast(86%)' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-bold text-[#282828] uppercase tracking-widest text-[10px]">{p.nome}</span>
                )}
             </motion.div>
           ))}
        </div>
      </div>
    </SlideWrapper>
  );
}

/* 11. SLIDE 08 - CONTACTO */
function Slide08Contact({ 
  contactos, 
  config, 
  perfil,
  slideConfig
}: { 
  contactos: any[]; 
  config: any; 
  perfil: any;
  slideConfig?: any
}) {
  const titleText = slideConfig?.titulo || 'CONECTAR E CRIAR';
  const eyebrowText = slideConfig?.eyebrow || config?.etiquetaRodapeContacto || 'Vamos Conversar';
  const titleParts = titleText.split(' ');
  const halfIdx = Math.ceil(titleParts.length / 2);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { addMensagem } = await import('./lib/supabase-db');
      await addMensagem({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        mensagem: formData.mensagem,
        tipo_origem: 'site',
      });
      setSent(true);
      setTimeout(() => {
        setShowContactForm(false);
        setSent(false);
        setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <SlideWrapper eyebrow={eyebrowText} title={<>{titleParts.slice(0, halfIdx).join(' ')} <br /> {titleParts.slice(halfIdx).join(' ')}</>} isOrange>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-16 flex-1 items-end">
        <div className="lg:col-span-7 space-y-1 lg:space-y-2">
          {contactos.map(c => (
             <div 
              key={c.id || c.valor} 
              className="group flex items-center justify-between bg-black/10 p-4 lg:p-8 transition-all hover:bg-black/30 cursor-pointer"
              onClick={() => {
                analytics.trackContactClick(c.id || c.valor, c.tipo);
                window.open(c.link, '_blank');
              }}
             >
               <div className="flex items-center gap-4 lg:gap-8">
                 <div className="text-white group-hover:text-brand-orange transition-colors scale-75 lg:scale-100">
                   {c.tipo === 'email' && <Mail className="h-6 w-6" />}
                   {c.tipo === 'whatsapp' && <Phone className="h-6 w-6" />}
                   {c.tipo === 'instagram' && <Instagram className="h-6 w-6" />}
                 </div>
                 <div>
                   <p className="text-[7px] lg:text-[9px] font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] text-white/40 mb-1 leading-none">{c.etiqueta}</p>
                   <p className="text-sm lg:text-3xl font-display font-bold text-white transition-colors leading-none tracking-tighter truncate max-w-[200px] lg:max-w-none">{c.valor}</p>
                 </div>
               </div>
               <ArrowRight className="h-4 w-4 lg:h-6 lg:w-6 opacity-0 group-hover:opacity-100 transition-all text-white -rotate-45" />
             </div>
          ))}
        </div>

        <div className="lg:col-span-5 space-y-3">
           <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowContactForm(true)}
            className="group flex flex-col gap-4 lg:gap-8 bg-brand-dark p-6 lg:p-12 text-white w-full shadow-2xl hover:bg-white hover:text-brand-orange transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 lg:p-8 opacity-10">
              <ArrowRight className="h-12 w-12 lg:h-24 lg:w-24 -rotate-45" />
            </div>
            <div className="text-[8px] lg:text-[10px] font-bold tracking-[0.3em] lg:tracking-[0.5em] uppercase opacity-40">PRÓXIMO PASSO</div>
            <div className="flex items-center gap-3 lg:gap-4">
              <span className="font-display font-bold uppercase tracking-tight text-xl lg:text-4xl text-left leading-none">{perfil?.labelBotaoAcaoFinal || 'Solicitar Orcamento'}</span>
              <ArrowRight className="h-5 w-5 lg:h-8 lg:w-8 transition-transform group-hover:translate-x-4 shrink-0" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              window.print();
            }}
            className="flex items-center justify-center gap-3 bg-brand-orange text-white px-6 py-4 w-full shadow-lg hover:opacity-90 transition-all rounded-xl"
          >
            <FileDown className="h-5 w-5" />
            <span className="font-bold uppercase tracking-widest text-sm">Imprimir / Guardar PDF</span>
          </motion.button>
        </div>
      </div>

      {/* Modal Formulário de Contacto */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 lg:p-8"
              onClick={e => e.stopPropagation()}
            >
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-2">Mensagem Enviada!</h3>
                  <p className="text-brand-dark/60">Obrigado pelo contacto. Vou responder em breve.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl lg:text-2xl font-display font-bold uppercase text-brand-dark">Solicitar Orçamento</h3>
                    <button onClick={() => setShowContactForm(false)} className="p-2 hover:bg-brand-cream rounded-full">
                      <X className="h-5 w-5 text-brand-dark" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-1">Nome *</label>
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:outline-none focus:border-brand-orange"
                        placeholder="O seu nome"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:outline-none focus:border-brand-orange"
                          placeholder="seu@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-1">Telefone</label>
                        <input
                          type="tel"
                          value={formData.telefone}
                          onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:outline-none focus:border-brand-orange"
                          placeholder="+244 900 000 000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-1">Mensagem *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.mensagem}
                        onChange={e => setFormData({ ...formData, mensagem: e.target.value })}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:outline-none focus:border-brand-orange resize-none"
                        placeholder="Conte-me mais sobre o seu projeto..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-brand-orange text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {sending ? 'A enviar...' : 'Enviar Mensagem'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideWrapper>
  );
}
