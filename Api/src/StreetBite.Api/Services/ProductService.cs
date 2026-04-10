using Microsoft.EntityFrameworkCore;
using StreetBite.Api.Abstractions;
using StreetBite.Api.Views.DTOs;
using StreetBite.Api.Views.Requests;
using StreetBite.Api.Views.Responses;
using StreetBite.Core.Entities;
using StreetBite.Core.Models;
using StreetBite.Infra.Data;

namespace StreetBite.Api.Services;

public sealed class ProductService(StreetBiteDbContext dbContext) : IProductService
{
    public async Task<Result<ProductViewDTO>> AddProductAsync(EntityRequest<Produto> request, CancellationToken cancellationToken = default)
    {
        var produto = new Produto
        {
            Nome = request.Data!.Nome.Trim(),
            Preco = request.Data.Preco,
            Categoria = request.Data.Categoria,
            Descricao = request.Data.Descricao?.Trim()
        };

        dbContext.Produtos.Add(produto);
        await dbContext.SaveChangesAsync(cancellationToken);

        var addedProduct = new ProductViewDTO(produto.Id, produto.Nome, produto.Preco, produto.Categoria, produto.Descricao);
        return Result<ProductViewDTO>.Ok(addedProduct);
    }

    public async Task<Result<PagedApiResponse<List<ProductViewDTO>>>> ListProductsAsync(
        int currentPage,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        if (currentPage <= 0 || pageSize <= 0)
        {
            return Result<PagedApiResponse<List<ProductViewDTO>>>.Fail(
                "Cabeçalhos de paginação inválidos. currentPage e pageSize devem ser maiores que zero.",
                System.Net.HttpStatusCode.BadRequest);
        }

        var totalRecords = await dbContext.Produtos.CountAsync(cancellationToken);

        var products = await dbContext.Produtos
            .AsNoTracking()
            .OrderBy(x => x.Id)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductViewDTO(x.Id, x.Nome, x.Preco, x.Categoria, x.Descricao))
            .ToListAsync(cancellationToken);

        var pagedResponse = new PagedApiResponse<List<ProductViewDTO>>(
            products,
            "Produtos listados com sucesso.",
            currentPage,
            totalRecords,
            pageSize);

        return Result<PagedApiResponse<List<ProductViewDTO>>>.Ok(pagedResponse);
    }

    public async Task<Result<ProductViewDTO>> GetProductByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var product = await dbContext.Produtos
            .AsNoTracking()
            .Select(x => new ProductViewDTO(x.Id, x.Nome, x.Preco, x.Categoria, x.Descricao))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (product is null)
            return Result<ProductViewDTO>.Fail("Produto não encontrado.", System.Net.HttpStatusCode.NotFound);

        return Result<ProductViewDTO>.Ok(product);
    }

    public async Task<Result<ProductViewDTO>> UpdateProductAsync(long id, EntityRequest<Produto> request, CancellationToken cancellationToken = default)
    {
        var product = await dbContext.Produtos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (product is null)
            return Result<ProductViewDTO>.Fail("Produto não encontrado.", System.Net.HttpStatusCode.NotFound);

        product.Nome = request.Data!.Nome.Trim();
        product.Preco = request.Data!.Preco;
        product.Categoria = request.Data!.Categoria;
        product.Descricao = request.Data.Descricao?.Trim();
        product.ModifiedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var updatedProduct = new ProductViewDTO(product.Id, product.Nome, product.Preco, product.Categoria, product.Descricao);
        return Result<ProductViewDTO>.Ok(updatedProduct);
    }

    public async Task<Result> DeleteProductAsync(long id, CancellationToken cancellationToken = default)
    {
        if (!await dbContext.Produtos.AnyAsync(x => x.Id == id, cancellationToken))
            return Result.Fail("Produto não encontrado.", System.Net.HttpStatusCode.NotFound);

        var produtoEmPedido = await dbContext.Itens.AnyAsync(x => x.Produto != null && x.Produto.Id == id, cancellationToken);
        if (produtoEmPedido)
        {
            return Result.Fail(
                "Não é possível remover este produto porque ele já está incluso em um pedido.",
                System.Net.HttpStatusCode.Conflict);
        }

        await dbContext.Produtos
            .Where(x => x.Id == id)
            .ExecuteDeleteAsync(cancellationToken: cancellationToken);

        return Result.Ok("Produto removido com sucesso.");
    }
}
