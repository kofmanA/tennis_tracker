namespace tennis_tracker.api.Models
{
    /// <summary>
    /// Represents a tennis player user in the system.
    /// </summary>
    public class User
    {
        /// <summary>
        /// Unique identifier for the user.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Unique username for login.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// PBKDF2 hashed password with salt.
        /// </summary>
        public string PasswordHash { get; set; }

        /// <summary>
        /// NTRP (National Tennis Rating Program) skill level (e.g., "3.5", "4.0").
        /// </summary>
        public string NtrpLevel { get; set; }

        /// <summary>
        /// Geographic location of the player.
        /// </summary>
        public string Location { get; set; }
    }
}
