import React from "react";
import { assets } from '../assets/assets.js'
import { Link } from 'react-router-dom'

function MainBanner() {
  return (
    <div className='relative overflow-hidden rounded-2xl mx-0'>
      <img src={assets.main_banner_bg} alt="Main Banner" className='w-full hidden md:block rounded-2xl' />
      <img src={assets.main_banner_bg_sm} alt="Main Banner" className='w-full md:hidden rounded-2xl' />

      {/* Gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent rounded-2xl' />

      <div className='absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-24 md:pb-0 px-6 md:pl-16 lg:pl-24'>
        <div className="animate-fadeInUp">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-white/90 px-3 py-1 rounded-full mb-4 shadow-sm">
            🌿 Fresh & Organic
          </span>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left max-w-72 md:max-w-96 lg:max-w-xl leading-tight text-gray-900 md:text-gray-900 drop-shadow-sm'>
            Freshness you can trust,{" "}
            <span className="text-gradient">Savings</span> you will love!
          </h1>

          <div className='flex items-center mt-7 gap-3 font-medium'>
            <Link to={"/products"}
              className='group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-primary-dull transition-all duration-200 rounded-full text-white cursor-pointer shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 font-semibold'>
              Shop Now
              <img className='transition-transform group-hover:translate-x-1' src={assets.white_arrow_icon} alt='arrow' />
            </Link>
            <Link to={"/products"}
              className='group hidden md:flex items-center gap-2 px-6 py-3 cursor-pointer bg-white/80 hover:bg-white rounded-full text-gray-800 font-semibold shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200'>
              Explore Deals
              <img className='transition-transform group-hover:translate-x-1' src={assets.black_arrow_icon} alt='arrow' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainBanner