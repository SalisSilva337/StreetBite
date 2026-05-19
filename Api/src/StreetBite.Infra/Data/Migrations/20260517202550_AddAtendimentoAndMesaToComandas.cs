using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StreetBite.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAtendimentoAndMesaToComandas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NumeroMesa",
                table: "comandas",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoAtendimento",
                table: "comandas",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NumeroMesa",
                table: "comandas");

            migrationBuilder.DropColumn(
                name: "TipoAtendimento",
                table: "comandas");
        }
    }
}
