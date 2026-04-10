# StreetBite FrontEnd

Frontend web do StreetBite, feito com **HTML5**, **CSS3** e **JavaScript vanilla**. A interface funciona como uma SPA leve: a shell principal carrega telas dinamicamente e conversa com a API por meio de um cliente HTTP centralizado.

## Stack

| Componente | Papel |
|---|---|
| HTML5 | Estrutura das telas |
| CSS3 | Layout, responsividade e tema |
| JavaScript ES Modules | Lógica da aplicação |
| Fetch API | Comunicação com o backend |
| Prettier 3.8.1 | Formatação |
| Vite 6 | Dev server e build |

## Estrutura

```text
FrontEnd/
├── landPage.html
├── Pages/
│   ├── streetBite.html
│   └── Iframes/
│       ├── home.html
│       ├── menu.html
│       ├── pedidos.html
│       └── settings.html
├── Scripts/
├── Styles/
├── Imgs/
├── Dockerfile
└── package.json
```

## Como a interface funciona

### 1. Página de entrada

`landPage.html` apresenta o projeto e direciona para `Pages/streetBite.html`.

### 2. Shell principal

`streetBite.html` é o container da aplicação. Ele mantém:

- sidebar de navegação;
- área de conteúdo dinâmica;
- botões flutuantes de tema e acessibilidade;
- suporte a VLibras e Sienna.

### 3. Carregamento dinâmico de telas

`Scripts/streetBite.js` coordena tudo:

- busca o HTML da tela;
- injeta o conteúdo em `#contentArea`;
- troca o CSS da página;
- remove o script anterior e injeta o novo script;
- mantém o estado do tema no `localStorage`.

As telas `menu.js` e `pedidos.js` são carregadas como **module scripts** porque importam helpers compartilhados.

### 4. Comunicação com a API

`Scripts/service.js` centraliza todas as chamadas HTTP.

Ele:

- usa `http://localhost:5109` como base padrão;
- envia payloads JSON;
- interpreta respostas no formato `{ data }`;
- aceita também `Data` e mensagens de erro em maiúsculo/minúsculo;
- mostra erros quando a API responde com falha estruturada.

## Telas principais

| Tela | Responsabilidade |
|---|---|
| Home | Visão geral da operação |
| Menu | CRUD de produtos |
| Pedidos | CRUD de comandas e itens |
| Settings | Tema e configurações |

## Arquitetura visual e UX

- tema claro/escuro com persistência;
- menu mobile com ações rápidas;
- barras e toasts de feedback;
- suporte a leitores de tela com ARIA;
- integração com VLibras;
- componentes reutilizáveis em `Scripts/components`.

## Assets

Imagens e ícones ficam em:

- `Imgs/images`
- `Imgs/icons`

O arquivo `productCategories.js` mapeia categorias e imagens do cardápio.

## Como executar

### Com Docker

Na raiz do repositório:

```bash
docker compose up --build
```

### Localmente

```bash
cd FrontEnd
npm install
npm run dev
```

## Formatação

```bash
cd FrontEnd
npx prettier --check .
npx prettier --write .
```

## Integração com o backend

Se a API estiver em outro endereço, ajuste `DEFAULT_BASE_URL` em `Scripts/service.js`.

## Referências

- [README principal](../README.md)
- [README da API](../Api/README.md)
