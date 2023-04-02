import Image from "next/image";
import * as React from "react";
import { Autoplay, Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  Swiper,
  SwiperSlide,
  type SwiperProps,
  type SwiperRef,
} from "swiper/react";
import { twMerge } from "tailwind-merge";

type CarouselProps = {
  data: string[];
} & React.RefAttributes<SwiperRef> &
  SwiperProps;

const Carousel = React.forwardRef<SwiperRef, CarouselProps>(
  ({ data, className, ...props }, ref) => {
    return (
      <Swiper
        ref={ref}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={true}
        pagination={{
          dynamicMainBullets: 1,
          dynamicBullets: true,
        }}
        modules={[Autoplay, Navigation, Pagination]}
        className={twMerge("h-full w-full overflow-hidden ", className)}
        {...props}
      >
        {data.map((item, i) => (
          <SwiperSlide key={i} className="relative overflow-hidden rounded-lg">
            <Image
              src={item}
              alt={item}
              width={512}
              height={512}
              className="aspect-square object-cover"
              loading="lazy"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }
);

export default Carousel;

Carousel.displayName = "Carousel";
