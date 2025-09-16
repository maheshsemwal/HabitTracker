import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocial } from '../hooks/useSocial';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Search, UserPlus, Check } from 'lucide-react';
import type { User } from '../store/atoms';

const UserSearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState<string | null>(null);
  
  const { searchUsers, sendFollowRequest, following } = useSocial();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayedSearch = setTimeout(() => {
        handleSearch();
      }, 300); // Debounce search

      return () => clearTimeout(delayedSearch);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const users = await searchUsers(searchQuery.trim());
      // Filter out current user
      const filteredUsers = users.filter(user => user.id !== currentUser?.id);
      setSearchResults(filteredUsers);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setRequestLoading(userId);
    try {
      await sendFollowRequest(userId);
      // Remove the user from search results after sending request
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setRequestLoading(null);
    }
  };

  const isAlreadyFollowing = (userId: string) => {
    return following.some(user => user.id === userId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Find Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity flex-1"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-medium text-foreground">
                      {user.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div>
                  {isAlreadyFollowing(user.id) ? (
                    <Button variant="outline" disabled className="flex items-center">
                      <Check className="w-4 h-4 mr-1" />
                      Following
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(user.id)}
                      disabled={requestLoading === user.id}
                      className="flex items-center"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {requestLoading === user.id ? 'Sending...' : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {searchQuery.trim().length > 2 && !loading && searchResults.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No users found matching "{searchQuery}"</p>
          </div>
        )}

        {searchQuery.trim().length <= 2 && searchQuery.trim().length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Type at least 3 characters to search</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSearchComponent;