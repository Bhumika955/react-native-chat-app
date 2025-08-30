import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, __v: 0 }).sort({
      username: 1,
    });
    res.json(users);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
