using StreetBite.Api.Abstractions;
using StreetBite.Api.Application.Common.Extensions;
using StreetBite.Api.Application.Common.Filters;
using StreetBite.Api.Views.DTOs;
using StreetBite.Api.Views.Requests;
using StreetBite.Api.Views.Responses;

namespace StreetBite.Api.Application.Cadastros;

public static class CadastrosEndpoints
{
    public static RouteGroupBuilder MapCadastrosEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/cadastros")
            .WithTags("Cadastros")
            .AddEndpointFilter<ValidationRequestFilter>();

        group.MapGet("/clientes", ListarClientes);
        group.MapPost("/clientes", CriarCliente);
        group.MapPost("/foodtrucks", CriarFoodtruck);
        group.MapPost("/foodtrucks/autenticar", AutenticarFoodtruck);
        group.MapPost("/foodtrucks/recuperacao/validar", ValidarEmailRecuperacao);
        group.MapPatch("/foodtrucks/recuperacao/senha", AtualizarSenhaFoodtruck);

        return group;
    }

    private static async Task<IResult> ListarClientes(
        ICadastroService cadastroService,
        CancellationToken cancellationToken)
    {
        var result = await cadastroService.ListClientesAsync(cancellationToken);
        return result.Success
            ? TypedResults.Ok(ApiResponse<List<ClienteViewDTO>>.Success(result.Data!))
            : result.ToHttpResult();
    }

    private static async Task<IResult> CriarCliente(
        ICadastroService cadastroService,
        ClienteCadastroRequest request,
        CancellationToken cancellationToken)
    {
        var result = await cadastroService.CreateClienteAsync(request, cancellationToken);
        return result.Success
            ? TypedResults.Created($"/api/v1/cadastros/clientes/{result.Data!.ClienteId}", ApiResponse<ClienteViewDTO>.Success(result.Data))
            : result.ToHttpResult();
    }

    private static async Task<IResult> CriarFoodtruck(
        ICadastroService cadastroService,
        FoodtruckCadastroRequest request,
        CancellationToken cancellationToken)
    {
        var result = await cadastroService.CreateFoodtruckAsync(request, cancellationToken);
        return result.Success
            ? TypedResults.Created($"/api/v1/cadastros/foodtrucks/{result.Data!.FoodtruckId}", ApiResponse<FoodtruckViewDTO>.Success(result.Data))
            : result.ToHttpResult();
    }

    private static async Task<IResult> AutenticarFoodtruck(
        ICadastroService cadastroService,
        FoodtruckLoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await cadastroService.AuthenticateFoodtruckAsync(request, cancellationToken);
        return result.Success
            ? TypedResults.Ok(ApiResponse<FoodtruckViewDTO>.Success(result.Data!))
            : result.ToHttpResult();
    }

    private static async Task<IResult> ValidarEmailRecuperacao(
        ICadastroService cadastroService,
        FoodtruckEmailRequest request,
        CancellationToken cancellationToken)
    {
        var result = await cadastroService.VerifyFoodtruckEmailAsync(request, cancellationToken);
        return result.ToHttpResult();
    }

    private static async Task<IResult> AtualizarSenhaFoodtruck(
        ICadastroService cadastroService,
        FoodtruckUpdatePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await cadastroService.UpdateFoodtruckPasswordAsync(request, cancellationToken);
        return result.ToHttpResult();
    }
}