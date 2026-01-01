import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  try {
    console.log(`🔐 Auth check @ ${req.method} ${req.path}`);

    let token = null;

    // 1️⃣ Authorization header first
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("➡️ Token from Authorization header");
    }

    // 2️⃣ Cookie fallback
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
      console.log("➡️ Token from Cookie");
    }

    if (!token) {
      console.log("❌ No token found");
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    // 3️⃣ Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(`✅ Authenticated: ${decoded.email} | Role: ${decoded.role}`);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.name, error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please sign in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please sign in again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal authentication error",
    });
  }
};

// Admin role guard
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    console.log("🚫 Admin access denied");
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  console.log("🛡 Admin access granted");
  next();
};
