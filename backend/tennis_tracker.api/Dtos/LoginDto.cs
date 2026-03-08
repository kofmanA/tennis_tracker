namespace tennis_tracker.api.Dtos
{
    /// <summary>
    /// Data transfer object for user login requests.
    /// </summary>
    public class LoginDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
