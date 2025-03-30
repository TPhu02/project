using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class UserLocation
    {
        [Key]
        public Guid LocationId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty; // ✅ Thêm giá trị mặc định

        [MaxLength(100)]
        public string? District { get; set; } // ✅ Cho phép null

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("UserId")]
        public User User { get; set; } = default!; // ✅ Đánh dấu là requireds
    }
}
