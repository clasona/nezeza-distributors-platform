import Image from 'next/image';
import { useSelector } from 'react-redux';
import { Carousel } from 'react-responsive-carousel';
import sliderImg_1 from '../images/slider/slide1.png';
import sliderImg_2 from '../images/slider/slide2.jpeg';
import sliderImg_3 from '../images/slider/slide3.jpg';
import sliderImg_4 from '../images/slider/slide4.jpg';
import { stateProps } from '../../type';
import Link from 'next/link';

interface BannerProps {
  onBuyClick: () => void;
}
const Banner = ({ onBuyClick }: BannerProps) => {
  const { userInfo } = useSelector((state: stateProps) => state.next);
  return (
    <div className='relative mb-4 banner-bottom h-40 sm:h-48 md:h-56 overflow-hidden'>
      {!userInfo ? (
        <div className='relative w-full h-full'>
          <video
            autoPlay
            loop
            muted
            playsInline // Important for mobile browsers
            className='w-full h-full object-cover'
          >
            <source
              src='/videos/vesoko_banner_videos_combined.mp4'
              type='video/mp4'
            />
            Your browser does not support the video tag.
          </video>

          <div className='absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10 px-4'>
            <p className='text-sm sm:text-base md:text-lg font-semibold mb-3 max-w-xl leading-tight'>
              Discover amazing products or sell your own on VeSoko
            </p>
            <div className='flex w-full max-w-xs gap-2 justify-center'>
              <button
                className='flex items-center justify-center bg-vesoko_dark_blue hover:bg-blue-800 text-white font-medium py-1.5 px-3 rounded text-sm w-1/2 transition-colors duration-200'
                onClick={onBuyClick}
              >
                Buy Now
              </button>
              <span className='text-white self-center text-xs'>or</span>
              <Link
                href='/seller-onboarding'
                className='flex items-center justify-center bg-vesoko_green_600 hover:bg-vesoko_green_800 text-white font-medium py-1.5 px-3 rounded text-sm w-1/2 transition-colors duration-200'
              >
                Sell Now
              </Link>
            </div>
          </div>

          <div className='w-full h-[20%] bg-gradient-to-t from-gray-100 to-transparent absolute bottom-0 z-20'></div>
        </div>
      ) : (
        <div className='w-full h-full'>
          <Carousel
            autoPlay
            infiniteLoop
            showStatus={false}
            showIndicators={false}
            interval={3000}
            className='h-full'
          >
            <div className='h-full'>
              <Image 
                priority 
                src={sliderImg_1} 
                alt='sliderImg' 
                className='w-full h-full object-cover'
                style={{ height: '100%' }}
              />
            </div>
            <div className='h-full'>
              <Image 
                src={sliderImg_2} 
                alt='sliderImg' 
                className='w-full h-full object-cover'
                style={{ height: '100%' }}
              />
            </div>
            <div className='h-full'>
              <Image 
                src={sliderImg_3} 
                alt='sliderImg' 
                className='w-full h-full object-cover'
                style={{ height: '100%' }}
              />
            </div>
            <div className='h-full'>
              <Image 
                src={sliderImg_4} 
                alt='sliderImg' 
                className='w-full h-full object-cover'
                style={{ height: '100%' }}
              />
            </div>
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default Banner;
