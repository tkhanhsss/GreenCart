import { useEffect, useState } from "react";
import { useAppContext } from '../context/AppContext.jsx'
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets.js";
import ProductCart from '../components/ProductCart.jsx';

const ProductDetails = () => {
    const { products, navigate, currency, addToCart } = useAppContext();
    const { id } = useParams();
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    const product = products.find((item) => item._id === id);

    useEffect(() => {
        if (products.length > 0) {
            let productsCopy = products.filter((item) => item.category === product.category);
            setRelatedProducts(productsCopy.slice(0, 5));
        }
    }, [products]);

    useEffect(() => {
        setThumbnail(product?.images[0] ? product.images[0] : null);
    }, [product]);

    const discount = product && product.price > product.offerPrice
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
        : 0;

    return product && (
        <div className="mt-8 pb-16 animate-fadeIn">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
                <Link to={'/'} className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <Link to={'/products'} className="hover:text-primary transition-colors">Products</Link>
                <span>/</span>
                <Link to={`/products/${product.category.toLowerCase()}`} className="hover:text-primary transition-colors">{product.category}</Link>
                <span>/</span>
                <span className="text-gray-600 font-medium truncate max-w-40">{product.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-10 mt-4">
                {/* Images */}
                <div className="flex gap-3 flex-shrink-0">
                    <div className="flex flex-col gap-2.5">
                        {product.images.map((image, index) => (
                            <div key={index} onClick={() => setThumbnail(image)}
                                className={`border-2 rounded-xl overflow-hidden cursor-pointer w-16 h-16 flex items-center justify-center transition-all duration-200 bg-gray-50
                                    ${thumbnail === image ? 'border-primary shadow-md shadow-primary/20' : 'border-gray-200 hover:border-primary/50'}`}>
                                <img src={image} alt={`Thumbnail ${index + 1}`} className="max-w-full max-h-full object-contain p-1" />
                            </div>
                        ))}
                    </div>

                    <div className="border-2 border-gray-100 rounded-2xl overflow-hidden max-w-96 w-full bg-gray-50 flex items-center justify-center p-4">
                        <img src={thumbnail} alt="Selected product" className="w-full max-h-96 object-contain" />
                    </div>
                </div>

                {/* Product Info */}
                <div className="w-full md:w-1/2">
                    <div className="flex items-start gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold text-gray-800 flex-1">{product.name}</h1>
                        {discount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0">
                                -{discount}% OFF
                            </span>
                        )}
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mt-2">
                        {Array(5).fill('').map((_, i) =>
                            <img key={i} src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt="star" className="w-4" />
                        )}
                        <span className="text-sm text-gray-400 ml-1.5">(4 reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="mt-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-baseline gap-3">
                            <p className="text-3xl font-bold text-primary">{currency}{product.offerPrice}</p>
                            {product.price > product.offerPrice && (
                                <p className="text-lg text-gray-400 line-through">{currency}{product.price}</p>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
                    </div>

                    {/* Description */}
                    <div className="mt-5">
                        <p className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">About this product</p>
                        <ul className="space-y-1.5">
                            {product.description.map((desc, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {desc}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center mt-8 gap-3 text-base">
                        <button onClick={() => { addToCart(product._id); }}
                            className="flex-1 py-3.5 cursor-pointer font-semibold bg-white border-2 border-primary text-primary hover:bg-primary/5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md">
                            Add to Cart
                        </button>
                        <button onClick={() => { addToCart(product._id); navigate('/cart') }}
                            className="flex-1 py-3.5 cursor-pointer font-semibold bg-primary text-white hover:bg-primary-dull rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div className="mt-20">
                <div className="text-center mb-8">
                    <p className="text-2xl font-bold text-gray-800">Related Products</p>
                    <div className="w-16 h-0.5 bg-primary rounded-full mt-2 mx-auto" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:grid-cols-5">
                    {relatedProducts.filter((p) => p.inStock).map((p) => (
                        <ProductCart key={p._id} product={p} />
                    ))}
                </div>
                <div className="text-center mt-10">
                    <button onClick={() => { navigate('/products'); scrollTo(0, 0); }}
                        className="cursor-pointer px-10 py-3 border-2 border-primary rounded-full text-primary font-semibold hover:bg-primary hover:text-white transition-all duration-200">
                        See More Products
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;