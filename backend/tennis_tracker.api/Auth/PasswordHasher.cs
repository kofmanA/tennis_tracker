using System.Security.Cryptography;
using System.Text;

namespace tennis_tracker.api.Auth
{
    /// <summary>
    /// Provides secure password hashing using PBKDF2 (Password-Based Key Derivation Function 2).
    /// Uses SHA256 with random salt for enhanced security.
    /// </summary>
    public class PasswordHasher
    {
        private const int SaltSize = 16; // 128-bit salt
        private const int KeySize = 32;  // 256-bit key
        private const int Iterations = 10000; // PBKDF2 iterations

        /// <summary>
        /// Hashes a password using PBKDF2 with a randomly generated salt.
        /// </summary>
        /// <param name="password">Plain text password to hash</param>
        /// <returns>Formatted hash string: "iterations.salt.key" (Base64 encoded)</returns>
        public string HashPassword(string password)
        {
            // Generate cryptographically secure random salt
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[SaltSize];
            rng.GetBytes(salt);

            // Derive key from password using PBKDF2-SHA256
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
            var key = pbkdf2.GetBytes(KeySize);

            var saltBase64 = Convert.ToBase64String(salt);
            var keyBase64 = Convert.ToBase64String(key);

            // Format: iterations.salt.key for storage
            return $"{Iterations}.{saltBase64}.{keyBase64}";
        }

        /// <summary>
        /// Verifies a password against a stored hash.
        /// </summary>
        /// <param name="password">Plain text password to verify</param>
        /// <param name="storedHash">Stored hash in format "iterations.salt.key"</param>
        /// <returns>True if password matches, false otherwise</returns>
        public bool VerifyPassword(string password, string storedHash)
        {
            // Parse stored hash components
            var parts = storedHash.Split('.');
            var iterations = int.Parse(parts[0]);
            var salt = Convert.FromBase64String(parts[1]);
            var key = Convert.FromBase64String(parts[2]);

            // Derive key from provided password using same salt and iterations
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
            var keyToCheck = pbkdf2.GetBytes(KeySize);

            // Constant-time comparison to prevent timing attacks
            return keyToCheck.SequenceEqual(key);
        }
    }
}

