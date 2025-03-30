using System.ComponentModel.DataAnnotations;

public class RegisterRequest
{
    [Required]
    public required string UserName { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }

    [Required]
    public int Age { get; set; }

    [Required]
    public required string Gender { get; set; }

    public string Avatar { get; set; } = "default_avatar.png";

    [Required]
    public required string Location { get; set; }
}
