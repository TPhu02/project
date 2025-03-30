using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using backend.Data;
using System.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Diagnostics;

[Route("api/[controller]")]
[ApiController]
public class SportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SportsController(AppDbContext context)
    {
        _context = context;
    }

    // API lấy danh sách môn thể thao
    [HttpGet]
    public async Task<IActionResult> GetSports()
    {
        var sports = await _context.Sports.ToListAsync();
        if (sports == null || sports.Count == 0)
            return NotFound("Không có môn thể thao nào!");

        return Ok(sports);
    }
}
