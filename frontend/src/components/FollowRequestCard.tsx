import type { FollowRequest } from '../store/atoms';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FollowRequestCardProps {
  request: FollowRequest;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  loading?: boolean;
}

const FollowRequestCard: React.FC<FollowRequestCardProps> = ({
  request,
  onAccept,
  onReject,
  loading = false,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {request.follower.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {request.follower.name || 'Unknown User'}
            </p>
            <p className="text-xs text-muted-foreground">
              {request.follower.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => onAccept(request.id)}
            disabled={loading}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject(request.id)}
            disabled={loading}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowRequestCard;