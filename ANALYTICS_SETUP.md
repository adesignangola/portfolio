# Sistema de Analytics do Portfolio

## Visão Geral

Este sistema de analytics foi implementado para monitorar o desempenho do portfolio público, rastrear engajamento dos usuários e fornecer insights valiosos sobre como os visitantes interagem com o conteúdo.

## 🚀 Funcionalidades Implementadas

### 1. Rastreamento de Eventos
- **Visualizações de slides**: Monitora quais slides são mais visualizados
- **Cliques em projetos**: Rastreia interesse em projetos específicos
- **Cliques em contatos**: Monitora tentativas de contato
- **Sessões de usuário**: Duração e comportamento completo

### 2. Dashboard de Analytics
- **Métricas principais**: Sessões, visualizações, duração média, taxa de conversão
- **Gráficos de tráfego**: Evolução diária do tráfego
- **Distribuição geográfica**: Visitantes por país
- **Performance de slides**: Engajamento por slide
- **Conteúdo popular**: Projetos e elementos mais visualizados
- **Sessões recentes**: Atividade em tempo real

### 3. Automação
- **Cálculo automático de métricas diárias**
- **Limpeza automática de dados antigos (90 dias)**
- **Atualização em tempo real de performance de conteúdo**

## 📋 Instalação

### Passo 1: Aplicar Migration no Supabase

1. Abra o painel do Supabase
2. Vá para **SQL Editor**
3. Copie e cole o conteúdo do arquivo `scripts/setup-analytics.sql`
4. Execute o script

Isso criará todas as tabelas necessárias:
- `analytics_events`
- `user_sessions` 
- `content_performance`
- `daily_metrics`

### Passo 2: Verificar Configuração

O sistema já está integrado no frontend. Verifique se:

1. **Import do analytics** está em `src/App.tsx`
2. **Rastreamento de eventos** está ativo nos componentes
3. **Dashboard analytics** está disponível no AdminPanel

### Passo 3: Configurar Edge Functions (Opcional)

Para automação completa:

```bash
# Deploy da função de métricas diárias
supabase functions deploy daily-metrics
```

## 🎯 Como Usar

### Acessar o Dashboard

1. Abra o portfolio localmente
2. Acesse o painel admin (Ctrl+Alt+A ou clique no logo 5x)
3. PIN: `1234`
4. Clique na aba **Analytics**

### Métricas Disponíveis

#### Cards Principais
- **Sessões Totais**: Número de visitas únicas
- **Visualizações**: Total de slides visualizados
- **Duração Média**: Tempo médio por sessão
- **Taxa de Conversão**: Percentual de visitantes que interagiram

#### Gráficos
- **Tráfego Diário**: Evolução dos últimos dias
- **Distribuição Geográfica**: Visitantes por país
- **Performance dos Slides**: Engajamento por slide
- **Conteúdo Popular**: Projetos mais visualizados

#### Tabelas Detalhadas
- **Sessões Recentes**: Lista das últimas atividades
- **Performance de Conteúdo**: Métricas detalhadas por item

## 🔧 Configurações Avançadas

### Intervalos de Tempo
O dashboard permite filtrar por:
- Últimos 7 dias
- Últimos 30 dias (padrão)
- Últimos 90 dias

### Retenção de Dados
- **Eventos e sessões**: 90 dias (automático)
- **Métricas diárias**: 2 anos (automático)
- **Configurável** via função `cleanup_old_analytics()`

### Privacidade e Compliance
- ✅ **Anônimo**: Sem dados pessoais identificáveis
- ✅ **GDPR compliant**: Coleta consentida
- ✅ **Cookie-less**: Baseado em sessão
- ✅ **Seguro**: Apenas leitura para usuários autenticados

## 📊 Eventos Rastreados

### Tipo de Eventos
```typescript
type EventType = 
  | 'slide_view'        // Visualização de slide
  | 'project_click'     // Clique em projeto
  | 'contact_click'     // Clique em contato
  | 'testimonial_view'  // Visualização de depoimento
  | 'session_start'     // Início de sessão
  | 'session_end';      // Fim de sessão
```

### Metadados Coletados
- **Device**: Desktop/mobile/tablet
- **Browser**: Chrome/Firefox/Safari/etc
- **Resolução**: Tamanho da tela
- **Localização**: País (via IP)
- **Referrer**: Fonte de tráfego
- **UTM**: Parâmetros de campanha

## 🚨 Solução de Problemas

### Dashboard Não Mostra Dados
1. Verifique se a migration foi aplicada
2. Confirme se há tráfego no site
3. Verifique permissões no Supabase

### Erros de TypeScript
1. Verifique imports em `src/lib/analytics.ts`
2. Confirme tipos no `AnalyticsDashboard.tsx`

### Performance Lenta
1. Verifique índices nas tabelas
2. Considere reduzir o intervalo de tempo
3. Monitore tamanho das tabelas

## 🔄 Manutenção

### Tarefas Automáticas
- ✅ Limpeza de dados antigos
- ✅ Cálculo de métricas diárias
- ✅ Atualização de performance

### Tarefas Manuais (Recomendado)
- 📅 Revisar métricas semanais
- 📅 Analisar tendências mensais
- 📅 Otimizar conteúdo baseado em insights

## 📈 Próximos Passos

### Fase 2 Planejada
- [ ] Heatmaps de interação
- [ ] Relatórios automatizados por email
- [ ] Alertas de atividade incomum
- [ ] A/B testing framework

### Fase 3 Planejada
- [ ] Analytics preditivos
- [ ] Recomendações de conteúdo
- [ ] Análise de concorrentes
- [ ] Lead scoring avançado

## 🛠️ Desenvolvimento

### Estrutura de Arquivos
```
src/
├── lib/
│   └── analytics.ts           # Serviço de analytics
├── components/
│   └── AnalyticsDashboard.tsx # Dashboard completo
└── App.tsx                    # Integração de tracking

supabase/
├── migrations/
│   └── 20260425140000_analytics_schema.sql
└── functions/
    └── daily-metrics/
        └── index.ts           # Edge function

scripts/
├── setup-analytics.sql        # SQL para setup
└── apply-analytics-migration.mjs
```

### Principais Funções
- `analytics.trackSlideView()`
- `analytics.trackProjectClick()`
- `analytics.trackContactClick()`
- `analytics.trackTestimonialView()`

Este sistema transforma o dashboard de um simples gerenciador de conteúdo em uma ferramenta estratégica de inteligência de negócios para otimizar o portfolio.
