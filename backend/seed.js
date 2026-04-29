import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import userModel from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
    try {
        const dbUri = process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017';
        await mongoose.connect(`${dbUri}/e-commerce`);
        console.log('Connected to Development MongoDB for seeding');

        // Optional: Clear existing users to start fresh
        // await userModel.deleteMany({});
        // console.log('Cleared existing users');

        const salt = await bcrypt.genSalt(10);
        const userPassword = await bcrypt.hash('password123', salt);
        const adminPassword = await bcrypt.hash('admin123', salt);

        const users = [];

        console.log('Generating 50+ users and admins...');

        // Generate 45 regular users
        for (let i = 0; i < 45; i++) {
            users.push({
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: userPassword,
                role: 'user',
                cartData: {}
            });
        }

        // Generate 5+ admin users
        for (let i = 0; i < 7; i++) {
            users.push({
                name: faker.person.fullName() + ' (Staff Admin)',
                email: `admin${i + 1}@shopora.com`,
                password: adminPassword,
                role: 'admin',
                cartData: {}
            });
        }

        // Add a specific test user for the USER
        users.push({
            name: 'Test User',
            email: 'user@test.com',
            password: userPassword,
            role: 'user',
            cartData: {}
        });

        await userModel.insertMany(users);
        console.log(`Successfully seeded ${users.length} entries into the development database!`);
        console.log('\n--- Credentials ---');
        console.log('User Login: user@test.com / password123');
        console.log('Admin Login: admin1@shopora.com / admin123');
        console.log('-------------------\n');
        
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
