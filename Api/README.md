# StreetBite API

API REST do StreetBite, construída em **.NET 10** com **Minimal APIs**, **Entity Framework Core** e **PostgreSQL**.

O objetivo desta documentação é ajudar devs que não conhecem a stack a entender rapidamente onde ficam as responsabilidades, como o fluxo de requisição funciona e como rodar o backend.

## Stack

| Componente | Papel |
|---|---|
| .NET 10 / ASP.NET Core | Host da API e pipeline HTTP |
| Minimal APIs | Definição das rotas |
| Entity Framework Core | Persistência e migrations |
| PostgreSQL | Banco de dados |
| Nanoid | Geração de código de comanda |
| ReDoc / OpenAPI | Documentação interativa em desenvolvimento |

## Estrutura em camadas

| Projeto | Responsabilidade |
|---|---|
| `StreetBite.Api` | Endpoints, filtros, resposta HTTP, DI e bootstrap |
| `StreetBite.Core` | Entidades, enums, validações e modelos de resultado |
| `StreetBite.Infra` | `DbContext`, configurações Fluent API e migrations |

```text
Program.cs
  ├─ AddApiServices(...)
  ├─ UseApiConfiguration(...)
  ├─ MapProdutosEndpoints()
  └─ MapComandasEndpoints()
```

## Estrutura principal

```text
Api/src/
├── StreetBite.Api/
│   ├── Program.cs
│   ├── Application/
│   │   ├── Common/
│   │   ├── Comandas/
│   │   └── Produtos/
│   ├── Services/
│   ├── Abstractions/
│   └── Views/
├── StreetBite.Core/
└── StreetBite.Infra/
```

## Como a API funciona

### 1. Bootstrapping

`Program.cs` só liga os blocos principais:

- registra serviços com `AddApiServices(...)`;
- configura pipeline com `UseApiConfiguration()`;
- mapeia `/api/v1/produtos` e `/api/v1/comandas`.

### 2. Configuração de infraestrutura

`ServiceCollectionExtensions` registra:

- CORS liberado;
- `StreetBiteDbContext` com PostgreSQL;
- `GlobalExceptionHandler`;
- serviços de produto, comanda e geração de código.

Na inicialização, a API também aplica automaticamente as migrations pendentes do EF Core antes de aceitar requisições.

### 3. Pipeline HTTP

`WebApplicationExtensions` habilita:

- OpenAPI e ReDoc em desenvolvimento;
- `UseExceptionHandler()`;
- política de CORS da aplicação.

### 4. Validação

Qualquer argumento que implemente `IValidation` passa pelo `ValidationRequestFilter`.

O `EntityRequest<T>` valida se existe `Id` ou `Data`, e a própria entidade valida o conteúdo interno. Se falhar, a API responde `400 Bad Request`.

### 5. Resultado padronizado

Os serviços retornam `Result` ou `Result<T>`.

- sucesso vira `ApiResponse<T>` com `data`;
- falha vira `ApiResponse<T>` com `message` e status HTTP;
- `ApiResponse` usa `Message == null` como sinal de sucesso.

## Fluxo de uma requisição

Exemplo: criar produto.

```text
POST /api/v1/produtos
  ↓
ValidationRequestFilter
  ↓
ProdutosEndpoints.AdicionarProduto
  ↓
IProductService / ProductService
  ↓
StreetBiteDbContext + EF Core
  ↓
Result<T> -> ApiResponse<T>
  ↓
201 Created
```

## Endpoints principais

### Produtos

| Método | Rota |
|---|---|
| GET | `/api/v1/produtos` |
| GET | `/api/v1/produtos/{id}` |
| POST | `/api/v1/produtos` |
| PATCH | `/api/v1/produtos/{id}` |
| DELETE | `/api/v1/produtos/{id}` |

### Comandas e itens

| Método | Rota |
|---|---|
| GET | `/api/v1/comandas` |
| GET | `/api/v1/comandas/{id}` |
| POST | `/api/v1/comandas` |
| PATCH | `/api/v1/comandas/{id}` |
| PATCH | `/api/v1/comandas/{id}/confirmar` |
| DELETE | `/api/v1/comandas/{id}` |
| POST | `/api/v1/comandas/item` |
| GET | `/api/v1/comandas/item/{id}` |
| GET | `/api/v1/comandas/itens` |
| PATCH | `/api/v1/comandas/item/{id}` |
| DELETE | `/api/v1/comandas/item/{id}` |

## Convenções importantes

### Payload de produto

Criação e atualização de produto usam o envelope:

```json
{
  "data": {
    "nome": "Hambúrguer",
    "preco": 25.5,
    "categoria": "Lanche"
  }
}
```

### Status HTTP

| Situação | Status |
|---|---|
| Sucesso no GET | `200 OK` |
| Criação | `201 Created` |
| Remoção | `204 No Content` |
| Validação | `400 Bad Request` |
| Não encontrado | `404 Not Found` |
| Erro inesperado | `500 Internal Server Error` |

### Domínio

- `StreetBite.Core` concentra entidades e enums.
- `BaseEntity` fornece `Id`, `CreatedAt` e `ModifiedAt`.
- `StreetBite.Infra` aplica o mapeamento com Fluent API.

## Como executar

### Pré-requisitos

- .NET 10 SDK
- PostgreSQL

### Com Docker

Na raiz do repositório:

```bash
docker compose up --build
```

### Localmente

```bash
cd Api
dotnet build src/StreetBite.Api/StreetBite.Api.csproj
dotnet run --project src/StreetBite.Api/StreetBite.Api.csproj
```

## Configuração

O connection string padrão é lido de `ConnectionStrings:DefaultConnection`.

No `compose.yaml`, a API usa:

```text
Host=db;Port=5432;Database=streetbite;Username=postgres;Password=postgres
```

## Documentação interativa

Em desenvolvimento, a API expõe:

- OpenAPI em `/openapi/v1.json`
- ReDoc na aplicação web de desenvolvimento

## Referências

- [README principal](../README.md)
- [README do FrontEnd](../FrontEnd/README.md)
