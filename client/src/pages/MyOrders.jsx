import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

function MyOrders() {
    const [myOrders, setMyOrders] = useState([]);
    const { currency, axios, user } = useAppContext();

    const fetchMyOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/user');
            if (data.success) {
                setMyOrders(data.orders);
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        if (user) {
            fetchMyOrders();
        }
    }, [user]);

    const statusColors = {
        'Order Placed':  'bg-blue-50 text-blue-600 border-blue-200',
        'Processing':    'bg-yellow-50 text-yellow-700 border-yellow-200',
        'Shipped':       'bg-purple-50 text-purple-600 border-purple-200',
        'Out for Delivery': 'bg-orange-50 text-orange-600 border-orange-200',
        'Delivered':     'bg-green-50 text-green-600 border-green-200',
    };

    return (
        <div className='mt-8 pb-16 animate-fadeIn'>
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>My Orders</h1>
                    <div className='w-12 h-0.5 bg-primary rounded-full mt-2' />
                </div>
                <span className="text-sm text-gray-400">{myOrders.length} order{myOrders.length !== 1 ? 's' : ''}</span>
            </div>

            {myOrders.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="font-medium text-gray-500">No orders yet</p>
                    <p className="text-sm mt-1">When you place orders, they'll appear here.</p>
                </div>
            )}

            <div className="space-y-6">
                {myOrders.map((order, oIdx) => (
                    <div key={oIdx} className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
                        {/* Order header */}
                        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100 gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-gray-400 font-medium">Order</span>
                                <span className="text-xs text-gray-600 font-mono">#{order._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
                                <span>📦 {order.paymentType}</span>
                                <span className="font-bold text-gray-800">{currency}{parseFloat((order.items.reduce((sum, item) => sum + ((item.product?.offerPrice || 0) * item.quantity), 0) * 1.02).toPrecision(12))}</span>
                            </div>
                        </div>

                        {/* Order items */}
                        <div className="divide-y divide-gray-50">
                            {order.items.map((item, iIdx) => (
                                <div key={iIdx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                                    <div className='flex items-center gap-4'>
                                        <div className='bg-primary/8 rounded-2xl p-3 flex-shrink-0'>
                                            <img src={item.product.images[0]} alt="" className='w-16 h-16 object-contain' />
                                        </div>
                                        <div>
                                            <h2 className='text-base font-semibold text-gray-800'>{item.product.name}</h2>
                                            <p className="text-xs text-gray-400 mt-0.5">{item.product.category?.name}</p>
                                            <p className="text-xs text-gray-500 mt-1.5">Qty: <span className="font-medium text-gray-700">{item.quantity || 1}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 pl-0 sm:pl-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[order.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {order.status}
                                        </span>
                                        <div className="text-right">
                                            <p className='text-primary font-bold'>{currency}{item.product.offerPrice * item.quantity}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyOrders;