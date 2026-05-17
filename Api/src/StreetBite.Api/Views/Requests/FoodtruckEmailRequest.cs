using StreetBite.Core.Abstractions;
using StreetBite.Core.Models;

namespace StreetBite.Api.Views.Requests;

public sealed record FoodtruckEmailRequest(string Email) : IValidation
{
    public Result Validate()
    {
        if (string.IsNullOrWhiteSpace(Email))
        {
            return Result.Fail("E-mail do foodtruck deve ser informado.");
        }

        return Result.Ok();
    }
}