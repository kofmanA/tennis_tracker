using Microsoft.AspNetCore.Mvc;
using tennis_tracker.api.Dtos;
using tennis_tracker.api.Services;

namespace tennis_tracker.api.Controllers
{
    /// <summary>
    /// API controller for user authentication and registration.
    /// </summary>
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Register a new user account.
        /// </summary>
        /// <param name="dto">Registration details</param>
        /// <returns>User details with JWT token</returns>
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterUserDto dto)
        {
            try
            {
                var result = await _authService.RegisterAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Authenticate a user and receive a JWT token.
        /// </summary>
        /// <param name="dto">Login credentials</param>
        /// <returns>User details with JWT token</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }
    }
}

