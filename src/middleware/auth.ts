import { Request, Response, NextFunction } from "express";
import { UserService } from "../service/userService";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        secret_key: string;
        created_at: Date;
        updated_at: Date;
      };
    }
  }
}

/**
 * Authentication middleware that validates X-Secret-Key header
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const secretKey = req.headers["x-secret-key"] as string;

    if (!secretKey) {
      res.status(401).json({
        error: "Authentication required",
        message: "X-Secret-Key header is missing",
      });
      return;
    }

    // Find user by secret key
    const user = await UserService.findBySecretKey(secretKey);

    if (!user) {
      res.status(401).json({
        error: "Authentication failed",
        message: "Invalid secret key",
      });
      return;
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Authentication service unavailable",
    });
  }
};
