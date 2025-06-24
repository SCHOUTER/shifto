import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log( '🌱 Starting database seed...' );

  // Create a test restaurant
  const restaurant = await prisma.restaurant.create( {
    data: {
      name: 'Demo Restaurant & Bar',
    },
  } );

  console.log( '✅ Created restaurant:', restaurant.name );

  // Create roles for the restaurant
  const bartenderRole = await prisma.role.create( {
    data: {
      name: 'Bartender',
      restaurantId: restaurant.id,
    },
  } );

  const serverRole = await prisma.role.create( {
    data: {
      name: 'Server',
      restaurantId: restaurant.id,
    },
  } );

  const kitchenRole = await prisma.role.create( {
    data: {
      name: 'Kitchen Staff',
      restaurantId: restaurant.id,
    },
  } );

  console.log( '✅ Created roles:', [bartenderRole.name, serverRole.name, kitchenRole.name] );

  // Create admin user
  const adminPassword = await bcrypt.hash( 'admin123', 10 );
  const adminUser = await prisma.user.create( {
    data: {
      email: 'admin@demo.com',
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: adminPassword,
      restaurantId: restaurant.id,
    },
  } );

  // Create staff users
  const staffPassword = await bcrypt.hash( 'staff123', 10 );
  const staffUsers = await Promise.all( [
    prisma.user.create( {
      data: {
        email: 'john@demo.com',
        name: 'John Doe',
        role: 'STAFF',
        passwordHash: staffPassword,
        restaurantId: restaurant.id,
      },
    } ),
    prisma.user.create( {
      data: {
        email: 'jane@demo.com',
        name: 'Jane Smith',
        role: 'STAFF',
        passwordHash: staffPassword,
        restaurantId: restaurant.id,
      },
    } ),
    prisma.user.create( {
      data: {
        email: 'mike@demo.com',
        name: 'Mike Johnson',
        role: 'STAFF',
        passwordHash: staffPassword,
        restaurantId: restaurant.id,
      },
    } ),
  ] );

  console.log( '✅ Created users:', [adminUser.name, ...staffUsers.map( u => u.name )] );

  // Create some sample availabilities
  await prisma.availability.createMany( {
    data: [
      // John's availability
      { userId: staffUsers[0].id, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' },
      { userId: staffUsers[0].id, dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00' },
      { userId: staffUsers[0].id, dayOfWeek: 'FRIDAY', startTime: '18:00', endTime: '02:00' },
      { userId: staffUsers[0].id, dayOfWeek: 'SATURDAY', startTime: '18:00', endTime: '02:00' },

      // Jane's availability
      { userId: staffUsers[1].id, dayOfWeek: 'WEDNESDAY', startTime: '10:00', endTime: '18:00' },
      { userId: staffUsers[1].id, dayOfWeek: 'THURSDAY', startTime: '10:00', endTime: '18:00' },
      { userId: staffUsers[1].id, dayOfWeek: 'FRIDAY', startTime: '10:00', endTime: '18:00' },
      { userId: staffUsers[1].id, dayOfWeek: 'SUNDAY', startTime: '12:00', endTime: '20:00' },

      // Mike's availability
      { userId: staffUsers[2].id, dayOfWeek: 'MONDAY', startTime: '18:00', endTime: '02:00' },
      { userId: staffUsers[2].id, dayOfWeek: 'THURSDAY', startTime: '18:00', endTime: '02:00' },
      { userId: staffUsers[2].id, dayOfWeek: 'FRIDAY', startTime: '18:00', endTime: '02:00' },
      { userId: staffUsers[2].id, dayOfWeek: 'SATURDAY', startTime: '18:00', endTime: '02:00' },
    ],
  } );

  // Create shift requirements
  await prisma.shiftRequirement.createMany( {
    data: [
      // Weekday lunch shifts
      { restaurantId: restaurant.id, roleId: serverRole.id, dayOfWeek: 'MONDAY', startTime: '11:00', endTime: '15:00', needed: 2 },
      { restaurantId: restaurant.id, roleId: serverRole.id, dayOfWeek: 'TUESDAY', startTime: '11:00', endTime: '15:00', needed: 2 },
      { restaurantId: restaurant.id, roleId: kitchenRole.id, dayOfWeek: 'MONDAY', startTime: '10:00', endTime: '16:00', needed: 1 },
      { restaurantId: restaurant.id, roleId: kitchenRole.id, dayOfWeek: 'TUESDAY', startTime: '10:00', endTime: '16:00', needed: 1 },

      // Weekend evening shifts (busier)
      { restaurantId: restaurant.id, roleId: bartenderRole.id, dayOfWeek: 'FRIDAY', startTime: '19:00', endTime: '02:00', needed: 2 },
      { restaurantId: restaurant.id, roleId: bartenderRole.id, dayOfWeek: 'SATURDAY', startTime: '19:00', endTime: '02:00', needed: 2 },
      { restaurantId: restaurant.id, roleId: serverRole.id, dayOfWeek: 'FRIDAY', startTime: '18:00', endTime: '01:00', needed: 3 },
      { restaurantId: restaurant.id, roleId: serverRole.id, dayOfWeek: 'SATURDAY', startTime: '18:00', endTime: '01:00', needed: 3 },
    ],
  } );

  console.log( '✅ Created sample availabilities and shift requirements' );

  console.log( '\n🎉 Database seeded successfully!' );
  console.log( '\n📝 Test Credentials:' );
  console.log( 'Admin: admin@demo.com / admin123' );
  console.log( 'Staff: john@demo.com / staff123' );
  console.log( 'Staff: jane@demo.com / staff123' );
  console.log( 'Staff: mike@demo.com / staff123' );
}

main()
  .catch( ( e ) => {
    console.error( '❌ Seed failed:', e );
    process.exit( 1 );
  } )
  .finally( async () => {
    await prisma.$disconnect();
  } );