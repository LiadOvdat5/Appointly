namespace WebAPI.Utilities
{
    /// <summary>
    /// Localized strings for push notification titles and bodies (EN / HE).
    /// </summary>
    public static class PushText
    {
        // ── Booking confirmed — owner ─────────────────────────────────────────
        public static (string title, string body) NewBookingOwner(
            string lang, string clientName, string serviceName, string dateLabel) => lang == "he"
            ? ("הזמנה חדשה", $"{clientName} הזמין {serviceName} ב-{dateLabel}.")
            : ("New Booking", $"{clientName} booked {serviceName} on {dateLabel}.");

        // ── Booking confirmed — customer ──────────────────────────────────────
        public static (string title, string body) BookingConfirmedCustomer(
            string lang, string serviceName, string businessName, string dateLabel) => lang == "he"
            ? ("הזמנה אושרה", $"{serviceName} ב-{businessName} ב-{dateLabel} אושר.")
            : ("Booking Confirmed", $"Your {serviceName} at {businessName} on {dateLabel} is confirmed.");

        // ── Cancellation — customer (business cancelled) ──────────────────────
        public static (string title, string body) AppointmentCancelledCustomer(
            string lang, string serviceName, string businessName, string dateLabel) => lang == "he"
            ? ("פגישה בוטלה", $"{serviceName} ב-{businessName} ב-{dateLabel} בוטל.")
            : ("Appointment Cancelled", $"Your {serviceName} at {businessName} on {dateLabel} was cancelled.");

        // ── Cancellation — owner (customer cancelled) ─────────────────────────
        public static (string title, string body) BookingCancelledOwner(
            string lang, string clientName, string serviceName, string dateLabel) => lang == "he"
            ? ("הזמנה בוטלה", $"{clientName} ביטל את {serviceName} ב-{dateLabel}.")
            : ("Booking Cancelled", $"{clientName} cancelled their {serviceName} on {dateLabel}.");

        // ── 24h reminder ──────────────────────────────────────────────────────
        public static (string title, string body) Reminder24h(
            string lang, string serviceName, string businessName, string timeLabel) => lang == "he"
            ? ("תזכורת", $"{serviceName} ב-{businessName} מחר ב-{timeLabel}.")
            : ("Reminder", $"Your {serviceName} at {businessName} is tomorrow at {timeLabel}.");

        // ── 1h reminder ───────────────────────────────────────────────────────
        public static (string title, string body) Reminder1h(
            string lang, string serviceName, string businessName) => lang == "he"
            ? ("תזכורת", $"{serviceName} ב-{businessName} מתחיל בעוד שעה.")
            : ("Reminder", $"Your {serviceName} at {businessName} starts in 1 hour.");

        // ── Review prompt ─────────────────────────────────────────────────────
        public static (string title, string body) ReviewPrompt(
            string lang, string businessName) => lang == "he"
            ? ("איך היה?", $"השאר ביקורת על {businessName}.")
            : ("How was it?", $"Leave a review for {businessName}.");
    }
}
