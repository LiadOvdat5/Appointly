namespace WebAPI.DTOs
{
    public class PushPreferencesDTO
    {
        public bool PushBookingConfirm { get; set; }
        public bool PushCancellations { get; set; }
        public bool PushReminders24h { get; set; }
        public bool PushReminders1h { get; set; }
        public bool PushReviewPrompt { get; set; }
    }

    public class UpdatePushPreferencesDTO
    {
        public bool? PushBookingConfirm { get; set; }
        public bool? PushCancellations { get; set; }
        public bool? PushReminders24h { get; set; }
        public bool? PushReminders1h { get; set; }
        public bool? PushReviewPrompt { get; set; }
    }
}
