# Sistema Weeklies — Frontend

Interface web para o sistema de gestão de atividades e presença do Learning Lab UFC.  
O serviço centraliza weeklies, controle de ponto e acompanhamento de presenças em reuniões quinzenais.

---

## Stack

| Camada           | Tecnologia        |
| ---------------- | ----------------- |
| Biblioteca Core  | React 19          |
| Linguagem        | TypeScript        |
| Build Tool / Env | Vite              |
| Estilização      | TailwindCSS v4    |
| Componentes Base | Radix UI / Shadcn |

---

## Pré-requisitos

- [Node.js ≥ 18](https://nodejs.org/) (Recomendado LTS)
- `npm` (Gerenciador de pacotes)
- `git`

---

## Primeiros passos

### 1. Clonar o repositório

```bash
git clone https://github.com/LearningLabUFC/sistema-weeklies-frontend.git
cd sistema-weeklies-frontend
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O projeto estará disponível localmente em **http://localhost:5173** (ou na porta indicada pelo Vite no terminal).

---

## Estrutura de diretórios (sugerida)

```
sistema-weeklies-frontend/
├── public/               # Ativos estáticos públicos
├── src/
│   ├── assets/           # Imagens, SVGs e mídias locais
│   ├── components/       # Componentes globais e reutilizáveis (Shadcn/UI)
│   ├── contexts/         # Contextos do React (Autenticação, Temas, etc.)
│   ├── hooks/            # Custom Hooks customizados
│   ├── layouts/          # Estruturas de página (padrão, autenticado, etc.)
│   ├── pages/            # Componentes de página (Dashboard, Login, Weeklies...)
│   ├── routes/           # Configurações de rotas (React Router)
│   ├── services/         # Integração com a API (Axios/Fetch)
│   ├── utils/            # Funções utilitárias e helpers
│   ├── main.tsx          # Ponto de entrada do React
│   └── index.css         # Estilos globais e diretivas do Tailwind
├── .env.local            # Variáveis de ambiente locais (não versionado)
├── .gitignore
├── eslint.config.js      # Configuração do ESLint
├── package.json          # Dependências e scripts do projeto
├── tsconfig.json         # Configurações do TypeScript
└── vite.config.ts        # Configurações do Vite e plugins
```

---

## Scripts úteis

| Comando           | Descrição                                                      |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento do Vite                   |
| `npm run build`   | Executa a checagem do TypeScript e compila o projeto para prod |
| `npm run lint`    | Executa o ESLint para encontrar problemas no código            |
| `npm run format`  | Formata o código automaticamente usando o Prettier             |
| `npm run preview` | Visualiza localmente o build de produção gerado                |

---

## Licença

Projeto interno do **Learning Lab UFC**. Todos os direitos reservados.
