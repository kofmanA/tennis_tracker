using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using tennis_tracker.api.Dtos.Sessions;
using tennis_tracker.api.Services;

namespace tennis_tracker.api.Controllers
{
    /// <summary>
    /// API controller for managing tennis sessions.
    /// Requires JWT authentication for all endpoints.
    /// </summary>
    [ApiController]
    [Route("sessions")]
    [Authorize] // All endpoints require JWT authentication
    public class SessionController : ControllerBase
    {
        private readonly SessionService _sessionService;

        public SessionController(SessionService sessionService)
        {
            _sessionService = sessionService;
        }

        /// <summary>
        /// Get all sessions for the authenticated user.
        /// </summary>
        /// <returns>List of user's tennis sessions</returns>
        [HttpGet]
        public async Task<IActionResult> GetSessions()
        {
            var userId = GetCurrentUserId();
            var sessions = await _sessionService.GetSessionsAsync(userId);
            return Ok(sessions);
        }

        /// <summary>
        /// Search partner usernames for autocomplete.
        /// </summary>
        /// <param name="query">Search text</param>
        /// <returns>Matching usernames</returns>
        [HttpGet("partners")]
        public async Task<IActionResult> SearchPartners([FromQuery] string query = "")
        {
            var userId = GetCurrentUserId();
            var usernames = await _sessionService.SearchPartnerUsernamesAsync(userId, query);
            return Ok(usernames);
        }

        /// <summary>
        /// Get a specific session by ID.
        /// </summary>
        /// <param name="id">Session ID</param>
        /// <returns>Session details</returns>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetSession(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var session = await _sessionService.GetSessionByIdAsync(id, userId);
                
                if (session == null)
                    return NotFound(new { error = "Session not found or you don't have permission to view it" });
                
                return Ok(session);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new tennis session.
        /// </summary>
        /// <param name="dto">Session details</param>
        /// <returns>Created session</returns>
        [HttpPost]
        public async Task<IActionResult> CreateSession(CreateSessionDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var session = await _sessionService.CreateSessionAsync(userId, dto);
                return CreatedAtAction(nameof(GetSession), new { id = session.Id }, session);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing session.
        /// </summary>
        /// <param name="id">Session ID to update</param>
        /// <param name="dto">Updated session details</param>
        /// <returns>Updated session</returns>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateSession(int id, CreateSessionDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var session = await _sessionService.UpdateSessionAsync(id, userId, dto);
                return Ok(session);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a session.
        /// </summary>
        /// <param name="id">Session ID to delete</param>
        /// <returns>No content on success</returns>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteSession(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _sessionService.DeleteSessionAsync(id, userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get total hours played by the authenticated user.
        /// </summary>
        /// <returns>Total hours as a decimal</returns>
        [HttpGet("stats/total-hours")]
        public async Task<IActionResult> GetTotalHours()
        {
            var userId = GetCurrentUserId();
            var totalHours = await _sessionService.GetTotalHoursAsync(userId);
            return Ok(new { totalHours });
        }

        /// <summary>
        /// Helper method to extract user ID from JWT claims.
        /// </summary>
        /// <returns>Current user's ID</returns>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }
    }
}
