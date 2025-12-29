import { useState, useEffect } from 'react';
import { supabase, Order, OrderItem, MenuItem } from '../lib/supabase';
import { MapPin, Navigation, CheckCircle, Pizza, LogOut, Phone, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function RiderPage() {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<(Order & { items: (OrderItem & { menu_item: MenuItem })[] })[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    fetchAssignedOrders();

    const subscription = supabase
      .channel('rider_orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `assigned_rider_id=eq.${user?.id}`
      }, () => {
        fetchAssignedOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [user]);

  const fetchAssignedOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items (*)
        )
      `)
      .eq('assigned_rider_id', user?.id)
      .in('status', ['out_for_delivery'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as any);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        updateLocation(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);
    setTracking(true);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setTracking(false);
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    if (orders.length === 0) return;

    const currentOrder = orders[0];

    const { data: existingLocation } = await supabase
      .from('rider_locations')
      .select('*')
      .eq('rider_id', user?.id)
      .maybeSingle();

    if (existingLocation) {
      await supabase
        .from('rider_locations')
        .update({
          latitude,
          longitude,
          order_id: currentOrder.id,
          updated_at: new Date().toISOString()
        })
        .eq('rider_id', user?.id);
    } else {
      await supabase
        .from('rider_locations')
        .insert([{
          rider_id: user?.id,
          order_id: currentOrder.id,
          latitude,
          longitude
        }]);
    }
  };

  const markAsDelivered = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId);

    if (!error) {
      fetchAssignedOrders();
      if (orders.length === 1) {
        stopTracking();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-red-600 via-orange-500 to-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Pizza size={40} />
              <div>
                <h1 className="text-2xl font-bold">Pizza Zone Rider</h1>
                <p className="text-sm text-white/80">Delivery Management</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="hover:bg-white/10 p-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Navigation className="mr-2 text-orange-600" size={28} />
            GPS Tracking
          </h2>

          <div className="flex items-center space-x-4 mb-4">
            {!tracking ? (
              <button
                onClick={startTracking}
                disabled={orders.length === 0}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Navigation size={20} />
                <span>Start Tracking</span>
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-red-700 transition-colors"
              >
                <Navigation size={20} />
                <span>Stop Tracking</span>
              </button>
            )}

            {tracking && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                <span className="font-semibold">Tracking Active</span>
              </div>
            )}
          </div>

          {location && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 mb-2">
                <MapPin className="inline mr-1" size={16} />
                Current Location:
              </p>
              <p className="text-sm text-green-700">
                Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}

          {orders.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
              No active deliveries assigned
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Package className="mr-2 text-orange-600" size={28} />
            Active Deliveries
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No deliveries assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border-2 border-purple-200 bg-purple-50 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-purple-900">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <div className="space-y-1 text-sm text-purple-800">
                        <p className="flex items-center">
                          <Phone className="mr-2" size={16} />
                          {order.delivery_phone}
                        </p>
                        <p className="flex items-start">
                          <MapPin className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                          {order.delivery_address}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-900">
                        GH₵ {order.total_amount.toFixed(2)}
                      </p>
                      {order.payment_status === 'pending' && (
                        <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          Collect Cash
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-purple-200 pt-3 mb-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm text-purple-800">
                          <span>{item.menu_item.name} x {item.quantity}</span>
                          <span className="font-semibold">GH₵ {(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => markAsDelivered(order.id)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={20} />
                    <span>Mark as Delivered</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
