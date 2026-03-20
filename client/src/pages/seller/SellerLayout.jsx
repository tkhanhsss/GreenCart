import React from 'react'
import { useAppContext } from '../../context/AppContext.jsx'
import { assets } from '../../assets/assets.js';
import { Link, NavLink, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';

function SellerLayout() {
    const { setIsSeller, navigate, axios } = useAppContext();

    const sidebarLinks = [
        {
            name: "Dashboard", path: "/seller/dashboard",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        },
        {
            name: "Add Product", path: "/seller/add-product",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        },
        {
            name: "Product List", path: "/seller/product-list",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        },
        {
            name: "Orders", path: "/seller/orders",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        },
        {
            name: "Users", path: "/seller/users",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        },
        {
            name: "Categories", path: "/seller/categories",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        },
        {
            name: "Stock Import", path: "/seller/stock-import",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
        },
        {
            name: "Cancellations", path: "/seller/cancellation-voucher",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        },
    ];

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/seller/logout');
            if (data.success) {
                toast.success(data.message);
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
            {/* Top Header */}
            <header className="flex items-center justify-between px-5 md:px-8 py-3.5 bg-gray-900 text-white flex-shrink-0 shadow-lg z-10">
                <Link to='/'>
                    <img className="h-8 cursor-pointer brightness-0 invert" src={assets.logo} alt="Logo" />
                </Link>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2.5 bg-gray-800 rounded-full px-3 py-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-sm text-gray-300 font-medium">Admin</span>
                    </div>
                    <button onClick={logout}
                        className='flex items-center gap-2 border border-gray-600 hover:border-red-400 hover:text-red-400 text-gray-300 rounded-full text-sm px-4 py-1.5 cursor-pointer transition-all duration-200'>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                    </button>
                </div>
            </header>

            <div className='flex flex-1 overflow-hidden'>
                {/* Sidebar */}
                <aside className="md:w-56 w-16 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0 pt-3">
                    <nav className="flex-1">
                        {sidebarLinks.map((item) => (
                            <NavLink to={item.path} key={item.name} end={item.path === "/seller"}
                                className={({ isActive }) => `flex items-center gap-3.5 py-3 px-4 mx-2 my-0.5 rounded-xl transition-all duration-150
                                    ${isActive
                                        ? 'bg-primary text-white shadow-sm shadow-primary/30'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}`}>
                                <span className="flex-shrink-0">{item.icon}</span>
                                <span className="md:block hidden text-sm font-medium">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom - Store link */}
                    <div className="px-2 pb-4">
                        <Link to="/"
                            className="flex items-center gap-3.5 py-3 px-4 rounded-xl text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            <span className="md:block hidden text-sm font-medium">View Store</span>
                        </Link>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 overflow-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default SellerLayout