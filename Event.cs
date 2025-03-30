using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Event
    {
        [Key]
        public Guid EventId { get; set; } = Guid.NewGuid();

        [Required, MaxLength(255)]
        public string? EventName { get; set; } 

        [Required]
        public Guid SportId { get; set; }

        [ForeignKey("SportId")]
        public Sport? Sport { get; set; }

        [Required]
        public Guid OrganizerId { get; set; }

        [ForeignKey("OrganizerId")]
        public User? Organizer { get; set; }

        [Required]
        public DateTime EventDate { get; set; }

        [Required, MaxLength(255)]
        public string? Location { get; set; } 

        [Required, MaxLength(50)]
        public string SkillLevel { get; set; } = string.Empty;

        [Required]
        public int MaxParticipants { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? MatchFormat { get; set; }

        public string? Status { get; set; } 

        public string? RejectionReason { get; set; } 

        public List<EventParticipant> Participants { get; set; } = new List<EventParticipant>();

    }
}