namespace backend.Models
{
    public class EventInvitation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SenderId { get; set; }
        public required User Sender { get; set; }
        public Guid ReceiverId { get; set; }
        public required User Receiver { get; set; }
        public Guid EventId { get; set; }
        public required Event Event { get; set; }
        public required string Status { get; set; } // "Pending", "Accepted", "Rejected"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}