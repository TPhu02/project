using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Message
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ConversationId { get; set; } // Hội thoại chứa tin nhắn
        public Guid SenderId { get; set; } // Người gửi tin nhắn
        public Guid ReceiverId { get; set; } // Người nhận tin nhắn

        [ForeignKey("SenderId")]
        public User Sender { get; set; } = null!;

        [ForeignKey("ReceiverId")]
        public User Receiver { get; set; } = null!;

        public string Content { get; set; } = string.Empty;
        public string Type { get; set; } = "text";
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;

        // Navigation properties
        [ForeignKey("ConversationId")]
        public required Conversation Conversation { get; set; }
    }
}
