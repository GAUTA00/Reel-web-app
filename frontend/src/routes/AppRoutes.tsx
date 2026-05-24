// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import Welcome from '../screens/auth/Welcome';
import Login from '../screens/auth/login/Login';
import Signup from '../screens/auth/signup/Signup';
import Feed from '../screens/feed/Feed';
import Dashboard from '../screens/dashboard/Dashboard';
import Profile from '../screens/profile/Profile';
import GoogleCallback from '../screens/auth/GoogleCallback';
import GoogleAuthSuccess from '../screens/auth/GoogleAuthSuccess';
import UploadPage from '../screens/upload/UploadPage';
import Notifications from '../screens/notifications/Notifications';
import Friends from '../screens/friends/Friends';
import SearchPage from '../screens/search/SearchPage';
import TagPage from '../screens/tag/TagPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/friends" element={<Friends />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/tag/:tag" element={<TagPage />} />
    </Routes>
  );
}
