import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import habitRoutes from './routes/habitRoutes';
import completeHabitRoutes from './routes/completeHabitRoutes';
import followRoutes from './routes/userRoutes';
import feedRoutes from './routes/feedRoutes';
import analyticRoutes from './routes/analyticRoutes';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/habits', habitRoutes);
app.use('/api/v1/complete', completeHabitRoutes);
app.use('/api/v1/user', followRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/analytics', analyticRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
