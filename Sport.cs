using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Sport
    {
        [Key]
        public Guid SportId { get; set; } = Guid.NewGuid();

        [Required, MaxLength(100)]
        public string SportName { get; set; } = string.Empty;
        
        public List<Event>? Events { get; set; }
    }
}