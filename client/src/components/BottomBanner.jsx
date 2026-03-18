import React from 'react'
import { assets, features } from '../assets/assets.js'

function BottomBanner() {
  return (
    <div className='relative mt-20 rounded-2xl overflow-hidden'>
      <img src={assets.bottom_banner_image} alt='banner' className='w-full hidden md:block' />
      <img src={assets.bottom_banner_image_sm} alt='banner' className='w-full md:hidden' />
      <div className='absolute inset-0 flex flex-col items-center md:items-end md:justify-center pt-12 md:pt-0 md:pr-20'>
        <div>
          <h2 className='text-2xl md:text-3xl font-bold text-primary mb-6'>
            Why choose GreenCart?
          </h2>
          {features.map((feature, index) => (
            <div key={index} className='flex items-center gap-4 mt-4'>
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <img src={feature.icon} alt={feature.title} className='w-6 h-6' />
              </div>
              <div>
                <h3 className='text-base md:text-lg font-semibold text-gray-800'>{feature.title}</h3>
                <p className='text-xs text-gray-500 md:text-sm'>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BottomBanner