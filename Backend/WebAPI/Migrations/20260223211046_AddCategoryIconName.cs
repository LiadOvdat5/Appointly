using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryIconName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IconName",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "IconName",
                value: null);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e01"),
                column: "IconName",
                value: null);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e02"),
                column: "IconName",
                value: null);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e03"),
                column: "IconName",
                value: null);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e04"),
                column: "IconName",
                value: null);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e05"),
                column: "IconName",
                value: null);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e06"),
                column: "IconName",
                value: null);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e07"),
                column: "IconName",
                value: null);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e08"),
                column: "IconName",
                value: null);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e09"),
                column: "IconName",
                value: null);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e10"),
                column: "IconName",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IconName",
                table: "Categories");
        }
    }
}
