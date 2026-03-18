import React from 'react'
import MainBanner from '../components/MainBanner.jsx'
import Categories from '../components/Categories.jsx'
import BestSeller from '../components/BestSeller.jsx'
import BottomBanner from '../components/BottomBanner.jsx'

function Home() {
  return (
    <div className='mt-10'>
      <MainBanner />
      <Categories />
      <BestSeller />
      <BottomBanner />
    </div>
  )
}

export default Home