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
    <div className='relative mb-4 banner-bottom'>
      {!userInfo ? (
        <div>
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

          <div className='absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10'>
            <p className='text-2xl font-semibold mb-4'>
              {' '}
              Discover amazing products or sell your own on the VeSoko platform.
            </p>
            <div className='flex w-full max-w-xs gap-4 justify-center'>
              {' '}
              <button
                className='flex items-center justify-center bg-vesoko_dark_blue hover:bg-blue-800 hover:underline text-white font-bold py-2 px-4 rounded-md w-1/2'
                onClick={onBuyClick}
              >
                Buy
              </button>
              <span className='text-white self-center'>or</span>{' '}
              <Link
                href='/seller-onboarding'
                className='flex items-center justify-center bg-vesoko_green_600 hover:bg-vesoko_green_800 hover:underline  text-white font-bold py-2 px-4 rounded-md w-1/2 '
              >
                Sell
              </Link>
            </div>
          </div>

          <div className='w-full h-[20%] bg-gradient-to-t from-gray-100 to-transparent absolute bottom-0 z-20'></div>
        </div>
      ) : (
        <Carousel
          autoPlay
          infiniteLoop
          showStatus={false}
          showIndicators={false}
          interval={3000}
        >
          <div>
            <Image priority src={sliderImg_1} alt='sliderImg' />
          </div>
          <div>
            <Image src={sliderImg_2} alt='sliderImg' />
          </div>
          <div>
            <Image src={sliderImg_3} alt='sliderImg' />
          </div>
          <div>
            <Image src={sliderImg_4} alt='sliderImg' />
          </div>
        </Carousel>
      )}
    </div>
  );
};

export default Banner;
