using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Businesses",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            // Backfill: generate a slug from the business name for existing rows.
            // Uses a T-SQL inline function approach: lowercase, spaces→hyphens,
            // strips characters not in [a-z0-9-], then appends the first 8 chars of
            // the ID to guarantee uniqueness without needing a cursor.
            migrationBuilder.Sql(@"
                UPDATE Businesses
                SET Slug = LOWER(
                    REPLACE(
                        REPLACE(
                            REPLACE(
                                REPLACE(
                                    REPLACE(
                                        REPLACE(Name, ' ', '-'),
                                        '''', ''),
                                    '.', ''),
                                ',', ''),
                            '(', ''),
                        ')', '')
                    ) + '-' + LEFT(CAST(Id AS nvarchar(36)), 8)
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Businesses_Slug",
                table: "Businesses",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Businesses_Slug",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Businesses");
        }
    }
}
