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
            // Create a temporary integer column
            migrationBuilder.AddColumn<int>(
                name: "FormaPagamentoTemp",
                table: "foodtrucks",
                type: "integer",
                nullable: true);

            // Migrate data from varchar to integer using SQL
            migrationBuilder.Sql(
                @"UPDATE foodtrucks 
                  SET ""FormaPagamentoTemp"" = CASE 
                    WHEN ""FormaPagamento"" = 'Credito' OR ""FormaPagamento"" = 'Crédito' THEN 1
                    WHEN ""FormaPagamento"" = 'Debito' OR ""FormaPagamento"" = 'Débito' THEN 2
                    WHEN ""FormaPagamento"" = 'Dinheiro' THEN 3
                    WHEN ""FormaPagamento"" = 'Pix' OR ""FormaPagamento"" = 'PIX' THEN 4
                    ELSE 0
                  END");

            // Drop old column
            migrationBuilder.DropColumn(
                name: "FormaPagamento",
                table: "foodtrucks");

            // Rename temp column to original name
            migrationBuilder.RenameColumn(
                name: "FormaPagamentoTemp",
                table: "foodtrucks",
                newName: "FormaPagamento");

            // Make it not null and set default
            migrationBuilder.AlterColumn<int>(
                name: "FormaPagamento",
                table: "foodtrucks",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Create a temporary varchar column
            migrationBuilder.AddColumn<string>(
                name: "FormaPagamentoTemp",
                table: "foodtrucks",
                type: "character varying(60)",
                maxLength: 60,
                nullable: true);

            // Migrate data back from integer to varchar using SQL
            migrationBuilder.Sql(
                @"UPDATE foodtrucks 
                  SET ""FormaPagamentoTemp"" = CASE 
                    WHEN ""FormaPagamento"" = 1 THEN 'Crédito'
                    WHEN ""FormaPagamento"" = 2 THEN 'Débito'
                    WHEN ""FormaPagamento"" = 3 THEN 'Dinheiro'
                    WHEN ""FormaPagamento"" = 4 THEN 'PIX'
                    ELSE NULL
                  END");

            // Drop integer column
            migrationBuilder.DropColumn(
                name: "FormaPagamento",
                table: "foodtrucks");

            // Rename temp column back to original name
            migrationBuilder.RenameColumn(
                name: "FormaPagamentoTemp",
                table: "foodtrucks",
                newName: "FormaPagamento");
        }
    }
}
