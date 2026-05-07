using StreetBite.Core.Abstractions;
using StreetBite.Core.Models;

namespace StreetBite.Api.Views.Requests;

public sealed record ComandaCreateRequest(long ClienteId) : IValidation
{
    public Result Validate()
    {
        if (ClienteId <= 0)
        {
            return Result.Fail("ClienteId deve ser informado.");
        }

        return Result.Ok();
    }
}