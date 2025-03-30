using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Rating
    {
        [Key]
        public Guid RatingId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ReviewerId { get; set; }

        [Required]
        public Guid RatedUserId { get; set; }

        [Required]
        public Guid EventId { get; set; }

        [Required]
        [Range(1, 5)]
        public int RatingValue { get; set; }

        [MaxLength(500)]
        public string? Comment { get; set; } // ✅ Cho phép null

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("ReviewerId")]
        public User Reviewer { get; set; } = default!;

        [ForeignKey("RatedUserId")]
        public User RatedUser { get; set; } = default!;

        [ForeignKey("EventId")]
        public Event Event { get; set; } = default!;
    }
}
