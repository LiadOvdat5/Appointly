using System;

namespace WebAPI.Utilities
{
    public class AppointmentNotFoundException : Exception
    {
        public AppointmentNotFoundException() : base("Appointment not found.")
        {
        }

        public AppointmentNotFoundException(Guid appointmentId)
            : base($"Appointment with ID '{appointmentId}' was not found.")
        {
        }

        public AppointmentNotFoundException(string message) : base(message)
        {
        }

        public AppointmentNotFoundException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }

    public class SlotUnavailableException : Exception
    {
        public SlotUnavailableException() : base("The selected time slot is not available.")
        {
        }

        public SlotUnavailableException(Guid scheduleId)
            : base($"The time slot with ID '{scheduleId}' is not available for booking.")
        {
        }

        public SlotUnavailableException(string message) : base(message)
        {
        }

        public SlotUnavailableException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }

    public class UnauthorizedAppointmentAccessException : Exception
    {
        public UnauthorizedAppointmentAccessException()
            : base("You do not have permission to access this appointment.")
        {
        }

        public UnauthorizedAppointmentAccessException(string message) : base(message)
        {
        }

        public UnauthorizedAppointmentAccessException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }

    public class AppointmentAlreadyCanceledException : Exception
    {
        public AppointmentAlreadyCanceledException()
            : base("This appointment has already been canceled.")
        {
        }

        public AppointmentAlreadyCanceledException(Guid appointmentId)
            : base($"Appointment '{appointmentId}' has already been canceled.")
        {
        }

        public AppointmentAlreadyCanceledException(string message) : base(message)
        {
        }

        public AppointmentAlreadyCanceledException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }

    public class AppointmentAlreadyCompletedException : Exception
    {
        public AppointmentAlreadyCompletedException()
            : base("This appointment has already been completed.")
        {
        }

        public AppointmentAlreadyCompletedException(Guid appointmentId)
            : base($"Appointment '{appointmentId}' has already been completed.")
        {
        }

        public AppointmentAlreadyCompletedException(string message) : base(message)
        {
        }

        public AppointmentAlreadyCompletedException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }

    public class InvalidAppointmentOperationException : Exception
    {
        public InvalidAppointmentOperationException()
            : base("Invalid appointment operation.")
        {
        }

        public InvalidAppointmentOperationException(string message) : base(message)
        {
        }

        public InvalidAppointmentOperationException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}
