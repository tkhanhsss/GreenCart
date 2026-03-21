import React from 'react'
import ProductCart from './ProductCart'
import { useAppContext } from '../context/AppContext'

function BestSeller() {
  const { products, navigate } = useAppContext();
  return (
    <div className='mt-20'>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className='text-2xl md:text-3xl font-bold text-gray-800 section-heading'>Best Sellers</p>
        </div>
        <button onClick={() => { navigate('/products'); scrollTo(0,0); }}
            className="text-sm text-primary font-medium hover:underline hidden md:block">
            See all →
        </button>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5 lg:grid-cols-5'>
        {products
          .filter(p => p.quantity > 0)
          .sort((a, b) => {
            const discountA = (a.price - a.offerPrice) / a.price;
            const discountB = (b.price - b.offerPrice) / b.price;
            return discountB - discountA;
          })
          .slice(0, 5)
          .map((product, index) => (
            <ProductCart key={index} product={product} />
          ))}
      </div>
    </div>
  )
}

export default BestSeller