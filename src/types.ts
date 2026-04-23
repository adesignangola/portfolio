/**
 * Tipos baseados nos modelos de dados descritos no Skeleton para integração futura com CMS.
 */

export interface Perfil {
  fotografia: string;
  nomeCompleto: string;
  destaqueNome: string; // Ex: "PINTO"
  eyebrowEntrada: string; // Ex: "Designer, Luanda, Angola"
  tagline: string;
  biografia: string;
  labelBotaoInicio: string;
  labelBotaoAcaoFinal: string;
  anoPortfolio: string; // Alterado para string conforme pedido no texto "Portfolio 2025"
}

export interface Servico {
  id: string;
  titulo: string;
  descricao: string;
  corFundo: 'azul-escuro' | 'laranja';
  ordem: number;
  ativo: boolean;
}

export interface Projecto {
  id: string;
  imagemDestaque: string;
  titulo: string;
  nomeCliente: string;
  categoria: string;
  descricao: string;
  ano: string; // Alterado para string para flexibilidade (ex: "2024")
  emDestaque: boolean;
  ordem: number;
  ativo: boolean;
}

export interface Metrica {
  id: string;
  valor: string;
  sufixo: string;
  legenda: string;
  ordem: number;
  ativo: boolean;
}

export interface Sector {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
}

export interface Pais {
  id: string;
  nome: string;
  bandeira: string; // Usar emoji ou URL
  descricao: string;
  ordem: number;
  ativo: boolean;
}

export interface Depoimento {
  id: string;
  texto: string;
  autor: string;
  cargo: string;
  organizacao: string;
  iniciais: string;
  emDestaque: boolean;
  ordem: number;
  ativo: boolean;
}

export interface Ferramenta {
  id: string;
  nome: string;
  grupo: 'adobe' | 'outras';
  ordem: number;
  ativo: boolean;
}

export interface Parceiro {
  id: string;
  nome: string;
  logo: string;
  link?: string;
  ordem: number;
  ativo: boolean;
}

export interface Contacto {
  id: string;
  etiqueta: string; // Ex: "Email"
  valor: string; // Ex: "contato@..."
  tipo: 'email' | 'whatsapp' | 'instagram' | 'linkedin' | 'map' | 'tel';
  link: string;
  ordem: number;
  ativo: boolean;
}

export interface ConfigGlobals {
  nomeAgencia: string;
  servicosRodape: string;
  processoTrabalho: string;
  etiquetaRodapeContacto: string;
}
