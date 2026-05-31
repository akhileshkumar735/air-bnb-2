const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email.js");

const JWT_SECRET = process.env.JWT_SECRET || "antigravity_secret_access_key_123";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "antigravity_secret_refresh_key_123";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// 1. Signup Handler
module.exports.signupHandler = async (req, res, next) => {
  const { username, email, password, avatar } = req.body;
  
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const newUser = new User({ 
      email, 
      username,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      verificationToken,
      verificationTokenExpires
    });

    const registeredUser = await User.register(newUser, password);

    // Send verification email
    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
    const emailOptions = {
      email: registeredUser.email,
      subject: "Verify your AntiGravity Account",
      message: `Hi ${registeredUser.username},\n\nPlease verify your account by clicking the link: ${verificationUrl}`,
      html: `
        <h3>Welcome to AntiGravity!</h3>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="display:inline-block;padding:10px 20px;background-color:#ff385c;color:white;text-decoration:none;border-radius:5px;">Verify Email</a>
      `
    };
    
    await sendEmail(emailOptions);

    const accessToken = generateAccessToken(registeredUser);
    const refreshToken = generateRefreshToken(registeredUser);

    registeredUser.refreshToken = refreshToken;
    await registeredUser.save();

    // Set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      token: accessToken,
      user: {
        id: registeredUser._id,
        username: registeredUser.username,
        email: registeredUser.email,
        role: registeredUser.role,
        avatar: registeredUser.avatar,
        wishlist: registeredUser.wishlist
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 2. Login Handler
module.exports.loginHandler = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    let userObj = await User.findOne({ email });
    if (!userObj) {
      // Fallback: check if they entered username instead
      userObj = await User.findOne({ username: email });
    }

    if (!userObj) {
      return res.status(401).json({ message: "Invalid email/username or password." });
    }

    const authResult = await User.authenticate()(userObj.username, password);
    if (!authResult.user) {
      return res.status(401).json({ message: "Invalid email/username or password." });
    }

    const activeUser = authResult.user;
    const accessToken = generateAccessToken(activeUser);
    const refreshToken = generateRefreshToken(activeUser);

    activeUser.refreshToken = refreshToken;
    await activeUser.save();

    // Set refresh token in secure cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: "Log in successful.",
      token: accessToken,
      user: {
        id: activeUser._id,
        username: activeUser.username,
        email: activeUser.email,
        role: activeUser.role,
        avatar: activeUser.avatar,
        wishlist: activeUser.wishlist
      }
    });
  } catch (err) {
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

// 3. Refresh Token Handler
module.exports.refreshTokenHandler = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is missing." });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid or expired session." });
    }

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired session." });
  }
};

// 4. Email Verification Handler
module.exports.verifyEmailHandler = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or has expired." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email address verified successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Password Reset Request (Forgot Password)
module.exports.forgotPasswordHandler = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const emailOptions = {
      email: user.email,
      subject: "Reset your AntiGravity Password",
      message: `Hi ${user.username},\n\nPlease reset your password by clicking the link: ${resetUrl}`,
      html: `
        <h3>Reset Password Request</h3>
        <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#ff385c;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
      `
    };

    await sendEmail(emailOptions);
    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Reset Password Handler
module.exports.resetPasswordHandler = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    // Set new password (passport local mongoose static helper handles hashing)
    await user.setPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully! You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7. Get user profile
module.exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 8. Update user profile
module.exports.updateProfile = async (req, res) => {
  const { username, avatar } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (username) user.username = username;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    res.status(200).json({ message: "Profile updated successfully.", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 9. Toggle Wishlist Item
module.exports.toggleWishlist = async (req, res) => {
  const { id: listingId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const index = user.wishlist.indexOf(listingId);
    if (index === -1) {
      user.wishlist.push(listingId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    // Populate listings inside updated wishlist
    const updatedUser = await User.findById(user._id).populate("wishlist");
    res.status(200).json({ wishlist: updatedUser.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 10. Logout Handler
module.exports.logout = async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
  } catch (err) {
    console.error("Token database deletion failed:", err.message);
  } finally {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Log out successful." });
  }
};

// 11. Google Login Handler
module.exports.googleLoginHandler = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: "Google ID Token is missing." });
  }

  try {
    let email, name, picture, email_verified;

    // Check for developer bypass token to ease local verification without OAuth credentials
    if (idToken === "google_oauth_bypass_token" || idToken.startsWith("google_oauth_bypass_token")) {
      email = "sakhileshkumar078@gmail.com";
      name = "Akhilesh Kumar";
      picture = "https://api.dicebear.com/7.x/avataaars/svg?seed=Akhilesh";
      email_verified = true;
    } else {
      // 1. Verify Google token via Google API tokeninfo
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!verifyRes.ok) {
        return res.status(400).json({ message: "Google ID Token verification failed." });
      }

      const payload = await verifyRes.json();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      email_verified = payload.email_verified;
    }
    
    if (!email_verified) {
      return res.status(400).json({ message: "Google email is not verified." });
    }

    // 2. Find or Create User
    let activeUser = await User.findOne({ email });

    if (!activeUser) {
      // Create user
      // Clean username from spaces
      let cleanUsername = name.replace(/\s+/g, "_").toLowerCase();
      // Ensure unique username
      let usernameExists = await User.findOne({ username: cleanUsername });
      if (usernameExists) {
        cleanUsername = `${cleanUsername}_${crypto.randomBytes(3).toString("hex")}`;
      }

      const randomPassword = crypto.randomBytes(24).toString("hex");

      const newUser = new User({
        email,
        username: cleanUsername,
        avatar: picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
        isVerified: true // verified via Google
      });

      activeUser = await User.register(newUser, randomPassword);
    }

    // 3. Log user in by issuing token
    const accessToken = generateAccessToken(activeUser);
    const refreshToken = generateRefreshToken(activeUser);

    activeUser.refreshToken = refreshToken;
    await activeUser.save();

    // Set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: "Google log in successful.",
      token: accessToken,
      user: {
        id: activeUser._id,
        username: activeUser.username,
        email: activeUser.email,
        role: activeUser.role,
        avatar: activeUser.avatar,
        wishlist: activeUser.wishlist
      }
    });

  } catch (err) {
    console.error("Google authentication failed:", err.message);
    res.status(500).json({ message: "Google authentication failed. Please try again." });
  }
};

