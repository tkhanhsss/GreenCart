import React from 'react'

function NewsLetter() {
  return (
    <div className="relative overflow-hidden mt-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white py-16 px-6 sm:px-10 text-center flex flex-col items-center justify-center">

      {/* Decorative circles */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/3 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-xl w-full">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4">
          Newsletter
        </span>
        <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight">
          Get the Latest Deals & News
        </h2>
        <p className="mt-3 text-white/75 text-sm sm:text-base max-w-md">
          Subscribe to our newsletter and never miss exclusive offers, fresh arrivals and seasonal promotions.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 mt-8 w-full max-w-md">
          <input
            type="email"
            className="bg-white/15 border border-white/30 text-white placeholder-white/60 outline-none px-5 py-3 rounded-full flex-1 w-full focus:bg-white/25 focus:border-white/60 transition-all text-sm"
            placeholder="Enter your email address"
          />
          <button className="bg-white text-primary hover:bg-primary-light font-semibold rounded-full px-7 py-3 w-full sm:w-auto transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm whitespace-nowrap cursor-pointer">
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewsLetter