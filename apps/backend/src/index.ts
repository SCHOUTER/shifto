import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use( helmet() );
app.use( cors( {
  origin: process.env.ALLOWED_ORIGINS?.split( ',' ) || ['http://localhost:3000'],
  credentials: true,
} ) );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

// Basic health check route
app.get( '/api/health', ( req, res ) => {
  res.json( {
    status: 'ok',
    message: 'Hospitality Scheduler API is running!',
    timestamp: new Date().toISOString()
  } );
} );

// Routes
app.use( '/api/auth', authRoutes );
app.use( '/api/users', userRoutes );

// 404 handler
app.use( '*', ( req, res ) => {
  res.status( 404 ).json( { error: 'Route not found' } );
} );

// Error handler
app.use( ( err: any, req: express.Request, res: express.Response, next: express.NextFunction ) => {
  console.error( err.stack );
  res.status( 500 ).json( { error: 'Something went wrong!' } );
} );

app.listen( PORT, () => {
  console.log( `🚀 Server running on port ${PORT}` );
  console.log( `📍 Health check: http://localhost:${PORT}/api/health` );
} );