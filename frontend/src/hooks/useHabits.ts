import { useRecoilState } from 'recoil';
import { habitsState, selectedHabitState, loadingState } from '../store/atoms';
import { habitAPI, completeHabitAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useHabits = () => {
  const [habits, setHabits] = useRecoilState(habitsState);
  const [selectedHabit, setSelectedHabit] = useRecoilState(selectedHabitState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const { fetchCurrentUser } = useAuth();

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const fetchedHabits = await habitAPI.getHabits();
      setHabits(fetchedHabits);
    } catch (error: any) {
      // Don't show error toast for 401 errors as they're handled by the interceptor
      if (error.response?.status !== 401) {
        const message = error.response?.data?.error || 'Failed to fetch habits';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (habitData: {
    name: string;
    description?: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    category?: string;
  }) => {
    try {
      setLoading(true);
      const newHabit = await habitAPI.createHabit(habitData);
      setHabits(prev => [...prev, newHabit]);
      toast.success('Habit created successfully!');
      return newHabit;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create habit';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateHabit = async (id: string, habitData: {
    name?: string;
    description?: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    category?: string;
  }) => {
    try {
      setLoading(true);
      const updatedHabit = await habitAPI.updateHabit(id, habitData);
      setHabits(prev => prev.map(habit => 
        habit.id === id ? updatedHabit : habit
      ));
      toast.success('Habit updated successfully!');
      return updatedHabit;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update habit';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      setLoading(true);
      await habitAPI.deleteHabit(id);
      setHabits(prev => prev.filter(habit => habit.id !== id));
      toast.success('Habit deleted successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete habit';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeHabit = async (habitId: string) => {
    try {
      setLoading(true);
      const response = await completeHabitAPI.markAsCompleted(habitId);
      
      // Update local state - refresh habits to get updated completion data
      await fetchHabits();
      
      // Also refresh current user to get updated overall streak
      await fetchCurrentUser();
      
      toast.success('Habit completed! 🎉');
      return response;
    } catch (error: any) {
      // Don't show error toast for 401 errors as they're handled by the interceptor
      if (error.response?.status !== 401) {
        const message = error.response?.data?.error || 'Failed to complete habit';
        toast.error(message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getHabitHistory = async (habitId: string) => {
    try {
      const history = await completeHabitAPI.getHistory(habitId);
      return history;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch habit history';
      toast.error(message);
      throw error;
    }
  };

  return {
    habits,
    selectedHabit,
    loading,
    setSelectedHabit,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    getHabitHistory,
  };
};