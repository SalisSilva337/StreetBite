using StreetBite.Api.Views.DTOs;
using StreetBite.Api.Views.Requests;
using StreetBite.Core.Models;

namespace StreetBite.Api.Abstractions;

public interface IComandaService
{
    Task<Result<ComandaViewDTO>> AddComandaAsync(CancellationToken cancellationToken = default);

    Task<Result<List<ComandaViewDTO>>> ListComandasAsync(CancellationToken cancellationToken = default);

    Task<Result<ComandaViewDTO>> GetComandaByIdAsync(long id, CancellationToken cancellationToken = default);

    Task<Result<ComandaViewDTO>> UpdateComandaAsync(
        long id,
        ComandaUpdateRequest request,
        CancellationToken cancellationToken = default);

    Task<Result> ConfirmComandaAsync(
        long id,
        CancellationToken cancellationToken = default);

    Task<Result> DeleteComandaAsync(long id, CancellationToken cancellationToken = default);

    Task<Result<ItemViewDTO>> AddItemAsync(ItemRequest request, CancellationToken cancellationToken = default);

    Task<Result<List<ItemViewDTO>>> ListItemsAsync(CancellationToken cancellationToken = default);

    Task<Result<ItemViewDTO>> GetItemByIdAsync(long id, CancellationToken cancellationToken = default);

    Task<Result<ItemViewDTO>> UpdateItemAsync(
        long id,
        ItemUpdateRequest request,
        CancellationToken cancellationToken = default);

    Task<Result> DeleteItemAsync(long id, CancellationToken cancellationToken = default);
}
