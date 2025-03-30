using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)  { }

        // Thêm DbSet cho các bảng trong database
        public DbSet<User> Users { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Sport> Sports { get; set; }
        public DbSet<PlayerSport> PlayerSports { get; set; }
        public DbSet<FriendRequest> FriendRequests { get; set; }
        public DbSet<EventInvitation> EventInvitations { get; set; }
        public DbSet<EventParticipant> EventParticipants { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //base.OnModelCreating(modelBuilder);
            // Cấu hình quan hệ thong bao
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Sender)
                .WithMany()
                .HasForeignKey(n => n.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình quan hệ cho EventParticipant
            modelBuilder.Entity<EventParticipant>()
                .HasKey(ep => new { ep.EventId, ep.UserId });

            modelBuilder.Entity<EventParticipant>()
                .HasOne(ep => ep.Event)
                .WithMany(e => e.Participants)
                .HasForeignKey(ep => ep.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EventParticipant>()
                .HasOne(ep => ep.User)
                .WithMany(u => u.EventParticipants)
                .HasForeignKey(ep => ep.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình quan hệ cho Friendship
            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Friend)
                .WithMany()
                .HasForeignKey(f => f.FriendId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình quan hệ cho Conversation
            // Quan hệ giữa User và Conversation
            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.Starter)
                .WithMany(u => u.Conversations)
                .HasForeignKey(c => c.StarterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.Receiver)
                .WithMany()
                .HasForeignKey(c => c.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ giữa Message và User (Người gửi)
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ giữa Message và User (Người nhận)
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ giữa Message và Conversation
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình quan hệ cho FriendRequest
            modelBuilder.Entity<FriendRequest>()
                .HasOne(fr => fr.Sender)
                .WithMany(u => u.FriendRequestsSent)
                .HasForeignKey(fr => fr.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FriendRequest>()
                .HasOne(fr => fr.Receiver)
                .WithMany(u => u.FriendRequestsReceived)
                .HasForeignKey(fr => fr.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình quan hệ cho EventInvitation
            modelBuilder.Entity<EventInvitation>()
                .HasOne(ei => ei.Sender)
                .WithMany(u => u.EventInvitationsSent)
                .HasForeignKey(ei => ei.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EventInvitation>()
                .HasOne(ei => ei.Receiver)
                .WithMany(u => u.EventInvitationsReceived)
                .HasForeignKey(ei => ei.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình quan hệ cho ActivityHistory
            modelBuilder.Entity<ActivityHistory>()
                .HasOne(a => a.User)
                .WithMany(u => u.ActivityHistories)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ActivityHistory>()
                .HasOne(a => a.Event)
                .WithMany()
                .HasForeignKey(a => a.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình quan hệ 1 User - N PlayerSports
            modelBuilder.Entity<PlayerSport>()
                .HasOne(ps => ps.User)
                .WithMany(u => u.PlayerSports)
                .HasForeignKey(ps => ps.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình quan hệ Event -> Sport
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Sport)
                .WithMany(s => s.Events)
                .HasForeignKey(e => e.SportId);
        }
    }
}