import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { createHabitDialogState, editHabitDialogState } from '../store/atoms';
import { todayHabitsSelector, completedTodaySelector, habitStatsSelector } from '../store/selectors';
import { useHabits } from '../hooks/useHabits';
import Layout from '../components/Layout';
import HabitCard from '../components/HabitCard';
import CreateHabitDialog from '../components/CreateHabitDialog';
import EditHabitDialog from '../components/EditHabitDialog';
import HabitDetailView from '../components/HabitDetailView';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Target, TrendingUp, Calendar, Award } from 'lucide-react';
import type { Habit } from '../store/atoms';

const Dashboard = () => {
  const [, setCreateDialogOpen] = useRecoilState(createHabitDialogState);
  const [, setEditDialogOpen] = useRecoilState(editHabitDialogState);
  const [selectedHabitForView, setSelectedHabitForView] = useState<Habit | null>(null);
  
  const todayHabits = useRecoilValue(todayHabitsSelector);
  const completedToday = useRecoilValue(completedTodaySelector);
  const stats = useRecoilValue(habitStatsSelector);

  const { 
    habits, 
    loading, 
    fetchHabits, 
    completeHabit, 
    deleteHabit, 
    setSelectedHabit 
  } = useHabits();

  // Update selectedHabitForView when habits change to ensure we have the latest data
  useEffect(() => {
    if (selectedHabitForView) {
      const updatedHabit = habits.find(h => h.id === selectedHabitForView.id);
      if (updatedHabit) {
        setSelectedHabitForView(updatedHabit);
      }
    }
  }, [habits, selectedHabitForView]);

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setEditDialogOpen(true);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(habitId);
    }
  };

  if (loading && habits.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your habits...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Track your daily habits and progress</p>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Habit
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHabits}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedToday.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayHabits.length} remaining
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCurrentStreak}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.longestStreak}</div>
            </CardContent>
          </Card>
        </div>

        {/* Habits to Complete Today */}
        {todayHabits.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Complete Today ({todayHabits.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={completeHabit}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                  onView={setSelectedHabitForView}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Completed Today ({completedToday.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedToday.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={completeHabit}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                  onView={setSelectedHabitForView}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Habits */}
        {habits.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              All Habits ({habits.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={completeHabit}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                  onView={setSelectedHabitForView}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {habits.length === 0 && !loading && (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">No habits yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first habit!
            </p>
            <div className="mt-6">
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Habit
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateHabitDialog />
      <EditHabitDialog />
      
      {/* Habit Detail View */}
      {selectedHabitForView && (
        <HabitDetailView
          habit={selectedHabitForView}
          isOpen={!!selectedHabitForView}
          onClose={() => setSelectedHabitForView(null)}
        />
      )}
    </Layout>
  );
};

export default Dashboard;