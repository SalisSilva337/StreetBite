using Microsoft.EntityFrameworkCore;
using StreetBite.Api.Abstractions;
using StreetBite.Api.Views.DTOs;
using StreetBite.Api.Views.Requests;
using StreetBite.Core.Entities;
using StreetBite.Core.Models;
using StreetBite.Infra.Data;
using System.Net;

namespace StreetBite.Api.Services;

public sealed class CadastroService(StreetBiteDbContext dbContext) : ICadastroService
{
    public async Task<Result<List<ClienteViewDTO>>> ListClientesAsync(CancellationToken cancellationToken = default)
    {
        var clientes = await dbContext.Clientes
            .AsNoTracking()
            .OrderBy(x => x.Nome)
            .ToListAsync(cancellationToken);

        var response = clientes
            .Select(MapCliente)
            .ToList();

        return Result<List<ClienteViewDTO>>.Ok(response);
    }

    public async Task<Result<ClienteViewDTO>> CreateClienteAsync(ClienteCadastroRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedName = request.Nome.Trim();
        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        var normalizedPhone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone.Trim();

        var clientExists = await dbContext.Clientes.AnyAsync(
            x => x.Nome == normalizedName || (normalizedEmail != null && x.Email == normalizedEmail) || (normalizedPhone != null && x.Telefone == normalizedPhone),
            cancellationToken);

        if (clientExists)
        {
            return Result<ClienteViewDTO>.Fail("Cliente já cadastrado.", HttpStatusCode.Conflict);
        }

        var cliente = new Cliente
        {
            Nome = normalizedName,
            Email = normalizedEmail,
            Telefone = normalizedPhone,
            Senha = request.Senha.Trim(),
        };

        dbContext.Clientes.Add(cliente);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result<ClienteViewDTO>.Ok(MapCliente(cliente));
    }

    public async Task<Result<FoodtruckViewDTO>> CreateFoodtruckAsync(FoodtruckCadastroRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedName = request.Nome.Trim();
        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        var normalizedPhone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone.Trim();
        var normalizedDocument = request.Documento.Trim();

        var truckExists = await dbContext.Foodtrucks.AnyAsync(
            x => x.Nome == normalizedName || x.Documento == normalizedDocument || (normalizedEmail != null && x.Email == normalizedEmail),
            cancellationToken);

        if (truckExists)
        {
            return Result<FoodtruckViewDTO>.Fail("Foodtruck já cadastrado.", HttpStatusCode.Conflict);
        }

        var foodtruck = new Foodtruck
        {
            Nome = normalizedName,
            Email = normalizedEmail,
            Telefone = normalizedPhone,
            Documento = normalizedDocument,
            Cep = string.IsNullOrWhiteSpace(request.Cep) ? null : request.Cep.Trim(),
            FormaPagamento = string.IsNullOrWhiteSpace(request.FormaPagamento) ? null : request.FormaPagamento.Trim(),
            Senha = request.Senha.Trim(),
        };

        dbContext.Foodtrucks.Add(foodtruck);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result<FoodtruckViewDTO>.Ok(MapFoodtruck(foodtruck));
    }

    private static ClienteViewDTO MapCliente(Cliente cliente)
    {
        return new ClienteViewDTO(
            cliente.Id,
            cliente.Nome,
            cliente.Email,
            cliente.Telefone,
            cliente.CreatedAt);
    }

    private static FoodtruckViewDTO MapFoodtruck(Foodtruck foodtruck)
    {
        return new FoodtruckViewDTO(
            foodtruck.Id,
            foodtruck.Nome,
            foodtruck.Email,
            foodtruck.Telefone,
            foodtruck.Documento,
            foodtruck.Cep,
            foodtruck.FormaPagamento,
            foodtruck.CreatedAt);
    }
}