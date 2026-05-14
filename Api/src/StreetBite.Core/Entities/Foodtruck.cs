using StreetBite.Core.Enums;

namespace StreetBite.Core.Entities;

public sealed class Foodtruck : BaseEntity
{
    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Telefone { get; set; }

    public string Documento { get; set; } = string.Empty;

    public string? Cep { get; set; }

    public EMetodoPagamento FormaPagamento { get; set; }

    public string Senha { get; set; } = string.Empty;
}