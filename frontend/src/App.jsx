import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Placeholder } from './components/Placeholder';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ListingDetail from './pages/ListingDetail';
import ListingForm from './pages/ListingForm';

// Routes are wired now; each Placeholder is swapped for its real page in F2–F11.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="listings/:id" element={<ListingDetail />} />
        <Route path="u/:id" element={<Placeholder title="Public profile (F7)" />} />

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
              <Placeholder title="Dashboard (F6)" />
            </ProtectedRoute>
          }
        />
        <Route
          path="messages"
          element={
            <ProtectedRoute>
              <Placeholder title="Inbox (F8)" />
            </ProtectedRoute>
          }
        />
        <Route
          path="favorites"
          element={
            <ProtectedRoute>
              <Placeholder title="Favorites (F9)" />
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
              <Placeholder title="Admin (F10)" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Placeholder title="404 — Page not found" />} />
      </Route>
    </Routes>
  );
}
