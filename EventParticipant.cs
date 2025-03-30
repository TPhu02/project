using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class EventParticipant
    {
        public Guid EventId { get; set; }
        
        [ForeignKey("EventId")]
        public Event? Event { get; set; }

        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}