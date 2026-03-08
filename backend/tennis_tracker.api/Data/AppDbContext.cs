using Microsoft.EntityFrameworkCore;
using tennis_tracker.api.Models;

namespace tennis_tracker.api.Data
{
    /// <summary>
    /// Entity Framework Core database context for the Tennis Tracker application.
    /// Manages User and Session entities.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// Users (tennis players) in the system.
        /// </summary>
        public DbSet<User> Users { get; set; }

        /// <summary>
        /// Tennis practice/play sessions between users.
        /// </summary>
        public DbSet<Session> Sessions { get; set; }

    }
}
