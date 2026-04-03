using StreetBite.Core.Abstractions;
using StreetBite.Core.Enums;
using StreetBite.Core.Models;

namespace StreetBite.Api.Views.Requests;

public sealed record ComandaUpdateRequest(
    EComandaStatus Status,
    EMetodoPagamento MetodoDePagamento) : IValidation
{
    public Result Validate()
    {
        if (!Enum.IsDefined(Status))
        {
            return Result.Fail("Status da comanda inválido.");
        }

        if (!Enum.IsDefined(MetodoDePagamento))
        {
            return Result.Fail("Método de pagamento inválido.");
        }

        return Result.Ok();
    }
}
