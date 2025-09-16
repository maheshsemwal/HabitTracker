import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  CheckCircle, 
  Target, 
  Flame, 
  Calendar,
  Clock
} from 'lucide-react';
import type { FeedItem } from '../store/atoms';
import { feedAPI } from '../services/api';

interface UserActivitiesProps {
  userId: string;
  userName?: string;
  isOwnProfile?: boolean;
}

const UserActivities: React.FC<UserActivitiesProps> = ({ 
  userId, 
  userName = 'User',
  isOwnProfile = false 
}) => {
  const [activities, setActivities] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserActivities();
  }, [userId]);

  const fetchUserActivities = async () => {
    try {
      setLoading(true);
      const userFeed = await feedAPI.getUserFeed(userId);
      setActivities(userFeed);
    } catch (error) {
      console.error('Failed to fetch user activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'HABIT_COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'HABIT_CREATED':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'STREAK_UPDATED':
        return <Flame className="w-4 h-4 text-orange-500" />;
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'HABIT_COMPLETED':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30';
      case 'HABIT_CREATED':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30';
      case 'STREAK_UPDATED':
        return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/30';
      default:
        return 'bg-muted/20 border-muted';
    }
  };

  const formatActivityType = (type: string) => {
    switch (type) {
      case 'HABIT_COMPLETED':
        return 'Completed';
      case 'HABIT_CREATED':
        return 'Created';
      case 'STREAK_UPDATED':
        return 'Streak';
      default:
        return type;
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">
            No Activities Yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isOwnProfile 
              ? "Start completing habits to see your activity here!"
              : `${userName} hasn't shared any activities yet.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((activity) => (
          <Card 
            key={activity.id} 
            className={`transition-all duration-200 hover:shadow-md ${getActivityColor(activity.type)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActivityIcon(activity.type)}
                    <Badge variant="outline" className="text-xs">
                      {formatActivityType(activity.type)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-foreground font-medium mb-1">
                    {activity.message}
                  </p>
                  
                  {activity.habit && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-muted-foreground">
                        {activity.habit.name}
                      </span>
                      {activity.habit.category && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.habit.category}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {activities.length > 6 && (
        <div className="text-center">
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            View all activities
          </button>
        </div>
      )}
    </div>
  );
};

export default UserActivities;