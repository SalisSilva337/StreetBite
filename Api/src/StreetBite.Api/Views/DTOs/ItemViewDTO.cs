using StreetBite.Core.Enums;

namespace StreetBite.Api.Views.DTOs;

public sealed record ItemViewDTO(
    int Id,
    string ProdutoNome,
    ECategorias Categoria,
    int Quantidade,
    decimal PrecoUnitario);
