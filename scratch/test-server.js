import 'dotenv/config';
import express from 'express';
import connectDB from '../server/config/db.js';
import authRoutes from '../server/routes/auth.js';

const app = express();
app.use(express.json());

connectDB().then(() => {
  app.use('/api/auth', authRoutes);
  
  app.listen(5001, () => {
    console.log('Test server ready on 5001');
  });
}).catch(console.error);
