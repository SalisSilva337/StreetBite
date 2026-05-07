namespace StreetBite.Api.Views.DTOs;

public sealed record ClienteViewDTO(
    int ClienteId,
    string Nome,
    string? Email,
    string? Telefone,
    DateTime CriadoEm);