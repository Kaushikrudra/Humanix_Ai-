import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import stripeRoutes from './routes/stripe';
import userRoutes from './routes/user';

dotenv.config();

const app = express();

app.use(cors());

// Webhook needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
