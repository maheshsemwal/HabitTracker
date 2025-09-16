import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocial } from '../hooks/useSocial';
import { userAPI } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, UserPlus, Users } from 'lucide-react';
import type { User as UserType } from '../store/atoms';

interface FollowListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  title: string;
}

const FollowListDialog: React.FC<FollowListDialogProps> = ({
  isOpen,
  onClose,
  userId,
  type,
  title
}) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { sendFollowRequest } = useSocial();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let usersList: UserType[] = [];
      
      if (type === 'followers') {
        usersList = await userAPI.getFollowers(userId);
      } else {
        usersList = await userAPI.getFollowing(userId);
      }

      // Sort users with current user at the top if present
      const sortedUsers = usersList.sort((a, b) => {
        if (a.id === currentUser?.id) return -1;
        if (b.id === currentUser?.id) return 1;
        return a.name.localeCompare(b.name);
      });

      setUsers(sortedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: UserType) => {
    if (user.id === currentUser?.id) {
      navigate('/profile');
    } else {
      navigate(`/profile/${user.id}`);
    }
    onClose();
  };

  const handleFollowUser = async (user: UserType) => {
    try {
      await sendFollowRequest(user.id);
      // Optionally refresh the list
      await fetchUsers();
    } catch (error) {
      console.error('Failed to send follow request:', error);
    }
  };

  const isCurrentUser = (user: UserType) => user.id === currentUser?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {type === 'followers' ? (
              <Users className="w-5 h-5" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">
                No {type} yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {type === 'followers' 
                  ? "No one is following this user yet."
                  : "This user isn't following anyone yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                    isCurrentUser(user) ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                >
                  <div 
                    className="flex items-center space-x-3 cursor-pointer flex-1"
                    onClick={() => handleUserClick(user)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.name || 'Unknown User'}
                        </p>
                        {isCurrentUser(user) && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  {!isCurrentUser(user) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFollowUser(user)}
                      className="ml-2"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Follow
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;