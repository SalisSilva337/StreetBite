using StreetBite.Api.Views.DTOs;
using StreetBite.Api.Views.Requests;
using StreetBite.Core.Models;

namespace StreetBite.Api.Abstractions;

public interface ICadastroService
{
    Task<Result<ClienteViewDTO>> CreateClienteAsync(ClienteCadastroRequest request, CancellationToken cancellationToken = default);

    Task<Result<FoodtruckViewDTO>> CreateFoodtruckAsync(FoodtruckCadastroRequest request, CancellationToken cancellationToken = default);
}