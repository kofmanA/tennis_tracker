namespace tennis_tracker.api.Auth
{
    public interface ITokenService
    {
        string CreateToken(int userId, string username);
    }
}
