# Joiner PRO - Sistema ERP para Marcenarias

Sistema de Planejamento de Recursos Empresariais (ERP) focado em Marcenarias e Indústrias Moveleiras.

## 🚀 Funcionalidades

- **Dashboard** com métricas em tempo real
- **Gestão de Clientes** - Cadastro e acompanhamento
- **Gestão de Projetos** - Controle de produção e prazos
- **Controle de Estoque** - Insumos e materiais
- **Módulo Financeiro** - Contas a pagar/receber
- **Relatórios** - Análises e exportação de dados
- **Sistema de Autenticação** - Controle de acesso seguro

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para PostgreSQL
- **NextAuth.js** - Autenticação
- **Tailwind CSS** - Estilização
- **PostgreSQL** - Banco de dados

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

## 🔧 Instalação e Configuração

1. **Clone o repositório e instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações:
   - `DATABASE_URL` - URL de conexão com PostgreSQL
   - `NEXTAUTH_SECRET` - Chave secreta para NextAuth.js
   - `NEXTAUTH_URL` - URL base da aplicação

3. **Configure o banco de dados:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Crie o primeiro usuário administrador:**
   ```bash
   npx ts-node create-admin.ts <username> <password>
   ```
   Exemplo:
   ```bash
   npx ts-node create-admin.ts admin minha_senha_segura
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação:**
   - Abra [http://localhost:3000](http://localhost:3000)
   - Faça login com as credenciais criadas

## 🔐 Sistema de Autenticação

O sistema utiliza autenticação baseada em credenciais (usuário/senha):

- **Usuários são criados manualmente** pelo administrador
- **Middleware protege todas as rotas** automaticamente
- **Sessões são gerenciadas** pelo NextAuth.js
- **Logout seguro** disponível na sidebar

### Criando Novos Usuários

Para criar novos usuários, execute o script `create-admin.ts`:

```bash
npx ts-node create-admin.ts novo_usuario senha_segura
```

### Gerenciamento de Usuários

Atualmente, o gerenciamento de usuários é feito diretamente no banco de dados. Futuras versões incluirão interface administrativa.

## 📊 Estrutura do Banco de Dados

- **Users** - Controle de usuários e permissões
- **Clientes** - Cadastro de clientes
- **Projetos** - Gestão de projetos e produção
- **Insumos** - Controle de estoque e materiais
- **ContasPagar/Receber** - Módulo financeiro

## 🚀 Deploy

Para produção, configure as variáveis de ambiente adequadamente e execute:

```bash
npm run build
npm start
```

## 📝 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificação de código

## 🤝 Contribuição

Desenvolvido por [@compiler.tech](https://www.instagram.com/compiler.tech)

## 📄 Licença

Este projeto é propriedade da empresa e seu uso é restrito aos colaboradores autorizados.
