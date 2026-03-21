import React, { useMemo } from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import ProductCart from '../components/ProductCart.jsx'

function AllProducts() {
  const { products, searchQuery } = useAppContext();

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter(p =>
      p.quantity > 0 && (!query || p.name.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  return (
    <div className='mt-10 flex flex-col'>
      <div className='flex flex-col items-end w-max'>
        <p className='text-2xl font-medium uppercase'>All Products</p>
        <div className='w-16 h-0.5 bg-primary-dull rounded-full' />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
        {filteredProducts.map((product) => (
          <ProductCart key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default AllProducts;