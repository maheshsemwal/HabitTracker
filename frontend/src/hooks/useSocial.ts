import { useRecoilState } from 'recoil';
import { feedState, followRequestsState, followersState, followingState } from '../store/atoms';
import { feedAPI, userAPI } from '../services/api';
import { toast } from 'sonner';

export const useSocial = () => {
  const [feed, setFeed] = useRecoilState(feedState);
  const [followRequests, setFollowRequests] = useRecoilState(followRequestsState);
  const [followers, setFollowers] = useRecoilState(followersState);
  const [following, setFollowing] = useRecoilState(followingState);

  const searchUsers = async (query: string) => {
    try {
      const users = await userAPI.searchUsers(query);
      return users;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to search users';
      toast.error(message);
      throw error;
    }
  };

  const fetchFeed = async () => {
    try {
      const feedData = await feedAPI.getMyFeed();
      setFeed(feedData);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch feed';
      toast.error(message);
    }
  };

  const fetchUserFeed = async (userId: string) => {
    try {
      const feedData = await feedAPI.getUserFeed(userId);
      return feedData;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch user feed';
      toast.error(message);
      throw error;
    }
  };

  const sendFollowRequest = async (userId: string) => {
    try {
      await userAPI.sendFollowRequest(userId);
      toast.success('Follow request sent!');
      // Refresh follow requests
      await fetchFollowRequests();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send follow request';
      toast.error(message);
      throw error;
    }
  };

  const respondToRequest = async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    try {
      await userAPI.respondToRequest(requestId, action);
      const actionText = action === 'ACCEPTED' ? 'accepted' : 'rejected';
      toast.success(`Follow request ${actionText}!`);
      // Refresh follow requests
      await fetchFollowRequests();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to respond to request';
      toast.error(message);
      throw error;
    }
  };

  const fetchFollowRequests = async () => {
    try {
      const requests = await userAPI.getRequests();
      setFollowRequests(requests);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch follow requests';
      toast.error(message);
    }
  };

  const fetchFollowers = async (userId: string) => {
    try {
      const followersData = await userAPI.getFollowers(userId);
      setFollowers(followersData);
      return followersData;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch followers';
      toast.error(message);
      throw error;
    }
  };

  const fetchFollowing = async (userId: string) => {
    try {
      const followingData = await userAPI.getFollowing(userId);
      setFollowing(followingData);
      return followingData;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch following';
      toast.error(message);
      throw error;
    }
  };

  return {
    feed,
    followRequests,
    followers,
    following,
    searchUsers,
    fetchFeed,
    fetchUserFeed,
    sendFollowRequest,
    respondToRequest,
    fetchFollowRequests,
    fetchFollowers,
    fetchFollowing,
  };
};