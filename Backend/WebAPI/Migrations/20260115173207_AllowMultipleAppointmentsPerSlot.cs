using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AllowMultipleAppointmentsPerSlot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Appointments_ServiceScheduleId",
                table: "Appointments");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ServiceScheduleId",
                table: "Appointments",
                column: "ServiceScheduleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Appointments_ServiceScheduleId",
                table: "Appointments");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ServiceScheduleId",
                table: "Appointments",
                column: "ServiceScheduleId",
                unique: true);
        }
    }
}
