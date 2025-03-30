using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationsController(AppDbContext context)
        {
            _context = context;
        }

        // Sơ đồ 1: Hiển thị danh sách thông báo
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    n.NotificationId,
                    n.Type,
                    n.Content,
                    n.IsRead,
                    n.CreatedAt,
                    Sender = new
                    {
                        n.Sender!.UserId,
                        n.Sender.UserName,
                        n.Sender.Avatar
                    }
                })
                .ToListAsync();

            return Ok(notifications);
        }

        // Sơ đồ 2: Xem chi tiết thông báo
        [Authorize]
        [HttpGet("{notificationId}")]
        public async Task<IActionResult> GetNotificationDetails(Guid notificationId)
        {
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var notification = await _context.Notifications
                .Where(n => n.UserId == userId && n.NotificationId == notificationId)
                .Select(n => new
                {
                    n.NotificationId,
                    n.Type,
                    n.Content,
                    n.IsRead,
                    n.CreatedAt,
                    Sender = new
                    {
                        n.Sender!.UserId,
                        n.Sender.UserName,
                        n.Sender.Avatar
                    }
                })
                .FirstOrDefaultAsync();

            if (notification == null)
            {
                return NotFound(new { message = "Không tìm thấy thông báo!" });
            }

            return Ok(notification);
        }

        // Sơ đồ 3: Tương tác với thông báo (Chấp nhận/Từ chối yêu cầu kết bạn)
        [Authorize]
        [HttpPost("{notificationId}/respond")]
        public async Task<IActionResult> RespondToNotification(Guid notificationId, [FromBody] NotificationResponseDto responseDto)
        {
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var notification = await _context.Notifications
                .Include(n => n.Sender)
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            if (notification == null)
            {
                return NotFound(new { message = "Không tìm thấy thông báo!" });
            }

            if (notification.Type != "FriendRequest")
            {
                return BadRequest(new { message = "Thông báo không phải là yêu cầu kết bạn!" });
            }

            // Tìm bản ghi Friendship tương ứng
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => f.UserId == notification.SenderId && f.FriendId == userId && f.Status == "pending");

            if (friendship == null)
            {
                return NotFound(new { message = "Không tìm thấy yêu cầu kết bạn!" });
            }

            // Kiểm tra null cho notification.Sender
            if (notification.Sender == null)
            {
                return BadRequest(new { message = "Không tìm thấy thông tin người gửi!" });
            }

            if (responseDto.Action == "accept")
            {
                // Cập nhật trạng thái Friendship
                friendship.Status = "accepted";

                // Tạo thông báo cho người gửi
                var senderNotification = new Notification
                {
                    UserId = notification.SenderId,
                    SenderId = userId,
                    Type = "FriendRequestAccepted",
                    Content = $"{notification.Sender.UserName} đã chấp nhận yêu cầu kết bạn của bạn.",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(senderNotification);

                // Xóa thông báo yêu cầu kết bạn
                _context.Notifications.Remove(notification);
            }
            else if (responseDto.Action == "reject")
            {
                // Cập nhật trạng thái Friendship
                friendship.Status = "rejected";

                // Tạo thông báo cho người gửi
                var senderNotification = new Notification
                {
                    UserId = notification.SenderId,
                    SenderId = userId,
                    Type = "FriendRequestRejected",
                    Content = $"{notification.Sender.UserName} đã từ chối yêu cầu kết bạn của bạn.",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(senderNotification);

                // Xóa thông báo yêu cầu kết bạn
                _context.Notifications.Remove(notification);
            }
            else
            {
                return BadRequest(new { message = "Hành động không hợp lệ! (accept/reject)" });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = responseDto.Action == "accept" ? "Bạn đã kết bạn thành công!" : "Bạn đã từ chối yêu cầu kết bạn." });
        }

        // Sơ đồ 4: Xóa thông báo
        [Authorize]
        [HttpDelete("{notificationId}")]
        public async Task<IActionResult> DeleteNotification(Guid notificationId)
        {
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            if (notification == null)
            {
                return NotFound(new { message = "Không tìm thấy thông báo!" });
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thông báo đã được xóa." });
        }

        // Sơ đồ 4: Xóa tất cả thông báo
        [Authorize]
        [HttpDelete("delete-all")]
        public async Task<IActionResult> DeleteAllNotifications()
        {
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .ToListAsync();

            if (!notifications.Any())
            {
                return NotFound(new { message = "Không có thông báo để xóa!" });
            }

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tất cả thông báo đã được xóa." });
        }

        // Sơ đồ 5: Đánh dấu tất cả thông báo là đã đọc
        [Authorize]
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (!notifications.Any())
            {
                return NotFound(new { message = "Không có thông báo chưa đọc!" });
            }

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Tất cả thông báo đã được đánh dấu là đã đọc." });
        }
    }

    public class NotificationResponseDto
    {
        public string Action { get; set; } = string.Empty; // "accept" hoặc "reject"
    }
}