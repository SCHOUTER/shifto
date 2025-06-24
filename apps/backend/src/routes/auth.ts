import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router: Router = Router();
const prisma = new PrismaClient();

// Login
router.post( '/login', async ( req, res ) => {
  try {
    const { email, password } = req.body;

    if ( !email || !password ) {
      return res.status( 400 ).json( { error: 'Email and password are required' } );
    }

    // Find user by email
    const user = await prisma.user.findUnique( {
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    } );

    if ( !user ) {
      return res.status( 401 ).json( { error: 'Invalid email or password' } );
    }

    // Check password
    const isValidPassword = await bcrypt.compare( password, user.passwordHash );
    if ( !isValidPassword ) {
      return res.status( 401 ).json( { error: 'Invalid email or password' } );
    }

    // Generate JWT
    if ( !process.env.JWT_SECRET ) {
      throw new Error( 'JWT_SECRET is not defined in environment variables' );
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data and token
    res.json( {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurant: {
            id: user.restaurant.id,
            name: user.restaurant.name,
          },
        },
      },
    } );
  } catch ( error ) {
    console.error( 'Login error:', error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
} );

// Get current user
router.get( '/me', authenticateToken, async ( req: AuthRequest, res ) => {
  try {
    const user = await prisma.user.findUnique( {
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    } );

    if ( !user ) {
      return res.status( 404 ).json( { error: 'User not found' } );
    }

    res.json( {
      success: true,
      data: { user },
    } );
  } catch ( error ) {
    console.error( 'Get user error:', error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
} );

// Logout (client-side token removal, server doesn't need to do anything)
router.post( '/logout', ( req, res ) => {
  res.json( {
    success: true,
    message: 'Logged out successfully',
  } );
} );

export default router;