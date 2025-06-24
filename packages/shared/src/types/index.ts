export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  restaurantId: string;
}

export interface Availability {
  id: string;
  userId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface ScheduledShift {
  id: string;
  userId: string;
  roleId: string;
  restaurantId: string;
  date: Date;
  startTime: string;
  endTime: string;
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}