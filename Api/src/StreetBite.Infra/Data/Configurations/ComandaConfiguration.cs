using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StreetBite.Core.Constants;
using StreetBite.Core.Entities;

namespace StreetBite.Infra.Data.Configurations;

public sealed class ComandaConfiguration : BaseEntityConfiguration<Comanda>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Comanda> builder)
    {
        builder.ToTable("comandas");

        builder.Property(x => x.CodigoPedido)
            .IsRequired()
            .HasMaxLength(ComandaConstants.CodigoPedidoLength);

        builder.HasIndex(x => x.CodigoPedido)
            .IsUnique();

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(x => x.Subtotal)
            .HasPrecision(18, 2);

        builder.Property(x => x.MetodoDePagamento)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(x => x.ClienteNome)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasOne(x => x.Cliente)
            .WithMany()
            .HasForeignKey("cliente_id")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
