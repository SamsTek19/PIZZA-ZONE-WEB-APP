import { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CheckCircle, XCircle, Truck } from 'lucide-react';
import { supabase, Order, OrderItem, MenuItem, RiderLocation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<(Order & { items: (OrderItem & { menu_item: MenuItem })[] })[]>([]);
  const [riderLocations, setRiderLocations] = useState<Record<string, RiderLocation>>({});

  useEffect(() => {
    fetchOrders();

    const ordersSubscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${user?.id}` }, () => {
        fetchOrders();
      })
      .subscribe();

    const locationSubscription = supabase
      .channel('rider_locations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rider_locations' }, (payload) => {
        if (payload.new) {
          setRiderLocations(prev => ({
            ...prev,
            [(payload.new as RiderLocation).order_id || '']: payload.new as RiderLocation
          }));
        }
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      locationSubscription.unsubscribe();
    };
  }, [user]);

  const fetchOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items (*)
        )
      `)
      .eq('customer_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!ordersError && ordersData) {
      setOrders(ordersData as any);

      const activeOrders = ordersData.filter(o => o.status === 'out_for_delivery');
      for (const order of activeOrders) {
        if (order.assigned_rider_id) {
          const { data: locationData } = await supabase
            .from('rider_locations')
            .select('*')
            .eq('order_id', order.id)
            .maybeSingle();

          if (locationData) {
            setRiderLocations(prev => ({
              ...prev,
              [order.id]: locationData
            }));
          }
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="inline" size={16} />;
      case 'confirmed': return <CheckCircle className="inline" size={16} />;
      case 'preparing': return <Package className="inline" size={16} />;
      case 'ready': return <CheckCircle className="inline" size={16} />;
      case 'out_for_delivery': return <Truck className="inline" size={16} />;
      case 'delivered': return <CheckCircle className="inline" size={16} />;
      case 'cancelled': return <XCircle className="inline" size={16} />;
      default: return <Package className="inline" size={16} />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Package className="mr-2 text-orange-600" size={28} />
        My Orders
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No orders yet</p>
          <p className="text-sm">Start ordering to see your order history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{formatStatus(order.status)}</span>
                    </span>
                    {order.payment_status === 'paid' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Paid
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Order ID: {order.id.slice(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">GH₵ {order.total_amount.toFixed(2)}</p>
                  {order.estimated_delivery_time && order.status !== 'delivered' && (
                    <p className="text-xs text-gray-500 mt-1">
                      <Clock className="inline" size={12} /> ETA: {new Date(order.estimated_delivery_time).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-3">
                <div className="space-y-1">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.menu_item.name} x {item.quantity}
                      </span>
                      <span className="text-gray-800">GH₵ {(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>{order.delivery_address}</span>
              </div>

              {order.status === 'out_for_delivery' && riderLocations[order.id] && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900 mb-2">
                    <Truck className="inline mr-1" size={16} />
                    Rider is on the way!
                  </p>
                  <p className="text-xs text-purple-700">
                    Location: {riderLocations[order.id].latitude.toFixed(6)}, {riderLocations[order.id].longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Last updated: {new Date(riderLocations[order.id].updated_at).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
