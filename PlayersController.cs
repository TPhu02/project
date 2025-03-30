using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using backend.Data;
using System.Web;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

[Route("api/Player")]
[ApiController]
public class PlayersController : ControllerBase
{
    private readonly AppDbContext _context;

    public PlayersController(AppDbContext context)
    {
        _context = context;
    }

    // API: Đăng ký môn thể thao
    [HttpPost("register")]
    public async Task<IActionResult> RegisterSport([FromBody] PlayerSport playerSport)
    {
        if (playerSport == null || string.IsNullOrEmpty(playerSport.Sport))
        {
            return BadRequest(new { message = "Thông tin không hợp lệ!" });
        }

        var user = await _context.Users.FindAsync(playerSport.UserId);
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không tồn tại!" });
        }

        bool alreadyRegistered = await _context.PlayerSports
            .AnyAsync(ps => ps.UserId == playerSport.UserId && ps.Sport == playerSport.Sport);

        if (alreadyRegistered)
        {
            return BadRequest(new { message = "Người dùng đã đăng ký môn thể thao này!" });
        }

        _context.PlayerSports.Add(playerSport);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đăng ký môn thể thao thành công!" });
    }

    // API: Lấy danh sách người chơi theo môn thể thao
    [HttpGet("{sport}")]
    public async Task<ActionResult> GetPlayersBySport(string sport)
    {
        sport = HttpUtility.UrlDecode(sport);
        Console.WriteLine($"Fetching players for sport: '{sport}'");

        if (string.IsNullOrEmpty(sport))
        {
            Console.WriteLine("Môn thể thao không hợp lệ!");
            return BadRequest(new { message = "Môn thể thao không hợp lệ!" });
        }

        var allSports = await _context.PlayerSports.Select(ps => ps.Sport).Distinct().ToListAsync();
        Console.WriteLine($"Danh sách môn thể thao trong DB: {string.Join(", ", allSports)}");

        var players = await _context.PlayerSports
            .Where(ps => ps.Sport.Trim().ToLower() == sport.Trim().ToLower() && ps.User != null)
            .Include(ps => ps.User!)
            .Select(ps => new
            {
                UserId = ps.User!.UserId,
                UserName = ps.User.UserName,
                Avatar = ps.User.Avatar,
                Age = ps.User.Age,
                Gender = ps.User.Gender,
                Location = ps.User.Location
            })
            .ToListAsync();

        Console.WriteLine($"Số lượng người chơi tìm thấy: {players.Count}");

        if (!players.Any())
        {
            Console.WriteLine("Không có người chơi nào đăng ký môn này!");
            return NotFound(new { message = "Không có người chơi nào đăng ký môn này!" });
        }

        return Ok(players);
    }

    // Lấy chi tiết người chơi
    [HttpGet("details/{userId}")]
    public async Task<ActionResult> GetPlayerDetails(Guid userId)
    {
        var player = await _context.Users
            .Where(u => u.UserId == userId)
            .Select(u => new
            {
                UserId = u.UserId,
                UserName = u.UserName,
                Avatar = u.Avatar,
                Age = u.Age,
                Gender = u.Gender,
                Location = u.Location,
                Sport = u.PlayerSports != null ? u.PlayerSports.Select(ps => ps.Sport).FirstOrDefault() : null
            })
            .FirstOrDefaultAsync();

        if (player == null) return NotFound(new { message = "Không tìm thấy người chơi." });
        return Ok(player);
    }

    // Gửi yêu cầu kết bạn
[HttpPost("friend-request")]
public async Task<ActionResult> SendFriendRequest([FromBody] FriendRequestDto request)
{
    var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(currentUserId))
    {
        return BadRequest(new { message = "Không tìm thấy ID người dùng." });
    }

    var sender = await _context.Users.FindAsync(Guid.Parse(currentUserId));
    var receiver = await _context.Users.FindAsync(request.TargetUserId);
    
    if (sender == null || receiver == null)
    {
        return BadRequest(new { message = "Không tìm thấy người dùng." });
    }

    var friendRequest = new FriendRequest
    {
        Id = Guid.NewGuid(),
        SenderId = sender.UserId,
        Sender = sender,  // Gán đối tượng Sender
        ReceiverId = receiver.UserId,
        Receiver = receiver,  // Gán đối tượng Receiver
        Status = "Pending",
        CreatedAt = DateTime.UtcNow
    };

    _context.FriendRequests.Add(friendRequest);
    await _context.SaveChangesAsync();
    return Ok(new { message = "Yêu cầu kết bạn đã được gửi!" });
}

// Mời tham gia sự kiện
[HttpPost("invite-event")]
public async Task<ActionResult> InviteToEvent([FromBody] EventInvitationDto request)
{
    var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(currentUserId))
    {
        return BadRequest(new { message = "Không tìm thấy ID người dùng." });
    }

    var sender = await _context.Users.FindAsync(Guid.Parse(currentUserId));
    var receiver = await _context.Users.FindAsync(request.TargetUserId);
    var eventEntity = await _context.Events.FindAsync(request.EventId);
    
    if (sender == null || receiver == null || eventEntity == null)
    {
        return BadRequest(new { message = "Dữ liệu không hợp lệ." });
    }

    var invitation = new EventInvitation
    {
        Id = Guid.NewGuid(),
        SenderId = sender.UserId,
        Sender = sender,  // Gán đối tượng Sender
        ReceiverId = receiver.UserId,
        Receiver = receiver,  // Gán đối tượng Receiver
        EventId = eventEntity.EventId,
        Event = eventEntity,  // Gán đối tượng Event
        Status = "Pending",
        CreatedAt = DateTime.UtcNow
    };

    _context.EventInvitations.Add(invitation);
    await _context.SaveChangesAsync();
    return Ok(new { message = "Lời mời tham gia sự kiện đã được gửi!" });
}

public class EventInvitationDto
{
    public Guid TargetUserId { get; set; }
    public Guid EventId { get; set; }
}

// API chấp nhận/từ chối yêu cầu kết bạn
[HttpPost("friend-request/respond")]
public async Task<ActionResult> RespondFriendRequest([FromBody] FriendRequestResponseDto request)
{
    var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(currentUserId))
    {
        return BadRequest(new { message = "Không tìm thấy ID người dùng." });
    }

    var userId = Guid.Parse(currentUserId);
    var friendRequest = await _context.FriendRequests
        .FirstOrDefaultAsync(fr => fr.Id == request.RequestId && fr.ReceiverId == userId);
    if (friendRequest == null) return NotFound(new { message = "Không tìm thấy yêu cầu kết bạn." });

    friendRequest.Status = request.Accept ? "Accepted" : "Rejected";
    await _context.SaveChangesAsync();
    return Ok(new { message = $"Yêu cầu kết bạn đã được {(request.Accept ? "chấp nhận" : "từ chối")}!" });
}

public class FriendRequestResponseDto
{
    public Guid RequestId { get; set; } // Chuyển từ int -> Guid
    public bool Accept { get; set; }
}

// API chấp nhận/từ chối lời mời sự kiện
[HttpPost("invite-event/respond")]
public async Task<ActionResult> RespondEventInvitation([FromBody] EventInvitationResponseDto request)
{
    var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(currentUserId))
    {
        return BadRequest(new { message = "Không tìm thấy ID người dùng." });
    }

    var userId = Guid.Parse(currentUserId);
    var invitation = await _context.EventInvitations
        .FirstOrDefaultAsync(ei => ei.Id == request.InvitationId && ei.ReceiverId == userId);
    if (invitation == null) return NotFound(new { message = "Không tìm thấy lời mời sự kiện." });

    invitation.Status = request.Accept ? "Accepted" : "Rejected";
    await _context.SaveChangesAsync();
    return Ok(new { message = $"Lời mời sự kiện đã được {(request.Accept ? "chấp nhận" : "từ chối")}!" });
}

public class EventInvitationResponseDto
{
    public Guid InvitationId { get; set; } // Chuyển từ int -> Guid
    public bool Accept { get; set; }
}
public class FriendRequestDto
{
    public Guid TargetUserId { get; set; }
}
}