using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationTargetPathBodyParamsAndBusinessNotifyFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BodyParams",
                table: "Notifications",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TargetPath",
                table: "Notifications",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "NotifyOnCancellation",
                table: "Businesses",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "NotifyOnNewBooking",
                table: "Businesses",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BodyParams",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "TargetPath",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "NotifyOnCancellation",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "NotifyOnNewBooking",
                table: "Businesses");
        }
    }
}
