using Microsoft.EntityFrameworkCore;
using tennis_tracker.api.Data;
using tennis_tracker.api.Models;

namespace tennis_tracker.api.Repositories
{
    /// <summary>
    /// Repository for managing User entity database operations.
    /// </summary>
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves a user by their username.
        /// </summary>
        /// <param name="username">Username to search for</param>
        /// <returns>User entity or null if not found</returns>
        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }


        /// <summary>
        /// Creates a new user in the database.
        /// </summary>
        /// <param name="user">User entity to create</param>
        public async Task CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Deletes a user in the database.
        /// </summary>
        /// <param name="id">ID of user entity to remove</param>
        //public async Task DeleteAsync(int id)
        //{
        //    _context.Users.Remove(Users.);

        //}
    }
}

