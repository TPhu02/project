using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Models;
using backend.Data;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _context;

    public EventsController(AppDbContext context)
    {
        _context = context;
    }

    // Lấy danh sách sự kiện
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetEvents()
    {
        var events = await _context.Events
            .Include(e => e.Sport)
            .Select(e => new
            {
                eventId = e.EventId,
                eventName = e.EventName,
                sportId = e.SportId,
                sportName = e.Sport != null ? e.Sport.SportName : "Không xác định",
                location = e.Location,
                maxParticipants = e.MaxParticipants,
                matchFormat = e.MatchFormat,
                eventDate = e.EventDate,
                participants = e.Participants != null ? e.Participants.Select(p => p.UserId).ToList() : new List<Guid>(),
                organizerId = e.OrganizerId,
                status = e.Status
            })
            .ToListAsync();
        return Ok(events);
    }

    // Lấy chi tiết sự kiện
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetEvent(Guid id)
    {
        try
        {
            var evt = await _context.Events
                .Include(e => e.Sport)
                .Include(e => e.Participants)
                .FirstOrDefaultAsync(e => e.EventId == id);

            if (evt == null) return NotFound();

            return Ok(new
            {
                eventId = evt.EventId,
                eventName = evt.EventName,
                sportId = evt.SportId,
                sportName = evt.Sport != null ? evt.Sport.SportName : "Không xác định",
                location = evt.Location,
                maxParticipants = evt.MaxParticipants,
                matchFormat = evt.MatchFormat,
                eventDate = evt.EventDate,
                participants = evt.Participants != null ? evt.Participants.Select(p => p.UserId).ToList() : new List<Guid>(),
                organizerId = evt.OrganizerId,
                status = evt.Status
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy chi tiết sự kiện.", error = ex.Message });
        }
    }

    // Tạo sự kiện
    [HttpPost]
    public async Task<ActionResult<Event>> CreateEvent([FromBody] EventDto eventDto)
    {
        if (eventDto == null)
        {
            return BadRequest(new { message = "Dữ liệu sự kiện không hợp lệ." });
        }

        if (string.IsNullOrEmpty(eventDto.EventName) || string.IsNullOrEmpty(eventDto.Location) || 
            string.IsNullOrEmpty(eventDto.MatchFormat) || string.IsNullOrEmpty(eventDto.Status))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin sự kiện." });
        }

        if (eventDto.MaxParticipants <= 0)
        {
            return BadRequest(new { message = "Số người tối đa phải lớn hơn 0." });
        }

        var userIdClaim = User.FindFirst("nameid")?.Value; // Sửa: Lấy trực tiếp "nameid"
        Console.WriteLine($"userIdClaim (nameid): {userIdClaim}");
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized(new { message = "Token không hợp lệ hoặc không chứa userId." });
        }

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return BadRequest(new { message = "Định dạng userId không hợp lệ." });
        }

        var sport = await _context.Sports.FindAsync(eventDto.SportId);
        if (sport == null)
        {
            return BadRequest(new { message = "Môn thể thao không tồn tại." });
        }

        var evt = new Event
        {
            EventId = Guid.NewGuid(),
            EventName = eventDto.EventName,
            SportId = eventDto.SportId,
            Location = eventDto.Location,
            MaxParticipants = eventDto.MaxParticipants,
            MatchFormat = eventDto.MatchFormat,
            EventDate = DateTime.UtcNow,
            OrganizerId = userId,
            Status = eventDto.Status,
            Participants = new List<EventParticipant>()
        };

        try
        {
            _context.Events.Add(evt);
            await _context.SaveChangesAsync();
            return Ok(evt);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lưu sự kiện.", error = ex.Message });
        }
    }

    // Cập nhật sự kiện
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateEvent(Guid id, [FromBody] EventDto eventDto)
    {
        var evt = await _context.Events.FindAsync(id);
        if (evt == null) return NotFound();

        var userIdClaim = User.FindFirst("nameid")?.Value; // Sửa: Lấy trực tiếp "nameid"
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Không tìm thấy thông tin người dùng." });

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return BadRequest(new { message = "Định dạng userId không hợp lệ." });
        }

        if (evt.OrganizerId != userId) return Forbid();

        if (eventDto == null || string.IsNullOrEmpty(eventDto.EventName) || string.IsNullOrEmpty(eventDto.Location) || 
            string.IsNullOrEmpty(eventDto.MatchFormat))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin sự kiện." });
        }

        if (eventDto.MaxParticipants <= 0)
        {
            return BadRequest(new { message = "Số người tối đa phải lớn hơn 0." });
        }

        evt.EventName = eventDto.EventName;
        evt.SportId = eventDto.SportId;
        evt.Location = eventDto.Location;
        evt.MaxParticipants = eventDto.MaxParticipants;
        evt.MatchFormat = eventDto.MatchFormat;

        try
        {
            await _context.SaveChangesAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi cập nhật sự kiện.", error = ex.Message });
        }
    }

    // Xóa sự kiện
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteEvent(Guid id)
    {
        var evt = await _context.Events.FindAsync(id);
        if (evt == null) return NotFound();

        var userIdClaim = User.FindFirst("nameid")?.Value; // Sửa: Lấy trực tiếp "nameid"
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Không tìm thấy thông tin người dùng." });

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return BadRequest(new { message = "Định dạng userId không hợp lệ." });
        }

        if (evt.OrganizerId != userId) return Forbid();

        try
        {
            _context.Events.Remove(evt);
            await _context.SaveChangesAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi xóa sự kiện.", error = ex.Message });
        }
    }

    // Tham gia sự kiện
    [HttpPost("{id}/join")]
    public async Task<ActionResult> JoinEvent(Guid id)
    {
        var evt = await _context.Events.Include(e => e.Participants).FirstOrDefaultAsync(e => e.EventId == id);
        if (evt == null) return NotFound();

        var userIdClaim = User.FindFirst("nameid")?.Value; // Sửa: Lấy trực tiếp "nameid"
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Không tìm thấy thông tin người dùng." });

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return BadRequest(new { message = "Định dạng userId không hợp lệ." });
        }

        if (evt.Participants != null && evt.Participants.Count >= evt.MaxParticipants)
            return BadRequest(new { message = "Sự kiện đã đủ người tham gia." });

        if (evt.Participants != null && evt.Participants.Any(p => p.UserId == userId))
            return BadRequest(new { message = "Bạn đã tham gia sự kiện này." });

        evt.Participants ??= new List<EventParticipant>();
        evt.Participants.Add(new EventParticipant { EventId = id, UserId = userId });

        try
        {
            await _context.SaveChangesAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi tham gia sự kiện.", error = ex.Message });
        }
    }

    // Hủy tham gia sự kiện
    [HttpPost("{id}/leave")]
    public async Task<ActionResult> LeaveEvent(Guid id)
    {
        var evt = await _context.Events.Include(e => e.Participants).FirstOrDefaultAsync(e => e.EventId == id);
        if (evt == null) return NotFound();

        var userIdClaim = User.FindFirst("nameid")?.Value; // Sửa: Lấy trực tiếp "nameid"
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Không tìm thấy thông tin người dùng." });

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return BadRequest(new { message = "Định dạng userId không hợp lệ." });
        }

        var participant = evt.Participants?.FirstOrDefault(p => p.UserId == userId);
        if (participant == null) return BadRequest(new { message = "Bạn chưa tham gia sự kiện này." });

        evt?.Participants?.Remove(participant);

        try
        {
            await _context.SaveChangesAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi rời sự kiện.", error = ex.Message });
        }
    }

    // Lấy danh sách sự kiện cần duyệt (cho Admin)
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<Event>>> GetPendingEvents()
    {
        try
        {
            var events = await _context.Events
                .Where(e => e.Status == "pending")
                .Include(e => e.Sport)
                .ToListAsync();
            return Ok(events);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách sự kiện cần duyệt.", error = ex.Message });
        }
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> ApproveEvent(Guid id)
    {
        var evt = await _context.Events.FindAsync(id);
        if (evt == null) return NotFound();

        evt.Status = "approved";

        try
        {
            await _context.SaveChangesAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi duyệt sự kiện.", error = ex.Message });
        }
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> RejectEvent(Guid id, [FromBody] string reason)
    {
        var evt = await _context.Events.FindAsync(id);
        if (evt == null) return NotFound();

        evt.Status = "rejected";
        evt.RejectionReason = reason;

        try
        {
            await _context.SaveChangesAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi từ chối sự kiện.", error = ex.Message });
        }
    }
}