import React from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import { useParams } from 'react-router-dom';
import ProductCart from '../components/ProductCart.jsx'

function ProductCategory() {
  const { products } = useAppContext();
  const { category } = useParams();

  const heading = category.charAt(0).toUpperCase() + category.slice(1);
  const filteredProducts = products.filter(p => p.category.toLowerCase() === category);

  return (
    <div className='mt-10'>
      <div className='flex flex-col items-end w-max'>
        <p className='text-2xl font-medium'>{heading.toUpperCase()}</p>
        <div className='w-16 h-0.5 bg-primary rounded-full' />
      </div>
      {filteredProducts.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
          {filteredProducts.map((product) => (
            <ProductCart key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className='flex items-center justify-center h-[60vh]'>
          <p className='text-2xl font-medium text-primary-dull'>No products found in this category.</p>
        </div>
      )}
    </div>
  );
}

export default ProductCategory;