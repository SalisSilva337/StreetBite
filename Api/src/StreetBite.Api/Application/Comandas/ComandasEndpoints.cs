using StreetBite.Api.Abstractions;
using StreetBite.Api.Application.Common.Extensions;
using StreetBite.Api.Application.Common.Filters;
using StreetBite.Api.Views.DTOs;
using StreetBite.Api.Views.Requests;
using StreetBite.Api.Views.Responses;

namespace StreetBite.Api.Application.Comandas;

public static class ComandasEndpoints
{
    public static RouteGroupBuilder MapComandasEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/comandas")
            .WithTags("Comandas")
            .AddEndpointFilter<ValidationRequestFilter>();

        group.MapPost("", CriarComanda);
        group.MapGet("", ListarComandas);
        group.MapGet("/{id:long}", ObterComandaPorId);
        group.MapPatch("/{id:long}", AtualizarComanda);
        group.MapPatch("/{id:long}/confirmar", ConfirmarComanda);
        group.MapDelete("/{id:long}", RemoverComanda);

        group.MapPost("/item", AdicionarItem);
        group.MapGet("/item/{id:long}", ObterItemPorId);
        group.MapGet("/itens", ListarItens);
        group.MapPatch("/item/{id:long}", AtualizarItem);
        group.MapDelete("/item/{id:long}", RemoverItem);

        return group;
    }

    private static async Task<IResult> CriarComanda(
        IComandaService comandaService,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.AddComandaAsync(cancellationToken);
        if (!result.Success)
        {
            return result.ToHttpResult();
        }

        return TypedResults.Created(
            $"/api/v1/comandas/{result.Data!.ComandaId}",
            ApiResponse<ComandaViewDTO>.Success(result.Data));
    }

    private static async Task<IResult> ListarComandas(
        IComandaService comandaService,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.ListComandasAsync(cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> ObterComandaPorId(
        IComandaService comandaService,
        long id,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.GetComandaByIdAsync(id, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> AtualizarComanda(
        IComandaService comandaService,
        long id,
        ComandaUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.UpdateComandaAsync(id, request, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> ConfirmarComanda(
        IComandaService comandaService,
        long id,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.ConfirmComandaAsync(id, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> RemoverComanda(
        IComandaService comandaService,
        long id,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.DeleteComandaAsync(id, cancellationToken);
        return result.Success
            ? TypedResults.NoContent()
            : result.ToHttpResult();
    }

    private static async Task<IResult> AdicionarItem(
        IComandaService comandaService,
        ItemRequest request,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.AddItemAsync(request, cancellationToken);
        if (!result.Success)
        {
            return result.ToHttpResult();
        }

        return TypedResults.Created(
            $"/api/v1/comandas/item/{result.Data!.Id}",
            ApiResponse<ItemViewDTO>.Success(result.Data));
    }

    private static async Task<IResult> ObterItemPorId(
        IComandaService comandaService,
        long id,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.GetItemByIdAsync(id, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> ListarItens(
        IComandaService comandaService,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.ListItemsAsync(cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> AtualizarItem(
        IComandaService comandaService,
        long id,
        ItemUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.UpdateItemAsync(id, request, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> RemoverItem(
        IComandaService comandaService,
        long id,
        CancellationToken cancellationToken)
    {
        var result = await comandaService.DeleteItemAsync(id, cancellationToken);
        return result.Success
            ? TypedResults.NoContent()
            : result.ToHttpResult();
    }
}
