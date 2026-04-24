/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, X, Mail, Phone, Instagram, Quote, Settings } from 'lucide-react';
import { usePortfolio } from './hooks/usePortfolio';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const { perfil, servicos, metricas, projectos, contactos, sectores, paises, ferramentas, depoimentos, parceiros, config, loading } = usePortfolio();
  const [view, setView] = useState<'entry' | 'presentation'>('entry');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const totalSlides = 9;

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 1024);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

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
        if (e.key === 'Escape') setView('entry');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  const handleStart = async () => {
    setView('presentation');
    setCurrentSlide(0);

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if ((screen.orientation as any) && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch (e) {
      console.log("Auto-rotate/Fullscreen not supported or blocked by browser.");
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
    <div className="relative h-screen w-full bg-white text-brand-dark selection:bg-brand-orange selection:text-white overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {view === 'entry' ? (
          <EntryScreen 
            key="entry" 
            onStart={handleStart} 
            perfil={perfil} 
            config={config} 
            metricas={metricas}
            onLogoClick={handleLogoClick}
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
              onClose={() => setView('entry')}
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
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      </AnimatePresence>
      
      {/* Hidden Admin Access */}
      <button 
        onClick={() => setShowAdmin(true)} 
        className="fixed bottom-4 left-4 p-3 opacity-0 hover:opacity-20 transition-all z-50 text-brand-dark"
      >
        <Settings className="h-5 w-5" />
      </button>
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
  onLogoClick
}: { 
  onStart: () => void, 
  perfil: any, 
  config: any, 
  metricas: any[],
  onLogoClick: () => void,
  key?: string
}) {
  const nomePartes = (perfil?.nomeCompleto || 'Adilson Pinto Amado').split(' ');
  const sobrenomeDestaque = perfil?.destaqueNome || (nomePartes.length > 2 ? nomePartes[1] : nomePartes[nomePartes.length - 1]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-screen w-full flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="flex justify-between p-6 lg:p-10 text-[9px] lg:text-[10px] font-bold tracking-[0.4em] lg:tracking-[0.6em] uppercase opacity-40 shrink-0">
        <div onClick={onLogoClick} className="cursor-pointer hover:opacity-100 transition-opacity">{config?.nomeAgencia || 'A-DESIGN'}</div>
        <div className="hidden sm:block">PORTFOLIO {perfil?.anoPortfolio || '2025'}</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-6 lg:px-24 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 items-center w-full">
          {/* Left Side: Text and Action */}
          <div className="lg:col-span-7 flex flex-col text-left order-2 lg:order-1">
            <motion.div 
              initial={{ x: -25, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="mb-2 lg:mb-3 text-[9px] lg:text-[10px] font-bold tracking-[0.4em] lg:tracking-[0.6em] text-brand-orange uppercase"
            >
              {perfil.eyebrowEntrada}
            </motion.div>
            
            <motion.div 
              initial={{ x: -25, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col text-5xl sm:text-7xl lg:text-8xl font-display font-bold leading-[0.8] text-brand-dark mb-4 tracking-tighter"
            >
              <span>{nomePartes[0]}</span>
              <span className="text-brand-orange">{sobrenomeDestaque}</span>
              <span>{nomePartes[nomePartes.length - 1] !== sobrenomeDestaque ? nomePartes[nomePartes.length - 1] : ''}</span>
            </motion.div>

            <motion.div 
               initial={{ scaleX: 0, opacity: 0 }}
               animate={{ scaleX: 1, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="w-20 lg:w-32 h-1 bg-brand-orange mb-6 lg:mb-8 origin-left"
            />

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-md text-sm lg:text-lg leading-relaxed text-brand-dark/70 mb-8 lg:mb-10 font-medium"
            >
              {perfil.tagline}
            </motion.p>

            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center justify-between bg-brand-dark p-5 lg:p-6 pr-8 lg:pr-10 text-white w-full sm:w-[350px] transition-all hover:bg-brand-orange shadow-2xl"
            >
              <span className="font-bold uppercase tracking-[0.3em] lg:tracking-[0.5em] text-[9px] lg:text-[10px] leading-none">{perfil.labelBotaoInicio}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-4" />
            </motion.button>
          </div>

          {/* Right Side: Image and Stats */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative w-full max-w-[220px] sm:max-w-[340px] aspect-[4/5] overflow-hidden grayscale brightness-105 border-b-4 lg:border-b-8 border-brand-orange bg-brand-cream shadow-2xl"
            >
              <img 
                src={perfil.fotografia} 
                className="h-full w-full object-cover grayscale"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 lg:mt-12 grid grid-cols-3 gap-6 lg:gap-12 w-full max-w-[340px]"
            >
              {metricas.slice(0, 3).map((stat) => (
                <div key={stat.id || stat.legenda} className="flex flex-col border-t border-black/5 pt-3 lg:pt-4 text-left lg:text-right w-full">
                  <span className="text-xl lg:text-3xl font-display font-bold text-brand-dark leading-none mb-1">{stat.valor}{stat.sufixo}</span>
                  <span className="text-[7px] lg:text-[8px] font-bold tracking-widest text-brand-orange uppercase leading-tight">
                    {stat.legenda ? stat.legenda.replace('\n', ' ') : ''}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 lg:p-10 flex justify-center items-center bg-white shrink-0">
        <div className="flex items-center gap-4 text-[9px] lg:text-[10px] font-bold tracking-[0.3em] uppercase opacity-30 text-center flex-wrap justify-center">
          {config?.servicosRodape?.split(',').map((s: string, i: number, arr: any[]) => (
            <React.Fragment key={s}>
              <span>{s.trim()}</span>
              {i < arr.length - 1 && <span className="text-brand-orange">•</span>}
            </React.Fragment>
          ))}
        </div>
      </footer>
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
  config
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
  key?: string;
}) {
  const slides = [
    <Slide01WhoIAm perfil={perfil} />,
    <Slide02WhatIDo servicos={servicos} />,
    <Slide03Results metricas={metricas} />,
    <Slide04Portfolio projectos={projectos} />,
    <Slide05Markets sectores={sectores} paises={paises} />,
    <Slide09Partners parceiros={parceiros} />,
    <Slide06Testimonials depoimentos={depoimentos} />,
    <Slide07Tools ferramentas={ferramentas} config={config} />,
    <Slide08Contact contactos={contactos} config={config} perfil={perfil} />
  ];

  const bgColorMap = [
    'bg-brand-dark',   // 01
    'bg-white',        // 02
    'bg-brand-orange', // 03
    'bg-white',        // 04
    'bg-brand-cream',  // 05
    'bg-white',        // 09 (Partners)
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
          <span>SAIR</span>
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
function Slide01WhoIAm({ perfil }: { perfil: any }) {
  const nomePartes = (perfil?.nomeCompleto || 'Adilson Pinto Amado').split(' ');
  return (
    <SlideWrapper eyebrow="Quem Sou" title={<>{nomePartes[0]} <br /> {perfil?.destaqueNome || nomePartes[1]}</>} isDark>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 items-start lg:items-center flex-1 h-full mt-2 lg:mt-4">
        <div className="lg:col-span-1 border-l border-white/20 h-full hidden lg:block" />
        <div className="lg:col-span-6 text-white flex flex-col justify-center">
          <p className="text-xs lg:text-xl lg:opacity-90 leading-relaxed font-medium">
             {perfil?.biografia || 'Designer com experiência em identidade visual e comunicação criativa.'}
          </p>
          <div className="mt-4 lg:mt-12 flex gap-2 lg:gap-3 flex-wrap">
            {['IDENTIDADE VISUAL', 'BRANDING', 'DESIGN'].map(t => (
              <span key={t} className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-3 lg:px-6 py-1.5 lg:py-2.5 font-bold text-[7px] lg:text-[10px] tracking-widest uppercase rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-[140px] sm:max-w-[320px] aspect-[4/5] overflow-hidden grayscale border border-white/10 shadow-2xl brightness-105">
            <img src={perfil.fotografia} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}

/* 5. SLIDE 02 - O QUE FAÇO */
function Slide02WhatIDo({ servicos }: { servicos: any[] }) {
  return (
    <SlideWrapper eyebrow="Expertise" title="O QUE FAÇO">
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
function Slide03Results({ metricas }: { metricas: any[] }) {
  return (
    <SlideWrapper eyebrow="Performance" title={<>NÚMEROS QUE <br /> FALAM</>} isOrange>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 flex-1">
        {metricas.map(m => (
          <div key={m.id || m.legenda} className="bg-black/10 p-5 lg:p-10 flex flex-col justify-between border border-white/10 group hover:bg-black/20 transition-all">
            <div className="text-[8px] lg:text-[10px] font-bold tracking-[0.3em] lg:tracking-[0.4em] opacity-40 uppercase mb-4 lg:mb-8">STAT {String(m.id || '').padStart(2, '0')}</div>
            <div>
              <span className="block text-2xl lg:text-6xl font-display font-bold text-white mb-1 lg:mb-2 leading-none whitespace-nowrap">{m.valor}{m.sufixo}</span>
              <span className="block text-[8px] lg:text-[10px] font-bold tracking-widest uppercase text-white/50 leading-tight">{m.legenda}</span>
            </div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}

/* 7. SLIDE 04 - PORTFÓLIO */
function Slide04Portfolio({ projectos }: { projectos: any[] }) {
  return (
    <SlideWrapper eyebrow="Trabalhos" title="PROJETOS">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 bg-black/5 border border-black/5 flex-1">
        {projectos.slice(0, 4).map((p, idx) => (
          <div 
            key={p.id || p.titulo} 
            className={`group bg-white flex flex-col justify-between p-4 lg:p-10 transition-all hover:bg-brand-orange hover:text-white cursor-pointer relative overflow-hidden h-full ${idx > 1 ? 'hidden lg:flex' : 'flex'}`}
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
               <img 
                 src={p.imagemDestaque} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                 referrerPolicy="no-referrer" 
               />
            </div>

            <div className="mt-2 lg:mt-8 hidden sm:block">
               <p className="text-[8px] lg:text-xs opacity-50 font-bold uppercase tracking-widest truncate">{p.nomeClient || p.nomeCliente}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}

/* 8. SLIDE 05 - CLIENTES E SECTORES */
function Slide05Markets({ sectores, paises }: { sectores: any[], paises: any[] }) {
  const displaySectores = sectores.length > 0 ? sectores : [{ id: '1', nome: 'Sectores em Breve' }];
  const displayPaises = paises.length > 0 ? paises : [
    { id: '1', nome: 'Angola', bandeira: '🇦🇴', descricao: 'Mercado Principal' },
    { id: '2', nome: 'Portugal', bandeira: '🇵🇹', descricao: 'Presença Internacional' }
  ];

  return (
    <SlideWrapper eyebrow="Global" title={<>CLIENTES E <br /> SECTORES</>}>
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
function Slide06Testimonials({ depoimentos }: { depoimentos: any[] }) {
  const displayDepoimentos = depoimentos.length > 0 ? depoimentos : [
    { id: 1, autor: 'Cliente Alpha', cargo: 'CEO', organizacao: 'Empresa X', texto: 'Experiência incrível e profissionalismo de alto nível.', iniciais: 'CA' },
    { id: 2, autor: 'Cliente Beta', cargo: 'Fundador', organizacao: 'Startup Y', texto: 'A identidade visual criada mudou o nosso negócio.', iniciais: 'CB' }
  ];

  return (
    <SlideWrapper eyebrow="Confiança" title="TESTEMUNHOS" isDark>
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
function Slide07Tools({ ferramentas, config }: { ferramentas: any[], config: any }) {
  const adobeSuite = ferramentas.filter(f => f.grupo === 'adobe');
  const outrasPlataformas = ferramentas.filter(f => f.grupo === 'outras');

  const displayAdobe = adobeSuite.length > 0 ? adobeSuite : [{ id: 1, nome: 'Adobe Suite' }];
  const displayOutras = outrasPlataformas.length > 0 ? outrasPlataformas : [{ id: 1, nome: 'Outras Ferramentas' }];

  return (
    <SlideWrapper eyebrow="Toolkit" title="FERRAMENTAS">
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
            {config.processoTrabalho}
          </p>
       </div>
    </SlideWrapper>
  );
}

/* 12. SLIDE 09 - PARCEIROS */
function Slide09Partners({ parceiros }: { parceiros: any[] }) {
  const displayParceiros = parceiros.length > 0 ? parceiros : [
    { id: 1, nome: 'Empresa A', logo: 'https://via.placeholder.com/150' },
    { id: 2, nome: 'Empresa B', logo: 'https://via.placeholder.com/150' },
    { id: 3, nome: 'Empresa C', logo: 'https://via.placeholder.com/150' },
    { id: 4, nome: 'Empresa D', logo: 'https://via.placeholder.com/150' }
  ];

  return (
    <SlideWrapper eyebrow="Network" title="PARCEIROS">
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
           {displayParceiros.map(p => (
             <motion.div 
               key={p.id}
               whileHover={{ y: -5 }}
               className="bg-zinc-50 border border-zinc-100 p-8 lg:p-12 flex items-center justify-center grayscale hover:grayscale-0 transition-all group"
             >
                {p.logo ? (
                  <img 
                    src={p.logo} 
                    alt={p.nome} 
                    className="max-h-12 lg:max-h-20 w-auto opacity-40 group-hover:opacity-100 transition-opacity" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-bold text-zinc-300 uppercase tracking-widest text-[10px]">{p.nome}</span>
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
  perfil
}: { 
  contactos: any[]; 
  config: any; 
  perfil: any
}) {
  return (
    <SlideWrapper eyebrow={config.etiquetaRodapeContacto || 'Vamos Conversar'} title={<>CONECTAR E <br /> CRIAR</>} isOrange>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-16 flex-1 items-end">
        <div className="lg:col-span-7 space-y-1 lg:space-y-2">
          {contactos.map(c => (
             <div 
              key={c.id || c.valor} 
              className="group flex items-center justify-between bg-black/10 p-4 lg:p-8 transition-all hover:bg-black/30 cursor-pointer"
              onClick={() => window.open(c.link, '_blank')}
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

        <div className="lg:col-span-5">
           <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col gap-4 lg:gap-8 bg-brand-dark p-6 lg:p-12 text-white w-full shadow-2xl hover:bg-white hover:text-brand-orange transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 lg:p-8 opacity-10">
              <ArrowRight className="h-12 w-12 lg:h-24 lg:w-24 -rotate-45" />
            </div>
            <div className="text-[8px] lg:text-[10px] font-bold tracking-[0.3em] lg:tracking-[0.5em] uppercase opacity-40">PRÓXIMO PASSO</div>
            <div className="flex items-center gap-3 lg:gap-4">
              <span className="font-display font-bold uppercase tracking-tight text-xl lg:text-4xl text-left leading-none">{perfil.labelBotaoAcaoFinal || 'Solicitar Orçamento'}</span>
              <ArrowRight className="h-5 w-5 lg:h-8 lg:w-8 transition-transform group-hover:translate-x-4 shrink-0" />
            </div>
          </motion.button>
        </div>
      </div>
    </SlideWrapper>
  );
}
