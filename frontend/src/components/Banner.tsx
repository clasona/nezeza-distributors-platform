import Image from 'next/image';
import { useSelector } from 'react-redux';
import { Carousel } from 'react-responsive-carousel';
import sliderImg_1 from '../images/slider/slide1.png';
import sliderImg_2 from '../images/slider/slide2.jpeg';
import sliderImg_3 from '../images/slider/slide3.jpg';
import sliderImg_4 from '../images/slider/slide4.jpg';
import { stateProps } from '../../type';

const Banner = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);
  return (
    <div className='relative mb-4'>
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
              src='/videos/nezeza_banner_videos_combined.mp4'
              type='video/mp4'
            />
            Your browser does not support the video tag.
          </video>

          <div className='absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10'>
            <p className='text-2xl font-semibold mb-4'>
              {' '}
              {/* Increased font size and weight */}
              Discover amazing products or sell your own on the Nezeza platform.
            </p>
            <div className='flex w-full max-w-xs gap-4 justify-center'>
              {' '}
              {/* Added w-full and max-w-xs */}
              <button className='bg-nezeza_dark_blue hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md w-1/2'>
                {' '}
                {/* Added w-1/2 */}
                Buy
              </button>
              <span className='text-white self-center'>or</span>{' '}
              {/* self-center vertically centers 'or' */}
              <button className='bg-nezeza_green_600 hover:bg-nezeza_green_800 text-white font-bold py-2 px-4 rounded-md w-1/2'>
                {' '}
                {/* Added w-1/2 */}
                Sell
              </button>
            </div>
          </div>

          <div className='w-full h-40 bg-gradient-to-t from-gray-100 to-transparent absolute bottom-0 z-20'></div>
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
