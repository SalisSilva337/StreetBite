using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StreetBite.Infra.Data.Migrations
{
    public partial class AddAtendimentoAndMesaToComandas : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TipoAtendimento",
                table: "comandas",
                type: "text",
                nullable: false,
                defaultValue: "DeliveryRetirada");

            migrationBuilder.AddColumn<int>(
                name: "NumeroMesa",
                table: "comandas",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TipoAtendimento",
                table: "comandas");

            migrationBuilder.DropColumn(
                name: "NumeroMesa",
                table: "comandas");
        }
    }
}