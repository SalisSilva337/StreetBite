using Microsoft.EntityFrameworkCore;
using StreetBite.Core.Entities;

namespace StreetBite.Infra.Data;

public sealed class StreetBiteDbContext(DbContextOptions<StreetBiteDbContext> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes { get; set; } = null!;
    public DbSet<Comanda> Comandas { get; set; } = null!;
    public DbSet<Endereco> Enderecos { get; set; } = null!;
    public DbSet<Foodtruck> Foodtrucks { get; set; } = null!;
    public DbSet<Item> Itens { get; set; } = null!;
    public DbSet<Produto> Produtos { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(StreetBiteDbContext).Assembly);
    }
}
