namespace WebAPI.DTOs
{
    /// <summary>Response for GET /businesses/{id}/services/{id}/assignment</summary>
    public class ServiceAssignmentResponseDTO
    {
        public Guid? StaffId { get; set; }
        public string? StaffName { get; set; }
        public bool IsOwner { get; set; }
        public bool BlockOnBooking { get; set; }
    }

    /// <summary>Body for PUT /businesses/{id}/services/{id}/assignment</summary>
    public class SetServiceAssignmentDTO
    {
        /// <summary>The user ID to assign, or null to unassign.</summary>
        public Guid? StaffId { get; set; }
    }

    /// <summary>Body for PATCH /businesses/{id}/services/{id}/assignment/preferences</summary>
    public class UpdateAssignmentPreferencesDTO
    {
        public bool BlockOnBooking { get; set; }
    }
}
