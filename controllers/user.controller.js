import User from "../models/user.model.js";

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
