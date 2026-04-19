namespace WebAPI.DTOs
{
    public class BroadcastDTO
    {
        public Guid Id { get; set; }
        public Guid BusinessId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public int FollowerCount { get; set; }
    }

    public class CreateBroadcastDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
    }

    public class BroadcastStatusDTO
    {
        public int SentToday { get; set; }
        public int DailyLimit { get; set; }
        /// <summary>When the oldest broadcast in today's window expires (null if no broadcasts today).</summary>
        public DateTime? ResetsAt { get; set; }
    }
}
