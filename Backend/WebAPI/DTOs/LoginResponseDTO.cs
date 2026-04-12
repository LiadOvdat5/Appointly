using System;

namespace WebAPI.DTOs
{
    public class LoginResponseDTO
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserDTO? User { get; set; }

        // Raw refresh token — set in HttpOnly cookie by the controller, never sent in response body
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime RefreshTokenExpiry { get; set; }
    }
}
