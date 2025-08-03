import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import config from './config';
import authRoutes from './routes/authRoutes';
import aiAgentRoutes from './routes/aiAgentRoutes';
import purchaseRoutes from './routes/purchaseRoutes';

const app: Application = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

if (config.env === 'production') {
  app.use('/api', limiter);
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/agents', aiAgentRoutes);
app.use('/api/v1/purchases', purchaseRoutes);

// Simple route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Autonomous Purchase System API is running...');
});

// Handle 404
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send('Not Found');
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
