import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Edit, Trash2, Calendar, Target } from 'lucide-react';
import type { Habit } from '../store/atoms';
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onView?: (habit: Habit) => void;
  loading?: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onComplete,
  onEdit,
  onDelete,
  onView,
  loading = false,
}) => {
  const isCompletedToday = () => {
    if (!habit.completedHabits || !Array.isArray(habit.completedHabits)) {
      return false;
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
  };

  const completed = isCompletedToday();

  const getFrequencyText = () => {
    switch (habit.frequency) {
      case 'DAILY':
        return 'Daily';
      case 'WEEKLY':
        return 'Weekly';
      case 'MONTHLY':
        return 'Monthly';
      default:
        return habit.frequency;
    }
  };

  const getFrequencyColor = () => {
    switch (habit.frequency) {
      case 'DAILY':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'WEEKLY':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'MONTHLY':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 ${
        completed ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/30' : 'hover:shadow-md'
      } ${onView ? 'cursor-pointer' : ''}`}
      onClick={() => onView && onView(habit)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {habit.name}
            </CardTitle>
            {habit.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {habit.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(habit);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(habit.id);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={getFrequencyColor()}>
              <Calendar className="w-3 h-3 mr-1" />
              {getFrequencyText()}
            </Badge>
            {habit.category && (
              <Badge variant="outline">
                {habit.category}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>Streak: {habit.currentStreak}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Best streak: {habit.longestStreak}
          </div>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(habit.id);
            }}
            disabled={completed || loading}
            className={`${
              completed
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                : ''
            }`}
            variant={completed ? undefined : 'default'}
          >
            <Check className="w-4 h-4 mr-2" />
            {completed ? 'Completed!' : 'Mark Complete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;