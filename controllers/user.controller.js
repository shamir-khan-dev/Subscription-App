import User from "../models/user.model.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};
