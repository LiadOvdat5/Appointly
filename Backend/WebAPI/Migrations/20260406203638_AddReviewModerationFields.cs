using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewModerationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FlaggedAt",
                table: "Reviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRemoved",
                table: "Reviews",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                table: "Reviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ResolvedByAdminId",
                table: "Reviews",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FlaggedAt",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "IsRemoved",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ResolvedByAdminId",
                table: "Reviews");
        }
    }
}
