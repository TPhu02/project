using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/friends")]
    [ApiController]
    public class FriendsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FriendsController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetFriends()
        {
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var friends = await _context.Friendships
                .Where(f => (f.UserId == userId || f.FriendId == userId) && f.Status == "accepted")
                .Select(f => new
                {
                    FriendId = f.UserId == userId ? f.FriendId : f.UserId,
                    Friend = f.UserId == userId
                        ? new { f.Friend.UserName, f.Friend.Email, f.Friend.Avatar }
                        : new { f.User.UserName, f.User.Email, f.User.Avatar }
                })
                .ToListAsync();

            return Ok(friends);
        }

        [Authorize]
        [HttpGet("search")]
        public async Task<IActionResult> SearchFriends([FromQuery] string keyword)
        {
            if (string.IsNullOrEmpty(keyword))
            {
                return BadRequest(new { message = "Từ khóa tìm kiếm không được để trống!" });
            }

            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var friends = await _context.Friendships
                .Where(f => (f.UserId == userId || f.FriendId == userId) && f.Status == "accepted")
                .Select(f => f.UserId == userId ? f.Friend : f.User)
                .Where(u => u.UserName.Contains(keyword) || u.Email.Contains(keyword))
                .Select(u => new { u.UserName, u.Email, u.Avatar })
                .ToListAsync();

            return Ok(friends);
        }

        [Authorize]
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var conversations = await _context.Conversations
                .Where(c => (c.StarterId == userId || c.ReceiverId == userId) &&
                            (c.StarterId == userId ? !c.IsDeletedByStarter : !c.IsDeletedByReceiver))
                .Select(c => new
                {
                    ConversationId = c.Id,
                    OtherParticipant = c.StarterId == userId
                        ? new { c.Receiver.UserName, c.Receiver.Avatar }
                        : new { c.Starter.UserName, c.Starter.Avatar },
                    LastMessage = c.Messages
                        .OrderByDescending(m => m.SentAt)
                        .Select(m => new { m.Content, m.SentAt, m.IsRead })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(conversations);
        }

        [Authorize]
        [HttpGet("conversations/{conversationId}")]
        public async Task<IActionResult> GetConversation(Guid conversationId)
        {
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var conversation = await _context.Conversations
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Sender)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Receiver)
                .Include(c => c.Starter)
                .Include(c => c.Receiver)
                .FirstOrDefaultAsync(c => c.Id == conversationId);

            if (conversation == null)
            {
                return NotFound(new { message = "Không tìm thấy hội thoại!" });
            }

            if (conversation.StarterId != userId && conversation.ReceiverId != userId)
            {
                return Forbid("Bạn không có quyền truy cập hội thoại này!");
            }

            if ((conversation.StarterId == userId && conversation.IsDeletedByStarter) ||
                (conversation.ReceiverId == userId && conversation.IsDeletedByReceiver))
            {
                return NotFound(new { message = "Hội thoại đã bị xóa!" });
            }

            var otherParticipant = conversation.StarterId == userId
                ? new { conversation.Receiver.UserName, conversation.Receiver.Avatar }
                : new { conversation.Starter.UserName, conversation.Starter.Avatar };

            var messages = conversation.Messages
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    MessageId = m.Id,
                    m.Content,
                    m.Type,
                    m.SentAt,
                    m.IsRead,
                    IsSentByMe = m.SenderId == userId
                });

            return Ok(new
            {
                ConversationId = conversation.Id,
                OtherParticipant = otherParticipant,
                Messages = messages
            });
        }

        [Authorize]
        [HttpPost("conversations/{conversationId}/messages")]
        public async Task<IActionResult> SendMessage(Guid conversationId, [FromBody] MessageDto messageDto)
        {
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == conversationId);

            if (conversation == null)
            {
                return NotFound(new { message = "Không tìm thấy hội thoại!" });
            }

            if (conversation.StarterId != userId && conversation.ReceiverId != userId)
            {
                return Forbid("Bạn không có quyền gửi tin nhắn trong hội thoại này!");
            }

            if ((conversation.StarterId == userId && conversation.IsDeletedByStarter) ||
                (conversation.ReceiverId == userId && conversation.IsDeletedByReceiver))
            {
                return BadRequest(new { message = "Hội thoại đã bị xóa, không thể gửi tin nhắn!" });
            }

            var receiverId = conversation.StarterId == userId
                ? conversation.ReceiverId
                : conversation.StarterId;

            var message = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                Conversation = conversation, // Gán giá trị cho Conversation
                SenderId = userId,
                ReceiverId = receiverId,
                Content = messageDto.Content,
                Type = messageDto.Type,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                MessageId = message.Id,
                message.Content,
                message.Type,
                message.SentAt,
                message.IsRead,
                IsSentByMe = true
            });
        }

        [Authorize]
        [HttpDelete("conversations/{conversationId}")]
        public async Task<IActionResult> DeleteConversation(Guid conversationId)
        {
            // Lấy userId từ token
            var userIdClaim = User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
            }

            // Tìm hội thoại và bao gồm các tin nhắn liên quan
            var conversation = await _context.Conversations
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == conversationId);

            if (conversation == null)
            {
                return NotFound(new { message = "Không tìm thấy hội thoại!" });
            }

            // Kiểm tra quyền truy cập
            if (conversation.StarterId != userId && conversation.ReceiverId != userId)
            {
                return Forbid("Bạn không có quyền xóa hội thoại này!");
            }

            // Kiểm tra xem hội thoại đã bị xóa bởi người dùng này chưa
            if (conversation.StarterId == userId && conversation.IsDeletedByStarter)
            {
                return BadRequest(new { message = "Hội thoại đã được xóa bởi bạn trước đó!" });
            }
            if (conversation.ReceiverId == userId && conversation.IsDeletedByReceiver)
            {
                return BadRequest(new { message = "Hội thoại đã được xóa bởi bạn trước đó!" });
            }

            // Đánh dấu xóa mềm
            if (conversation.StarterId == userId)
            {
                conversation.IsDeletedByStarter = true;
            }
            else
            {
                conversation.IsDeletedByReceiver = true;
            }

            // Nếu cả hai bên đều xóa, xóa hoàn toàn hội thoại và tin nhắn
            if (conversation.IsDeletedByStarter && conversation.IsDeletedByReceiver)
            {
                if (conversation.Messages.Any())
                {
                    _context.Messages.RemoveRange(conversation.Messages);
                }
                _context.Conversations.Remove(conversation);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Hội thoại đã được xóa thành công!" });
        }
    }

    public class MessageDto
    {
        public string Content { get; set; } = string.Empty;
        public string Type { get; set; } = "text";
    }
}