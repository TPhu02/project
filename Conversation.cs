using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Conversation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid StarterId { get; set; } // Người bắt đầu cuộc trò chuyện
        public Guid ReceiverId { get; set; } // Người nhận

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeletedByStarter { get; set; } = false;
        public bool IsDeletedByReceiver { get; set; } = false;

        // Navigation properties
        [ForeignKey("StarterId")]
        public User Starter { get; set; } = null!;

        [ForeignKey("ReceiverId")]
        public User Receiver { get; set; } = null!;

        public List<Message> Messages { get; set; } = new List<Message>();
    }
}
