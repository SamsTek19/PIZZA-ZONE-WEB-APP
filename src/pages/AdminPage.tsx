import { useState, useEffect } from 'react';
import { supabase, Order, OrderItem, MenuItem, Profile } from '../lib/supabase';
import { Package, CheckCircle, Clock, Truck, XCircle, Bell, Pizza, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPage() {
  const { signOut } = useAuth();
  const [orders, setOrders] = useState<(Order & {
    items: (OrderItem & { menu_item: MenuItem })[];
    customer: Profile;
  })[]>([]);
  const [riders, setRiders] = useState<Profile[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchRiders();

    const subscription = supabase
      .channel('admin_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items (*)
        ),
        customer:profiles!orders_customer_id_fkey (*)
      `)
      .neq('status', 'delivered')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as any);
    }
    setLoading(false);
  };

  const fetchRiders = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'rider');

    if (!error && data) {
      setRiders(data);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await sendNotification(order.customer_id, orderId, `Your order is now ${status.replace('_', ' ')}`);
      }
    }
  };

  const assignRider = async (orderId: string, riderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({
        assigned_rider_id: riderId,
        status: 'out_for_delivery'
      })
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await sendNotification(order.customer_id, orderId, 'Your order is out for delivery!');
      }
    }
  };

  const sendNotification = async (userId: string, orderId: string, message: string) => {
    await supabase
      .from('notifications')
      .insert([{ user_id: userId, order_id: orderId, message }]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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
                <h1 className="text-2xl font-bold">Pizza Zone Admin</h1>
                <p className="text-sm text-white/80">Order Management</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Package className="mr-2 text-orange-600" size={28} />
            Active Orders
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No active orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className={`border-2 rounded-lg p-5 ${getStatusColor(order.status)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm opacity-80">
                        Customer: {order.customer.full_name}
                      </p>
                      <p className="text-sm opacity-80">
                        Phone: {order.delivery_phone}
                      </p>
                      <p className="text-sm opacity-80">
                        Address: {order.delivery_address}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">GH₵ {order.total_amount.toFixed(2)}</p>
                      <p className="text-xs opacity-80 mt-1">
                        Payment: {order.payment_status}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-current/20 pt-3 mb-4">
                    <h4 className="font-semibold mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.menu_item.name} x {item.quantity}</span>
                          <span className="font-semibold">GH₵ {(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle size={18} />
                        <span>Confirm Order</span>
                      </button>
                    )}

                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                      >
                        <Clock size={18} />
                        <span>Start Preparing</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle size={18} />
                        <span>Mark as Ready</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <div className="flex items-center space-x-2">
                        <select
                          onChange={(e) => assignRider(order.id, e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          defaultValue=""
                        >
                          <option value="" disabled>Assign Rider</option>
                          {riders.map((rider) => (
                            <option key={rider.id} value={rider.id}>
                              {rider.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Truck size={18} />
                        <span className="font-semibold">
                          Rider: {riders.find(r => r.id === order.assigned_rider_id)?.full_name || 'Unknown'}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <XCircle size={18} />
                      <span>Cancel</span>
                    </button>

                    <button
                      onClick={() => sendNotification(order.customer_id, order.id, 'Your order is ready for pickup!')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <Bell size={18} />
                      <span>Notify Customer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
