const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Explicitly set the database name
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'studentdrop_ai', // This forces the database name
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    if (collections.length > 0) {
      console.log(`📚 Collections: ${collections.map(c => c.name).join(', ')}`);
    } else {
      console.log(`📚 No collections created yet`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;