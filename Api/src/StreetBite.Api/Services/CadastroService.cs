using BCrypt.Net;
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
        var normalizedEmail = request.Email?.Trim();
        var normalizedPhone = request.Telefone?.Trim();
        var normalizedCep = request.Cep?.Trim();
        var normalizedStreet = request.Street?.Trim();
        var normalizedNumber = request.Number?.Trim();

        var clientExists = await dbContext.Clientes.AnyAsync(
            x => x.Email == normalizedEmail || x.Telefone == normalizedPhone,
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
            Senha = string.Empty,
        };

        cliente.Enderecos.Add(new Endereco
        {
            Cep = int.TryParse(normalizedCep, out var cepValue) ? cepValue : null,
            Street = normalizedStreet ?? string.Empty,
            Number = int.TryParse(normalizedNumber, out var numberValue) ? numberValue : null,
        });

        dbContext.Clientes.Add(cliente);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result<ClienteViewDTO>.Ok(MapCliente(cliente));
    }

    public async Task<Result<FoodtruckViewDTO>> CreateFoodtruckAsync(FoodtruckCadastroRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedName = request.Nome.Trim();
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedPhone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone.Trim();
        var normalizedDocument = request.Documento.Trim();

        var truckExists = await dbContext.Foodtrucks.AnyAsync(
            x => x.Documento == normalizedDocument || x.Email == normalizedEmail,
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
            FormaPagamento = request.FormaPagamento,
            Senha = BCrypt.Net.BCrypt.EnhancedHashPassword(request.Senha.Trim()),
        };

        dbContext.Foodtrucks.Add(foodtruck);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result<FoodtruckViewDTO>.Ok(MapFoodtruck(foodtruck));
    }

    public async Task<Result<FoodtruckViewDTO>> AuthenticateFoodtruckAsync(FoodtruckLoginRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedPassword = request.Senha.Trim();

        var foodtruck = await dbContext.Foodtrucks
            .AsNoTracking()
            .Where(x => EF.Functions.ILike(x.Email, normalizedEmail))
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (foodtruck is null)
        {
            return Result<FoodtruckViewDTO>.Fail("E-mail não encontrado.", HttpStatusCode.NotFound);
        }

        if (!BCrypt.Net.BCrypt.EnhancedVerify(normalizedPassword, foodtruck.Senha))
        {
            return Result<FoodtruckViewDTO>.Fail("Senha incorreta.", HttpStatusCode.Unauthorized);
        }

        return Result<FoodtruckViewDTO>.Ok(MapFoodtruck(foodtruck));
    }

    public async Task<Result> VerifyFoodtruckEmailAsync(FoodtruckEmailRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var exists = await dbContext.Foodtrucks.AnyAsync(
            x => EF.Functions.ILike(x.Email, normalizedEmail),
            cancellationToken);

        return exists
            ? Result.Ok()
            : Result.Fail("E-mail não encontrado.", HttpStatusCode.NotFound);
    }

    public async Task<Result> UpdateFoodtruckPasswordAsync(FoodtruckUpdatePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedPassword = request.NovaSenha.Trim();

        var foodtruck = await dbContext.Foodtrucks.FirstOrDefaultAsync(
            x => EF.Functions.ILike(x.Email, normalizedEmail),
            cancellationToken);

        if (foodtruck is null)
        {
            return Result.Fail("Foodtruck não encontrado.", HttpStatusCode.NotFound);
        }

        foodtruck.Senha = BCrypt.Net.BCrypt.EnhancedHashPassword(normalizedPassword);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Ok();
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
