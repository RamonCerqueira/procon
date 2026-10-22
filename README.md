# PROCON Digital (MVP-PB)

Sistema integrado de gestão para órgãos de defesa do consumidor (PROCON), desenvolvido com tecnologias modernas para garantir eficiência, acessibilidade e transparência. Este projeto abrange desde o atendimento ao cidadão até a gestão interna de processos, audiências e fiscalização.

## 🚀 Funcionalidades Principais

O sistema é dividido em módulos para atender a todas as necessidades do órgão:

- **Portal Público (Cidadão)**:
  - Landing Page moderna e acessível.
  - Registro de reclamações e denúncias anônimas.
  - Consulta de andamento de processos.
  - Agendamento de atendimento.
  - Painel do Cidadão (Área logada).

- **Gestão de Atendimento (Triagem)**:
  - Painel de Senhas (TV).
  - Totem de Autoatendimento (Kiosk).
  - Fila de espera inteligente.

- **Gestão de Processos (CIP/Processo Administrativo)**:
  - Cadastro completo de consumidores e fornecedores.
  - Abertura e tramitação de processos.
  - Gestão Eletrônica de Documentos (GED).
  - Histórico de movimentações.

- **Audiências**:
  - Agendamento de audiências (Conciliação/Instrução).
  - Módulo de Audiência Virtual.
  - Gestão de pautas e salas.

- **Fiscalização**:
  - App Mobile para fiscais em campo.
  - Checklists de infração personalizáveis.
  - Registro fotográfico de evidências.

- **Superendividamento**:
  - Wizard para análise financeira do consumidor.
  - Cálculo do Mínimo Existencial.
  - Geração de planos de pagamento.

- **Jurídico e Pesquisa**:
  - Emissão de pareceres jurídicos.
  - Relatórios de pesquisa de preço de mercado.
  - Dashboards analíticos e indicadores de desempenho.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna e robusta:

- **Core**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/), [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- **Roteamento**: [React Router v6](https://reactrouter.com/)
- **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand)
- **Formulários e Validação**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Componentes UI & Acessibilidade**: [Headless UI](https://headlessui.com/), [Lucide React](https://lucide.dev/) (Ícones)
- **Visualização de Dados**: [Recharts](https://recharts.org/)
- **HTTP & Mocking**: [Axios](https://axios-http.com/), [Axios Mock Adapter](https://github.com/ctimmerm/axios-mock-adapter)

## 📦 Instalação e Execução

Pré-requisitos: Node.js (versão 18+ recomendada) e NPM/Yarn.

1. **Clone o repositório** (se aplicável) ou extraia os arquivos.

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   O sistema estará acessível em `http://localhost:5173`.

4. **Para gerar a build de produção**:
   ```bash
   npm run build
   ```

## 🔑 Credenciais de Acesso (Ambiente de Teste)

O sistema utiliza um mock de backend (`src/services/mock.ts`) para simular o funcionamento completo sem necessidade de uma API real configurada.

Use as seguintes credenciais para testar os diferentes perfis:

### Perfil Administrativo (Servidor/Fiscal/Diretor)
- **Email**: `admin@example.com`
- **Senha**: `123456`
- **Acesso**: Gestão completa, Dashboards, Audiências, Fiscalização, etc.

### Perfil Cidadão (Portal do Consumidor)
- **Email**: `cidadao@example.com`
- **Senha**: `123456`
- **Acesso**: Painel do Cidadão, Minhas Reclamações, Consulta de Processos.

## 📂 Estrutura do Projeto

```
src/
├── components/         # Componentes globais (Chat, etc)
├── design-system/      # Biblioteca de componentes UI reutilizáveis (Botões, Inputs, Cards)
├── layout/             # Layouts da aplicação (Sidebar, Header, MainLayout)
├── modules/            # Módulos funcionais do sistema (Organizados por domínio)
│   ├── auth/           # Login e Autenticação
│   ├── cases/          # Gestão de Processos
│   ├── citizen/        # Painel do Cidadão
│   ├── dashboard/      # Dashboard Principal
│   ├── hearings/       # Audiências
│   ├── inspections/    # Fiscalização
│   ├── public/         # Área Pública (Landing Page)
│   └── ...             # Outros módulos (Legal, Reports, etc)
├── routes/             # Definição das rotas da aplicação
├── services/           # Configuração de API e Mocks
├── store/              # Stores do Zustand (Estado Global)
└── utils/              # Funções utilitárias
```

## 📱 Responsividade e Acessibilidade

- O sistema é **Totalmente Responsivo** (Mobile-First), funcionando em desktops, tablets e smartphones.
- Inclui recursos de **Acessibilidade** como Alto Contraste, Aumento de Fonte e Navegação por Teclado ("Skip to content").

---
**Desenvolvido para modernizar a gestão pública e garantir os direitos do consumidor.**
