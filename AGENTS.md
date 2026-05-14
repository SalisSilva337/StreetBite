# StreetBite Agent Instructions

## Project shape

Food-truck management SPA with .NET 10 Minimal API backend and vanilla JS frontend.

- `Api/src/StreetBite.Api` — endpoints, DI bootstrap (`Program.cs` → `AddApiServices`/`UseApiConfiguration`/`Map*Endpoints`).
- `Api/src/StreetBite.Core` — entities, enums, validation (`IValidation`), `Result`/`Result<T>` model.
- `Api/src/StreetBite.Infra` — EF Core `DbContext`, fluent configs (`Data/Configurations/BaseEntityConfiguration`), PostgreSQL migrations.
- `web/` — Vite-bundled frontend; `Scripts/streetBite.js` is the SPA shell that fetches page HTML into `#contentArea` and injects page-level JS modules.

## Commands

Prerequisites: .NET 10 SDK (pinned to `10.0.201` in `Api/global.json`), Node.js, PostgreSQL.

```bash
# Full stack (Docker)
docker compose up --build

# DB only (Docker), then run locally
docker compose up -d --no-deps db
```

Backend (working directory: `Api`):

```bash
dotnet build src/StreetBite.Api/StreetBite.Api.csproj
dotnet run --project src/StreetBite.Api/StreetBite.Api.csproj    # auto-applies migrations
dotnet ef database update --project src/StreetBite.Infra --startup-project src/StreetBite.Api
```

Frontend (working directory: `web`):

```bash
npm install
npx prettier --check .          # check formatting
npx prettier --write .          # auto-format
npm run dev                     # Vite dev server on :3000
npm run build                   # production build
```

Ports: API `5109`, frontend `3000`, DB `5432`.
Connection string (local): `Host=localhost;Port=5432;Database=streetbite;Username=postgres;Password=postgres`.

## Architecture

- `Program.cs` maps three endpoint groups: `ProdutosEndpoints`, `CadastrosEndpoints`, `ComandasEndpoints`. Item routes live under comandas (`/api/v1/comandas/item`, `/api/v1/comandas/itens`).
- Services return `Result`/`Result<T>`; endpoints translate to `ApiResponse<T>` (success when `Message == null`) or `PagedApiResponse<T>`.
- `ValidationRequestFilter` runs on any endpoint argument implementing `IValidation`.
- `GlobalExceptionHandler` returns a JSON `ApiResponse<object>` on unhandled failures.
- EF Core fluent mappings are in `Infra/Data/Configurations/`; `BaseEntityConfiguration` defines `Id`, `CreatedAt`, `ModifiedAt`.
- Frontend API calls go through `web/Scripts/service.js` (`ApiService` class, base URL `http://localhost:5109`), which unwraps `{ data }`/`{ Data }` from responses and surfaces error messages.
- Vite config (`web/vite.config.mjs`) has multi-page entry points: every `.html` in `web/Pages/` gets its own build output with `base: "./"`.
- Docker `compose.yaml` context is `web/` for the frontend service, not `FrontEnd/`.

## Conventions

- Domain terms are in Portuguese: `Produto`, `Comanda`, `Item`, `Cliente`, `Endereco`, `Cadastro`, `Foodtruck`.
- `/api/v1/` prefix on all routes. Response envelope always wraps `data`.
- Product create/update from the frontend sends `{ data: { nome, preco, categoria } }` to `/api/v1/produtos`.
- Category values are normalized through `web/Scripts/productCategories.js` (imports from `enumMappings.js`); do not duplicate that mapping.
- Page scripts that import ESM helpers (`menu.js`, `pedidos.js`, `home.js`) must be loaded with `type="module"` in their page HTML.
- Reusable UI components live in `web/Scripts/components/` (e.g. `snackbar.js`, `loadingProgress.js`).
- Prettier settings (from `.vscode/settings.json`): `semi: true`, `singleQuote: false`, `tabWidth: 2`, `trailingComma: "all"`.
- No test project exists yet.
