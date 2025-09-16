import { selector } from 'recoil';
import { habitsState, currentUserState, feedState, followingState } from './atoms';
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

// Habit selectors
export const todayHabitsSelector = selector({
  key: 'todayHabitsSelector',
  get: ({ get }) => {
    const habits = get(habitsState);
    return habits.filter(habit => {
      // Ensure completedHabits exists and is an array
      if (!habit.completedHabits || !Array.isArray(habit.completedHabits)) {
        return true; // Show habit if no completion data exists
      }
      
      // Check if habit needs completion today based on frequency
      if (habit.frequency === 'DAILY') {
        // Check if completed today
        const completedToday = habit.completedHabits.some(completion => 
          isToday(parseISO(completion.date))
        );
        return !completedToday;
      }
      if (habit.frequency === 'WEEKLY') {
        const completedThisWeek = habit.completedHabits.some(completion => 
          isThisWeek(parseISO(completion.date))
        );
        return !completedThisWeek;
      }
      if (habit.frequency === 'MONTHLY') {
        const completedThisMonth = habit.completedHabits.some(completion => 
          isThisMonth(parseISO(completion.date))
        );
        return !completedThisMonth;
      }
      return false;
    });
  },
});

export const completedTodaySelector = selector({
  key: 'completedTodaySelector',
  get: ({ get }) => {
    const habits = get(habitsState);
    return habits.filter(habit => {
      // Ensure completedHabits exists and is an array
      if (!habit.completedHabits || !Array.isArray(habit.completedHabits)) {
        return false; // Don't show as completed if no completion data
      }
      
      if (habit.frequency === 'DAILY') {
        return habit.completedHabits.some(completion => 
          isToday(parseISO(completion.date))
        );
      }
      if (habit.frequency === 'WEEKLY') {
        return habit.completedHabits.some(completion => 
          isThisWeek(parseISO(completion.date))
        );
      }
      if (habit.frequency === 'MONTHLY') {
        return habit.completedHabits.some(completion => 
          isThisMonth(parseISO(completion.date))
        );
      }
      return false;
    });
  },
});

export const habitStatsSelector = selector({
  key: 'habitStatsSelector',
  get: ({ get }) => {
    const habits = get(habitsState);
    const currentUser = get(currentUserState);
    
    const totalHabits = habits.length;
    const totalCompletions = habits.reduce((sum, habit) => 
      sum + (habit.completedHabits?.length || 0), 0
    );
    
    // Use user's overall streak, not sum of habit streaks
    const totalCurrentStreak = currentUser?.overallStreak || 0;
    
    // Use user's longest overall streak, not individual habit streaks
    const longestStreak = currentUser?.longestOverallStreak || 0;
    
    return {
      totalHabits,
      totalCompletions,
      totalCurrentStreak,
      longestStreak,
    };
  },
});

// Feed selectors
export const friendsFeedSelector = selector({
  key: 'friendsFeedSelector',
  get: ({ get }) => {
    const feed = get(feedState);
    const following = get(followingState);
    const currentUser = get(currentUserState);
    
    // Filter feed to only show posts from friends (people we follow)
    return feed.filter(item => {
      if (!currentUser) return false;
      if (item.userId === currentUser.id) return false; // Exclude our own posts
      return following.some(friend => friend.id === item.userId);
    });
  },
});

export const myFeedSelector = selector({
  key: 'myFeedSelector',
  get: ({ get }) => {
    const feed = get(feedState);
    const currentUser = get(currentUserState);
    
    if (!currentUser) return [];
    
    return feed.filter(item => item.userId === currentUser.id);
  },
});