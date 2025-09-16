import { useEffect, useState } from 'react';
import { format, isToday, isYesterday, startOfWeek, startOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, Target, Flame, TrendingUp, Clock, CheckCircle, X } from 'lucide-react';
import type { Habit, CompletedHabit } from '../store/atoms';
import { habitAPI } from '../services/api';

interface HabitDetailViewProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

interface HabitHistory {
  habitId: string;
  completions: CompletedHabit[];
}

const HabitDetailView: React.FC<HabitDetailViewProps> = ({ habit, isOpen, onClose }) => {
  const [history, setHistory] = useState<HabitHistory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && habit.id) {
      fetchHabitHistory();
    }
  }, [isOpen, habit.id, habit.completedHabits?.length]); // Also refresh when completedHabits changes

  const fetchHabitHistory = async () => {
    try {
      setLoading(true);
      const historyData = await habitAPI.getHabitHistory(habit.id);
      console.log('Fetched habit history:', historyData); // Debug log
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch habit history:', error);
      setHistory(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionRate = () => {
    if (!history) return 0;

    const now = new Date();
    const createdAt = new Date(habit.createdAt);
    let totalExpected = 0;

    if (habit.frequency === 'DAILY') {
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalExpected = daysSinceCreation;
    } else if (habit.frequency === 'WEEKLY') {
      const weeksSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
      totalExpected = weeksSinceCreation;
    } else if (habit.frequency === 'MONTHLY') {
      const monthsSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1;
      totalExpected = monthsSinceCreation;
    }

    return totalExpected > 0 ? Math.round((history.completions.length / totalExpected) * 100) : 0;
  };

  const formatCompletionDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM dd, yyyy \'at\' h:mm a');
    }
  };

  const getFrequencyPeriod = () => {
    const now = new Date();
    
    switch (habit.frequency) {
      case 'DAILY':
        return format(now, 'EEEE, MMM dd');
      case 'WEEKLY':
        const weekStart = startOfWeek(now);
        return `Week of ${format(weekStart, 'MMM dd')}`;
      case 'MONTHLY':
        const monthStart = startOfMonth(now);
        return format(monthStart, 'MMMM yyyy');
      default:
        return '';
    }
  };

  const isCompletedForCurrentPeriod = () => {
    if (!history) return false;

    const now = new Date();
    const today = now.toDateString();

    return history.completions.some(completion => {
      const completionDate = new Date(completion.date);
      
      switch (habit.frequency) {
        case 'DAILY':
          return completionDate.toDateString() === today;
        case 'WEEKLY':
          const weekStart = startOfWeek(now);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return completionDate >= weekStart && completionDate <= weekEnd;
        case 'MONTHLY':
          const monthStart = startOfMonth(now);
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthStart.getMonth() + 1);
          monthEnd.setDate(0);
          return completionDate >= monthStart && completionDate <= monthEnd;
        default:
          return false;
      }
    });
  };

  const completionRate = calculateCompletionRate();
  const completedThisPeriod = isCompletedForCurrentPeriod();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>{habit.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Habit Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Habit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">{format(new Date(habit.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <Badge variant="outline">{habit.frequency}</Badge>
                </div>
              </div>
              
              {habit.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground">{habit.description}</p>
                </div>
              )}
              
              {habit.category && (
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="secondary">{habit.category}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{habit.currentStreak}</div>
                <p className="text-xs text-muted-foreground">days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{habit.longestStreak}</div>
                <p className="text-xs text-muted-foreground">days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <p className="text-xs text-muted-foreground">overall</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{history?.completions.length || 0}</div>
                <p className="text-xs text-muted-foreground">times</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Period Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Current Period Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{getFrequencyPeriod()}</p>
                  <p className="font-medium">
                    {completedThisPeriod ? (
                      <span className="text-green-600 flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Not completed yet</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completion History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading history...</p>
                </div>
              ) : history && history.completions.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.completions.map((completion) => (
                    <div
                      key={completion.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-foreground">Completed</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCompletionDate(completion.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No completions yet</p>
                  <p className="text-sm">Start building your habit streak!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HabitDetailView;