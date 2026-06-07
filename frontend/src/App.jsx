import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Placeholder } from './components/Placeholder';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ListingDetail from './pages/ListingDetail';
import ListingForm from './pages/ListingForm';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile';
import Messages from './pages/Messages';
import Favorites from './pages/Favorites';
import Admin from './pages/Admin';

// Routes are wired now; each Placeholder is swapped for its real page in F2–F11.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="listings/:id" element={<ListingDetail />} />
        <Route path="u/:id" element={<PublicProfile />} />

        <Route
          path="sell"
          element={
            <ProtectedRoute>
              <ListingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="listings/:id/edit"
          element={
            <ProtectedRoute>
              <ListingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="messages/:conversationId"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Placeholder title="Settings (F11)" />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Placeholder title="404 — Page not found" />} />
      </Route>
    </Routes>
  );
}
