using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StreetBite.Infra.Data.Migrations
{
    public partial class MakeComandaClienteNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_comandas_clientes_cliente_id",
                table: "comandas");

            migrationBuilder.AlterColumn<int>(
                name: "cliente_id",
                table: "comandas",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_comandas_clientes_cliente_id",
                table: "comandas",
                column: "cliente_id",
                principalTable: "clientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_comandas_clientes_cliente_id",
                table: "comandas");

            migrationBuilder.AlterColumn<int>(
                name: "cliente_id",
                table: "comandas",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_comandas_clientes_cliente_id",
                table: "comandas",
                column: "cliente_id",
                principalTable: "clientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}