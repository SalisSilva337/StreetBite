using StreetBite.Api.Views.DTOs;
using StreetBite.Api.Views.Requests;
using StreetBite.Core.Models;

namespace StreetBite.Api.Abstractions;

public interface ICadastroService
{
    Task<Result<List<ClienteViewDTO>>> ListClientesAsync(CancellationToken cancellationToken = default);

    Task<Result<ClienteViewDTO>> CreateClienteAsync(ClienteCadastroRequest request, CancellationToken cancellationToken = default);

    Task<Result<FoodtruckViewDTO>> CreateFoodtruckAsync(FoodtruckCadastroRequest request, CancellationToken cancellationToken = default);

    Task<Result<FoodtruckViewDTO>> AuthenticateFoodtruckAsync(FoodtruckLoginRequest request, CancellationToken cancellationToken = default);

    Task<Result> VerifyFoodtruckEmailAsync(FoodtruckEmailRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateFoodtruckPasswordAsync(FoodtruckUpdatePasswordRequest request, CancellationToken cancellationToken = default);
}