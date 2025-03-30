using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class ActivityHistory
    {
        [Key]
        public Guid ActivityId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid EventId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ActivityType { get; set; } = string.Empty; // ✅ Thêm giá trị mặc định

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("UserId")]
        public User User { get; set; } = default!;

        [ForeignKey("EventId")]
        public Event Event { get; set; } = default!;
    }
}
