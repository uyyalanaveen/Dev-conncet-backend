// filepath: /d:/Final-Year-project/Backend/Server.js
import express from 'express';
import mongoose from 'mongoose';
import routes from './routes/Userroutes.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Use routes
app.use('/api', routes);

// Database connection
mongoose.connect(process.env.MongoDB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});