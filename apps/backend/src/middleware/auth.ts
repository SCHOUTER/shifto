import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'STAFF';
    restaurantId: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split( ' ' )[1]; // Bearer TOKEN

  if ( !token ) {
    return res.status( 401 ).json( { error: 'Access token required' } );
  }

  try {
    const decoded = jwt.verify( token, process.env.JWT_SECRET! ) as any;

    // Get fresh user data from database
    const user = await prisma.user.findUnique( {
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        restaurantId: true,
      },
    } );

    if ( !user ) {
      return res.status( 401 ).json( { error: 'User not found' } );
    }

    req.user = user;
    next();
  } catch ( error ) {
    return res.status( 403 ).json( { error: 'Invalid or expired token' } );
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if ( !req.user ) {
    return res.status( 401 ).json( { error: 'Authentication required' } );
  }

  if ( req.user.role !== 'ADMIN' ) {
    return res.status( 403 ).json( { error: 'Admin access required' } );
  }

  next();
};

export const requireSameRestaurant = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if ( !req.user ) {
    return res.status( 401 ).json( { error: 'Authentication required' } );
  }

  // This middleware ensures users can only access data from their restaurant
  // The actual filtering should be done in the route handlers
  next();
};