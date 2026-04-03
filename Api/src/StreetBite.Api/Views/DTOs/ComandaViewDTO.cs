using StreetBite.Core.Enums;

namespace StreetBite.Api.Views.DTOs;

public sealed record ComandaViewDTO(
    int ComandaId,
    List<ItemViewDTO> Items,
    string CodigoDoPedido,
    decimal Subtotal,
    EComandaStatus Status,
    DateTime PedidoCriadoEm,
    EMetodoPagamento MetodoDePagamento);
