# StreetBite

<div align="center">
  <img src="./FrontEnd/Imgs/images/StreetBite-logo.png" alt="Logo do StreetBite" width="180" />

  <h1>StreetBite</h1>
  <p>Plataforma web para gestão de food trucks, com cardápio, comandas e pedidos em um único fluxo.</p>

  <p>
    <img src="https://img.shields.io/badge/.NET-10-512BD4?logo=.net&logoColor=white" alt=".NET 10" />
    <img src="https://img.shields.io/badge/Frontend-Vanilla%20JS-F7DF1E?logo=javascript&logoColor=black" alt="Vanilla JS" />
    <img src="https://img.shields.io/badge/Banco-PostgreSQL-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

## Sobre o projeto

O StreetBite foi criado para profissionalizar operações de food trucks com uma interface enxuta e de baixo custo. A ideia é reduzir o trabalho manual, diminuir erros de registro e centralizar em uma só aplicação o controle de cardápio e pedidos.

## Visão geral da arquitetura

| Camada       | Responsabilidade                                                        |
| ------------ | ----------------------------------------------------------------------- |
| **API**      | Expõe os endpoints REST, valida requisições e aplica regras de negócio. |
| **Core**     | Contém entidades, enums, validações e modelos de resultado.             |
| **Infra**    | Faz a persistência com EF Core e PostgreSQL.                            |
| **FrontEnd** | Entrega a interface web em HTML, CSS e JavaScript puro.                 |

```text
FrontEnd (Vanilla JS)
        ↓ HTTP
.NET 10 API (Minimal APIs)
        ↓ EF Core
PostgreSQL
```

Veja os detalhes técnicos em:

- [README da API](./Api/README.md)
- [README do FrontEnd](./FrontEnd/README.md)
- [Guia de setup e Docker](./DOCKER-SETUP.md)
- [Notas de arquitetura](./AGENTS.md)

## Estrutura do repositório

```text
StreetBite/
├── Api/        # Backend .NET 10
├── FrontEnd/   # Interface web estática
├── compose.yaml
├── AGENTS.md
└── README.md
```

## Como executar

### Com Docker

```bash
docker compose up --build
```

### Localmente

Backend:

```bash
cd Api
dotnet build src/StreetBite.Api/StreetBite.Api.csproj
dotnet run --project src/StreetBite.Api/StreetBite.Api.csproj
```

FrontEnd:

```bash
cd FrontEnd
npm install
npm run dev
```

## Capturas de tela

<img width="1918" height="908" alt="Tela inicial do StreetBite" src="https://github.com/user-attachments/assets/181febdc-3477-4a55-95f8-1da34b79b10d" />

<img width="1919" height="902" alt="Tela principal do StreetBite" src="https://github.com/user-attachments/assets/39529833-9d36-4acd-8bc7-126b629e4d80" />

## Figma

- [Design da aplicação](https://www.figma.com/design/uAC8odd4ScmFf9QTPhL8t1/StreetBite?node-id=0-1&p=f&t=Hr3nVETTd1u2AIGM-0)

## Integrantes

- Salis Silva
- José Lucas
- Pedro Correia
- Pedro Leão
- Julia Cavalcante

## Instituição

CESMAC AL — Sistemas de Informação

## Status

Projeto acadêmico em evolução.
