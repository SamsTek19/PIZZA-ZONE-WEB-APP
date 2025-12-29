import { Pizza, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

export default function Navbar({ cartItemsCount, onCartClick }: NavbarProps) {
  const { profile, signOut } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-red-600 via-orange-500 to-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Pizza size={40} className="drop-shadow-lg" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pizza Zone</h1>
              <p className="text-xs text-white/80">Best Food in Town</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={onCartClick}
              className="relative hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <ShoppingCart size={24} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <User size={20} />
              <span className="text-sm font-medium">{profile?.full_name}</span>
            </div>

            <button
              onClick={signOut}
              className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
