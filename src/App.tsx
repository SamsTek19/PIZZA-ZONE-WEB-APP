import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import RiderPage from './pages/RiderPage';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Pizza Zone...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth />;
  }

  switch (profile.role) {
    case 'admin':
      return <AdminPage />;
    case 'manager':
      return <ManagerPage />;
    case 'rider':
      return <RiderPage />;
    case 'customer':
    default:
      return <CustomerPage />;
  }
}

export default App;
