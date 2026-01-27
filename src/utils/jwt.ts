export interface AuthTokenPayload {
  id: string;
  email: string;
  roles: string[];
}

// Example: fake token signing
// Format: token_<id>_<email>_<roles_comma_separated>
export const signToken = (payload: AuthTokenPayload): string => {
  // In a real implementation, this would use jsonwebtoken library
  // For now, encoding roles in the token string
  const rolesStr = payload.roles.join(',');
  return `token_${payload.id}_${payload.email}_${rolesStr}`;
};

// Example: fake token verification
export const verifyToken = (token: string): AuthTokenPayload | null => {
  if (token === "valid" || token.startsWith("token_")) {
    // Extract payload from token (simplified)
    if (token.startsWith("token_")) {
      const parts = token.split("_");
      const id = parts[1] || "1";
      const email = parts[2] || "user@example.com";
      // Roles are in parts[3] (comma-separated) or default to ['user']
      const roles = parts[3] ? parts[3].split(',') : ['user'];
      return { 
        id, 
        email, 
        roles
      };
    }
    return { id: "1", email: "user@example.com", roles: ["user"] };
  }
  return null;
};
