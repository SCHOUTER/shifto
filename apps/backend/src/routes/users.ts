import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';

const router: Router = Router();
const prisma = new PrismaClient();

// Get all users in restaurant (admin only)
router.get( '/', authenticateToken, requireAdmin, async ( req: AuthRequest, res ) => {
  try {
    const users = await prisma.user.findMany( {
      where: { restaurantId: req.user!.restaurantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    } );

    res.json( {
      success: true,
      data: { users },
    } );
  } catch ( error ) {
    console.error( 'Get users error:', error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
} );

// Create new user (admin only)
router.post( '/', authenticateToken, requireAdmin, async ( req: AuthRequest, res ) => {
  try {
    const { email, name, password, role = 'STAFF' } = req.body;

    if ( !email || !name || !password ) {
      return res.status( 400 ).json( { error: 'Email, name, and password are required' } );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique( {
      where: { email },
    } );

    if ( existingUser ) {
      return res.status( 400 ).json( { error: 'User with this email already exists' } );
    }

    // Hash password
    const passwordHash = await bcrypt.hash( password, 10 );

    // Create user
    const user = await prisma.user.create( {
      data: {
        email,
        name,
        role,
        passwordHash,
        restaurantId: req.user!.restaurantId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    } );

    res.status( 201 ).json( {
      success: true,
      data: { user },
    } );
  } catch ( error ) {
    console.error( 'Create user error:', error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
} );

// Update user
router.put( '/:id', authenticateToken, async ( req: AuthRequest, res ) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Users can only update themselves, or admins can update anyone in their restaurant
    const targetUser = await prisma.user.findFirst( {
      where: {
        id,
        restaurantId: req.user!.restaurantId,
      },
    } );

    if ( !targetUser ) {
      return res.status( 404 ).json( { error: 'User not found' } );
    }

    // Check permissions
    if ( req.user!.id !== id && req.user!.role !== 'ADMIN' ) {
      return res.status( 403 ).json( { error: 'Cannot update other users' } );
    }

    // Staff cannot change roles
    const updateData: any = { name, email };
    if ( req.user!.role === 'ADMIN' && role ) {
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update( {
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    } );

    res.json( {
      success: true,
      data: { user: updatedUser },
    } );
  } catch ( error ) {
    console.error( 'Update user error:', error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
} );

// Delete user (admin only)
router.delete( '/:id', authenticateToken, requireAdmin, async ( req: AuthRequest, res ) => {
  try {
    const { id } = req.params;

    // Cannot delete yourself
    if ( req.user!.id === id ) {
      return res.status( 400 ).json( { error: 'Cannot delete your own account' } );
    }

    // Check if user exists in same restaurant
    const user = await prisma.user.findFirst( {
      where: {
        id,
        restaurantId: req.user!.restaurantId,
      },
    } );

    if ( !user ) {
      return res.status( 404 ).json( { error: 'User not found' } );
    }

    await prisma.user.delete( {
      where: { id },
    } );

    res.json( {
      success: true,
      message: 'User deleted successfully',
    } );
  } catch ( error ) {
    console.error( 'Delete user error:', error );
    res.status( 500 ).json( { error: 'Internal server error' } );
  }
} );

export default router;