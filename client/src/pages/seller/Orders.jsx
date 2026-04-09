import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext.jsx'
import { assets } from '../../assets/assets.js';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const statusColors = {
  "Order Placed":     "bg-blue-50 text-blue-700 border-blue-200",
  "Packing":          "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Shipped":          "bg-purple-50 text-purple-700 border-purple-200",
  "Out for Delivery": "bg-orange-50 text-orange-700 border-orange-200",
  "Delivered":        "bg-green-50 text-green-700 border-green-200",
  "Cancelled":        "bg-red-50 text-red-600 border-red-200",
};

function Orders() {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState(null); // orderId being updated

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const { data } = await axios.post('/api/order/status', { orderId, status: newStatus });
      if (data.success) {
        toast.success(`Status updated to "${newStatus}"`);
        setOrders(prev =>
          prev.map(o => o._id === orderId
            ? { ...o, status: newStatus, isPaid: newStatus === "Delivered" ? true : o.isPaid }
            : o)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(null);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className='no-scrollbar flex-1 h-full overflow-y-auto'>
      <div className="p-6 md:p-10">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Orders</h1>
            <p className="text-xs text-gray-400 mt-0.5">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <svg className="w-14 h-14 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="font-medium text-gray-500">No orders yet</p>
          </div>
        )}

        <div className="space-y-4 max-w-5xl">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <img className="w-4 h-4" src={assets.box_icon} alt="order" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Order </span>
                    <span className="text-xs font-mono font-semibold text-gray-700">#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Payment badge */}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${order.isPaid
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                    {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                  </span>

                  {/* Amount */}
                  <span className="font-bold text-gray-800 text-sm">{currency}{parseFloat((order.items.reduce((sum, item) => sum + ((item.product?.offerPrice || 0) * item.quantity), 0) * 1.02).toPrecision(12))}</span>

                  {/* Status badge - shows saved status with color */}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap
                    ${statusColors[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {order.status}
                  </span>

                  {/* Plain select to change status (no color on the select itself) */}
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className={`text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-1.5 pr-6 rounded-lg cursor-pointer outline-none appearance-none
                        hover:border-gray-400 transition-colors
                        ${updating === order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <svg className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {updating === order._id && (
                    <svg className="w-4 h-4 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Order Body */}
              <div className="p-5 flex flex-col md:flex-row gap-5 justify-between">
                {/* Items */}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</p>
                  <div className="space-y-1">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm text-gray-700">
                        {item.product?.name ?? (
                          <span className="italic text-gray-400">(Deleted product)</span>
                        )}
                        <span className='text-primary font-semibold ml-1.5'>× {item.quantity}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Delivery */}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Delivery To</p>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p className='font-medium text-gray-800'>{order.address.firstName} {order.address.lastName}</p>
                    <p>{order.address.street}, {order.address.ward}, {order.address.city}</p>
                    <p className="text-gray-400">{order.address.phone}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="md:text-right">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Info</p>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>{order.paymentType}</p>
                    <p className="text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Orders