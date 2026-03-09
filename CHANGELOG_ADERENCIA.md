# Changelog e Registro de Alterações (Aderência ao Edital PE 06.007/2026)

Este arquivo documenta as inserções no código-fonte realizadas em batch para suprir os gaps do edital. Use este tracking para subir suas modificações quando criar sua branch `feature/aderencia-edital-06007`.

## 📝 Modificações Realizadas (Fase 1 de Preenchimento)

### 1. Criação do Módulo de Ouvidoria (Ouvidoria Anônima)
**Arquivo Criado:** `src/modules/public/Ombudsman.tsx`
- Funcionalidade que permite ao cidadão registrar reclamações, elogios, sugestões e denúncias (conforme exigência nos fluxos acessórios do edital).
- Suporte a envio opcional de forma 100% anônima e sigilosa.
- Layout integrado ao Padrão Gov com ícones categorizados.

### 2. Rotas do Sistema (AppRoutes)
**Arquivo Alterado:** `src/routes/AppRoutes.tsx`
- Adição da rota pública `/portal/ombudsman` apontando dinamicamente para o módulo de Ouvidoria.
- Mapeamento estendido via `React.lazy`.

### 3. Timeline de Prazos (Cores Indicativas) na Listagem de Atendimentos / C.I.P
**Arquivo Alterado:** `src/modules/cases/pages/CaseList.tsx`
- Implementação da **Coluna Prazo (Deadline)** na visualização centralizada da F.A. e listagem geral.
- Aderência estrita no cálculo da Data x Data Atual da regra de categorização visual exigida nos cadernos:
  - **Verde (bg-green-100)**: No prazo (com folga)
  - **Amarelo (bg-yellow-100)**: Vencendo (3 dias ou menos)
  - **Vermelho (bg-red-100)**: Vencido / Expirado

---
**💡 Próximos Passos (Concluídos):**
### 4. Sala Mista de Audiência (Videoconferência Integrada)
**Arquivos Construídos:** `src/modules/hearings/pages/VirtualHearing.tsx`
- Funcionalidade completa de sala estúdio (Câmera, Mic, Ata em Tempo Real).
- Vinculado à rota: `/hearings/live/:id`.

### 5. Módulo Integrado de Ofícios e Rastreio (Tracking Pixel)
**Arquivos Construídos:** `src/modules/documents/pages/OfficialLetters.tsx`
- Controle autônomo de ofícios.
- Dashboards com estatísticas de Leitura (Tracking confirmando Lidos x Enviados).
- Rota mapeada: `/documents/letters`.

---
Este log ficará disponível na sua máquina para commitar assim que possuir acesso autorizado de push no GitHub.
