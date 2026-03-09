# Documentação Técnica e Análise de Aderência (Edital PE 06.007/2026)
## Projeto: PROCON LICITAÇÃO

### 1. Documentação Técnica da Plataforma
A solução atual do PROCON Digital é uma SPA (Single Page Application) focada em acessibilidade, estabilidade e capacidade de modo offline (Mobile-First e Offline-First).
* **Frontend:** React 18.2, Vite 5.2, TypeScript 5.2, Tailwind CSS 3.4.
* **Gerenciamento de Estado:** Zustand 4.5.
* **Assinatura Digital (ICP-Brasil):** Executada no Client-Side via `pkijs` e `asn1js`, gerando assinaturas CMS (PKCS#7) compatíveis com PAdES.
* **Inteligência Artificial:** Integração via API OpenAI (`gpt-3.5-turbo`) assistindo a redação narrativa de reclamações por cidadãos via portal, com pré-sanitização de dados sensíveis para conformidade com a LGPD.
* **Módulo Offline:** Através do `vite-plugin-pwa`, gerando Cache do Service Worker permitindo o aplicativo de fiscalização operar 100% local e sincronizar em background.

### 2. Passo a Passo do Funcionamento das Funcionalidades

**A. Atendimento ao Consumidor (Módulo Principal)**
1. O cidadão inicia a Reclamação Online ou é assistido no balcão físico do PROCON.
2. O relato é coletado e documentos anexados. Uma F.A. (Ficha de Atendimento) é gerada.
3. Se o cidadão desejar, a IA da OpenAI sugere e formata melhor a denúncia.
4. O Atendente Triador analisa a documentação: caso incompleta é descartada, caso procedente é gerada uma C.I.P (Carta de Informação Preliminar).
5. O Fornecedor notificado online tem até 10 dias para responder e expor a contraoferta na Plataforma do Fornecedor.
6. Não havendo acordo, é agendada uma Audiência de Conciliação.
7. O Juiz ou Conciliador insere a Sentença, aplicando Assinatura Digital ICP A1/A3.

**B. Fiscalização de Preços**
1. O Fiscal inicia o roteiro via WebApp e sincroniza a base de dados de lojas e produtos para seu cache PWA.
2. Em campo (sem internet), o Fiscal busca produtos (lê código de barras do produto) e lança valores dos preços atuais.
3. Ao reconectar, a base é esvaziada do cache e sincronizada via API para envio e consolidação central na Prefeitura.
4. Os dados aprovados seguem para publicação/boletim do Módulo de Pesquisa Digital de Preços.

**C. GED (Gestão Eletrônica de Documentos)**
1. Sistema assina e converte documentos PDFs digitalizados em interface e assina utilizando a base da Infraestrutura de Chaves Públicas.
2. Indexação de documentos gerando o armazenamento no sistema em S3 com Hash.

### 3. Confronto com o Edital e Análise de Aderência (Gap Analysis)

Avaliando as exigências do Edital PE 06.007/2026, identificamos o preenchimento de critérios técnicos contra gaps que devem ser preenchidos:

**✅ PONTOS SUPRIDOS (TOTAL ADERÊNCIA):**
* **Ambiente 100% Web Nativo e Mobile:** Atendido via arquitetura React + Tailwind.
* **Módulo de Pesquisa Digital:** A base do aplicativo PWA para o fiscal cobre a coleta exigida no portal externo.
* **Assinaturas Eletrônicas ou Digitais (ICP-Brasil):** Atendido plenamente com validação de certificados na camada cliente (PKIjs).
* **Módulo de Ficha de Atendimento Central:** Abertura, anexo e IA no atendimento suportam de forma robusta o requisito de atendimento digital e híbrido.

**⛔ PONTOS CEGOS, GAPS E FALHAS SOBRE O EDITAL (Requerem Ação Imediata):**
Na versão estruturada, as seguintes funcionalidades contam como ausentes ou não descritas tecnicamente e correm risco de invalidar a prova de conceito do Edital:
1. **Módulo de Triagem (TV e Guichê):** O Edital pontua um fluxo de fila (Painel de Senhas, triagem cronológica, e painéis de TV em HTML para guichê físico).
2. **Módulo de Ouvidoria:** Reclamações, elogios e denúncias anônimas não atreladas a uma Ficha de Atendimento (F.A).
3. **Módulo de Videoconferência:** O Edital exige que o próprio sistema disponha de módulo de audiência mista/virtual por videoconferência nativo ou link perfeitamente rastreado à F.A.
4. **Módulo de Ofício Independente e Controle de Leitura de Emails:** Monitorar via tracking de email a leitura dos ofícios e CIP enviadas, sem depender do envio postal dos Correios.
5. **Timeline do Atendimento com UI de Prazos (Cores):** A documentação exige que os painéis do atendente pisquem o status do prazo usando identificação visual colorida estrita (Verde: no prazo; Amarelo: vencendo; Vermelho: vencido).
6. **Módulo Superendividamento (Prevenção e Tratamento):** Específico para negociação simultânea de múltiplos débitos em conformidade com as exigências legais - ainda não detalhado no repositório.

### 4. Conclusão e Plano de Ação para Cobertura de 100%
Para atingir 100% de aderência legal, sugere-se implementar as seguintes *Tasks*:
- Módulo de Triagem Web (TV e Senhas)
- Componente Visual de Cores para Prazos
- Módulo Integrado de Ofícios
- Sistema Misto da Sala de Audiência / Videoconferência
- Módulo Superendividamento
- Ouvidoria Online
