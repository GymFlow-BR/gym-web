# GymFlow Web

Frontend web do **GymFlow**, MVP de uma plataforma para academias, personal trainers, professores e alunos.

A aplicação foi desenvolvida com foco em uma experiência simples, responsiva e mobile-first, permitindo que administradores e professores gerenciem alunos, exercícios, treinos e atribuições semanais, enquanto alunos acompanham seus treinos e progresso.

---

## Status do projeto

MVP funcional validado.

Fluxos principais implementados:

- Login com sessão via cookie `HttpOnly`.
- Cadastro de organização.
- Criação do primeiro administrador.
- Área administrativa para Admin e Professor.
- Gestão de alunos.
- Gestão de professores.
- Gestão de exercícios.
- Upload de imagem e vídeo de exercícios.
- Gestão de treinos modelo.
- Associação de exercícios aos treinos.
- Atribuição de treinos a alunos por dia da semana.
- Área do aluno mobile-first.
- Visualização do treino do dia.
- Visualização da rotina semanal.
- Visualização de detalhes de treino específico.
- Marcação e desmarcação de exercício concluído.
- Timer de descanso.
- Tela de perfil.
- Alteração de senha.
- Logout com confirmação.

---

## Tecnologias

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- Lucide React
- Geist Font
- ESLint

---

## Pré-requisitos

Antes de rodar o projeto localmente, instale:

- Node.js
- npm
- Backend do GymFlow rodando localmente

---

## Como rodar localmente

### 1. Instalar dependências

Na raiz do projeto frontend:

```bash
npm install
```

---

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Configuração local padrão:

```env
VITE_API_URL=http://localhost:8080
```

A variável `VITE_API_URL` define a URL base da API backend.

---

### 3. Rodar o frontend

```bash
npm run dev
```

A aplicação ficará disponível em:

```txt
http://localhost:5173
```

---

## Scripts disponíveis

### Ambiente de desenvolvimento

```bash
npm run dev
```

Inicia o servidor de desenvolvimento do Vite.

---

### Build de produção

```bash
npm run build
```

Executa a checagem TypeScript e gera a build de produção.

---

### Preview da build

```bash
npm run preview
```

Executa localmente a versão gerada em build.

---

### Lint

```bash
npm run lint
```

Executa validações de lint no projeto.

---

## Integração com backend

O frontend consome a API do GymFlow através da variável:

```env
VITE_API_URL=http://localhost:8080
```

Em desenvolvimento local, o backend deve estar rodando em:

```txt
http://localhost:8080
```

E o frontend em:

```txt
http://localhost:5173
```

O backend precisa permitir a origem do frontend via CORS.

---

## Autenticação

O GymFlow Web utiliza autenticação baseada em cookie `HttpOnly`.

Fluxo principal:

1. O usuário envia e-mail e senha na tela de login.
2. O backend valida as credenciais.
3. O backend cria um JWT.
4. O JWT é enviado em cookie `HttpOnly`.
5. O frontend não armazena token em `localStorage`.
6. As próximas requisições autenticadas enviam o cookie automaticamente.
7. O endpoint `/api/auth/me` recupera o usuário autenticado após refresh.
8. O logout chama o backend e limpa a sessão.

Importante:

As requisições autenticadas devem usar:

```ts
credentials: "include";
```

Isso é necessário para que o navegador envie o cookie de autenticação ao backend.

---

## Perfis de acesso

### ADMIN

Administrador da organização.

Pode acessar a área administrativa completa da própria organização.

Funcionalidades principais:

- Dashboard.
- Gestão de professores.
- Gestão de alunos.
- Gestão de exercícios.
- Gestão de treinos.
- Atribuição de treinos.
- Perfil.
- Alteração de senha.

---

### TEACHER

Professor ou personal trainer vinculado à organização.

Funcionalidades principais:

- Dashboard.
- Gestão de alunos.
- Gestão de exercícios.
- Gestão de treinos.
- Atribuição de treinos.
- Perfil.
- Alteração de senha.

Restrições:

- Não acessa a gestão de professores.
- Não pode criar outros professores.
- Não pode criar administradores.
- Não pode alterar status ativo/inativo de usuários.

---

### STUDENT

Aluno vinculado à organização.

Funcionalidades principais:

- Visualizar treino do dia.
- Visualizar rotina semanal.
- Abrir detalhes de treino específico.
- Marcar exercício como concluído.
- Desmarcar exercício concluído.
- Usar timer de descanso.
- Visualizar conclusão do treino.
- Acessar perfil.
- Alterar senha.
- Sair da conta.

---

## Principais áreas da aplicação

### Autenticação

Rotas principais:

```txt
/login
/register
```

Funcionalidades:

- Login.
- Cadastro de organização.
- Redirecionamento por perfil.
- Proteção de rotas.
- Bloqueio de acesso público para usuário já autenticado.

---

### Área Admin/Professor

Rotas principais:

```txt
/admin
/admin/students
/admin/teachers
/admin/exercises
/admin/workouts
/admin/profile
```

Funcionalidades:

- Visão geral.
- Listagem e criação de alunos.
- Listagem e criação de professores.
- Edição e inativação de usuários.
- Listagem, criação, edição e inativação de exercícios.
- Upload de imagem e vídeo de exercícios.
- Listagem, criação, edição e inativação de treinos.
- Associação de exercícios aos treinos.
- Atribuição de treino ao aluno por dia da semana.
- Consulta de rotina semanal do aluno.

---

### Área do Aluno

Rotas principais:

```txt
/student/current-workout
/student/workouts
/student/workouts/:studentWorkoutId
/student/profile
```

Funcionalidades:

- Visualização do treino atual do dia.
- Estado vazio quando não há treino no dia.
- Visualização da rotina semanal.
- Visualização de detalhes de treino específico.
- Progresso de treino atual.
- Progresso de treino específico.
- Marcação e desmarcação de exercícios.
- Timer de descanso.
- Card de conclusão do treino.

---

## Estrutura básica do projeto

```txt
src
├── app
├── assets
├── components
│   ├── brand
│   ├── layout
│   └── ui
├── features
│   ├── admin
│   ├── auth
│   ├── exercises
│   ├── not-found
│   ├── profile
│   ├── student-workout
│   ├── students
│   ├── teachers
│   └── workouts
├── services
├── index.css
└── main.tsx
```

---

## Organização por feature

O projeto utiliza organização por domínio/feature.

Cada feature pode conter:

```txt
components
pages
services
types
hooks
utils
```

Exemplo:

```txt
src/features/students
├── components
├── pages
├── services
└── types
```

Essa estrutura facilita manutenção, separação de responsabilidades e evolução gradual do MVP.

---

## API client

O consumo da API fica centralizado em:

```txt
src/services/api.ts
```

Responsabilidades:

- Montar URL base a partir de `VITE_API_URL`.
- Serializar body JSON.
- Tratar responses sem conteúdo.
- Enviar `credentials: "include"`.
- Lançar `ApiError` para erros HTTP.

Tratamento de erros:

```txt
src/services/apiError.ts
```

---

## Design e identidade visual

O frontend usa uma identidade visual dark, minimalista e mobile-first.

Características principais:

- Tema escuro.
- Verde como cor principal.
- Cards com bordas suaves.
- Layout administrativo responsivo.
- Área do aluno otimizada para mobile.
- Tipografia Geist.
- Logo simples do GymFlow em SVG reutilizável.

Componente de logo:

```txt
src/components/brand/GymFlowLogo.tsx
```

---

## Variáveis de ambiente

Arquivo local:

```txt
.env
```

Arquivo de exemplo:

```txt
.env.example
```

Conteúdo esperado:

```env
VITE_API_URL=http://localhost:8080
```

Atenção:

- Não versionar `.env`.
- Não colocar tokens, senhas ou segredos no frontend.
- Variáveis do Vite expostas com prefixo `VITE_` são acessíveis no bundle final.
- Segredos reais devem ficar apenas no backend ou no provedor de deploy.

---

## Build

Para gerar build de produção:

```bash
npm run build
```

A saída é gerada em:

```txt
dist
```

A pasta `dist` não deve ser editada manualmente.

---

## Deploy

O deploy do frontend pode ser feito em plataformas como:

- Vercel
- Netlify
- Railway
- Render
- VPS própria

Para deploy, configure a variável:

```env
VITE_API_URL=https://url-do-backend
```

Também será necessário configurar no backend:

```txt
FRONTEND_URL=https://url-do-frontend
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=None
```

Observação:

Para autenticação com cookie entre domínios diferentes, o backend precisa estar corretamente configurado com CORS, credenciais e atributos de cookie adequados.

---

## Usuários seed para desenvolvimento

Com o backend rodando e o seed aplicado, é possível testar com:

```txt
admin.dev@gymflow.com / 123456
teacher.dev@gymflow.com / 123456
student.dev@gymflow.com / 123456
```

Esses usuários são apenas para ambiente local.

---

## Validações antes de Pull Request

Antes de abrir uma PR, rode:

```bash
npm run build
```

Opcionalmente:

```bash
npm run lint
```

Checklist recomendado:

```txt
- Build passou.
- Fluxo alterado foi testado manualmente.
- Não há erros no console.
- Não há credenciais reais no código.
- Não há alterações fora do escopo da task.
```

---

## Fora do escopo do MVP

- Login com Google.
- Reset de senha por e-mail.
- Convite por e-mail.
- Pagamentos.
- Marketplace de profissionais.
- Notificações.
- Relatórios avançados.
- App mobile nativo.
- PWA finalizado.
- Chat interno.
- Integração com nutricionistas.
- Administração global da plataforma.

---

## Observações de desenvolvimento

- O frontend depende do backend para autenticação e dados.
- O backend deve estar rodando antes de testar fluxos autenticados.
- O navegador precisa aceitar cookies para manter a sessão.
- Em caso de erro `401` após refresh, verificar `/api/auth/me`, CORS e configuração de cookie.
- Em caso de erro de CORS, validar `FRONTEND_URL` no backend.
- Em produção, nunca usar URLs locais em `VITE_API_URL`.
