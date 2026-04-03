using Microsoft.EntityFrameworkCore;
using StreetBite.Api.Abstractions;
using StreetBite.Api.Views.DTOs;
using StreetBite.Api.Views.Requests;
using StreetBite.Core.Constants;
using StreetBite.Core.Entities;
using StreetBite.Core.Enums;
using StreetBite.Core.Models;
using StreetBite.Infra.Data;
using System.Net;

namespace StreetBite.Api.Services;

public sealed class ComandaService(
    StreetBiteDbContext dbContext, IOrderCodeGeneratorService orderCodeGeneratorService) : IComandaService
{
    public async Task<Result<ComandaViewDTO>> AddComandaAsync(CancellationToken cancellationToken = default)
    {
        var codigoPedido = await GenerateCodigoPedidoAsync(cancellationToken);
        if (codigoPedido is null)
        {
            return Result<ComandaViewDTO>.Fail(
                "Não foi possível gerar um código de pedido único.",
                HttpStatusCode.InternalServerError);
        }

        var comanda = new Comanda
        {
            CodigoPedido = codigoPedido,
            Status = EComandaStatus.Pendente,
            Subtotal = decimal.Zero,
            MetodoDePagamento = EMetodoPagamento.Pix
        };

        dbContext.Comandas.Add(comanda);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetComandaByIdAsync(comanda.Id, cancellationToken);
    }

    public async Task<Result<List<ComandaViewDTO>>> ListComandasAsync(CancellationToken cancellationToken = default)
    {
        var comandas = await dbContext.Comandas
            .AsNoTracking()
            .Include(x => x.Itens)
                .ThenInclude(x => x.Produto)
            .OrderByDescending(x => x.Id)
            .ToListAsync(cancellationToken);

        var response = comandas
            .Select(MapComanda)
            .ToList();

        return Result<List<ComandaViewDTO>>.Ok(response);
    }

    public async Task<Result<ComandaViewDTO>> GetComandaByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var comanda = await dbContext.Comandas
            .AsNoTracking()
            .Include(x => x.Itens)
                .ThenInclude(x => x.Produto)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (comanda is null)
        {
            return Result<ComandaViewDTO>.Fail("Comanda não encontrada.", HttpStatusCode.NotFound);
        }

        return Result<ComandaViewDTO>.Ok(MapComanda(comanda));
    }

    public async Task<Result<ComandaViewDTO>> UpdateComandaAsync(
        long id,
        ComandaUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var comanda = await dbContext.Comandas
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (comanda is null)
        {
            return Result<ComandaViewDTO>.Fail("Comanda não encontrada.", HttpStatusCode.NotFound);
        }

        comanda.Status = request.Status;
        comanda.MetodoDePagamento = request.MetodoDePagamento;
        comanda.ModifiedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetComandaByIdAsync(comanda.Id, cancellationToken);
    }

    public async Task<Result> ConfirmComandaAsync(
        long id,
        CancellationToken cancellationToken = default)
    {
        // This executes a single UPDATE query directly in the DB
        int rowsAffected = await dbContext.Comandas
            .Where(x => x.Id == id)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(c => c.Status, EComandaStatus.Finalizado)
                .SetProperty(c => c.ModifiedAt, DateTime.UtcNow),
                cancellationToken);

        if (rowsAffected == 0)
        {
            return Result.Fail("Comanda não encontrada.", HttpStatusCode.NotFound);
        }

        return Result.Ok();
    }

    public async Task<Result> DeleteComandaAsync(long id, CancellationToken cancellationToken = default)
    {
        if (!await dbContext.Comandas.AnyAsync(x => x.Id == id, cancellationToken))
        {
            return Result.Fail("Comanda não encontrada.", HttpStatusCode.NotFound);
        }

        await dbContext.Comandas
            .Where(x => x.Id == id)
            .ExecuteDeleteAsync(cancellationToken);

        return Result.Ok("Comanda removida com sucesso.");
    }

    public async Task<Result<ItemViewDTO>> AddItemAsync(ItemRequest request, CancellationToken cancellationToken = default)
    {
        var produto = await dbContext.Produtos
            .FirstOrDefaultAsync(x => x.Id == request.ProdutoId, cancellationToken);

        if (produto is null)
        {
            return Result<ItemViewDTO>.Fail("Produto não encontrado.", HttpStatusCode.NotFound);
        }

        var comanda = await dbContext.Comandas
            .FirstOrDefaultAsync(x => x.Id == request.ComandaId, cancellationToken);

        if (comanda is null)
        {
            return Result<ItemViewDTO>.Fail("Comanda não encontrada.", HttpStatusCode.NotFound);
        }

        var item = new Item
        {
            Comanda = comanda,
            Produto = produto,
            Quantidade = request.Quantidade
        };

        comanda.Itens.Add(item);
        dbContext.Itens.Add(item);

        await dbContext.SaveChangesAsync(cancellationToken);

        await RefreshSubtotalAsync(comanda.Id, cancellationToken);

        return await GetItemByIdAsync(item.Id, cancellationToken);
    }

    public async Task<Result<List<ItemViewDTO>>> ListItemsAsync(CancellationToken cancellationToken = default)
    {
        var itens = await dbContext.Itens
            .AsNoTracking()
            .Include(x => x.Produto)
            .OrderByDescending(x => x.Id)
            .ToListAsync(cancellationToken);

        return Result<List<ItemViewDTO>>.Ok(itens.Select(MapItem).ToList());
    }

    public async Task<Result<ItemViewDTO>> GetItemByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var item = await dbContext.Itens
            .AsNoTracking()
            .Include(x => x.Produto)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (item is null)
        {
            return Result<ItemViewDTO>.Fail("Item não encontrado.", HttpStatusCode.NotFound);
        }

        return Result<ItemViewDTO>.Ok(MapItem(item));
    }

    public async Task<Result<ItemViewDTO>> UpdateItemAsync(
        long id,
        ItemUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var item = await dbContext.Itens
            .Include(x => x.Comanda)
            .Include(x => x.Produto)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (item is null)
        {
            return Result<ItemViewDTO>.Fail("Item não encontrado.", HttpStatusCode.NotFound);
        }

        item.Quantidade = request.Quantidade;
        item.ModifiedAt = DateTime.UtcNow;


        if (item.Comanda is not null)
        {
            await RefreshSubtotalAsync(item.Comanda.Id, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetItemByIdAsync(item.Id, cancellationToken);
    }

    public async Task<Result> DeleteItemAsync(long id, CancellationToken cancellationToken = default)
    {
        var item = await dbContext.Itens
            .Include(x => x.Comanda)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (item is null)
        {
            return Result.Fail("Item não encontrado.", HttpStatusCode.NotFound);
        }

        var comandaId = item.Comanda?.Id;

        dbContext.Itens.Remove(item);

        if (comandaId is not null)
        {
            await RefreshSubtotalAsync(comandaId.Value, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Ok("Item removido com sucesso.");
    }

    private static ComandaViewDTO MapComanda(Comanda comanda)
    {
        var items = comanda.Itens
            .OrderBy(x => x.Id)
            .Select(MapItem)
            .ToList();

        return new ComandaViewDTO(
            comanda.Id,
            items,
            comanda.CodigoPedido,
            comanda.Subtotal,
            comanda.Status,
            comanda.CreatedAt,
            comanda.MetodoDePagamento);
    }

    private static ItemViewDTO MapItem(Item item)
    {
        return new ItemViewDTO(
            item.Id,
            item.Produto!.Nome,
            item.Produto.Categoria,
            item.Quantidade,
            item.PrecoUnitario);
    }

    private async Task RefreshSubtotalAsync(long comandaId, CancellationToken cancellationToken)
    {
        var subtotal = await dbContext.Itens
            .Where(x => x.Comanda != null && x.Comanda.Id == comandaId)
            .Select(x => x.PrecoUnitario * x.Quantidade)
            .SumAsync(cancellationToken);

        await dbContext.Comandas
            .Where(x => x.Id == comandaId)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Subtotal, subtotal)
                .SetProperty(x => x.ModifiedAt, DateTime.UtcNow), cancellationToken);
    }

    private async Task<string?> GenerateCodigoPedidoAsync(CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt < 20; attempt++)
        {
            var codigoPedido = orderCodeGeneratorService.Generate(ComandaConstants.CodigoPedidoLength);
            var exists = await dbContext.Comandas.AnyAsync(x => x.CodigoPedido == codigoPedido, cancellationToken);
            if (!exists)
            {
                return codigoPedido;
            }
        }

        return null;
    }
}
