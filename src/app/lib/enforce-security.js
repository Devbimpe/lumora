import jwt from 'jsonwebtoken';

// Security Helper for authenticating Server API Routes natively via JWT
export class SecurityHelper {
  
  static extractToken(request) {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});

    return cookies["auth-token"] || null;
  }

  static verifyToken(request) {
    const token = this.extractToken(request);
    if (!token) return { valid: false, error: "No authentication cookie found." };

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { valid: true, user: decoded };
    } catch (error) {
      return { valid: false, error: "Invalid or expired authentication token." };
    }
  }

  // Ensures the requesting user is an Admin
  static async verifyAdmin(request) {
    const session = this.verifyToken(request);
    if (!session.valid) return session;

    if (session.user.role !== 'Admin') {
      return { valid: false, error: "Insufficient permissions. Admin access required." };
    }

    return session;
  }

  // Ensures exactly matching ownership OR Admin status
  static async verifyOwnership(request, targetUserId) {
    const session = this.verifyToken(request);
    if (!session.valid) return session;

    if (session.user.role === 'Admin') return session; // Admins bypass ownership check

    // Normalize IDs to strings because route params/query values are strings.
    const requestedId = String(targetUserId);
    const tokenUserId = session.user.userId != null ? String(session.user.userId) : null;
    const tokenFirebaseUid = session.user.firebaseUid != null ? String(session.user.firebaseUid) : null;

    if (tokenUserId !== requestedId && tokenFirebaseUid !== requestedId) {
      return { valid: false, error: "Unauthorized operation on target user." };
    }

    return session;
  }
}
