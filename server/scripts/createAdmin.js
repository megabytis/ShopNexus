const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  cart: Array,
});

const User = mongoose.model("user", userSchema);

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    console.log("Connected to database");

    // Check if admin already exists
    const adminExists = await User.findOne({ role: "admin" });
    
    if (adminExists) {
      console.log("\n✅ Admin user already exists:");
      console.log("   Email:", adminExists.email);
      console.log("   Name:", adminExists.name);
      console.log("\nUse this email to login to the admin panel.");
      process.exit(0);
    }

    // Create new admin user
    const adminEmail = "admin@shopnexus.com";
    const adminPassword = "Admin@123"; // Change this to a secure password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = new User({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      cart: [],
    });

    await admin.save();

    console.log("\n✅ Admin user created successfully!");
    console.log("\n📧 Login Credentials:");
    console.log("   Email:", adminEmail);
    console.log("   Password:", adminPassword);
    console.log("\n🔐 Please change the password after first login!");
    console.log("\n🌐 Access admin panel at: http://localhost:5173/admin/login");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createAdminUser();
