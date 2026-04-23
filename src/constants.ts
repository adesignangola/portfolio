import { Perfil, Servico, Projecto, Metrica, Sector, Pais, Depoimento, Ferramenta, Contacto, Parceiro, ConfigGlobals } from './types';

export const PERFIL_DATA: Perfil = {
  fotografia: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop', // Placeholder
  nomeCompleto: 'ADILSON PINTO AMADO',
  destaqueNome: 'PINTO',
  eyebrowEntrada: 'DESIGNER, LUANDA, ANGOLA',
  tagline: 'Criador de identidades visuais que comunicam, vendem e ficam na memória. Mais de 5 anos a transformar marcas em Angola, Portugal e Alemanha.',
  biografia: 'Designer com mais de 5 anos de experiência especializado em identidade visual e comunicação criativa. Apaixonado por transformar conceitos em marcas poderosas que conectam pessoas e organizações aos seus propósitos.',
  labelBotaoInicio: 'Começar',
  labelBotaoAcaoFinal: 'Solicitar Orçamento',
  anoPortfolio: '2025'
};

export const SERVICOS_DATA: Servico[] = [
  {
    id: '1',
    titulo: 'IDENTIDADE VISUAL',
    descricao: 'Criação de logos, paletas de cor, tipografia e manual de marca. Do conceito à entrega completa do sistema visual.',
    corFundo: 'azul-escuro',
    ordem: 1,
    ativo: true
  },
  {
    id: '2',
    titulo: 'DESIGN GRÁFICO',
    descricao: 'Artes para redes sociais, cartazes, flyers e materiais institucionais com impacto visual real.',
    corFundo: 'laranja',
    ordem: 2,
    ativo: true
  }
];

export const METRICAS_DATA: Metrica[] = [
  { id: '1', valor: '5', sufixo: '+', legenda: 'Anos de\nExperiência', ordem: 1, ativo: true },
  { id: '2', valor: '50', sufixo: '+', legenda: 'Projetos\nConcluídos', ordem: 2, ativo: true },
  { id: '3', valor: '3', sufixo: '', legenda: 'Países de\nAtuação', ordem: 3, ativo: true },
  { id: '4', valor: '100', sufixo: '%', legenda: 'Satisfação\nTotal', ordem: 4, ativo: true }
];

export const PROJECTOS_DATA: Projecto[] = [
  {
    id: '1',
    imagemDestaque: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800',
    titulo: 'IDENTIDADE KERO',
    nomeCliente: 'KERO',
    categoria: 'BRANDING',
    descricao: 'Redesign completo da identidade visual da maior rede de hipermercados de Angola.',
    ano: '2024',
    emDestaque: true,
    ordem: 1,
    ativo: true
  },
  {
    id: '2',
    imagemDestaque: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800',
    titulo: 'REBRANDING SONANGOL',
    nomeCliente: 'SONANGOL',
    categoria: 'CORPORATE DESIGN',
    descricao: 'Evolução da marca institucional para refletir a nova era de energia sustentável.',
    ano: '2024',
    emDestaque: true,
    ordem: 2,
    ativo: true
  },
  {
    id: '3',
    imagemDestaque: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800',
    titulo: 'CAMPANHA UNITEL',
    nomeCliente: 'UNITEL',
    categoria: 'PUBLICIDADE',
    descricao: 'Design de materiais promocionais para a maior operadora de telecomunicações.',
    ano: '2023',
    emDestaque: true,
    ordem: 3,
    ativo: true
  }
];

export const SECTORES_DATA: Sector[] = [
  { id: '1', nome: 'Retalho', ordem: 1, ativo: true },
  { id: '2', nome: 'Energia', ordem: 2, ativo: true },
  { id: '3', nome: 'Telecomunicações', ordem: 3, ativo: true },
  { id: '4', nome: 'Banca', ordem: 4, ativo: true },
  { id: '5', nome: 'Tecnologia', ordem: 5, ativo: true }
];

export const PAISES_DATA: Pais[] = [
  { id: '1', nome: 'Angola', bandeira: '🇦🇴', descricao: 'Mercado Principal', ordem: 1, ativo: true },
  { id: '2', nome: 'Portugal', bandeira: '🇵🇹', descricao: 'Presença Internacional', ordem: 2, ativo: true },
  { id: '3', nome: 'Alemanha', bandeira: '🇩🇪', descricao: 'Presença Internacional', ordem: 3, ativo: true }
];

export const DEPOIMENTOS_DATA: Depoimento[] = [
  {
    id: '1',
    texto: 'O Adilson conseguiu captar exatamente a essência da nossa marca e transformar numa identidade visual moderna.',
    autor: 'Helena Santos',
    cargo: 'Diretora de Marketing',
    organizacao: 'Kero',
    iniciais: 'HS',
    emDestaque: true,
    ordem: 1,
    ativo: true
  },
  {
    id: '2',
    texto: 'Trabalho de excelência, cumprindo sempre os prazos e superando as expectativas em cada entrega.',
    autor: 'João Manuel',
    cargo: 'CEO',
    organizacao: 'Unitel',
    iniciais: 'JM',
    emDestaque: true,
    ordem: 2,
    ativo: true
  }
];

export const FERRAMENTAS_DATA: Ferramenta[] = [
  { id: '1', nome: 'Adobe Illustrator', grupo: 'adobe', ordem: 1, ativo: true },
  { id: '2', nome: 'Adobe Photoshop', grupo: 'adobe', ordem: 2, ativo: true },
  { id: '3', nome: 'Adobe InDesign', grupo: 'adobe', ordem: 3, ativo: true },
  { id: '4', nome: 'Figma', grupo: 'outras', ordem: 4, ativo: true }
];

export const CONTACTOS_DATA: Contacto[] = [
  { id: '1', etiqueta: 'Email', valor: 'contato@adesign.ao', tipo: 'email', link: 'mailto:contato@adesign.ao', ordem: 1, ativo: true },
  { id: '2', etiqueta: 'WhatsApp', valor: '+244 9XX XXX XXX', tipo: 'whatsapp', link: 'https://wa.me/244900000000', ordem: 2, ativo: true },
  { id: '3', etiqueta: 'Instagram', valor: '@adesignangola', tipo: 'instagram', link: 'https://instagram.com/adesignangola', ordem: 3, ativo: true }
];

export const PARCEIROS_DATA: Parceiro[] = [
  { id: '1', nome: 'KERO', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop', link: 'https://kero.com.ao', ordem: 1, ativo: true },
  { id: '2', nome: 'SONANGOL', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop', link: 'https://sonangol.co.ao', ordem: 2, ativo: true },
  { id: '3', nome: 'UNITEL', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop', link: 'https://unitel.ao', ordem: 3, ativo: true }
];

export const CONFIG_GLOBALS: ConfigGlobals = {
  nomeAgencia: 'A-DESIGN ANGOLA',
  servicosRodape: 'Identidade Visual • Branding • Design Gráfico • Redes Sociais',
  processoTrabalho: 'Processo de trabalho: Briefing, Conceito, Desenvolvimento, Revisão e Entrega. Comunicação transparente em cada etapa.',
  etiquetaRodapeContacto: 'VAMOS TRABALHAR JUNTOS'
};
