import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { habitStatsSelector } from '../store/selectors';
import { useAuth } from '../hooks/useAuth';
import { useHabits } from '../hooks/useHabits';
import { useSocial } from '../hooks/useSocial';
import { analyticsAPI, userAPI } from '../services/api';
import Layout from '../components/Layout';
import HabitCharts from '../components/HabitCharts';
import UserActivities from '../components/UserActivities';
import FollowListDialog from '../components/FollowListDialog';
import HabitDetailView from '../components/HabitDetailView';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  Users,
  UserPlus
} from 'lucide-react';
import type { User as UserType, Habit } from '../store/atoms';

interface UserAnalytics {
  totalHabits: number;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const { habits, fetchHabits } = useHabits();
  const { 
    sendFollowRequest
  } = useSocial();
  
  const stats = useRecoilValue(habitStatsSelector);
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [userFollowers, setUserFollowers] = useState<UserType[]>([]);
  const [userFollowing, setUserFollowing] = useState<UserType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Determine if it's own profile - either no userId param or userId matches current user
  const isOwnProfile = !userId || currentUser?.id === userId;
  const targetUserId = userId || currentUser?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchUserData();
    }
  }, [targetUserId, currentUser]);

  const fetchUserData = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      // Fetch user profile (unless it's current user's own profile)
      if (!isOwnProfile) {
        const userData = await userAPI.getUserProfile(targetUserId);
        setProfileUser(userData);
      }

      // Fetch user analytics
      const analyticsData = await analyticsAPI.getUserAnalytics(targetUserId);
      setAnalytics(analyticsData);

      // Fetch followers and following directly from API
      const followersData = await userAPI.getFollowers(targetUserId);
      const followingData = await userAPI.getFollowing(targetUserId);
      setUserFollowers(followersData);
      setUserFollowing(followingData);

      // Check if current user is following this user
      if (currentUser && !isOwnProfile) {
        const isFollowingUser = followersData.some(
          (follower: UserType) => follower.id === currentUser.id
        );
        setIsFollowing(isFollowingUser);
      }

      // If it's own profile, fetch habits
      if (isOwnProfile) {
        await fetchHabits();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async () => {
    if (!targetUserId || isOwnProfile) return;

    try {
      await sendFollowRequest(targetUserId);
      // Refresh data to update follow status
      await fetchUserData();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading && !analytics) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {isOwnProfile 
                    ? currentUser?.name?.charAt(0).toUpperCase() || 'U'
                    : profileUser?.name?.charAt(0).toUpperCase() || 'U'
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {isOwnProfile 
                    ? currentUser?.name || 'Unknown' 
                    : profileUser?.name || 'Loading...'
                  }
                </h1>
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? currentUser?.email 
                    : profileUser?.email || ''
                  }
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <button 
                    onClick={() => setFollowersDialogOpen(true)}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground hover:text-primary">
                      {userFollowers.length} followers
                    </span>
                  </button>
                  <button 
                    onClick={() => setFollowingDialogOpen(true)}
                    className="flex items-center space-x-1 hover:text-primary transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground hover:text-primary">
                      {userFollowing.length} following
                    </span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground">
                      {isOwnProfile 
                        ? `${currentUser?.overallStreak || 0} day streak`
                        : `${profileUser?.overallStreak || 0} day streak`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {!isOwnProfile && (
                <Button
                  onClick={handleFollowUser}
                  disabled={loading || isFollowing}
                  variant={isFollowing ? "outline" : "default"}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isOwnProfile ? stats.totalHabits : analytics?.totalHabits || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isOwnProfile ? stats.totalCompletions : analytics?.totalCompletions || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isOwnProfile ? (currentUser?.overallStreak || 0) : analytics?.currentStreak || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isOwnProfile ? (currentUser?.longestOverallStreak || 0) : analytics?.longestStreak || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Habits List (only for own profile) */}
        {isOwnProfile && habits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Habits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {habits.map((habit) => (
                  <div 
                    key={habit.id} 
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedHabit(habit)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-primary hover:text-primary/80">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{habit.frequency}</Badge>
                        {habit.category && (
                          <Badge variant="secondary">{habit.category}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        Streak: {habit.currentStreak}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Best: {habit.longestStreak}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section (visible for all profiles) */}
        {targetUserId && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Analytics & Progress</h2>
            <HabitCharts userId={targetUserId} />
          </div>
        )}

        {/* User Activities Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <UserActivities 
            userId={targetUserId!}
            userName={isOwnProfile 
              ? currentUser?.name 
              : profileUser?.name
            }
            isOwnProfile={isOwnProfile}
          />
        </div>
      </div>

      {/* Follow List Dialogs */}
      {targetUserId && (
        <>
          <FollowListDialog
            isOpen={followersDialogOpen}
            onClose={() => setFollowersDialogOpen(false)}
            userId={targetUserId}
            type="followers"
            title={`${userFollowers.length} Followers`}
          />
          
          <FollowListDialog
            isOpen={followingDialogOpen}
            onClose={() => setFollowingDialogOpen(false)}
            userId={targetUserId}
            type="following"
            title={`${userFollowing.length} Following`}
          />
        </>
      )}

      {/* Habit Detail View */}
      {selectedHabit && (
        <HabitDetailView
          habit={selectedHabit}
          isOpen={!!selectedHabit}
          onClose={() => setSelectedHabit(null)}
        />
      )}
    </Layout>
  );
};

export default Profile;