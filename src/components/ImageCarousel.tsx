import Image from "next/image";
import { Autoplay, Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

const ImageCarousel = ({ data }: { data: string[] }) => {
  return (
    <Swiper
      loop={true}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      navigation={true}
      pagination={{
        dynamicBullets: true,
      }}
      modules={[Autoplay, Navigation, Pagination]}
      className="h-full w-full"
    >
      {data.map((item) => (
        <SwiperSlide key={item} className="overflow-hidden rounded-lg">
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
};

export default ImageCarousel;
