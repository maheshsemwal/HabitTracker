import { useEffect, useState } from 'react';
import { useSocial } from '../hooks/useSocial';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import FollowRequestCard from './FollowRequestCard';
import { Bell, Users } from 'lucide-react';

const PendingRequestsList = () => {
  const [requestsLoading, setRequestsLoading] = useState(false);
  
  const { 
    followRequests, 
    fetchFollowRequests, 
    respondToRequest,
    fetchFollowing 
  } = useSocial();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchFollowRequests();
    }
  }, [currentUser]);

  const handleAcceptRequest = async (requestId: string) => {
    setRequestsLoading(true);
    try {
      await respondToRequest(requestId, 'ACCEPTED');
      if (currentUser) {
        await fetchFollowing(currentUser.id);
      }
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setRequestsLoading(true);
    try {
      await respondToRequest(requestId, 'REJECTED');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setRequestsLoading(false);
    }
  };

  const pendingRequests = followRequests.filter(req => req.status === 'PENDING');

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Follow Requests
            </span>
            <Badge variant="secondary">0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">
              No pending requests
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You don't have any follow requests at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Follow Requests
          </span>
          <Badge variant="secondary">{pendingRequests.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <FollowRequestCard
              key={request.id}
              request={request}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              loading={requestsLoading}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingRequestsList;