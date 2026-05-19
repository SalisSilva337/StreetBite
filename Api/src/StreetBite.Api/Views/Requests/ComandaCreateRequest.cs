using StreetBite.Core.Abstractions;
using StreetBite.Core.Enums;
using StreetBite.Core.Models;

namespace StreetBite.Api.Views.Requests;

public sealed record ComandaCreateRequest(
    long? ClienteId,
    ETipoAtendimento TipoAtendimento,
    int? NumeroMesa) : IValidation
{
    public Result Validate()
    {
        if (!Enum.IsDefined(TipoAtendimento))
        {
            return Result.Fail("Tipo de atendimento inválido.");
        }

        if (TipoAtendimento == ETipoAtendimento.DeliveryRetirada)
        {
            if (ClienteId is null || ClienteId <= 0)
            {
                return Result.Fail("ClienteId deve ser informado para Delivery/Retirada.");
            }

            return Result.Ok();
        }

        if (NumeroMesa is null || NumeroMesa < 1 || NumeroMesa > 10)
        {
            return Result.Fail("Número da mesa deve estar entre 1 e 10.");
        }

        return Result.Ok();
    }
}