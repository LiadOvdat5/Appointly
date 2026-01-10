using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class RefactorRemoveSchedulePolicy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BreakRules_SchedulePolicies_SchedulePolicyId",
                table: "BreakRules");

            migrationBuilder.DropForeignKey(
                name: "FK_DateExceptions_SchedulePolicies_SchedulePolicyId",
                table: "DateExceptions");

            migrationBuilder.DropForeignKey(
                name: "FK_RecurringRules_SchedulePolicies_SchedulePolicyId",
                table: "RecurringRules");

            migrationBuilder.DropForeignKey(
                name: "FK_Services_SchedulePolicies_SchedulePolicyId",
                table: "Services");

            migrationBuilder.DropForeignKey(
                name: "FK_WeeklyWorkingRules_SchedulePolicies_SchedulePolicyId",
                table: "WeeklyWorkingRules");

            migrationBuilder.DropTable(
                name: "SchedulePolicies");

            migrationBuilder.DropIndex(
                name: "IX_Services_SchedulePolicyId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "SchedulePolicyId",
                table: "Services");

            migrationBuilder.RenameColumn(
                name: "SchedulePolicyId",
                table: "WeeklyWorkingRules",
                newName: "ServiceId");

            migrationBuilder.RenameIndex(
                name: "IX_WeeklyWorkingRules_SchedulePolicyId",
                table: "WeeklyWorkingRules",
                newName: "IX_WeeklyWorkingRules_ServiceId");

            migrationBuilder.RenameColumn(
                name: "SchedulePolicyId",
                table: "RecurringRules",
                newName: "ServiceId");

            migrationBuilder.RenameIndex(
                name: "IX_RecurringRules_SchedulePolicyId",
                table: "RecurringRules",
                newName: "IX_RecurringRules_ServiceId");

            migrationBuilder.RenameColumn(
                name: "SchedulePolicyId",
                table: "DateExceptions",
                newName: "ServiceId");

            migrationBuilder.RenameIndex(
                name: "IX_DateExceptions_SchedulePolicyId",
                table: "DateExceptions",
                newName: "IX_DateExceptions_ServiceId");

            migrationBuilder.RenameColumn(
                name: "SchedulePolicyId",
                table: "BreakRules",
                newName: "ServiceId");

            migrationBuilder.RenameIndex(
                name: "IX_BreakRules_SchedulePolicyId",
                table: "BreakRules",
                newName: "IX_BreakRules_ServiceId");

            migrationBuilder.AddColumn<int>(
                name: "AdvanceBookingDays",
                table: "Businesses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Timezone",
                table: "Businesses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_BreakRules_Services_ServiceId",
                table: "BreakRules",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DateExceptions_Services_ServiceId",
                table: "DateExceptions",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RecurringRules_Services_ServiceId",
                table: "RecurringRules",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WeeklyWorkingRules_Services_ServiceId",
                table: "WeeklyWorkingRules",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BreakRules_Services_ServiceId",
                table: "BreakRules");

            migrationBuilder.DropForeignKey(
                name: "FK_DateExceptions_Services_ServiceId",
                table: "DateExceptions");

            migrationBuilder.DropForeignKey(
                name: "FK_RecurringRules_Services_ServiceId",
                table: "RecurringRules");

            migrationBuilder.DropForeignKey(
                name: "FK_WeeklyWorkingRules_Services_ServiceId",
                table: "WeeklyWorkingRules");

            migrationBuilder.DropColumn(
                name: "AdvanceBookingDays",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "Timezone",
                table: "Businesses");

            migrationBuilder.RenameColumn(
                name: "ServiceId",
                table: "WeeklyWorkingRules",
                newName: "SchedulePolicyId");

            migrationBuilder.RenameIndex(
                name: "IX_WeeklyWorkingRules_ServiceId",
                table: "WeeklyWorkingRules",
                newName: "IX_WeeklyWorkingRules_SchedulePolicyId");

            migrationBuilder.RenameColumn(
                name: "ServiceId",
                table: "RecurringRules",
                newName: "SchedulePolicyId");

            migrationBuilder.RenameIndex(
                name: "IX_RecurringRules_ServiceId",
                table: "RecurringRules",
                newName: "IX_RecurringRules_SchedulePolicyId");

            migrationBuilder.RenameColumn(
                name: "ServiceId",
                table: "DateExceptions",
                newName: "SchedulePolicyId");

            migrationBuilder.RenameIndex(
                name: "IX_DateExceptions_ServiceId",
                table: "DateExceptions",
                newName: "IX_DateExceptions_SchedulePolicyId");

            migrationBuilder.RenameColumn(
                name: "ServiceId",
                table: "BreakRules",
                newName: "SchedulePolicyId");

            migrationBuilder.RenameIndex(
                name: "IX_BreakRules_ServiceId",
                table: "BreakRules",
                newName: "IX_BreakRules_SchedulePolicyId");

            migrationBuilder.AddColumn<Guid>(
                name: "SchedulePolicyId",
                table: "Services",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SchedulePolicies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BusinessId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastGeneratedUntil = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OpenWeeksAhead = table.Column<int>(type: "int", nullable: false),
                    Timezone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchedulePolicies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SchedulePolicies_Businesses_BusinessId",
                        column: x => x.BusinessId,
                        principalTable: "Businesses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Services_SchedulePolicyId",
                table: "Services",
                column: "SchedulePolicyId");

            migrationBuilder.CreateIndex(
                name: "IX_SchedulePolicies_BusinessId",
                table: "SchedulePolicies",
                column: "BusinessId");

            migrationBuilder.AddForeignKey(
                name: "FK_BreakRules_SchedulePolicies_SchedulePolicyId",
                table: "BreakRules",
                column: "SchedulePolicyId",
                principalTable: "SchedulePolicies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DateExceptions_SchedulePolicies_SchedulePolicyId",
                table: "DateExceptions",
                column: "SchedulePolicyId",
                principalTable: "SchedulePolicies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RecurringRules_SchedulePolicies_SchedulePolicyId",
                table: "RecurringRules",
                column: "SchedulePolicyId",
                principalTable: "SchedulePolicies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Services_SchedulePolicies_SchedulePolicyId",
                table: "Services",
                column: "SchedulePolicyId",
                principalTable: "SchedulePolicies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WeeklyWorkingRules_SchedulePolicies_SchedulePolicyId",
                table: "WeeklyWorkingRules",
                column: "SchedulePolicyId",
                principalTable: "SchedulePolicies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
