import { Routes, Route } from 'react-router-dom';
import Welcome from '../pages/Welcome';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Feed from '../pages/Feed';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import GoogleCallback from '../pages/GoogleCallback';
import GoogleAuthSuccess from '../pages/GoogleAuthSuccess';
import UploadPage from '../pages/UploadPage';
import Notifications from '../pages/Notifications';
import Friends from '../pages/Friends';
import SearchPage from '../pages/SearchPage';

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
        </Routes>
    );
}
