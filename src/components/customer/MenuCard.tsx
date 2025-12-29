import { Plus, Clock } from 'lucide-react';
import { MenuItem } from '../../lib/supabase';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export default function MenuCard({ item, onAddToCart }: MenuCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍕
          </div>
        )}
        {!item.in_stock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={16} className="mr-1" />
            <span>{item.preparation_time} mins</span>
          </div>
          <div className="text-xl font-bold text-orange-600">
            GH₵ {item.price.toFixed(2)}
          </div>
        </div>

        <button
          onClick={() => onAddToCart(item)}
          disabled={!item.in_stock}
          className="w-full bg-gradient-to-r from-red-600 via-orange-500 to-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Plus size={20} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
