using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Notification
    {
        [Key]
        public Guid NotificationId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; } // Người nhận thông báo
        public User? User { get; set; } // Navigation property (nullable)

        [Required]
        public Guid SenderId { get; set; } // Người gửi thông báo
        public User? Sender { get; set; } // Navigation property (nullable)

        [Required, MaxLength(50)]
        public string Type { get; set; } = string.Empty; // Loại thông báo: "FriendRequest", "EventInvitation", v.v.

        [Required, MaxLength(500)]
        public string Content { get; set; } = string.Empty; // Nội dung thông báo

        public bool IsRead { get; set; } = false; // Trạng thái đã đọc

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Thời gian tạo
    }
}