namespace tennis_tracker.api.Dtos
{
    /// <summary>
    /// Data transfer object for user registration requests.
    /// </summary>
    public class RegisterUserDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string NtrpLevel { get; set; }
        public string Location { get; set; }
    }
}
