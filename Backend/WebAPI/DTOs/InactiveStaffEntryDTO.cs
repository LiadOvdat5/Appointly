namespace WebAPI.DTOs
{
    public enum InactiveStaffEntryType
    {
        RemovedStaff,
        DeclinedInvitation,
        ExpiredInvitation,
    }

    public class InactiveStaffEntryDTO
    {
        public InactiveStaffEntryType EntryType { get; set; }

        /// <summary>Only set for RemovedStaff entries — the user's ID.</summary>
        public Guid? UserId { get; set; }

        /// <summary>Display name (only available for registered users / removed staff).</summary>
        public string? Name { get; set; }

        /// <summary>Email address — always present.</summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>When the status last changed (removal date, decline date, expiry date).</summary>
        public DateTime StatusChangedAt { get; set; }
    }
}
