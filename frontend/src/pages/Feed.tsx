import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { friendsFeedSelector } from '../store/selectors';
import { useSocial } from '../hooks/useSocial';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import FeedItemComponent from '../components/FeedItem';
import UserSearchComponent from '../components/UserSearchComponent';
import PendingRequestsList from '../components/PendingRequestsList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, UserPlus } from 'lucide-react';

const Feed = () => {
  const friendsFeed = useRecoilValue(friendsFeedSelector);
  const { currentUser } = useAuth();
  
  const {
    following,
    fetchFeed,
    fetchFollowing,
  } = useSocial();

  useEffect(() => {
    if (currentUser) {
      fetchFeed();
      fetchFollowing(currentUser.id);
    }
  }, [currentUser]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Feed</h1>
          <p className="text-muted-foreground">See what your friends are up to</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Following</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{following.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feed Items</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{friendsFeed.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Search Component */}
        <UserSearchComponent />

        {/* Pending Requests List */}
        <PendingRequestsList />

        {/* Friends Feed */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Friends Activity
          </h2>
          
          {friendsFeed.length > 0 ? (
            <div className="space-y-4">
              {friendsFeed.map((item) => (
                <FeedItemComponent key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">
                  No activity yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Follow some friends to see their habit progress here!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Feed;