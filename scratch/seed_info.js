const axios = require('axios');

async function seed() {
  const backendUrl = 'http://localhost:3001';
  
  // Note: This requires at least one user to exist in the database.
  // We'll try to find a user or create a dummy one if we had a seed endpoint.
  // Since we don't have a seed endpoint, I'll provide instructions to the user.
  
  console.log('--- TreandX Seeding Instructions ---');
  console.log('1. Register a user via the mobile app.');
  console.log('2. Once registered, grab their ID from MongoDB.');
  console.log('3. Use a tool like Postman or a custom script to POST to /post create logic.');
  console.log('------------------------------------');
}

seed();
