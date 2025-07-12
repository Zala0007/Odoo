import User from "../models/User.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.userId, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};