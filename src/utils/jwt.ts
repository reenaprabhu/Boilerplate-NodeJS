export interface AuthTokenPayload {
  id: string;
  email: string;
  roles: string[];
}

// Example: fake token signing
export const signToken = (payload: AuthTokenPayload): string => {
  // In a real implementation, this would use jsonwebtoken library
  // For now, returning a simple token
  return `token_${payload.id}_${payload.email}`;
};

// Example: fake token verification
export const verifyToken = (token: string): AuthTokenPayload | null => {
  if (token === "valid" || token.startsWith("token_")) {
    // Extract payload from token (simplified)
    if (token.startsWith("token_")) {
      const parts = token.split("_");
      return { 
        id: parts[1] || "1", 
        email: parts[2] || "user@example.com", 
        roles: ["admin"] 
      };
    }
    return { id: "1", email: "user@example.com", roles: ["admin"] };
  }
  return null;
};
