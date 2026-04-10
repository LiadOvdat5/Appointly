using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class OneReviewPerBusinessPerCustomer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reviews_AppointmentId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_CustomerId",
                table: "Reviews");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_AppointmentId",
                table: "Reviews",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CustomerId_BusinessId",
                table: "Reviews",
                columns: new[] { "CustomerId", "BusinessId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reviews_AppointmentId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_CustomerId_BusinessId",
                table: "Reviews");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_AppointmentId",
                table: "Reviews",
                column: "AppointmentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CustomerId",
                table: "Reviews",
                column: "CustomerId");
        }
    }
}
