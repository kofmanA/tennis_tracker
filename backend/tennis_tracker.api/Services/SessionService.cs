using Microsoft.EntityFrameworkCore;
using tennis_tracker.api.Data;
using tennis_tracker.api.Dtos.Sessions;
using tennis_tracker.api.Models;
using tennis_tracker.api.Repositories;

namespace tennis_tracker.api.Services
{
    /// <summary>
    /// Service for managing tennis practice sessions.
    /// Handles session creation, retrieval, updates, and deletion.
    /// </summary>
    public class SessionService
    {
        private readonly AppDbContext _db;
        private readonly IUserRepository _userRepo;

        public SessionService(AppDbContext db, IUserRepository userRepo)
        {
            _db = db;
            _userRepo = userRepo;
        }

        /// <summary>
        /// Creates a new tennis session for the authenticated user.
        /// </summary>
        /// <param name="userId">ID of the user creating the session</param>
        /// <param name="dto">Session details</param>
        /// <returns>Created session details</returns>
        /// <exception cref="Exception">Thrown when partner user does not exist</exception>
        public async Task<SessionResponseDto> CreateSessionAsync(int userId, CreateSessionDto dto)
        {
            // Verify partner user exists
            var partner = await _userRepo.GetByUsernameAsync(dto.PartnerUsername);
            if (partner == null)
                throw new Exception("Partner user does not exist.");

            var session = new Session
            {
                UserId = userId,
                PartnerUserId = partner.Id,
                Date = dto.Date,
                DurationMinutes = dto.DurationMinutes,
                Location = dto.Location,
                Notes = dto.Notes
            };

            _db.Sessions.Add(session);
            await _db.SaveChangesAsync();

            return new SessionResponseDto
            {
                Id = session.Id,
                Date = session.Date,
                DurationMinutes = session.DurationMinutes,
                Location = session.Location,
                PartnerUserId = session.PartnerUserId,
                PartnerUsername = partner.Username,
                Notes = session.Notes
            };
        }

        /// <summary>
        /// Retrieves all sessions created by the specified user.
        /// </summary>
        /// <param name="userId">ID of the user whose sessions to retrieve</param>
        /// <returns>List of sessions ordered by date descending</returns>
        public async Task<List<SessionResponseDto>> GetSessionsAsync(int userId)
        {
            return await (
                from s in _db.Sessions
                join p in _db.Users on s.PartnerUserId equals p.Id
                where s.UserId == userId
                orderby s.Date descending
                select new SessionResponseDto
                {
                    Id = s.Id,
                    Date = s.Date,
                    DurationMinutes = s.DurationMinutes,
                    Location = s.Location,
                    PartnerUserId = s.PartnerUserId,
                    PartnerUsername = p.Username,
                    Notes = s.Notes
                })
                .ToListAsync();
        }

        /// <summary>
        /// Searches partner usernames for autocomplete.
        /// </summary>
        /// <param name="userId">Current authenticated user ID</param>
        /// <param name="query">Search text</param>
        /// <returns>Matching usernames</returns>
        public async Task<List<string>> SearchPartnerUsernamesAsync(int userId, string query)
        {
            var normalizedQuery = query.Trim();

            if (string.IsNullOrWhiteSpace(normalizedQuery))
                return new List<string>();

            return await _db.Users
                .Where(u => u.Id != userId && u.Username.Contains(normalizedQuery))
                .OrderBy(u => u.Username)
                .Select(u => u.Username)
                .Take(10)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a specific session by ID.
        /// </summary>
        /// <param name="sessionId">Session ID</param>
        /// <param name="userId">User ID to verify ownership</param>
        /// <returns>Session details or null if not found</returns>
        public async Task<SessionResponseDto?> GetSessionByIdAsync(int sessionId, int userId)
        {
            var session = await (
                from s in _db.Sessions
                join p in _db.Users on s.PartnerUserId equals p.Id
                where s.Id == sessionId && s.UserId == userId
                select new SessionResponseDto
                {
                    Id = s.Id,
                    Date = s.Date,
                    DurationMinutes = s.DurationMinutes,
                    Location = s.Location,
                    PartnerUserId = s.PartnerUserId,
                    PartnerUsername = p.Username,
                    Notes = s.Notes
                })
                .FirstOrDefaultAsync();

            return session;
        }

        /// <summary>
        /// Updates an existing session.
        /// </summary>
        /// <param name="sessionId">Session ID to update</param>
        /// <param name="userId">User ID to verify ownership</param>
        /// <param name="dto">Updated session details</param>
        /// <returns>Updated session details</returns>
        /// <exception cref="Exception">Thrown when session not found or partner doesn't exist</exception>
        public async Task<SessionResponseDto> UpdateSessionAsync(int sessionId, int userId, CreateSessionDto dto)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null)
                throw new Exception("Session not found or you don't have permission to update it.");

            // Verify partner user exists
            var partner = await _userRepo.GetByUsernameAsync(dto.PartnerUsername);
            if (partner == null)
                throw new Exception("Partner user does not exist.");

            // Update session properties
            session.PartnerUserId = partner.Id;
            session.Date = dto.Date;
            session.DurationMinutes = dto.DurationMinutes;
            session.Location = dto.Location;
            session.Notes = dto.Notes;

            await _db.SaveChangesAsync();

            return new SessionResponseDto
            {
                Id = session.Id,
                Date = session.Date,
                DurationMinutes = session.DurationMinutes,
                Location = session.Location,
                PartnerUserId = session.PartnerUserId,
                PartnerUsername = partner.Username,
                Notes = session.Notes
            };
        }

        /// <summary>
        /// Deletes a session.
        /// </summary>
        /// <param name="sessionId">Session ID to delete</param>
        /// <param name="userId">User ID to verify ownership</param>
        /// <exception cref="Exception">Thrown when session not found</exception>
        public async Task DeleteSessionAsync(int sessionId, int userId)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null)
                throw new Exception("Session not found or you don't have permission to delete it.");

            _db.Sessions.Remove(session);
            await _db.SaveChangesAsync();
        }

        /// <summary>
        /// Gets total hours played by the user.
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Total hours played as a decimal</returns>
        public async Task<double> GetTotalHoursAsync(int userId)
        {
            var totalMinutes = await _db.Sessions
                .Where(s => s.UserId == userId)
                .SumAsync(s => s.DurationMinutes);

            return totalMinutes / 60.0;
        }
    }
}

