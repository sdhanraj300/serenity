import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import img1 from '@/assets/slider/img1.jpg';
import img2 from '@/assets/slider/img2.jpg';
import Image from 'next/image';

const IMAGES = [img1.src, img2.src, img1.src, img2.src, img1.src, img2.src];

export function Slider() {
    return (
        <div className="max-w-7xl mt-10">
            <Swiper
                spaceBetween={30}
                loop={true}
                autoplay={{ delay: 3000 }}
                modules={[Autoplay]}
                breakpoints={{
                    640: {
                        slidesPerView: 1,
                    },
                    768: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                }}
                style={{ width: '100%', overflow: 'hidden' }}
            >
                {IMAGES.map((image, index) => (
                    <SwiperSlide key={index} style={{ width: '100%' }}>
                        <Image
                            alt="image"
                            src={image}
                            height={400}
                            width={400}
                            layout="responsive"
                            objectFit="cover"
                            className="rounded-[28px] w-full"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
