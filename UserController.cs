using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        //private readonly UserManager<User> _userManager;

        public UserController(AppDbContext context, IConfiguration configuration)//, UserManager<User> userManager)
        {
            _context = context;
            _configuration = configuration;
         //   _userManager = userManager;
        }

        private string GenerateJwtToken(User user)
        {
            var secretKey = _configuration["JwtSettings:SecretKey"];
            if (string.IsNullOrEmpty(secretKey))
                throw new Exception("SecretKey không được tìm thấy trong appsettings.json");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("nameid", user.UserId.ToString()),
                new Claim("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", user.Role ?? "User") // Thêm claim role
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
                    return BadRequest(new { message = "Vui lòng nhập email và mật khẩu!" });

                Console.WriteLine($"Đang xử lý đăng nhập cho email: {loginDto.Email}");

                // Hard-code tài khoản Admin
                const string adminEmail = "Admin@sportlink.com";
                const string adminPassword = "123";
                bool isAdmin = loginDto.Email == adminEmail && loginDto.Password == adminPassword;

                string token;
                object userResponse;

                if (isAdmin)
                {
                    Console.WriteLine("Đăng nhập với tài khoản Admin...");
                    var adminUser = new User
                    {
                        UserId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                        Email = adminEmail,
                        UserName = "Admin",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                        Age = 30,
                        Gender = "Nam",
                        Avatar = "default-avatar.jpg",
                        Location = "Admin Location",
                        Role = "Admin"
                    };
                    token = GenerateJwtToken(adminUser);
                    userResponse = new { adminUser.UserName, adminUser.Email, adminUser.Age, adminUser.Gender, adminUser.Avatar, adminUser.Location };
                }
                else
                {
                    Console.WriteLine("Đang tìm người dùng trong database...");
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
                    if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                    {
                        Console.WriteLine("Email hoặc mật khẩu không đúng.");
                        return Unauthorized(new { message = "Sai email hoặc mật khẩu!" });
                    }

                    Console.WriteLine($"Người dùng tìm thấy: {user.UserName}, Role: {user.Role}");
                    if (string.IsNullOrEmpty(user.Role))
                    {
                        Console.WriteLine("Role rỗng, gán role mặc định là User...");
                        user.Role = "User";
                        _context.Users.Update(user);
                        await _context.SaveChangesAsync();
                        Console.WriteLine("Role đã được cập nhật.");
                    }

                    token = GenerateJwtToken(user);
                    userResponse = new { user.UserName, user.Email, user.Age, user.Gender, user.Avatar, user.Location };
                }

                Console.WriteLine("Đăng nhập thành công, trả về token...");
                return Ok(new
                {
                    message = "Đăng nhập thành công!",
                    token,
                    user = userResponse
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi trong quá trình đăng nhập: {ex.Message}\nStackTrace: {ex.StackTrace}");
                throw; // Ném lại ngoại lệ để middleware UseExceptionHandler xử lý
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (string.IsNullOrEmpty(registerDto.Email) || string.IsNullOrEmpty(registerDto.Password))
                return BadRequest(new { message = "Vui lòng nhập email và mật khẩu!" });

            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                return BadRequest(new { message = "Email đã được sử dụng!" });

            var user = new User
            {
                UserName = registerDto.UserName,
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Age = registerDto.Age,
                Gender = registerDto.Gender,
                Avatar = registerDto.Avatar ?? "default-avatar.jpg",
                Location = registerDto.Location,
                Role = "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return Ok(new
            {
                message = "Đăng ký thành công!",
                token,
                user = new { user.UserName, user.Email, user.Age, user.Gender, user.Avatar, user.Location }
            });
        }

        [HttpPost("create-admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto createAdminDto)
        {
            if (string.IsNullOrEmpty(createAdminDto.Email) || string.IsNullOrEmpty(createAdminDto.Password))
                return BadRequest(new { message = "Vui lòng nhập email và mật khẩu!" });

            if (await _context.Users.AnyAsync(u => u.Email == createAdminDto.Email))
                return BadRequest(new { message = "Email đã được sử dụng!" });

            var newAdmin = new User
            {
                UserName = createAdminDto.UserName,
                Email = createAdminDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(createAdminDto.Password),
                Age = createAdminDto.Age,
                Gender = createAdminDto.Gender,
                Avatar = createAdminDto.Avatar ?? "default-avatar.jpg",
                Location = createAdminDto.Location,
                Role = "Admin"
            };

            _context.Users.Add(newAdmin);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(newAdmin);
            return Ok(new
            {
                message = "Tài khoản Admin mới đã được tạo!",
                token,
                user = new { newAdmin.UserName, newAdmin.Email, newAdmin.Age, newAdmin.Gender, newAdmin.Avatar, newAdmin.Location }
            });
        }

        [Authorize]
        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar([FromForm] IFormFile avatar)
        {
            Console.WriteLine("📩 Nhận request upload ảnh...");
            if (avatar == null || avatar.Length == 0)
            {
                Console.WriteLine("❌ Không có file nào được chọn!");
                return BadRequest(new { message = "Không có file nào được chọn!" });
            }

            if (avatar.Length > 5 * 1024 * 1024)
            {
                Console.WriteLine("❌ File quá lớn!");
                return BadRequest(new { message = "File quá lớn! Giới hạn 5MB." });
            }

            if (!avatar.ContentType.StartsWith("image/"))
            {
                Console.WriteLine("❌ Không phải file ảnh!");
                return BadRequest(new { message = "Chỉ chấp nhận file ảnh!" });
            }

            var userId = User.FindFirstValue("nameid");
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out Guid userGuid))
            {
                Console.WriteLine("❌ Token không hợp lệ!");
                return Unauthorized(new { message = "Token không hợp lệ!" });
            }

            var user = await _context.Users.FindAsync(userGuid);
            if (user == null)
            {
                Console.WriteLine("❌ Không tìm thấy user!");
                return NotFound(new { message = "Không tìm thấy user!" });
            }

            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            if (!Directory.Exists(uploadPath))
            {
                Console.WriteLine("📁 Tạo thư mục uploads...");
                Directory.CreateDirectory(uploadPath);
            }

            var fileExtension = Path.GetExtension(avatar.FileName).ToLower();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

            if (!allowedExtensions.Contains(fileExtension))
            {
                Console.WriteLine("❌ Định dạng không hợp lệ!");
                return BadRequest(new { message = "Chỉ chấp nhận file JPG, JPEG, PNG, WEBP, GIF!" });
            }

            if (!string.IsNullOrEmpty(user.Avatar) && Path.GetFileName(user.Avatar) != "default_avatar.png")
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.Avatar.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                {
                    Console.WriteLine($"🗑️ Xóa file cũ: {oldFilePath}");
                    System.IO.File.Delete(oldFilePath);
                }
            }

            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await avatar.CopyToAsync(stream);
            }

            user.Avatar = $"/uploads/{fileName}";
            await _context.SaveChangesAsync();

            string avatarUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}?t={DateTime.UtcNow.Ticks}";
            Console.WriteLine($"✅ Upload thành công: {avatarUrl}");

            return Ok(new { message = "Upload thành công!", avatarUrl });
        }

        [Authorize]
        [HttpPut("update-avatar")]
        public async Task<IActionResult> UpdateAvatar(IFormFile file)
        {
            var userId = User.FindFirstValue("nameid");
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out Guid userGuid))
                return Unauthorized(new { message = "Token không hợp lệ!" });

            var user = await _context.Users.FindAsync(userGuid);
            if (user == null)
                return NotFound(new { message = "User không tồn tại!" });

            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            if (!string.IsNullOrEmpty(user.Avatar) && user.Avatar != "default_avatar.png")
            {
                var oldFilePath = Path.Combine("wwwroot", user.Avatar.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                    System.IO.File.Delete(oldFilePath);
            }

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            user.Avatar = $"/uploads/{fileName}";
            await _context.SaveChangesAsync();

            string avatarUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}?t={DateTime.UtcNow.Ticks}";
            return Ok(new { message = "Cập nhật avatar thành công!", avatarUrl });
        }

//         [HttpPost("update-profile")]
// public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateProfileDto)
// {
//     try
//     {
//         // Lấy userId từ token (giả định bạn đã thiết lập middleware xác thực JWT)
//         var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//         if (string.IsNullOrEmpty(userId))
//         {
//             return Unauthorized(new { message = "Không thể xác thực người dùng!" });
//         }

//         var user = await _userManager.FindByIdAsync(userId);
//         if (user == null)
//         {
//             return NotFound(new { message = "Người dùng không tồn tại!" });
//         }

//         // Cập nhật thông tin user
//         user.UserName = updateProfileDto.UserName;
//         user.Age = updateProfileDto.Age;
//         user.Gender = updateProfileDto.Gender;
//         user.Location = updateProfileDto.Location;

//         var result = await _userManager.UpdateAsync(user);
//         if (!result.Succeeded)
//         {
//             var errors = string.Join(", ", result.Errors.Select(e => e.Description));
//             return BadRequest(new { message = $"Cập nhật hồ sơ thất bại: {errors}" });
//         }

//         return Ok(new { message = "Cập nhật hồ sơ thành công!" });
//     }
//     catch (Exception ex)
//     {
//         return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật hồ sơ!", error = ex.Message });
//     }
// }
//         public class UpdateProfileDto
// {
//     public string? UserName { get; set; }
//     public int Age { get; set; }
//     public string? Gender { get; set; }
//     public string? Location { get; set; }
// }

        public class LoginDto
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class RegisterDto
        {
            public string UserName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public int Age { get; set; }
            public string Gender { get; set; } = string.Empty;
            public string? Avatar { get; set; }
            public string Location { get; set; } = string.Empty;
        }

        public class CreateAdminDto
        {
            public string UserName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public int Age { get; set; }
            public string Gender { get; set; } = string.Empty;
            public string? Avatar { get; set; }
            public string Location { get; set; } = string.Empty;
        }
    }
}