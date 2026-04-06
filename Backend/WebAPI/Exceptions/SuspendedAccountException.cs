namespace WebAPI.Exceptions
{
    public class SuspendedAccountException : Exception
    {
        public SuspendedAccountException(string? reason)
            : base(string.IsNullOrWhiteSpace(reason)
                ? "Your account has been suspended."
                : $"Your account has been suspended: {reason}")
        { }
    }
}
