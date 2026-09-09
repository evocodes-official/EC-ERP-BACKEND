const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/jwt");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (userId) => {
  if (!config.JWT_REFRESH_SECRET) return null;
  return jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      company: company || "",
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    if (refreshToken) {
      user.refreshToken = refreshToken;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      refreshToken,
      user,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// @desc    Login user with email and password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    if (refreshToken) {
      user.refreshToken = refreshToken;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// @desc    Get current logged-in user (protected)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    if (!config.JWT_REFRESH_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Refresh token not configured",
      });
    }

    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error during token refresh",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+refreshToken");
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error during logout",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// @desc    Google OAuth callback placeholder
// @route   GET /api/auth/google/callback
// @access  Public (Google OAuth redirect)
const googleCallback = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }

  const token = generateToken(req.user._id);
  const refreshToken = generateRefreshToken(req.user._id);

  if (refreshToken) {
    req.user.refreshToken = refreshToken;
    await req.user.save();
  }

  if (req.query.redirect) {
    return res.redirect(
      `${config.FRONTEND_URL}?token=${token}&auth=google`
    );
  }

  res.status(200).json({
    success: true,
    message: "Google authentication successful",
    token,
    refreshToken,
    user: req.user,
  });
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  googleCallback,
};