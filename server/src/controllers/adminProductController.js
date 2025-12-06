const cloudinary = require("../config/cloudinary");

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "shopnexus/products",
        resource_type: "image",
        transformation: [
          {
            width: 800,
            height: 800,
            crop: "limit",
          },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },

      (error, result) => {
        if (error) {
          return res.status(500).json({
            message: "Cloudinary upload failed",
            error: error.message,
          });
        }

        return res.status(200).json({
          imageUrl: result.secure_url,
          publicId: result.public_id, // useful for delete later
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    return res.status(500).json({
      message: "Image upload error",
      error: err.message,
    });
  }
};

module.exports = {
  uploadProductImage,
};
