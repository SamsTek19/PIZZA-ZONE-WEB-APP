import { useState, useEffect } from 'react';
import { supabase, MenuItem, Category, Order } from '../lib/supabase';
import { Pizza, Package, TrendingUp, AlertTriangle, Plus, Edit, Save, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ManagerPage() {
  const { signOut } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, pendingOrders: 0 });

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchOrders();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');

    if (!error && data) {
      setMenuItems(data);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
      const totalRevenue = data.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0);
      const pending = data.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
      setStats({
        totalOrders: data.length,
        revenue: totalRevenue,
        pendingOrders: pending
      });
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const { error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id);

    if (!error) {
      fetchMenuItems();
      setEditingItem(null);
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category_id) {
      alert('Please fill in all required fields');
      return;
    }

    const { error } = await supabase
      .from('menu_items')
      .insert([{
        ...newItem,
        preparation_time: newItem.preparation_time || 30,
        stock_quantity: newItem.stock_quantity || 0,
        in_stock: true,
        is_active: true
      }]);

    if (!error) {
      fetchMenuItems();
      setShowAddForm(false);
      setNewItem({});
    }
  };

  const toggleStock = async (id: string, currentStock: boolean) => {
    await updateMenuItem(id, { in_stock: !currentStock });
  };

  const lowStockItems = menuItems.filter(item => item.stock_quantity < 10 && item.is_active);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-red-600 via-orange-500 to-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Pizza size={40} />
              <div>
                <h1 className="text-2xl font-bold">Pizza Zone Manager</h1>
                <p className="text-sm text-white/80">Inventory & Analytics</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>
              <Package className="text-blue-600" size={48} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">GH₵ {stats.revenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="text-green-600" size={48} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Orders</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
              </div>
              <AlertTriangle className="text-orange-600" size={48} />
            </div>
          </div>
        </div>

        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
              <AlertTriangle className="mr-2" size={24} />
              Low Stock Alert
            </h3>
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-red-700">
                  <span className="font-medium">{item.name}</span>
                  <span className="bg-red-200 px-3 py-1 rounded-full text-sm font-bold">
                    {item.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Package className="mr-2 text-orange-600" size={28} />
              Menu Management
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-red-600 via-orange-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              <span>Add Item</span>
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 bg-gray-50 border-2 border-orange-200 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">Add New Menu Item</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={newItem.category_id || ''}
                  onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price || ''}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={newItem.stock_quantity || ''}
                  onChange={(e) => setNewItem({ ...newItem, stock_quantity: parseInt(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Prep Time (mins)"
                  value={newItem.preparation_time || ''}
                  onChange={(e) => setNewItem({ ...newItem, preparation_time: parseInt(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={newItem.image_url || ''}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  placeholder="Description"
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={addMenuItem}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItem({});
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => {
                  const category = categories.find(c => c.id === item.category_id);
                  return (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{category?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                        GH₵ {item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            defaultValue={item.stock_quantity}
                            onBlur={(e) => updateMenuItem(item.id, { stock_quantity: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <span className={`font-semibold ${item.stock_quantity < 10 ? 'text-red-600' : 'text-gray-800'}`}>
                            {item.stock_quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStock(item.id, item.in_stock)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.in_stock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.in_stock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
