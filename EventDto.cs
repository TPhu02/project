using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class EventDto
    {
        public string? EventName { get; set; }
        public Guid SportId { get; set; }
        public string? Location { get; set; }
        public int MaxParticipants { get; set; }
        public string? MatchFormat { get; set; }
        public string? Status { get; set; }
    }
}