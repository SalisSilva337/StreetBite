namespace StreetBite.Core.Entities;

public sealed class Cliente : BaseEntity
{
    public string Nome { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Telefone { get; set; }

    public string Senha { get; set; } = string.Empty;

    public List<Endereco> Enderecos { get; set; } = [];
}
