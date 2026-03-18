import React from 'react'
import { useAppContext } from '../context/AppContext.jsx'

const PASTEL_COLORS = [
  'bg-yellow-50',
  'bg-pink-50',
  'bg-green-50',
  'bg-teal-50',
  'bg-orange-50',
  'bg-purple-50',
  'bg-blue-50',
  'bg-rose-50',
  'bg-lime-50',
  'bg-cyan-50',
];

function Categories() {
  const { navigate, categories } = useAppContext();

  return (
    <div className='mt-20'>
      <div className="flex items-end justify-between mb-6">
        <p className='text-2xl md:text-3xl font-bold text-gray-800 section-heading'>Categories</p>
        <button onClick={() => { navigate('/products'); scrollTo(0, 0); }}
          className="text-sm text-primary font-medium hover:underline hidden md:block">
          View all →
        </button>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4'>
        {categories.length > 0 ? categories.map((category, index) => (
          <div key={index}
            className={`group cursor-pointer rounded-2xl flex flex-col items-center gap-3 p-4 pt-5
              ${PASTEL_COLORS[index % PASTEL_COLORS.length]}
              hover:-translate-y-1 hover:shadow-md transition-all duration-250`}
            onClick={() => { navigate(`/products/${category.name.toLowerCase()}`); scrollTo(0, 0); }}>
            <img
              src={category.image}
              alt={category.name}
              className='h-20 w-full object-contain group-hover:scale-110 transition-transform duration-300'
            />
            <p className='text-sm font-semibold text-center text-primary'>{category.name}</p>
          </div>
        )) : (
          <p className='text-gray-400 text-sm col-span-full'>No categories available yet.</p>
        )}
      </div>
    </div>
  )
}

export default Categories