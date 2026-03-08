namespace tennis_tracker.api.Dtos.Sessions
{
    /// <summary>
    /// Data transfer object for creating a new tennis session.
    /// </summary>
    public class CreateSessionDto
    {
        public DateTime Date { get; set; }
        public int DurationMinutes { get; set; }
        public string Location { get; set; }
        public string PartnerUsername { get; set; }
        public string Notes { get; set; }
    }

}
