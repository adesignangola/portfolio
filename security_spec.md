# Especificação de Segurança para CMS do Portfólio Adilson

## 1. Invariantes de Dados
- Apenas administradores autenticados podem escrever em qualquer coleção.
- Leitores não precisam de autenticação para visualizar os dados do portfólio (leitura pública).
- `perfil/principal` e `configuracoes/global` são coleções de documento único (singleton).
- IDs devem ser alfanuméricos e seguros.
- Timestamps devem ser gerados pelo servidor na criação/atualização.

## 2. Os Doze Payloads Sujos
1. Tentativa de atualizar `perfil/principal` sem estar logado.
2. Tentativa de criar um projeto com string de metadados de 2MB.
3. Tentativa de excluir um serviço como convidado.
4. Tentativa de falsificar `ownerId` (não aplicável aqui, pois apenas administradores escrevem, mas bloquearemos todos os não-administradores).
5. Tentativa de alterar flag `isAdmin` em documento de usuário (não temos documentos de usuário, usamos coleção dedicada `admins`).
6. Tentativa de injetar tags de script em `tagline`.
7. Tentativa de contornar validação `ordem` enviando string em vez de número.
8. Tentativa de escrever em coleção não definida no blueprint (ex: `hack_collection`).
9. Tentativa de definir `ordem` extremamente alta para overflow.
10. Tentativa de atualizar campo imutável (se houver algum definido, como `id`).
11. Tentativa de ler PII de coleção privada (não aplicável aqui, todos os dados são públicos para exibição).
12. Tentativa de listar todos os usuários (bloquearemos acesso de leitura a qualquer lista de usuários).

## 3. Test Runner (Mock)
Um test runner real `firestore.rules.test.ts` verificaria estes.
Por agora, vou prosseguir para gerar as regras endurecidas.
