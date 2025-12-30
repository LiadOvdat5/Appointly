using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class RefactorServiceAndPartnerUseUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_BusinessPartners",
                table: "BusinessPartners");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "BusinessPartners");

            migrationBuilder.RenameColumn(
                name: "PartnerId",
                table: "Services",
                newName: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BusinessPartners",
                table: "BusinessPartners",
                columns: new[] { "UserId", "BusinessId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_BusinessPartners",
                table: "BusinessPartners");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Services",
                newName: "PartnerId");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "BusinessPartners",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_BusinessPartners",
                table: "BusinessPartners",
                column: "Id");
        }
    }
}
