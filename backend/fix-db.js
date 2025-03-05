// save this as fix-db.js in your server directory
const mongoose = require('mongoose');
require('dotenv').config();

const fixDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Drop the existing username index
    console.log('Dropping username index...');
    try {
      await mongoose.connection.db.collection('users').dropIndex('username_1');
      console.log('Successfully dropped username index');
    } catch (indexError) {
      console.log('No username index found or error dropping index:', indexError.message);
    }
    
    // Find users with null username
    console.log('Finding users with null username...');
    const usersWithNullUsername = await mongoose.connection.db.collection('users').find({ username: null }).toArray();
    console.log(`Found ${usersWithNullUsername.length} users with null username`);
    
    // Update users with null username
    if (usersWithNullUsername.length > 0) {
      console.log('Updating users with null username...');
      for (const user of usersWithNullUsername) {
        const generatedUsername = user.email ? 
          user.email.split('@')[0] + Math.floor(Math.random() * 10000) : 
          'user_' + Math.floor(Math.random() * 10000);
        
        await mongoose.connection.db.collection('users').updateOne(
          { _id: user._id },
          { $set: { username: generatedUsername } }
        );
        console.log(`Updated user ${user._id} with username ${generatedUsername}`);
      }
    }
    
    // Create a new index with sparse option
    console.log('Creating new sparse index on username...');
    await mongoose.connection.db.collection('users').createIndex(
      { username: 1 }, 
      { unique: true, sparse: true }
    );
    console.log('Successfully created new sparse index on username');
    
    console.log('Database fix completed successfully');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

fixDatabase();