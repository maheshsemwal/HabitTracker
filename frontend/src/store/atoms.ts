import { atom } from 'recoil';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  overallStreak: number;
  longestOverallStreak: number;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  completedHabits: CompletedHabit[];
}

export interface CompletedHabit {
  id: string;
  date: string;
  habitId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedItem {
  id: string;
  userId: string;
  habitId: string;
  type: 'HABIT_CREATED' | 'HABIT_COMPLETED' | 'STREAK_UPDATED';
  message?: string;
  createdAt: string;
  user: User;
  habit: Habit;
}

export interface FollowRequest {
  id: string;
  userId: string;
  followerId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user: User;
  follower: User;
}

// Auth atoms
export const authTokenState = atom<string | null>({
  key: 'authTokenState',
  default: null,
});

export const currentUserState = atom<User | null>({
  key: 'currentUserState',
  default: null,
});

export const isAuthenticatedState = atom<boolean>({
  key: 'isAuthenticatedState',
  default: false,
});

// Habit atoms
export const habitsState = atom<Habit[]>({
  key: 'habitsState',
  default: [],
});

export const selectedHabitState = atom<Habit | null>({
  key: 'selectedHabitState',
  default: null,
});

// Feed atoms
export const feedState = atom<FeedItem[]>({
  key: 'feedState',
  default: [],
});

// Social atoms
export const followRequestsState = atom<FollowRequest[]>({
  key: 'followRequestsState',
  default: [],
});

export const followersState = atom<User[]>({
  key: 'followersState',
  default: [],
});

export const followingState = atom<User[]>({
  key: 'followingState',
  default: [],
});

// UI atoms
export const loadingState = atom<boolean>({
  key: 'loadingState',
  default: false,
});

export const errorState = atom<string | null>({
  key: 'errorState',
  default: null,
});

// Dialogs
export const createHabitDialogState = atom<boolean>({
  key: 'createHabitDialogState',
  default: false,
});

export const editHabitDialogState = atom<boolean>({
  key: 'editHabitDialogState',
  default: false,
});