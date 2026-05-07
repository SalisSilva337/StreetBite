using StreetBite.Core.Abstractions;
using StreetBite.Core.Models;

namespace StreetBite.Api.Views.Requests;

public sealed record ClienteCadastroRequest(
    string Nome,
    string? Email,
    string? Telefone,
    string Senha) : IValidation
{
    public Result Validate()
    {
        if (string.IsNullOrWhiteSpace(Nome))
        {
            return Result.Fail("Nome do cliente deve ser informado.");
        }

        if (string.IsNullOrWhiteSpace(Senha))
        {
            return Result.Fail("Senha do cliente deve ser informada.");
        }

        return Result.Ok();
    }
}