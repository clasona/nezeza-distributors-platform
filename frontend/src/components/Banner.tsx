import Image from 'next/image';
import { useSelector } from 'react-redux';
import { Carousel } from 'react-responsive-carousel';
import { ArrowRight, ShoppingBag, Store, Star, TrendingUp } from 'lucide-react';
import sliderImg_1 from '../images/slider/slide1.png';
import sliderImg_2 from '../images/slider/slide2.jpeg';
import sliderImg_3 from '../images/slider/slide3.jpg';
import sliderImg_4 from '../images/slider/slide4.jpg';
import { stateProps } from '../../type';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface BannerProps {
  onBuyClick: () => void;
}

const Banner = ({ onBuyClick }: BannerProps) => {
  const { userInfo } = useSelector((state: stateProps) => state.next);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const heroSlides = [
    {
      title: "Authentic African Products",
      subtitle: "Discover genuine African products connecting producers to global markets",
      cta: "Shop Now",
      bgGradient: "from-blue-700 via-blue-500 to-purple-600"
    },
    {
      title: "Join Our African Marketplace",
      subtitle: "Connect with African sellers and expand your reach to global customers",
      cta: "Start Selling",
      bgGradient: "from-green-600 via-green-500 to-teal-600"
    },
    {
      title: "End-to-End Supply Chain",
      subtitle: "Seamlessly connecting manufacturers, wholesalers, and retailers across continents",
      cta: "Learn More",
      bgGradient: "from-purple-600 via-pink-500 to-red-500"
    }
  ];

  useEffect(() => {
    if (!userInfo) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [userInfo, heroSlides.length]);

  return (
    <div className='relative mb-4 sm:mb-8 banner-bottom h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg sm:rounded-xl mx-1 sm:mx-2 md:mx-4 shadow-lg sm:shadow-xl'>
      {!userInfo ? (
        <div className='relative w-full h-full'>
          {/* Background Video with Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].bgGradient} opacity-90 z-10`}></div>
          <video
            autoPlay
            loop
            muted
            playsInline 
            className='w-full h-full object-cover'
          >
            <source
              src='/videos/vesoko_banner_videos_combined.mp4'
              type='video/mp4'
            />
            Your browser does not support the video tag.
          </video>

          {/* Hero Content */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center text-white text-center z-20 px-3 sm:px-6 py-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Main Heading */}
            <div className='mb-4 sm:mb-6'>
              <h1 className='text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 sm:mb-4 leading-tight px-2'>
                {heroSlides[currentSlide].title}
              </h1>
              <p className='text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 max-w-3xl font-light opacity-90 px-2'>
                {heroSlides[currentSlide].subtitle}
              </p>
            </div>

            {/* Statistics */}
            <div className='flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-8 text-center'>
              <div className='bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]'>
                <div className='flex items-center justify-center mb-1 sm:mb-2'>
                  <ShoppingBag className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6' />
                </div>
                <div className='text-lg sm:text-xl md:text-2xl font-bold'>5K+</div>
                <div className='text-xs sm:text-sm opacity-80'>Products</div>
              </div>
              <div className='bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]'>
                <div className='flex items-center justify-center mb-1 sm:mb-2'>
                  <Store className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6' />
                </div>
                <div className='text-lg sm:text-xl md:text-2xl font-bold'>200+</div>
                <div className='text-xs sm:text-sm opacity-80'>Sellers</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-center w-full max-w-lg px-2'>
              <button
                className='group flex items-center justify-center bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg w-full sm:w-auto min-w-[160px] sm:min-w-[200px]'
                onClick={onBuyClick}
              >
                <ShoppingBag className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
                Shop Now
                <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1' />
              </button>
              <Link
                href='/sellers'
                className='group flex items-center justify-center bg-vesoko_green_600 hover:bg-vesoko_green_700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg w-full sm:w-auto min-w-[160px] sm:min-w-[200px]'
              >
                <Store className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
                Start Selling
                <TrendingUp className='w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1' />
              </Link>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30'>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          {/* Decorative Elements */}
          <div className='absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse'></div>
          <div className='absolute bottom-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-bounce'></div>
          <div className='absolute top-1/2 left-8 w-12 h-12 bg-white/10 rounded-full animate-ping'></div>
        </div>
      ) : (
        <div className='w-full h-full relative'>
          <Carousel
            autoPlay
            infiniteLoop
            showStatus={false}
            showIndicators={true}
            showThumbs={false}
            interval={4000}
            className='h-full rounded-2xl overflow-hidden'
            renderIndicator={(onClickHandler, isSelected, index) => (
              <button
                className={`inline-block w-3 h-3 mx-1 rounded-full transition-all duration-300 ${
                  isSelected ? 'bg-vesoko_green_600 scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={onClickHandler}
                key={index}
              />
            )}
          >
            {[sliderImg_1, sliderImg_2, sliderImg_3, sliderImg_4].map((img, index) => (
              <div key={index} className='h-full relative'>
                <Image 
                  priority={index === 0}
                  src={img} 
                  alt={`Slider Image ${index + 1}`}
                  className='w-full h-full object-cover'
                  style={{ height: '100%' }}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent'></div>
                <div className='absolute bottom-4 sm:bottom-8 md:bottom-12 left-4 sm:left-8 md:left-12 text-white z-10'>
                  <h3 className='text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2'>Authentic African Products</h3>
                  <p className='text-sm sm:text-base md:text-lg opacity-90'>Connecting Africa to the world</p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default Banner;
