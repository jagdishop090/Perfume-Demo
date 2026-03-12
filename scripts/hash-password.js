const bcrypt = require('bcryptjs');

// Function to hash a password
async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`Password: ${password}`);
    console.log(`Hashed: ${hashedPassword}`);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

// Function to verify a password
async function verifyPassword(password, hash) {
  try {
    const isValid = await bcrypt.compare(password, hash);
    console.log(`Password "${password}" is ${isValid ? 'valid' : 'invalid'}`);
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
  }
}

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.log('Usage: node hash-password.js <password>');
  console.log('Example: node hash-password.js admin123');
  process.exit(1);
}

// Hash the provided password
hashPassword(password);

// Example usage:
// node scripts/hash-password.js admin123