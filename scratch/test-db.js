import mongoose from 'mongoose';
import 'dotenv/config';

const uri = 'mongodb://gayatrimishra2424_db_user:eaOtE8pcGO35bAGu@ac-deyp7bu-shard-00-00.ukcoquo.mongodb.net:27017,ac-deyp7bu-shard-00-01.ukcoquo.mongodb.net:27017,ac-deyp7bu-shard-00-02.ukcoquo.mongodb.net:27017/skillswap?ssl=true&replicaSet=atlas-14gpo3-shard-0&authSource=admin&retryWrites=true&w=majority';

console.log('Attempting to connect to:', uri.replace(/\/\/.*:.*@/, '//<user>:<password>@'));

async function testConnection() {
  try {
    await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 5000 
    });
    console.log('✅ Success: Connected to MongoDB Atlas');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failure: Could not connect to MongoDB');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.reason) {
      console.error('Reason:', JSON.stringify(err.reason, null, 2));
    }
    process.exit(1);
  }
}

testConnection();
