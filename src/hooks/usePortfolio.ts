import { useEffect, useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, getDocs, collection, query, orderBy } from 'firebase/firestore';

const CACHE_KEY = 'portfolio_cache';
const CACHE_EXPIRY = 1000 * 60 * 30;

export interface SlideConfig {
  id: string;
  titulo: string;
  eyebrow: string;
}

interface CacheData {
  timestamp: number;
  data: {
    perfil: any;
    config: any;
    servicos: any[];
    projectos: any[];
    metricas: any[];
    contactos: any[];
    sectores: any[];
    paises: any[];
    ferramentas: any[];
    depoimentos: any[];
    parceiros: any[];
    slides: SlideConfig[];
    quemSou: any;
  };
}

function getCache(): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed: CacheData = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_EXPIRY) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCache(data: CacheData['data']) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {}
}

export function usePortfolio() {
  const [perfil, setPerfil] = useState<any>(undefined);
  const [servicos, setServicos] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any[]>([]);
  const [projectos, setProjectos] = useState<any[]>([]);
  const [contactos, setContactos] = useState<any[]>([]);
  const [sectores, setSectores] = useState<any[]>([]);
  const [paises, setPaises] = useState<any[]>([]);
  const [ferramentas, setFerramentas] = useState<any[]>([]);
  const [depoimentos, setDepoimentos] = useState<any[]>([]);
  const [parceiros, setParceiros] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(undefined);
  const [slides, setSlides] = useState<SlideConfig[]>([]);
  const [quemSou, setQuemSou] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const cached = getCache();
    if (cached) {
      setPerfil(cached.data.perfil);
      setConfig(cached.data.config);
      setServicos(cached.data.servicos);
      setProjectos(cached.data.projectos);
      setMetricas(cached.data.metricas);
      setContactos(cached.data.contactos);
      setSectores(cached.data.sectores);
      setPaises(cached.data.paises);
      setFerramentas(cached.data.ferramentas);
      setDepoimentos(cached.data.depoimentos);
      setParceiros(cached.data.parceiros);
      setSlides(cached.data.slides || []);
      setQuemSou(cached.data.quemSou || null);
      setLoading(false);
    }

    const defaultSlides: SlideConfig[] = [
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

    const fetchData = async () => {
      try {
        const [perfilSnap, configSnap, servicosSnap, projectosSnap, metricasSnap, contactosSnap, sectoresSnap, paisesSnap, ferramentasSnap, depoimentosSnap, parceirosSnap, slidesSnap, quemSouSnap] = await Promise.all([
          getDoc(doc(db, 'perfil', 'principal')),
          getDoc(doc(db, 'configuracoes', 'global')),
          getDocs(query(collection(db, 'servicos'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'projectos'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'metricas'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'contactos'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'sectores'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'paises'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'ferramentas'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'depoimentos'), orderBy('ordem', 'asc'))),
          getDocs(query(collection(db, 'parceiros'), orderBy('ordem', 'asc'))),
          getDocs(collection(db, 'slides')),
          getDoc(doc(db, 'quemsou', 'principal'))
        ]);

        let slidesData: SlideConfig[] = defaultSlides;
        if (slidesSnap.docs.length > 0) {
          slidesData = slidesSnap.docs.map(d => ({
            id: d.id,
            titulo: d.data().titulo || defaultSlides.find(s => s.id === d.id)?.titulo || '',
            eyebrow: d.data().eyebrow || defaultSlides.find(s => s.id === d.id)?.eyebrow || '',
          }));
        }

        const data = {
          perfil: perfilSnap.exists() ? perfilSnap.data() : null,
          config: configSnap.exists() ? configSnap.data() : null,
          servicos: servicosSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          projectos: projectosSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          metricas: metricasSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          contactos: contactosSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          sectores: sectoresSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          paises: paisesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          ferramentas: ferramentasSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          depoimentos: depoimentosSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          parceiros: parceirosSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          slides: slidesData,
          quemSou: quemSouSnap.exists() ? quemSouSnap.data() : null
        };

        if (!cached) {
          setPerfil(data.perfil);
          setConfig(data.config);
          setServicos(data.servicos);
          setProjectos(data.projectos);
          setMetricas(data.metricas);
          setContactos(data.contactos);
          setSectores(data.sectores);
          setPaises(data.paises);
          setFerramentas(data.ferramentas);
          setDepoimentos(data.depoimentos);
          setParceiros(data.parceiros);
          setSlides(data.slides);
          setQuemSou(data.quemSou);
        }

        setCache(data);
      } catch (err) {
        console.error('Error loading portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { perfil, servicos, metricas, projectos, contactos, sectores, paises, ferramentas, depoimentos, parceiros, config, slides, quemSou, loading };
}