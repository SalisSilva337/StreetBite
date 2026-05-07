namespace StreetBite.Api.Views.DTOs;

public sealed record FoodtruckViewDTO(
    int FoodtruckId,
    string Nome,
    string? Email,
    string? Telefone,
    string Documento,
    string? Cep,
    string? FormaPagamento,
    DateTime CriadoEm);