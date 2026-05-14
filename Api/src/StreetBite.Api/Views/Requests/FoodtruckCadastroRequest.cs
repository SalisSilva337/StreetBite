using StreetBite.Core.Abstractions;
using StreetBite.Core.Models;

namespace StreetBite.Api.Views.Requests;

public sealed record FoodtruckCadastroRequest(
    string Nome,
    string Email,
    string? Telefone,
    string Documento,
    string? Cep,
    string? FormaPagamento,
    string Senha) : IValidation
{
    public Result Validate()
    {
        if (string.IsNullOrWhiteSpace(Nome))
        {
            return Result.Fail("Nome do foodtruck deve ser informado.");
        }

        if (string.IsNullOrWhiteSpace(Email))
        {
            return Result.Fail("E-mail do foodtruck deve ser informado.");
        }

        if (string.IsNullOrWhiteSpace(Documento))
        {
            return Result.Fail("Documento do foodtruck deve ser informado.");
        }

        if (string.IsNullOrWhiteSpace(Senha))
        {
            return Result.Fail("Senha do foodtruck deve ser informada.");
        }

        return Result.Ok();
    }
}