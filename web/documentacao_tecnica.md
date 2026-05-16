# Documentacao Tecnica - Frontend StreetBite

## 1. Escopo e objetivo

Este documento descreve em alto detalhe o funcionamento interno do frontend localizado em `StreetBite/web`, com foco em:

- arquitetura de navegacao entre paginas;
- estrutura HTML de cada tela;
- mapeamento dos elementos com as classes CSS e comportamentos de estilo;
- scripts JavaScript responsaveis por estado, eventos, integracao de API e componentes compartilhados;
- pontos de extensao para alteracao de comportamento.

A proposta e servir como guia de consulta para manutencao e evolucao do sistema.

## 2. Visao geral da arquitetura

### 2.1 Paradigma adotado

O frontend opera como uma SPA leve baseada em HTML multipagina:

- existe uma pagina de entrada (`landPage.html`);
- existe uma shell principal (`Pages/streetBite.html`), que carrega telas internas de forma dinamica;
- as telas internas estao em `Pages/Iframes/*.html`;
- cada tela interna possui CSS e JS proprios, injetados em tempo de execucao.

### 2.2 Stack e ferramentas

- HTML5 para estrutura.
- CSS3 para tema, layout e responsividade.
- JavaScript ES Modules para logica.
- `fetch` para requisicoes HTTP.
- Vite para ambiente de dev/build (`vite.config.mjs`).

### 2.3 Estrutura funcional de pastas

- `landPage.html`: landing institucional com CTA para o painel.
- `Pages/streetBite.html`: shell com sidebar e area dinamica (`#contentArea`).
- `Pages/Iframes/home.html`: dashboard inicial.
- `Pages/Iframes/menu.html`: cardapio e CRUD de itens.
- `Pages/Iframes/pedidos.html`: lista de pedidos e wizard de criacao.
- `Pages/Iframes/settings.html`: configuracoes visuais e dados do estabelecimento.
- `Scripts/streetBite.js`: roteamento interno, tema, injecao de assets.
- `Scripts/service.js`: cliente API centralizado.
- `Scripts/components/*`: componentes compartilhados (loading e snackbar).
- `Styles/*.css`: estilos por tela.
- `Styles/components/*`: estilos de componentes compartilhados.

## 3. Bootstrap e fluxo de execucao

### 3.1 Landing (`landPage.html` + `landPage.js`)

1. O navegador abre `landPage.html`.
2. O arquivo inclui:
   - `Scripts/landPage.js` (modulo);
   - `Styles/landPage.css`.
3. O script `landPage.js` aplica o tema salvo em `localStorage` (`streetbite-theme`) e testa conexao com API (`getComandas()`) para validacao inicial.
4. O botao/link `SAIBA MAIS...` leva para `Pages/streetBite.html`.

### 3.2 Shell (`Pages/streetBite.html` + `streetBite.js`)

1. A shell renderiza a estrutura fixa:
   - sidebar de navegacao;
   - botoes de acao rapida mobile;
   - area de conteudo dinamico (`#contentArea`);
   - botao flutuante de tema;
   - integracao VLibras e Sienna Accessibility.
2. `streetBite.js` e carregado e executa:
   - restaura tema persistido;
   - registra listeners de navegacao;
   - intercepta links internos;
   - faz `loadPage("home")` no startup.
3. A cada troca de pagina, o script:
   - busca o HTML alvo via `fetch`;
   - parseia com `DOMParser`;
   - injeta `body` da pagina no `#contentArea`;
   - injeta dinamicamente os `<link rel="stylesheet">` e `<script src>` do `<head>` da pagina;
   - remove assets da pagina anterior;
   - aplica cache-buster apenas em scripts (`sb_page_load=<timestamp>`).

## 4. Roteamento interno e injecao dinamica

### 4.1 Mapa de paginas

No `streetBite.js`, o objeto `pages` define:

- `home -> Iframes/home.html`
- `menu -> Iframes/menu.html`
- `requests -> Iframes/pedidos.html`
- `settings -> Iframes/settings.html`

### 4.2 Interceptacao de navegacao

O shell trata 3 tipos de interacao dentro de `#contentArea`:

- botao com `data-load-page`: navega sem recarregar a shell;
- botao com `data-scroll-target`: rola para seletor interno da pagina ativa;
- ancora `<a href>` apontando para `home.html`, `menu.html`, `pedidos.html`, `settings.html`: traduz para chave interna e chama `loadPage`.

### 4.3 Ativacao visual de menu

`updateSidebarActive(pageKey)` remove `is-active` dos botoes e marca apenas o ativo.

## 5. Sistema de tema (claro/escuro)

### 5.1 Persistencia

- Chave: `streetbite-theme` em `localStorage`.
- Valor aceito: `light` ou `dark`.

### 5.2 Aplicacao do tema

`applyTheme(theme)`:

- normaliza valor;
- seta `data-theme` em `document.documentElement`;
- salva em storage;
- atualiza controles visuais (`aria-pressed`, rotulo, icone).

### 5.3 Variaveis CSS

Cada CSS de pagina define variaveis em `:root` e override em `:root[data-theme="dark"]`.
Padrao recorrente:

- `--primary`, `--secondary`, `--background`, `--card`, `--text`, `--text-light`, `--border`, `--button-color`, etc.

Resultado: o tema e global e todas as paginas carregadas dentro da shell respondem ao atributo raiz automaticamente.

## 6. Componentes compartilhados

### 6.1 Loading progress (`loadingProgress.js` + `loadingProgress.css`)

Responsavel por barra superior + toast de carregamento.

Funcionamento:

- `start({ message })` cria token unico (Symbol).
- Enquanto houver tokens ativos, componente permanece ativo.
- Auto-progresso ate ~94%, finaliza em 100% quando ultimo token fecha.
- Delay de exibicao evita flicker em requests muito rapidas.
- Aplica `aria-busy="true"` no `body` durante processamento.

Uso principal:

- shell durante troca de pagina;
- `ApiService` durante chamadas HTTP;
- busca CEP no fluxo de pedidos.

### 6.2 Snackbar (`snackbar.js` + `snackbar.css`)

Gerencia notificacoes de feedback.

Capacidades:

- tipos: `success`, `error`, `warning`, `info`;
- fila com limite de notificacoes simultaneas (`MAX_VISIBLE_SNACKBARS = 4`);
- auto-dismiss com duracao configuravel;
- botao de fechar e opcao de acao customizada.

Disponibilizado tambem em escopo global:

- `window.StreetBiteSnackbar`
- `window.showSnackbar(...)`

## 7. Cliente API centralizado (`service.js`)

### 7.1 Configuracao base

- `DEFAULT_BASE_URL = http://localhost:5109`
- toda rota passa por `buildUrl` para normalizacao.

### 7.2 Tratamento de resposta

- tenta parse JSON; fallback para texto puro.
- `unwrapResponse` aceita payload direto ou envelopado em `data`/`Data`.
- `hasWrappedError` detecta erros mesmo com HTTP 200 quando `success=false` ou mensagem sem `data`.
- `getErrorMessage` consolida `message/Message` e listas `errors/Errors`.

### 7.3 Efeito colateral visual

Toda request usa `loadingProgress.start/finish` com mensagem por verbo HTTP:

- GET: Carregando dados...
- POST: Enviando dados...
- PATCH/PUT: Atualizando dados...
- DELETE: Removendo dados...

### 7.4 Endpoints mapeados

Entidades implementadas:

- clientes
- comandas
- enderecos
- produtos

Observacao de contrato:

- `createProduto` e `updateProduto` enviam payload envelopado em `{ data }`.

## 8. Pagina por pagina (estrutura + CSS + JS)

## 8.1 Landing page

Arquivos:

- HTML: `landPage.html`
- CSS: `Styles/landPage.css`
- JS: `Scripts/landPage.js`

### 8.1.1 Estrutura HTML

Blocos principais:

- `main.page-center`
  - `section.info-section`
    - `div.logo-all > div.logo-circle > img.burger-icon`
    - `section.dialog-box`
      - `div.box-names` com titulo e textos
      - link CTA `a.button-seeMore` para shell
  - `section.img-section` com imagem principal

### 8.1.2 Mapeamento CSS

- `page-center`: layout em duas colunas (50/50).
- `info-section`: coluna textual com sombra e centralizacao vertical.
- `logo-circle`: area proporcional para logotipo.
- `button-seeMore`: botao CTA com hover e foco acessivel.
- `img-section img`: imagem cobrindo coluna direita (`object-fit: cover`).

### 8.1.3 Comportamento JS

- aplica tema salvo no documento raiz.
- chama API (`getComandas`) em `DOMContentLoaded` para diagnostico.
- usa snackbar em caso de falha.

## 8.2 Shell principal (container de navegacao)

Arquivos:

- HTML: `Pages/streetBite.html`
- CSS: `Styles/streetBite.css`
- JS: `Scripts/streetBite.js`

### 8.2.1 Estrutura HTML

- `section.mainSection`
  - `aside.sideBar`
    - `img.logo`
    - `div.buttonsNav`
      - links `.navBarButtons` para Home/Menu/Pedidos/Settings
      - `button.mobileActionButton` (acoes rapidas mobile)
    - `div.mobileQuickActions` com botoes Item/Pedido
  - `div#contentArea.contentArea`
- `div#floatingActionButtons.floatingActionButtons`
  - `button#themeToggleSidebarButton.themeIconButton`
- Blocos externos de acessibilidade:
  - VLibras (`vw`)
  - script sienna-accessibility

### 8.2.2 Mapeamento CSS por bloco

- `mainSection`: layout horizontal principal.
- `sideBar`: painel lateral fixo em desktop, barra inferior flutuante em mobile.
- `buttonsNav`: coluna desktop / grid de 5 itens em mobile.
- `navBarButtons`: botoes com icone mascarado (`mask-image`) + label.
- `.homeIcon`, `.menuIcon`, `.orderIcon`, `.settingsIcon`: definem icones SVG.
- `navBarButtons.is-active`: estado ativo de navegacao.
- `mobileActionButton` + `mobileQuickActions`: FAB central e menu rapido.
- `floatingActionButtons`: pilha fixa para tema + botao de acessibilidade.
- `contentArea`: viewport scrollavel onde as paginas injetadas vivem.

### 8.2.3 Responsividade

Breakpoint principal `max-width: 768px`:

- sidebar vira dock inferior;
- logo some;
- labels de navegacao somem, permanecendo apenas icones;
- botao de acao rapida aparece;
- ajuste de espaco inferior em `contentArea` para nao encobrir conteudo.

### 8.2.4 Comportamento JS detalhado

- expoe funcoes globais:
  - `window.applyTheme`
  - `window.getCurrentTheme`
  - `window.toggleTheme`
  - `window.loadPage`
- carrega pagina inicial (`home`).
- controla abertura/fechamento de quick actions mobile.
- quick action pode forcar navegacao e registrar acao pendente via:
  - `window.__streetbitePendingAction = "open-item-wizard"`
  - `window.__streetbitePendingAction = "open-order-wizard"`
- observacao: no estado atual do codigo, essa flag e escrita na shell, mas nao e consumida pelos scripts das paginas.
- sincroniza botao de acessibilidade externo para dentro da pilha flutuante via `MutationObserver`.

## 8.3 Pagina Home

Arquivos:

- HTML: `Pages/Iframes/home.html`
- CSS: `Styles/home.css`
- JS: `Scripts/home.js`

### 8.3.1 Estrutura HTML

- `main.main`
  - `section.labelSection` (titulos)
  - `section.topPageSection`
    - `section#burgerCarousel.burgerCarousel`
      - botoes `.carouselControl.prev/.next`
      - `div.carouselTrack` com `article.carouselSlide`
      - `div.carouselDots` com `.carouselDot`
    - `div.buttonsTopPage`
      - links `.interactionsButton` para menu e pedidos
  - `section.popularItems`
  - `section.midPage` com cards `.grid` de itens populares

### 8.3.2 Mapeamento CSS

- `main`: pilha vertical com espacamentos grandes.
- `burgerCarousel`: grade com controles laterais e trilha central.
- `carouselSlide`: slides sobrepostos com `opacity/transform` e classe `active`.
- `slideInfo`: bloco textual (titulo, descricao, preco).
- `carouselDots`: paginacao visual.
- `interactionsButton`: CTAs para fluxos principais.
- `midPage` + `.grid`: grade responsiva de populares.

### 8.3.3 Comportamento JS

`home.js`:

- inicializa carousel se `#burgerCarousel` existir;
- controla indice atual;
- ativa slide por:
  - clique em prev/next;
  - clique nos dots;
  - teclado (`ArrowLeft` / `ArrowRight`);
- alterna classe `active` em slide e dot;
- atualiza `aria-selected` dos dots.

## 8.4 Pagina Cardapio (Menu)

Arquivos:

- HTML: `Pages/Iframes/menu.html`
- CSS: `Styles/menu.css`
- JS: `Scripts/menu.js`

### 8.4.1 Estrutura HTML

- `main.main`
  - `section.labelSection`
    - titulos
    - botao `.createItem`
  - `section.gridSection` (cards dos produtos)
  - `section#itemWizard.wizardSection` (modal wizard)
    - `div.wizardContainer`
      - `aside.wizardVisual`
      - `div.wizardMain`
        - `header.wizardHeader`
        - `section.wizardBody`
          - `div#wizardStepItem.wizardStep`
            - campos: `#inputName`, `#selectCategory`, `#inputPrice`, `#inputDesc`
            - upload imagem `#files`, preview `#imageImg`
        - `footer.wizardFooter`
          - `#wizardNext`, `#wizardCancel`

### 8.4.2 Mapeamento CSS

#### Lista de itens

- `gridSection`: grade responsiva auto-fit.
- `grid`: card de produto com cor principal, sombra e altura minima.
- `itemImage`, `productName`, `productPrice`, `productCategory`.
- `productDescription` usa `<details>` com seta animada.
- `gridActions`, `gridEditButton`, `gridDeleteButton`.

#### Wizard

- `wizardSection`: overlay modal full-screen com backdrop.
- `wizardContainer`: layout duas colunas (visual + formulario).
- `wizardMain`, `wizardHeader`, `wizardStep`, `wizardFieldGroup`.
- `wizardField`, `wizardTextarea`.
- `wizardFooter`, `wizardButton.is-primary/.is-secondary`.
- `hidden` e `wizardStep.hidden` para alternancia de exibicao.

#### Mobile

- wizard cai para uma coluna;
- botoes ficam em largura maior;
- cards ajustam imagem/tipografia.

### 8.4.3 Comportamento JS

Responsabilidades principais:

- carregar produtos da API (`getProdutos`) e renderizar cards.
- abrir wizard em modo criar ou editar.
- salvar item via API:
  - criar: `createProduto(payload)`
  - editar: `updateProduto(id, payload)`
- excluir item: `deleteProduto(id)`.
- recarregar tela apos salvar via `window.loadPage("menu")`.
- preview local de imagem escolhida no input file (sem upload para backend).

Estado local:

- `editMode` (boolean)
- `editingItemId`

Mapeamentos auxiliares:

- categoria: `normalizeProductCategory` e `serializeProductCategory`.
- imagem: `getProductCategoryImage` com prioridade por nome canonico.

## 8.5 Pagina Pedidos

Arquivos:

- HTML: `Pages/Iframes/pedidos.html`
- CSS: `Styles/pedidos.css`
- JS: `Scripts/pedidos.js`

### 8.5.1 Estrutura HTML

- `main.main`
  - `section.labelSection` com botao `#openOrderWizard`
  - `section.gridSection` (cards de pedido)
  - `section#orderWizard.wizardSection` (wizard 3 passos)
    - Passo 1 (`#orderWizardStepItems`): itens e carrinho
    - Passo 2 (`#orderWizardStepLocal`): tipo atendimento
    - Passo 3 (`#orderWizardStepDetails`): cliente, endereco, pagamento
    - footer com botoes:
      - `#orderWizardCancel`
      - `#orderWizardBack`
      - `#orderWizardNext`

### 8.5.2 Mapeamento CSS

#### Cards de pedidos

- `grid.orderCard`: container principal.
- `orderCardHeader`: grade com data, total, pagamento, codigo e botao expandir.
- `orderCardBody`: duas colunas (itens + painel de acoes) com transicao de colapso.
- `orderCard.is-collapsed`: recolhe corpo com animacao.
- `orderItemsScroll`: lista scrollavel de itens.
- `orderActionsPanel`: status e botoes de acao.
- `preparingOrder` + variantes (`statusDone`, `statusCanceled`).

#### Wizard

Compartilha conceito visual com menu, com classes `wizard*` equivalentes.

#### Carrinho no wizard

- `orderCart`, `orderCartItem`, `orderSubtotal`.

### 8.5.3 Comportamento JS

Fluxos principais:

1. Carregar pedidos (`getComandas`) e renderizar cards expansivos.
2. Criar pedido via wizard:
   - valida itens no carrinho;
   - cria comanda (`createComanda`);
   - adiciona itens (`addItemComanda`);
   - atualiza pagamento/status (`updateComanda`);
   - recarrega pagina (`window.loadPage("requests")`).
3. Atualizar status pedido:
   - confirmar (`confirmComanda`)
   - cancelar (`deleteComanda`)

#### Estado e navegacao interna do wizard

- `currentStep` controla etapa (1..3).
- `showWizardStep(step)` alterna `hidden` e textos dos botoes.
- `resetWizardForm()` limpa campos e carrinho.

#### Carrinho local

- `cartItems[]` guarda itens temporarios antes do envio.
- cada item recebe `uid` unico para remocao.
- subtotal recalculado em `renderCart()`.

#### CEP

- quando atendimento nao e retirada e CEP muda:
  - consulta `https://opencep.com/v1/{cep}`;
  - preenche rua e bairro;
  - mostra loading e feedback de erro via snackbar.

#### Enum mapping

- status e pagamento sao resolvidos via `enumMappings.js`.
- isso desacopla descricao visual do valor numerico da API.

## 8.6 Pagina Settings

Arquivos:

- HTML: `Pages/Iframes/settings.html`
- CSS: `Styles/settings.css`
- JS potencial: `Scripts/settings.js`

### 8.6.1 Estrutura HTML

- `main.main`
  - `section.labelSection`
  - `section.gridSection`
    - `div#themeGrid.grid`: exibe tema atual
    - `div.grid`: nome/descricao estabelecimento
    - `div#openingHoursGrid.grid`: horarios semanais

### 8.6.2 Mapeamento CSS

- `gridSection`: cards em coluna.
- `.grid`: blocos de configuracao com sombra e padding.
- inputs com cor primaria e texto claro.
- `#openingHoursGrid section`: duas colunas (dias + horarios).
- `weekTimes`: pares de input time (abertura/fechamento).
- botoes padronizados com hover.

### 8.6.3 Estado funcional atual

- A pagina e majoritariamente estatica no estado atual.
- Nao ha `<script src="../../Scripts/settings.js">` em `settings.html`.
- Existe um `settings.js` no projeto, mas ele procura `#themeToggleButton`, elemento que nao existe no HTML atual.
- Na pratica, o tema e controlado pelo botao flutuante da shell (`themeToggleSidebarButton`).

## 9. Modulos auxiliares de dominio

### 9.1 `enumMappings.js`

Define classes e opcoes para:

- categorias de produto;
- metodos de pagamento;
- status de pedido.

Oferece utilitarios:

- `getEnumByValue(options, value)`
- `normalizeEnumValue(value, options)`
- `getEnumDescription(...)`

Aceita valor numerico, string numerica, descricao e aliases (normalizando acentos e caixa).

### 9.2 `productCategories.js`

Responsavel por:

- normalizar/serializar categoria;
- mapear imagem de item por nome ou por categoria.

Prioridade atual de imagem:

1. nome canonico (`big sb`, `big sb bacon`, etc.);
2. imagem da categoria;
3. fallback para categoria lanche.

## 10. Acessibilidade e UX

Implementacoes presentes:

- atributos `aria-label`, `aria-live`, `aria-hidden`, `aria-expanded`, `aria-pressed` em pontos criticos;
- foco visivel com `:focus-visible` em controles interativos;
- navegacao por teclado no carrossel;
- integracao com VLibras;
- integracao com Sienna Accessibility;
- feedback visual e textual via snackbar/loading.

## 11. Responsividade

Padroes observados:

- breakpoints principais em `768px`, `640px`, `1150px`.
- shell muda de sidebar vertical para dock inferior em mobile.
- wizards mudam de duas colunas para coluna unica.
- cards e imagens reduzem tamanho sem quebrar fluxo.

## 12. Configuracao de build e execucao

### 12.1 `package.json`

Scripts:

- `npm run dev` -> `vite --host 0.0.0.0 --port 3000`
- `npm run build` -> `vite build`
- `npm run preview` -> `vite preview --host 0.0.0.0 --port 3000`

Dependencias de dev:

- `vite`
- `prettier`

### 12.2 `vite.config.mjs`

- `base: "./"` para paths relativos.
- configura entradas multipagina:
  - landing;
  - shell;
  - todos os HTML detectados automaticamente em `Pages/Iframes`.

## 13. Guia de modificacao por objetivo

### 13.1 Alterar layout/visual de uma tela

1. Editar o HTML da tela alvo em `Pages/Iframes`.
2. Ajustar o CSS correspondente em `Styles/*.css`.
3. Se houver comportamento, alterar script da tela em `Scripts/*.js`.
4. Se a mudanca impactar navegacao/tema global, ajustar `streetBite.js`.

### 13.2 Alterar fluxo de criacao de item (Menu)

Pontos principais:

- validacoes em `saveItem()`.
- estrutura visual do wizard em `menu.html` + `menu.css`.
- payload enviado para API em `service.js` (`createProduto`/`updateProduto`).

### 13.3 Alterar fluxo de pedido (wizard 3 passos)

Pontos principais:

- transicao de etapas em `showWizardStep` e listener de `wizardNext`.
- itens temporarios em `cartItems` + `renderCart`.
- integracao CEP no listener de `orderCep`.
- persistencia final em `createOrderFromWizard`.

### 13.4 Alterar tema

- variaveis em `:root` e `:root[data-theme="dark"]` de cada CSS.
- logica de toggle/persistencia em `streetBite.js`.

### 13.5 Alterar endpoint/backend

- atualizar `DEFAULT_BASE_URL` em `service.js`.
- para payloads diferentes, ajustar wrappers `create*`/`update*`.

## 14. Pontos de atencao tecnica

1. A injecao dinamica de scripts por pagina depende do `<head>` dos HTML internos.
2. O cache-buster e aplicado apenas a `<script src>` para garantir reexecucao.
3. `settings.js` esta desacoplado do HTML atual (nao carregado e referencia seletor ausente).
4. O upload de imagem no menu hoje e apenas preview local (nao enviado para API).
5. Em `pedidos.js`, alguns campos de cliente/endereco ainda nao sao persistidos na API atual (fluxo concentra em comanda + itens + pagamento/status).

## 15. Resumo operacional

O frontend StreetBite combina:

- uma shell com roteamento interno via `fetch + DOMParser`;
- modulos de pagina com responsabilidade bem separada;
- cliente HTTP centralizado com tratamento de resposta robusto;
- UX consistente com tema global, loading unificado e notificacoes.

Com esse desenho, mudancas de comportamento tendem a ficar localizadas por tela, enquanto preocupacoes transversais (tema, navegacao, feedback, API) permanecem centralizadas e reutilizaveis.
