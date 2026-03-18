import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets.js'
import { useAppContext } from '../context/AppContext.jsx'
import toast from 'react-hot-toast'

function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, setUser, setShowUserLogin, navigate, setSearchQuery,
             searchQuery, getCartAmount, getCartCount, axios } = useAppContext();

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/user/logout', { withCredentials: true });
            if(data.success){
                toast.success(data.message);
                setUser(null);
                navigate('/');
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if(searchQuery.length > 0){
            navigate("/products");
        }
    }, [searchQuery]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-3.5 bg-white sticky top-0 z-50 transition-all duration-300
            ${scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-200'}`}>

            <NavLink to='/' onClick={() => setOpen(false)}>
                <img className='h-9' src={assets.logo} alt='logo' />
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-7 ml-7">
                {[{ label: 'Home', to: '/' }, { label: 'All Products', to: '/products' }, { label: 'Contact', to: '/' }].map(link => (
                    <NavLink key={link.label} to={link.to} className="relative group text-gray-600 hover:text-primary transition-colors duration-200 text-sm font-medium">
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
                    </NavLink>
                ))}

                {/* Search Bar */}
                <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-200 bg-gray-50 hover:border-primary/60 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 px-3.5 rounded-full transition-all duration-200">
                    <input
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="py-1.5 w-44 bg-transparent outline-none placeholder-gray-400 text-sm"
                        type="text" placeholder="Search products"
                    />
                    <img src={assets.search_icon} alt='search' className='w-4 h-4 opacity-50' />
                </div>

                {/* Cart Icon */}
                <div onClick={() => navigate("/cart")} className="relative cursor-pointer group">
                    <div className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                        <img src={assets.nav_cart_icon} alt='cart' className='w-5 opacity-70 group-hover:opacity-100 transition-opacity' />
                    </div>
                    {getCartCount() > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 text-[10px] text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-sm animate-pulseSoft">
                            {getCartCount()}
                        </span>
                    )}
                </div>

                {/* Login / Profile */}
                {!user ? (
                    <button onClick={() => { setOpen(false); setShowUserLogin(true); }}
                        className="cursor-pointer px-6 py-2 bg-primary hover:bg-primary-dull transition-all duration-200 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        Login
                    </button>
                ) : (
                    <div className='relative group'>
                        <button className='flex items-center gap-2 cursor-pointer border-2 border-primary/30 rounded-full p-0.5 hover:border-primary transition-colors duration-200'>
                            <img src={assets.profile_icon} className='w-8 h-8 rounded-full object-cover' alt='profile icon'/>
                        </button>
                        <div className='hidden group-hover:block absolute top-full right-0 pt-2 animate-slideDown'>
                            <ul className='bg-white shadow-xl border border-gray-100 py-2 w-44 rounded-2xl text-sm overflow-hidden'>
                                <li onClick={() => navigate("my-orders")} className='flex items-center gap-2.5 px-4 py-2.5 hover:bg-primary/10 cursor-pointer text-gray-700 hover:text-primary transition-colors'>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    My Orders
                                </li>
                                <li onClick={logout} className='flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 cursor-pointer text-gray-700 hover:text-red-500 transition-colors'>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Logout
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile right icons */}
            <div className='flex items-center gap-4 md:hidden'>
                <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
                    <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80' />
                    {getCartCount() > 0 && (
                        <span className="absolute -top-2 -right-2 text-[10px] text-white bg-primary w-[17px] h-[17px] rounded-full flex items-center justify-center font-bold">
                            {getCartCount()}
                        </span>
                    )}
                </div>
                <button onClick={() => setOpen(!open)} aria-label="Menu" className="p-1">
                    <img src={assets.menu_icon} alt='menu' className="w-6" />
                </button>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 py-5 flex flex-col gap-1 px-6 text-sm md:hidden animate-slideDown z-40">
                    {[{ label: 'Home', to: '/' }, { label: 'All Products', to: '/products' }, { label: 'Contact', to: '/' }].map(link => (
                        <NavLink key={link.label} to={link.to} onClick={() => setOpen(false)}
                            className="py-2.5 px-3 rounded-lg hover:bg-primary/10 text-gray-700 hover:text-primary font-medium transition-colors">
                            {link.label}
                        </NavLink>
                    ))}
                    {user && (
                        <NavLink to='/my-orders' onClick={() => setOpen(false)}
                            className="py-2.5 px-3 rounded-lg hover:bg-primary/10 text-gray-700 hover:text-primary font-medium transition-colors">
                            My Orders
                        </NavLink>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        {!user ? (
                            <button onClick={() => { setOpen(false); setShowUserLogin(true); }}
                                className="w-full cursor-pointer px-6 py-2.5 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm font-medium">
                                Login
                            </button>
                        ) : (
                            <button onClick={logout}
                                className="w-full cursor-pointer px-6 py-2.5 bg-red-50 hover:bg-red-100 transition text-red-500 rounded-full text-sm font-medium border border-red-200">
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar;