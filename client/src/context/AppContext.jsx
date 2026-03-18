import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      setIsSeller(data.success);
    } catch {
      setIsSeller(false);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems);
      }
    } catch {
      setUser(null);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) setProducts(data.products);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/list");
      if (data.success) setCategories(data.categories);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    toast.success("Added To Cart");
  };

  const updateCartItem = (itemId, quantity) => {
    setCartItems((prev) => ({ ...prev, [itemId]: quantity }));
    toast.success("Cart updated");
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) updated[itemId] -= 1;
      else delete updated[itemId];
      return updated;
    });
    toast.success("Removed from cart");
  };

  const getCartCount = () =>
    Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const getCartAmount = () => {
    const total = Object.entries(cartItems).reduce((sum, [id, qty]) => {
      const product = products.find((p) => p._id === id);
      return product ? sum + product.offerPrice * qty : sum;
    }, 0);
    return Math.floor(total * 100) / 100;
  };

  // Sync with DB on mount
  useEffect(() => {
    fetchSeller();
    fetchUser();
    fetchProducts();
    fetchCategories();
  }, []);

  // Persist cart to DB whenever it changes
  useEffect(() => {
    if (!user) return;
    const syncCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (!data.success) toast.error(data.message);
      } catch (error) {
        toast.error(error.message);
      }
    };
    syncCart();
  }, [cartItems]);

  const value = {
    navigate,
    user, setUser,
    isSeller, setIsSeller,
    showUserLogin, setShowUserLogin,
    products, categories, currency,
    cartItems, setCartItems,
    searchQuery, setSearchQuery,
    addToCart, updateCartItem, removeFromCart,
    getCartCount, getCartAmount,
    axios,
    fetchProducts, fetchCategories, fetchUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);