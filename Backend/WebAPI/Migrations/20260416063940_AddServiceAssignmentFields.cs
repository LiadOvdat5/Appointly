using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceAssignmentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BlockingAppointmentId",
                table: "ServiceSchedules",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedStaffId",
                table: "Services",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "BlockOnBooking",
                table: "Services",
                type: "bit",
                nullable: false,
                defaultValue: true);

            // Set existing rows to true (the desired default)
            migrationBuilder.Sql("UPDATE [Services] SET [BlockOnBooking] = 1 WHERE [BlockOnBooking] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSchedules_BlockingAppointmentId",
                table: "ServiceSchedules",
                column: "BlockingAppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_AssignedStaffId",
                table: "Services",
                column: "AssignedStaffId");

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Users_AssignedStaffId",
                table: "Services",
                column: "AssignedStaffId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceSchedules_Appointments_BlockingAppointmentId",
                table: "ServiceSchedules",
                column: "BlockingAppointmentId",
                principalTable: "Appointments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Services_Users_AssignedStaffId",
                table: "Services");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceSchedules_Appointments_BlockingAppointmentId",
                table: "ServiceSchedules");

            migrationBuilder.DropIndex(
                name: "IX_ServiceSchedules_BlockingAppointmentId",
                table: "ServiceSchedules");

            migrationBuilder.DropIndex(
                name: "IX_Services_AssignedStaffId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "BlockingAppointmentId",
                table: "ServiceSchedules");

            migrationBuilder.DropColumn(
                name: "AssignedStaffId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "BlockOnBooking",
                table: "Services");
        }
    }
}
