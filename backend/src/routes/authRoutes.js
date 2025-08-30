import express from "express";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 30
  ) {
    return res.status(400).json({ message: "Invalid username" });
  }

  if (
    !email ||
    typeof email !== "string" ||
    !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ) {
    return res.status(400).json({ message: "Invalid email" });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Invalid password" });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already in use" });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = signToken({
      id: user._id,
      username: user.username,
      email: user.email,
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (
    !email ||
    typeof email !== "string" ||
    !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ) {
    return res.status(400).json({ message: "Invalid email" });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Invalid password" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      id: user._id,
      username: user.username,
      email: user.email,
    });

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
