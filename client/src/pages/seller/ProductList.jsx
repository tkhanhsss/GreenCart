import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

function ProductList() {
  const { products, currency, axios, fetchProducts } = useAppContext();

  // stockState: tracks inline edit for Stock column
  const [stockState, setStockState] = useState({});
  // priceState: tracks inline edit for Price column
  const [priceState, setPriceState] = useState({});

  /* ─── Stock handlers ─── */
  const startStockEdit = (id, quantity) =>
    setStockState((prev) => ({ ...prev, [id]: { value: quantity, editing: true } }));

  const changeStock = (id, value) =>
    setStockState((prev) => ({ ...prev, [id]: { ...prev[id], value } }));

  const cancelStockEdit = (id, quantity) =>
    setStockState((prev) => ({ ...prev, [id]: { value: quantity, editing: false } }));

  const saveStock = async (id) => {
    try {
      const { value } = stockState[id];
      const { data } = await axios.post("/api/product/stock", { id, quantity: parseInt(value, 10) });
      if (data.success) {
        toast.success("Stock updated");
        setStockState((prev) => ({ ...prev, [id]: { ...prev[id], editing: false } }));
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ─── Price handlers ─── */
  const startPriceEdit = (id, price, offerPrice) =>
    setPriceState((prev) => ({ ...prev, [id]: { price, offerPrice, editing: true } }));

  const changePrice = (id, field, value) =>
    setPriceState((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const cancelPriceEdit = (id) =>
    setPriceState((prev) => ({ ...prev, [id]: { ...prev[id], editing: false } }));

  const savePrice = async (id) => {
    try {
      const { price, offerPrice } = priceState[id];
      const { data } = await axios.post("/api/product/price", {
        id,
        price: parseFloat(price),
        offerPrice: parseFloat(offerPrice),
      });
      if (data.success) {
        toast.success("Price updated");
        setPriceState((prev) => ({ ...prev, [id]: { ...prev[id], editing: false } }));
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ─── Delete handler ─── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const { data } = await axios.post("/api/product/delete", { id });
      if (data.success) {
        toast.success("Product deleted");
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-full overflow-y-auto">
      <div className="w-full p-6 md:p-10">

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Product List</h1>
            <p className="text-xs text-gray-400 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} listed</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-5xl">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Price</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const stock = stockState[product._id] || { value: product.quantity, editing: false };
                const price = priceState[product._id] || { price: product.price, offerPrice: product.offerPrice, editing: false };

                return (
                  <tr key={product._id} className="hover:bg-gray-50/60 transition-colors">

                    {/* Product name + image */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img src={product.images[0]} alt="Product" className="max-w-full max-h-full object-contain p-1" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate max-w-40">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 md:hidden">{product.category}</p>
                          <p className="text-xs text-primary font-medium mt-0.5 md:hidden">{currency}{product.offerPrice}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{product.category}</span>
                    </td>

                    {/* Price — inline edit */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      {price.editing ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₫</span>
                              <input
                                type="number" min="1"
                                value={price.price}
                                onChange={(e) => changePrice(product._id, "price", e.target.value)}
                                className="w-24 pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                                placeholder="Price"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₫</span>
                              <input
                                type="number" min="1"
                                value={price.offerPrice}
                                onChange={(e) => changePrice(product._id, "offerPrice", e.target.value)}
                                className="w-24 pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                                placeholder="Sale"
                              />
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => savePrice(product._id)}
                              className="px-3 py-1 bg-primary hover:bg-primary-dull text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                              Save
                            </button>
                            <button onClick={() => cancelPriceEdit(product._id)}
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/price">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{currency}{product.offerPrice}</p>
                            {product.price > product.offerPrice && (
                              <p className="text-xs text-gray-400 line-through">{currency}{product.price}</p>
                            )}
                          </div>
                          <button
                            onClick={() => startPriceEdit(product._id, product.price, product.offerPrice)}
                            className="p-1 rounded-lg hover:bg-primary/10 text-primary cursor-pointer transition-colors"
                            title="Edit price"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Stock — inline edit */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                          <input
                            type="number" min="0"
                            value={stock.value}
                            onChange={(e) => changeStock(product._id, e.target.value)}
                            onFocus={() => startStockEdit(product._id, product.quantity)}
                            className="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-xl outline-none text-center focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50 focus:bg-white transition-all"
                          />
                          {parseInt(stock.value) <= 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-red-400" title="Out of stock" />
                          )}
                        </div>
                        {stock.editing && (
                          <div className="flex gap-1.5">
                            <button onClick={() => saveStock(product._id)}
                              className="px-3 py-1.5 bg-primary hover:bg-primary-dull text-white cursor-pointer rounded-lg text-xs font-semibold transition-colors">
                              Save
                            </button>
                            <button onClick={() => cancelStockEdit(product._id, product.quantity)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions — delete */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="font-medium">No products yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;