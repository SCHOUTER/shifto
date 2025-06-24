import { z } from 'zod';

export const DayOfWeekSchema = z.enum( [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
] );

export const UserRoleSchema = z.enum( ['ADMIN', 'STAFF'] );

export const TimeSchema = z.string().regex( /^([01]\d|2[0-3]):([0-5]\d)$/, {
  message: 'Time must be in HH:MM format'
} );

export const CreateUserSchema = z.object( {
  email: z.string().email(),
  name: z.string().min( 1 ),
  password: z.string().min( 6 ),
  role: UserRoleSchema.optional().default( 'STAFF' ),
  restaurantId: z.string()
} );

export const LoginSchema = z.object( {
  email: z.string().email(),
  password: z.string().min( 1 )
} );

export const AvailabilitySchema = z.object( {
  dayOfWeek: DayOfWeekSchema,
  startTime: TimeSchema,
  endTime: TimeSchema
} );