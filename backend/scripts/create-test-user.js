/**
 * Script to create a test user
 * Run with: node create-test-user.js
 */

const bcrypt = require('bcryptjs');
const db = require('../config/db-selector');

async function createTestUser() {
  try {
    // Define test user data
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin' // or 'user' based on your needs
    };

    console.log('Creating test user...');

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM Users WHERE username = $1 OR email = $2',
      [testUser.username, testUser.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('Test user already exists!');
      console.log('You can log in with:');
      console.log(`Username: ${testUser.username}`);
      console.log(`Password: ${testUser.password}`);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);

    // Insert user into database
    const result = await db.query(
      `INSERT INTO Users (Username, Email, Password, FirstName, LastName, Role, CreatedAt, LastLogin) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [
        testUser.username,
        testUser.email,
        hashedPassword,
        testUser.firstName,
        testUser.lastName,
        testUser.role
      ]
    );

    console.log('Test user created successfully!');
    console.log('You can log in with:');
    console.log(`Username: ${testUser.username}`);
    console.log(`Password: ${testUser.password}`);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run the function
createTestUser();
