import cloudinary from '../config/cloudinary.js';  // Cloudinary config
import User from '../models/User.js'; // User model
import fs from 'fs'; // To remove file after uploading to Cloudinary

export const updateUserProfile = async (req, res) => {
  const userId = req.user.userId;
  let profileImageUrl = null;

  try {
    // If a file is uploaded
    if (req.file) {
      // Upload the image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads/profileImages", // Optional: Organize images in Cloudinary
        use_filename: true,
        unique_filename: false,
      });

      // Get the URL of the uploaded image
      profileImageUrl = result.secure_url;

      // Remove the uploaded file from the server after upload
      fs.unlinkSync(req.file.path);
    }

    // Update the user's profile image in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: profileImageUrl }, // Update only the profile image URL
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};
