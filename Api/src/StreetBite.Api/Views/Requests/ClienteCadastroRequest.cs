using StreetBite.Core.Abstractions;
using StreetBite.Core.Models;

namespace StreetBite.Api.Views.Requests;

public sealed record ClienteCadastroRequest(
    string Nome,
    string? Email,
    string? Telefone,
    string? Cep,
    string? Street,
    string? Number) : IValidation
{
    public Result Validate()
    {
        if (string.IsNullOrWhiteSpace(Nome))
        {
            return Result.Fail("Nome do cliente deve ser informado.");
        }

        if (string.IsNullOrWhiteSpace(Email))
        {
            return Result.Fail("E-mail do cliente deve ser informado.");
        }

        if (string.IsNullOrWhiteSpace(Telefone))
        {
            return Result.Fail("Telefone do cliente deve ser informado.");
        }

        if (string.IsNullOrWhiteSpace(Cep))
        {
            return Result.Fail("CEP do endereço deve ser informado.");
        }

        if (string.IsNullOrWhiteSpace(Street))
        {
            return Result.Fail("Rua do endereço deve ser informada.");
        }

        if (string.IsNullOrWhiteSpace(Number))
        {
            return Result.Fail("Número do endereço deve ser informado.");
        }

        return Result.Ok();
    }
}