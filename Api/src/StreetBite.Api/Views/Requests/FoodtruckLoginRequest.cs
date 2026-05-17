using StreetBite.Core.Abstractions;
using StreetBite.Core.Models;

namespace StreetBite.Api.Views.Requests;

public sealed record FoodtruckLoginRequest(
    string Email,
    string Senha) : IValidation
{
    public Result Validate()
    {
        if (string.IsNullOrWhiteSpace(Email))
        {
            return Result.Fail("E-mail do foodtruck deve ser informado.");
        }

        if (string.IsNullOrWhiteSpace(Senha))
        {
            return Result.Fail("Senha do foodtruck deve ser informada.");
        }

        return Result.Ok();
    }
}