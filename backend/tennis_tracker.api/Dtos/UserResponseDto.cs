namespace tennis_tracker.api.Dtos
{
    /// <summary>
    /// Data transfer object for user response after registration or login.
    /// Includes user details and JWT authentication token.
    /// </summary>
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string NtrpLevel { get; set; }
        public string Location { get; set; }
        public string Token { get; set; }
    }
}
