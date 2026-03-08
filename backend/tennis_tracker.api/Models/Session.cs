namespace tennis_tracker.api.Models
{
    /// <summary>
    /// Represents a tennis practice or play session between two users.
    /// </summary>
    public class Session
    {
        /// <summary>
        /// Unique identifier for the session.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ID of the user who created/logged the session.
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// ID of the partner/opponent user in the session.
        /// </summary>
        public int PartnerUserId { get; set; }

        /// <summary>
        /// Date and time when the session took place.
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Duration of the session in minutes.
        /// </summary>
        public int DurationMinutes { get; set; }

        /// <summary>
        /// Location where the session took place (e.g., court name, club).
        /// </summary>
        public string Location { get; set; }

        /// <summary>
        /// Optional notes about the session (e.g., drills practiced, scores).
        /// </summary>
        public string Notes { get; set; }

        public User User { get; set; }
        public User PartnerUser { get; set; }
    }

}
