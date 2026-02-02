const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, token failed",
          code: "TOKEN_INVALID",
        });
      }

      // Check if it's an access token (not refresh token)
      if (decoded.type !== "access") {
        return res.status(401).json({
          success: false,
          message: "Invalid token type. Please use an access token.",
          code: "INVALID_TOKEN_TYPE",
        });
      }

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      next();
    } catch (error) {
      // Check if error is due to token expiration
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access token expired. Please refresh your token.",
          code: "TOKEN_EXPIRED",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
        code: "TOKEN_INVALID",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
      code: "NO_TOKEN",
    });
  }
};

module.exports = { protect };
