using Microsoft.EntityFrameworkCore;
using backend.Data;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5084");

// 🔹 Cấu hình CORS
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
    policy =>
    {
        policy.WithOrigins(
            "http://localhost:5084",
            "http://localhost:19000",
            "http://localhost:8081",
            "http://192.168.1.4:5084" // Thêm origin của frontend
        )
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 🔹 Cấu hình SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .EnableSensitiveDataLogging()
           .EnableDetailedErrors());

// 🔹 Thêm Controllers
builder.Services.AddControllers();

// 🔹 Thêm Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SportLink API",
        Version = "v1",
        Description = "API cho ứng dụng tìm bạn chơi thể thao",
        Contact = new OpenApiContact
        {
            Name = "SportLink Team",
            Email = "support@sportlink.com"
        }
    });
    
    // Thêm xác thực vào Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập 'Bearer <token>'"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// 🔹 Thêm xác thực JWT
var secretKey = builder.Configuration["JwtSettings:SecretKey"];
if (string.IsNullOrEmpty(secretKey))
{
    throw new Exception("SecretKey không được tìm thấy trong appsettings.json");
}
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            NameClaimType = "nameid",
            RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                if (!string.IsNullOrEmpty(token))
                {
                    context.Token = token;
                    Console.WriteLine($"Token received: {token}");
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                return context.Response.WriteAsync("{\"message\":\"Token không hợp lệ!\"}");
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("Token validated successfully!");
                var claims = context.Principal?.Claims;
                if (claims != null)
                {
                    Console.WriteLine("Claims in token:");
                    foreach (var claim in claims)
                    {
                        Console.WriteLine($"Claim Type: {claim.Type}, Value: {claim.Value}");
                    }
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// 🔹 Đăng ký middleware & khởi động ứng dụng
var app = builder.Build();

// 🔹 Middleware xử lý lỗi toàn cục
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (error != null)
        {
            var exception = error.Error;
            Console.WriteLine($"❌ Lỗi server: {exception.Message}\nStackTrace: {exception.StackTrace}");
            await context.Response.WriteAsync("{\"message\":\"Lỗi server, vui lòng thử lại sau.\"}");
        }
        else
        {
            await context.Response.WriteAsync("{\"message\":\"Lỗi server không xác định.\"}");
        }
    });
});

// 🔹 Middleware fix lỗi JSON.parse() khi trả về 204 No Content
app.Use(async (context, next) =>
{
    await next();
    if (context.Response.StatusCode == 204)
    {
        context.Response.ContentLength = 0;
    }
});

// 🔹 Cấu hình middleware
app.UseRouting();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthentication();
app.UseAuthorization();

// 🔹 Bật Swagger cho mọi môi trường
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SportLink API v1");
    c.RoutePrefix = "swagger";
});

// 🔹 Cấu hình Static File để phục vụ ảnh từ thư mục avatars
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "avatars")),
    RequestPath = "/avatars"
});

// 🔹 Thiết lập route
app.MapControllers();

app.Run();