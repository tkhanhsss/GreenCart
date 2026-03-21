import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const ProductCart = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();
  const cartQuantity = cartItems[product._id] || 0;

  const discount = product.price && product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    product && (
      <div
        onClick={() => {
          navigate(`/products/${product.category?.name?.toLowerCase()}/${product._id}`);
          scrollTo(0, 0);
        }}
        className="relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-250 cursor-pointer overflow-hidden group"
      >
        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
            -{discount}%
          </div>
        )}

        {/* Image */}
        <div className="bg-gray-50 rounded-t-2xl flex items-center justify-center px-4 pt-4 pb-2 overflow-hidden">
          <img
            className="group-hover:scale-108 transition-transform duration-300 h-32 w-full object-contain"
            src={product.images[0]}
            alt={product.name}
          />
        </div>

        {/* Info */}
        <div className="p-3.5">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">{product.category?.name}</p>
          <p className="text-gray-800 font-semibold text-sm leading-snug truncate">{product.name}</p>

          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-primary font-bold text-base leading-none">
                {currency}{product.offerPrice}
              </p>
              {product.price > product.offerPrice && (
                <p className="text-gray-400 text-xs line-through mt-0.5">{currency}{product.price}</p>
              )}
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              {!cartQuantity ? (
                <button
                  className="flex items-center justify-center gap-1 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm hover:bg-primary-dull hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    if (product.quantity <= 0) {
                      toast.error("Out of stock!");
                      return;
                    }
                    addToCart(product._id);
                  }}
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 px-2 py-1 rounded-full select-none">
                  <button onClick={() => removeFromCart(product._id)}
                    className="cursor-pointer w-5 h-5 rounded-full bg-primary/20 hover:bg-primary/40 text-primary font-bold text-sm flex items-center justify-center transition-colors">
                    −
                  </button>
                  <span className="text-primary font-bold text-sm w-5 text-center">{cartQuantity}</span>
                  <button onClick={() => {
                    if (cartQuantity >= product.quantity) {
                      toast.error("Out of stock!");
                      return;
                    }
                    addToCart(product._id);
                  }}
                    className="cursor-pointer w-5 h-5 rounded-full bg-primary/20 hover:bg-primary/40 text-primary font-bold text-sm flex items-center justify-center transition-colors">
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ProductCart;