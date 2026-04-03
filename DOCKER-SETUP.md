# StreetBite Docker e Setup

Este guia explica quais ferramentas usar, como subir a stack completa com Docker e como trabalhar no dia a dia de desenvolvimento.

## 1. Ferramentas necessárias

### Obrigatórias

- **Docker Desktop** com suporte a Docker Compose
- **Git**
- **.NET 10 SDK**

### Para desenvolvimento do FrontEnd fora do Docker

- **Node.js**
- **npm** para instalar dependências e executar o servidor Vite

### Opcional

- **PostgreSQL local** se você preferir não usar o banco em container
- **VS Code** ou **Visual Studio** como IDE

## 2. Rodar o projeto inteiro com Docker

Na raiz do repositório:

```bash
docker compose up --build
```

Isso sobe:

| Serviço | Porta | Observação |
|---|---|---|
| `db` | `5432` | PostgreSQL com volume persistente |
| `api` | `5109` | API .NET 10 |
| `frontend` | `3000` | FrontEnd servido pelo Vite |

### Acessos úteis

- FrontEnd: `http://localhost:3000`
- API: `http://localhost:5109`

### Parar a stack

```bash
docker compose down
```

Se quiser apagar também os dados do banco:

```bash
docker compose down -v
```

## 3. Desenvolvimento

### Opção A: banco via Docker, API e FrontEnd local

Esta é a forma mais prática para desenvolver sem subir tudo em container.

```bash
docker compose up -d --no-deps db
```

Depois rode os serviços localmente:

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

O `Api/src/StreetBite.Api/appsettings.json` já usa:

```text
Host=localhost;Port=5432;Database=streetbite;Username=postgres;Password=postgres
```

### Opção B: tudo local

Se preferir instalar o PostgreSQL na máquina:

1. crie o banco `streetbite`;
2. use o usuário `postgres` com senha `postgres`, ou ajuste a connection string;
3. rode as migrations;
4. inicie a API e o FrontEnd localmente.

Exemplo:

```bash
cd Api
dotnet ef database update --project src/StreetBite.Infra --startup-project src/StreetBite.Api
dotnet run --project src/StreetBite.Api/StreetBite.Api.csproj
```

```bash
cd FrontEnd
npm install
npm run dev
```

## 4. Quando usar cada opção

| Cenário | Melhor escolha |
|---|---|
| Subir tudo rápido | Docker Compose completo |
| Trabalhar só no FrontEnd | DB em Docker + API/FrontEnd local |
| Trabalhar só no backend | DB em Docker + API local |
| Ambiente da máquina já tem PostgreSQL | Tudo local |

## 5. Referências

- [README principal](./README.md)
- [README da API](./Api/README.md)
- [README do FrontEnd](./FrontEnd/README.md)
