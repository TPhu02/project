using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        [Key]
        public Guid UserId { get; set; } = Guid.NewGuid();

        [Required, MaxLength(100)]
        public string UserName { get; set; } = string.Empty;
        public int Age { get; set; } 
        public string Gender { get; set; }  = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
        public string Role { get; set; } = "User";

        public bool IsOnline { get; set; } = false;
        public DateTime LastActive { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public List<EventParticipant> EventParticipants { get; set; } = new List<EventParticipant>();
        public List<Message> SentMessages { get; set; } = new List<Message>();
        public List<Message> ReceivedMessages { get; set; } = new List<Message>();
        public List<FriendRequest> FriendRequestsSent { get; set; } = new List<FriendRequest>();
        public List<FriendRequest> FriendRequestsReceived { get; set; } = new List<FriendRequest>();
        public List<EventInvitation> EventInvitationsSent { get; set; } = new List<EventInvitation>();
        public List<EventInvitation> EventInvitationsReceived { get; set; } = new List<EventInvitation>();
        public List<ActivityHistory> ActivityHistories { get; set; } = new List<ActivityHistory>();
        public List<PlayerSport> PlayerSports { get; set; } = new List<PlayerSport>();
        public List<Conversation> Conversations { get; set; } = new List<Conversation>();
        public List<Notification> Notifications { get; set; } = new List<Notification>(); // Thêm thuộc tính này
    }
}