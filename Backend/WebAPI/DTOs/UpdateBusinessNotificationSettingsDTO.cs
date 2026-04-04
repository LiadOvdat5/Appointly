namespace WebAPI.DTOs
{
    public class UpdateBusinessNotificationSettingsDTO
    {
        public bool? NotifyOnNewBooking { get; set; }
        public bool? NotifyOnCancellation { get; set; }
    }
}
