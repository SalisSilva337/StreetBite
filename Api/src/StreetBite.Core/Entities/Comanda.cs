using StreetBite.Core.Enums;

namespace StreetBite.Core.Entities;

public sealed class Comanda : BaseEntity
{

    public Cliente? Cliente { get; set; }

    public string ClienteNome { get; set; } = string.Empty;

    public ETipoAtendimento TipoAtendimento { get; set; } = ETipoAtendimento.DeliveryRetirada;

    public int? NumeroMesa { get; set; }

    public string CodigoPedido { get; set; } = string.Empty;

    public EComandaStatus Status { get; set; }

    public decimal Subtotal { get; set; }

    public EMetodoPagamento MetodoDePagamento { get; set; }
    public List<Item> Itens { get; set; } = [];
}
