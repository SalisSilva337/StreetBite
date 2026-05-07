using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StreetBite.Core.Entities;

namespace StreetBite.Infra.Data.Configurations;

public sealed class FoodtruckConfiguration : BaseEntityConfiguration<Foodtruck>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Foodtruck> builder)
    {
        builder.ToTable("foodtrucks");

        builder.Property(x => x.Nome)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Email)
            .HasMaxLength(200);

        builder.Property(x => x.Telefone)
            .HasMaxLength(25);

        builder.Property(x => x.Documento)
            .IsRequired()
            .HasMaxLength(25);

        builder.Property(x => x.Cep)
            .HasMaxLength(20);

        builder.Property(x => x.FormaPagamento)
            .HasMaxLength(60);

        builder.Property(x => x.Senha)
            .IsRequired()
            .HasMaxLength(200);
    }
}