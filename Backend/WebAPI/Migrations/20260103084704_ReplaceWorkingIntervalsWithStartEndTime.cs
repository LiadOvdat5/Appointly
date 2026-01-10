using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceWorkingIntervalsWithStartEndTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WorkingIntervals",
                table: "WeeklyWorkingRules");

            migrationBuilder.DropColumn(
                name: "WorkingIntervals",
                table: "RecurringRules");

            migrationBuilder.DropColumn(
                name: "WorkingIntervals",
                table: "DateExceptions");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "WeeklyWorkingRules",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "WeeklyWorkingRules",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "RecurringRules",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "RecurringRules",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "DateExceptions",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "DateExceptions",
                type: "time",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "WeeklyWorkingRules");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "WeeklyWorkingRules");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "RecurringRules");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "RecurringRules");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "DateExceptions");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "DateExceptions");

            migrationBuilder.AddColumn<string>(
                name: "WorkingIntervals",
                table: "WeeklyWorkingRules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WorkingIntervals",
                table: "RecurringRules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WorkingIntervals",
                table: "DateExceptions",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
