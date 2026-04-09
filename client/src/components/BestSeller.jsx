import React, { useEffect, useState } from 'react'
import ProductCart from './ProductCart'
import { useAppContext } from '../context/AppContext'

function BestSeller() {
  const { navigate, axios } = useAppContext();
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const { data } = await axios.get('/api/product/best-sellers?limit=5');
        if (data.success) setBestSellers(data.products);
      } catch (err) {
        console.error('Failed to fetch best sellers:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  return (
    <div className='mt-20'>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className='text-2xl md:text-3xl font-bold text-gray-800 section-heading'>Best Sellers</p>
        </div>
        <button onClick={() => { navigate('/products'); scrollTo(0, 0); }}
          className="text-sm text-primary font-medium hover:underline hidden md:block">
          See all →
        </button>
      </div>

      {loading ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5 lg:grid-cols-5'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='rounded-xl bg-gray-100 animate-pulse h-64' />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5 lg:grid-cols-5'>
          {bestSellers.map((product) => (
            <ProductCart key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BestSeller