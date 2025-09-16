import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { FeedItem } from '../store/atoms';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, Target, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedItemComponentProps {
  item: FeedItem;
}

const FeedItemComponent: React.FC<FeedItemComponentProps> = ({ item }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleUserClick = () => {
    if (item.user.id === currentUser?.id) {
      navigate('/profile');
    } else {
      navigate(`/profile/${item.user.id}`);
    }
  };

  const getIcon = () => {
    switch (item.type) {
      case 'HABIT_CREATED':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'HABIT_COMPLETED':
        return <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'STREAK_UPDATED':
        return <Trophy className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'HABIT_CREATED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'HABIT_COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'STREAK_UPDATED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTypeText = () => {
    switch (item.type) {
      case 'HABIT_CREATED':
        return 'New Habit';
      case 'HABIT_COMPLETED':
        return 'Completed';
      case 'STREAK_UPDATED':
        return 'Streak Updated';
      default:
        return item.type;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Avatar 
            className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={handleUserClick}
          >
            <AvatarFallback>
              {item.user.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleUserClick}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {item.user.name || 'Unknown User'}
                </button>
                <Badge className={getTypeColor()}>
                  {getIcon()}
                  <span className="ml-1">{getTypeText()}</span>
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </div>
            
            <div className="mt-1">
              <p className="text-sm text-foreground font-medium">
                {item.habit?.name || 'Unknown Habit'}
              </p>
              {item.habit?.category && (
                <Badge variant="outline" className="mt-1">
                  {item.habit.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {item.message && (
          <p className="text-sm text-muted-foreground">
            {item.message}
          </p>
        )}
        
        {item.type === 'HABIT_COMPLETED' && item.habit && (
          <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
            <span>Streak: {item.habit.currentStreak || 0}</span>
            <span>Best: {item.habit.longestStreak || 0}</span>
            <span>{item.habit.frequency?.toLowerCase() || 'daily'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedItemComponent;