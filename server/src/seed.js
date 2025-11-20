// seed.js

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const { productModel } = require("./models/product");
const { userModel } = require("./models/user");
const { categoriesModel } = require("./models/category");
const bcrypt = require("bcrypt");

// ---------------- CONNECT DB ------------------
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("🔥 Connected to MongoDB");
    } catch (err) {
        console.error("❌ DB Connection Error:", err);
        process.exit(1);
    }
}

// ---------------- CLEAR OLD DATA ------------------
async function clearOldData() {
    try {
        // Drop collections to ensure old indexes (like unique password) are removed
        await mongoose.connection.db.dropCollection("categories").catch(() => { });
        await mongoose.connection.db.dropCollection("products").catch(() => { });
        await mongoose.connection.db.dropCollection("users").catch(() => { });
        console.log("🗑 Old data and indexes cleared");
    } catch (error) {
        console.log("Error clearing data:", error.message);
    }
}

// ---------------- SEED CATEGORIES ------------------
async function seedCategories() {
    // Use a fixed list of distinct categories to avoid duplicates
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

    console.log("🎉 SEEDING COMPLETE");
    process.exit();
}

start();
