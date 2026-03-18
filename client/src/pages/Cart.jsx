
import { useEffect, useState } from "react";
import { useAppContext } from '../context/AppContext.jsx';
import { assets, dummyAddress } from "../assets/assets.js";
import toast from "react-hot-toast";

const Cart = () => {
    const { products, currency, cartItems, setCartItems, removeFromCart, getCartCount, updateCartItem,
        navigate, getCartAmount, axios, user } = useAppContext();

    const [cartArray, setCartArray] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [showAddress, setShowAddress] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const placeOrder = async () => {
        try {
            if (!selectedAddress) {
                return toast.error("Please select an address");
            }
            const { data } = await axios.post('/api/order/cod', {
                userId: user._id,
                items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                address: selectedAddress._id
            });
            if (data.success) {
                toast.success(data.message);
                setCartItems({});
                navigate('/my-orders');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const getCart = () => {
        let tempArray = [];
        for (const key in cartItems) {
            const product = products.find((item) => item._id === key);
            if (product) {
                product.quantity = cartItems[key];
                tempArray.push(product);
            }
        }
        setCartArray(tempArray);
    }

    const getUserAddress = async () => {
        try {
            const { data } = await axios.get('/api/address/get');
            if (data.success) {
                setAddresses(data.addresses);
                if (data.addresses.length > 0) {
                    setSelectedAddress(data.addresses[0]);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (products.length > 0 && cartItems) {
            getCart();
        }
    }, [products, cartItems]);

    useEffect(() => {
        if (user) {
            getUserAddress();
        }
    }, [user]);

    return products.length > 0 && cartItems ? (
        <div className="flex flex-col lg:flex-row mt-10 gap-8 pb-16">

            {/* Cart Items */}
            <div className='flex-1'>
                <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    Shopping Cart
                    <span className="text-sm font-medium text-white bg-primary px-2.5 py-0.5 rounded-full">{getCartCount()} items</span>
                </h1>

                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr] text-xs font-semibold uppercase tracking-wider text-gray-400 pb-3 border-b border-gray-100 px-2">
                    <p>Product</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Remove</p>
                </div>

                {/* Cart Rows */}
                <div className="divide-y divide-gray-50">
                    {cartArray.map((product, index) => (
                        <div key={index} className="grid grid-cols-[2fr_1fr_1fr] items-center py-4 px-2 hover:bg-gray-50/60 rounded-xl transition-colors">
                            <div className="flex items-center gap-4">
                                <div onClick={() => { navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0) }}
                                    className="cursor-pointer w-20 h-20 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 hover:border-primary/30 transition-colors">
                                    <img className="max-w-full max-h-full object-contain p-1" src={product.images[0]} alt={product.name} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                                        <span>Qty:</span>
                                        <select onChange={e => updateCartItem(product._id, Number(e.target.value))}
                                            value={cartItems[product._id]}
                                            className="outline-none border border-gray-200 rounded-lg px-1.5 py-0.5 text-xs cursor-pointer bg-white">
                                            {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center font-semibold text-gray-800">{currency}{product.offerPrice * product.quantity}</p>
                            <div className="flex justify-center">
                                <button onClick={() => removeFromCart(product._id)}
                                    className="cursor-pointer w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors group">
                                    <svg className="w-4 h-4 text-red-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={() => { navigate("/products"); scrollTo(0, 0); }}
                    className="group cursor-pointer flex items-center mt-6 gap-2 text-primary font-medium text-sm hover:gap-3 transition-all">
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Continue Shopping
                </button>
            </div>

            {/* Order Summary */}
            <div className="lg:w-[360px] w-full">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-5">Order Summary</h2>

                    {/* Address */}
                    <div className="mb-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Delivery Address</p>
                        <div className="relative">
                        <div className="bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-start justify-between gap-3 p-3.5">
                                <p className="text-sm text-gray-700 flex-1">
                                    {selectedAddress
                                        ? `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`
                                        : "No address found"}
                                </p>
                                <button onClick={() => setShowAddress(!showAddress)}
                                    className="text-xs text-primary font-semibold hover:underline cursor-pointer whitespace-nowrap flex-shrink-0 mt-0.5">
                                    Change
                                </button>
                            </div>
                        </div>
                            {showAddress && (
                                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden animate-slideDown">
                                    {addresses.map((address, index) => (
                                        <p key={index} onClick={() => { setSelectedAddress(address); setShowAddress(false); }}
                                            className="text-sm text-gray-600 px-4 py-2.5 hover:bg-primary/8 cursor-pointer border-b border-gray-50 last:border-0">
                                            {address.street}, {address.ward}, {address.district}, {address.city}
                                        </p>
                                    ))}
                                    <p onClick={() => navigate("/add-address")}
                                        className="text-primary text-center cursor-pointer py-3 px-4 bg-primary/5 hover:bg-primary/10 font-semibold text-sm">
                                        + Add new address
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="mb-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Payment Method</p>
                        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                            <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            </span>
                            <span className="text-sm font-medium text-gray-700">Cash On Delivery</span>
                        </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span className="font-medium text-gray-800">{currency}{getCartAmount()}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Shipping</span>
                            <span className="text-green-600 font-medium">Free</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Tax (2%)</span>
                            <span className="font-medium text-gray-800">{currency}{(getCartAmount() * 2 / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
                            <span>Total</span>
                            <span className="text-primary">{currency}{(getCartAmount() + getCartAmount() * 2 / 100).toFixed(2)}</span>
                        </div>
                    </div>

                    <button onClick={placeOrder}
                        className="w-full py-3.5 mt-6 cursor-pointer bg-primary hover:bg-primary-dull text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5">
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center mt-24 gap-5 text-center pb-16">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 5.6A1 1 0 006.6 20h10.8a1 1 0 00.97-.76L19 13M7 13h10" />
                </svg>
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-700">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">Looks like you haven't added anything yet.</p>
            </div>
            <button onClick={() => { navigate('/products'); scrollTo(0, 0); }}
                className="mt-2 px-10 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dull transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 cursor-pointer">
                Start Shopping
            </button>
        </div>
    );
}

export default Cart;
