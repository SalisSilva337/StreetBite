using StreetBite.Api.Application.Common;
using StreetBite.Api.Application.Cadastros;
using StreetBite.Api.Application.Comandas;
using StreetBite.Api.Application.Produtos;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

await app.MigrateDatabaseAsync();

app.UseApiConfiguration();

app.MapGet("/", () => new { Message = "OK" });

app.MapProdutosEndpoints();
app.MapCadastrosEndpoints();
app.MapComandasEndpoints();

app.Run();
