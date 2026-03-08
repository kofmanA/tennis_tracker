using tennis_tracker.api.Auth;
using tennis_tracker.api.Dtos;
using tennis_tracker.api.Models;
using tennis_tracker.api.Repositories;

namespace tennis_tracker.api.Services
{
    /// <summary>
    /// Service responsible for user authentication and registration operations.
    /// Handles user registration, login, password hashing, and JWT token generation.
    /// </summary>
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly PasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;

        public AuthService(
            IUserRepository userRepository,
            PasswordHasher passwordHasher,
            ITokenService tokenService)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }

        /// <summary>
        /// Registers a new user account with hashed password and generates a JWT token.
        /// </summary>
        /// <param name="dto">Registration details including username, password, NTRP level, and location</param>
        /// <returns>User response with ID, username, NTRP level, location, and authentication token</returns>
        /// <exception cref="Exception">Thrown when username already exists</exception>
        public async Task<UserResponseDto> RegisterAsync(RegisterUserDto dto)
        {
            // Check if username is already taken
            var existingUser = await _userRepository.GetByUsernameAsync(dto.Username);
            if (existingUser != null)
                throw new Exception("Username already exists.");

            // Hash the password using PBKDF2 with salt
            var hashedPassword = _passwordHasher.HashPassword(dto.Password);

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = hashedPassword,
                NtrpLevel = dto.NtrpLevel,
                Location = dto.Location
            };

            await _userRepository.CreateAsync(user);

            // Generate JWT token for immediate authentication
            var token = _tokenService.CreateToken(user.Id, user.Username);

            return new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                NtrpLevel = user.NtrpLevel,
                Location = user.Location,
                Token = token
            };
        }

        /// <summary>
        /// Authenticates a user with username and password, returning a JWT token.
        /// </summary>
        /// <param name="dto">Login credentials (username and password)</param>
        /// <returns>User response with authentication token</returns>
        /// <exception cref="Exception">Thrown when credentials are invalid</exception>
        public async Task<UserResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByUsernameAsync(dto.Username);
            if (user == null)
                throw new Exception("Invalid username or password.");

            // Verify password against stored hash
            var isValid = _passwordHasher.VerifyPassword(dto.Password, user.PasswordHash);
            if (!isValid)
                throw new Exception("Invalid username or password.");

            // Generate new JWT token for this session
            var token = _tokenService.CreateToken(user.Id, user.Username);

            return new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                NtrpLevel = user.NtrpLevel,
                Location = user.Location,
                Token = token
            };
        }
    }
}
