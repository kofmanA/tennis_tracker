using tennis_tracker.api.Models;

namespace tennis_tracker.api.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetUserByIdAsync(int id);

        Task CreateAsync(User user);
    }
}
