import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className='flex flex-col gap-8 p-3 max-w-4xl mx-auto my-10'>
      <h1 className='text-3xl font-bold text-slate-700 text-center'>
        About JitenEstate
      </h1>
      
      <div className='flex flex-col gap-6 text-slate-600'>
        <section>
          <h2 className='text-2xl font-semibold text-slate-700 mb-3'>
            Welcome to JitenEstate
          </h2>
          <p className='text-lg leading-relaxed'>
            JitenEstate is your trusted partner in finding the perfect place to call home. 
            We are a modern, user-friendly real estate platform designed to connect property 
            seekers with their ideal living spaces. Whether you're looking to rent or buy, 
            our platform offers a seamless experience with comprehensive search tools and 
            detailed property listings.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold text-slate-700 mb-3'>
            Our Mission
          </h2>
          <p className='text-lg leading-relaxed'>
            Our mission is to simplify the property search process and make finding your 
            next home as easy and enjoyable as possible. We believe everyone deserves to 
            find a place that feels like home, and we're here to make that journey smooth 
            and stress-free.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold text-slate-700 mb-3'>
            What We Offer
          </h2>
          <div className='flex flex-col gap-4'>
            <div>
              <h3 className='text-xl font-semibold text-slate-700 mb-2'>
                🏠 Comprehensive Property Listings
              </h3>
              <p className='text-lg leading-relaxed'>
                Browse through a wide range of properties available for rent and sale. 
                Each listing includes detailed information including property type, size, 
                amenities, location, and pricing.
              </p>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-slate-700 mb-2'>
                🔍 Advanced Search & Filters
              </h3>
              <p className='text-lg leading-relaxed'>
                Find exactly what you're looking for with our powerful search functionality. 
                Filter properties by type (rent/sale), amenities (parking, furnished), 
                special offers, and more. Sort by price, date, or relevance to discover 
                your perfect match.
              </p>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-slate-700 mb-2'>
                📸 Rich Media Experience
              </h3>
              <p className='text-lg leading-relaxed'>
                Every property listing features high-quality images, giving you a clear 
                view of what each space has to offer. Our image galleries help you visualize 
                yourself in your new home.
              </p>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-slate-700 mb-2'>
                💰 Special Offers & Deals
              </h3>
              <p className='text-lg leading-relaxed'>
                Discover exclusive deals and special offers on select properties. Our 
                platform highlights discounted listings, helping you find great value 
                in your property search.
              </p>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-slate-700 mb-2'>
                👤 User-Friendly Platform
              </h3>
              <p className='text-lg leading-relaxed'>
                Create an account to list your properties, save your favorite listings, 
                and directly contact property owners. Our intuitive interface makes 
                managing your property search effortless.
              </p>
            </div>

            <div>
              <h3 className='text-xl font-semibold text-slate-700 mb-2'>
                📍 Location-Based Search
              </h3>
              <p className='text-lg leading-relaxed'>
                Search properties by location, address, or neighborhood. Our platform 
                helps you find properties in your preferred areas with detailed address 
                information for each listing.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-semibold text-slate-700 mb-3'>
            For Property Owners
          </h2>
          <p className='text-lg leading-relaxed'>
            Are you a property owner looking to rent or sell? JitenEstate provides you 
            with a platform to showcase your properties to potential tenants and buyers. 
            Create detailed listings with multiple images, set your pricing, and manage 
            your properties all in one place. Connect directly with interested parties 
            and make the process of renting or selling your property simple and efficient.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold text-slate-700 mb-3'>
            Get Started Today
          </h2>
          <p className='text-lg leading-relaxed mb-4'>
            Ready to find your perfect place? Start browsing our listings or create an 
            account to list your property. Our platform is designed to make your real 
            estate journey smooth, whether you're searching for a home or listing a property.
          </p>
          <div className='flex gap-4 flex-wrap'>
            <Link
              to='/search'
              className='bg-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-95 transition-opacity'
            >
              Browse Properties
            </Link>
            <Link
              to='/signUp'
              className='bg-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-95 transition-opacity'
            >
              Create Account
            </Link>
          </div>
        </section>

        <section className='mt-4'>
          <p className='text-base text-slate-500 italic'>
            JitenEstate - Your trusted partner in finding the perfect place to call home.
          </p>
        </section>
      </div>
    </div>
  );
}
