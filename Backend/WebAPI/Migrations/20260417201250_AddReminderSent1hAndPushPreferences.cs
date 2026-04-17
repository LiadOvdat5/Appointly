using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderSent1hAndPushPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PushBookingConfirm",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "PushCancellations",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "PushReminders1h",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "PushReminders24h",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "PushReviewPrompt",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReminderSent1hAt",
                table: "Appointments",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PushBookingConfirm",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PushCancellations",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PushReminders1h",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PushReminders24h",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PushReviewPrompt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ReminderSent1hAt",
                table: "Appointments");
        }
    }
}
