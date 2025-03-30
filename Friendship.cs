namespace backend.Models
{
    public class Friendship
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; } // Người gửi lời mời
        public Guid FriendId { get; set; } // Người nhận lời mời
        public string Status { get; set; } = string.Empty; // "pending", "accepted", "rejected"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Quan hệ với bảng User
        public required User User { get; set; }
        public required User Friend { get; set; }
    }
}