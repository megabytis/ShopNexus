// seed.js

require("dotenv").config({ path: "../.env" });

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
    await categoriesModel.deleteMany({});
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    console.log("🗑 Old data cleared");
}

// ---------------- SEED CATEGORIES ------------------
async function seedCategories() {
    let categories = [];

    for (let i = 0; i < 10; i++) {
        categories.push({
            name: faker.commerce.department(),
        });
    }

    const created = await categoriesModel.insertMany(categories);
    console.log(`📁 Created ${created.length} categories`);
    return created;
}

// ---------------- SEED USERS ------------------
async function seedUsers() {
    let users = [];

    const hashedPass = await bcrypt.hash("Password123@", 10);

    for (let i = 0; i < 10; i++) {
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

    for (let i = 0; i < 50; i++) {
        const category = faker.helpers.arrayElement(categories);

        products.push({
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: Number(faker.commerce.price({ min: 100, max: 50000 })),
            stock: faker.number.int({ min: 5, max: 100 }),
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
