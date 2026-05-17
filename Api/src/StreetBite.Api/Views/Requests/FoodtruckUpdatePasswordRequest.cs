using StreetBite.Core.Abstractions;
using StreetBite.Core.Models;

namespace StreetBite.Api.Views.Requests;

public sealed record FoodtruckUpdatePasswordRequest(
    string Email,
    string NovaSenha) : IValidation
{
    public Result Validate()
    {
        if (string.IsNullOrWhiteSpace(Email))
        {
            return Result.Fail("E-mail do foodtruck deve ser informado.");
        }

        if (string.IsNullOrWhiteSpace(NovaSenha))
        {
            return Result.Fail("Nova senha do foodtruck deve ser informada.");
        }

        return Result.Ok();
    }
}