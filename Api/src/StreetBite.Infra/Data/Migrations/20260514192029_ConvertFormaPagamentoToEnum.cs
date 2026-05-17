using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StreetBite.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class ConvertFormaPagamentoToEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"
                UPDATE ""foodtrucks"" SET ""FormaPagamento"" = '0' WHERE ""FormaPagamento"" IS NULL OR ""FormaPagamento"" = '';

                ALTER TABLE ""foodtrucks"" ALTER COLUMN ""FormaPagamento"" TYPE integer
                    USING CASE ""FormaPagamento""
                        WHEN 'Credito' THEN 1
                        WHEN 'Debito' THEN 2
                        WHEN 'Dinheiro' THEN 3
                        WHEN 'Pix' THEN 4
                        ELSE 0
                    END;

                ALTER TABLE ""foodtrucks"" ALTER COLUMN ""FormaPagamento"" SET NOT NULL;
                ALTER TABLE ""foodtrucks"" ALTER COLUMN ""FormaPagamento"" SET DEFAULT 0;
                ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"
                ALTER TABLE ""foodtrucks"" ALTER COLUMN ""FormaPagamento"" TYPE character varying(60);
                ALTER TABLE ""foodtrucks"" ALTER COLUMN ""FormaPagamento"" DROP DEFAULT;
                ALTER TABLE ""foodtrucks"" ALTER COLUMN ""FormaPagamento"" DROP NOT NULL;
                ");
        }
    }
}