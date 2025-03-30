using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class PlayerSport
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string Sport { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}