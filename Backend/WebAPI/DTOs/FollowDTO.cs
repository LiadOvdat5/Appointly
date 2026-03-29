namespace WebAPI.DTOs
{
    public class FollowDTO
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid BusinessId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class FollowStatusDTO
    {
        public bool IsFollowing { get; set; }
        public Guid? FollowId { get; set; }
    }

    public class CreateFollowDTO
    {
        public Guid BusinessId { get; set; }
    }
}
