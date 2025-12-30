using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessInvitationsAndUpdatePartners : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Businesses",
                table: "BusinessPartners");

            migrationBuilder.DropColumn(
                name: "PartnerIds",
                table: "Businesses");

            migrationBuilder.AddColumn<Guid>(
                name: "BusinessId",
                table: "BusinessPartners",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "InvitationId",
                table: "BusinessPartners",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinedAt",
                table: "BusinessPartners",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "BusinessPartners",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "BusinessInvitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BusinessId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InviterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkerEmail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    WorkerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    InvitedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessInvitations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BusinessPartners_BusinessId",
                table: "BusinessPartners",
                column: "BusinessId");

            migrationBuilder.AddForeignKey(
                name: "FK_BusinessPartners_Businesses_BusinessId",
                table: "BusinessPartners",
                column: "BusinessId",
                principalTable: "Businesses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BusinessPartners_Businesses_BusinessId",
                table: "BusinessPartners");

            migrationBuilder.DropTable(
                name: "BusinessInvitations");

            migrationBuilder.DropIndex(
                name: "IX_BusinessPartners_BusinessId",
                table: "BusinessPartners");

            migrationBuilder.DropColumn(
                name: "BusinessId",
                table: "BusinessPartners");

            migrationBuilder.DropColumn(
                name: "InvitationId",
                table: "BusinessPartners");

            migrationBuilder.DropColumn(
                name: "JoinedAt",
                table: "BusinessPartners");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "BusinessPartners");

            migrationBuilder.AddColumn<string>(
                name: "Businesses",
                table: "BusinessPartners",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PartnerIds",
                table: "Businesses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
