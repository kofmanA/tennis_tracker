namespace tennis_tracker.api.Dtos.Sessions
{
    /// <summary>
    /// Data transfer object for session response.
    /// </summary>
    public class SessionResponseDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public int DurationMinutes { get; set; }
        public string Location { get; set; }
        public int PartnerUserId { get; set; }
        public string PartnerUsername { get; set; }
        public string Notes { get; set; }
    }

}
