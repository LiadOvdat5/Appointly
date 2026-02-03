using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "Services",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "CategoryIds",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), null, "Uncategorized" },
                    { new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e01"), null, "Men's Haircut" },
                    { new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e02"), null, "Women's Haircut" },
                    { new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e03"), null, "Beard Trim" },
                    { new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e04"), null, "Hair Coloring" },
                    { new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e05"), null, "Nail Polish" },
                    { new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e06"), null, "Gel Nails" },
                    { new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e07"), null, "Manicure" },
                    { new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e08"), null, "Pedicure" },
                    { new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e09"), null, "Eyebrow Shaping" },
                    { new Guid("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e10"), null, "Facial Treatment" }
                });

            // Ensure existing services point to the 'Uncategorized' category rather than the default empty Guid
            migrationBuilder.Sql("UPDATE Services SET CategoryId = '11111111-1111-1111-1111-111111111111' WHERE CategoryId = '00000000-0000-0000-0000-000000000000';");

            migrationBuilder.CreateIndex(
                name: "IX_Services_CategoryId",
                table: "Services",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Categories_CategoryId",
                table: "Services",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Services_Categories_CategoryId",
                table: "Services");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Services_CategoryId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "CategoryIds",
                table: "Businesses");
        }
    }
}
