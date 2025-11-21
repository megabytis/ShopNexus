// seed-prod.js
const path = require("path");
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

// Import models - adjusting paths since this script is in server root
const { productModel } = require("./src/models/product");
const { userModel } = require("./src/models/user");
const { categoriesModel } = require("./src/models/category");

// Hardcoded connection string for production seeding
// This connects to YOUR MongoDB Atlas cluster (same as Render)
const MONGO_URI = "mongodb+srv://shopNexus:Y5pUFcP4Tessjkfe@shopnexus.1zewbn1.mongodb.net/shopDB?retryWrites=true&w=majority&appName=ShopNexus";

// ---------------- CONNECT DB ------------------
async function connectDB() {
    try {
        console.log("⏳ Connecting to Production MongoDB...");
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("🔥 Connected to Production MongoDB!");
    } catch (err) {
        console.error("❌ DB Connection Error:", err);
        process.exit(1);
    }
}

// ---------------- CLEAR OLD DATA ------------------
async function clearOldData() {
    try {
        console.log("🗑 Clearing old data...");
        await mongoose.connection.db.dropCollection("categories").catch(() => { });
        await mongoose.connection.db.dropCollection("products").catch(() => { });
        await mongoose.connection.db.dropCollection("users").catch(() => { });
        console.log("✅ Old data cleared");
    } catch (error) {
        console.log("⚠️ Error clearing data (might be empty):", error.message);
    }
}

// ---------------- SEED CATEGORIES ------------------
async function seedCategories() {
    const categoryNames = [
        "Electronics", "Fashion", "Home & Garden", "Sports",
        "Toys & Hobbies", "Health & Beauty", "Automotive",
        "Books", "Music", "Computers", "Pet Supplies", "Office"
    ];

    let categories = [];
    for (const name of categoryNames) {
        categories.push({ name });
    }

    const created = await categoriesModel.insertMany(categories);
    console.log(`📁 Created ${created.length} categories`);
    return created;
}

// ---------------- SEED USERS ------------------
async function seedUsers() {
    let users = [];
    const hashedPass = await bcrypt.hash("Password123@", 10);

    // Create 20 random users
    for (let i = 0; i < 20; i++) {
        users.push({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: hashedPass,
            role: "user",
            cart: [],
        });
    }

    const admin = await userModel.create({
        name: "Admin",
        email: "admin@example.com",
        password: hashedPass,
        role: "admin",
        cart: [],
    });

    const created = await userModel.insertMany(users);
    console.log(`👤 Created ${created.length + 1} users (including admin)`);

    return [...created, admin];
}

// ---------------- SEED PRODUCTS ------------------
async function seedProducts(categories) {
    let products = [];

    // Create 200 products
    for (let i = 0; i < 200; i++) {
        const category = faker.helpers.arrayElement(categories);

        products.push({
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: Number(faker.commerce.price({ min: 10, max: 2000 })),
            stock: faker.number.int({ min: 0, max: 100 }),
            image: faker.image.urlLoremFlickr({ category: "product" }),
            category: category._id,
        });
    }

    const created = await productModel.insertMany(products);
    console.log(`📦 Created ${created.length} products`);

    return created;
}

// ---------------- MAIN ------------------
async function start() {
    await connectDB();
    await clearOldData();

    const categories = await seedCategories();
    const users = await seedUsers();
    const products = await seedProducts(categories);

    console.log("🎉 PRODUCTION SEEDING COMPLETE");
    process.exit();
}

start();
