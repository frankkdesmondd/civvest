import React, { useState, useEffect } from 'react';
import { IoIosChatboxes } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SandraPics from '../assets/sandra.jpg'
import MohammadPics from '../assets/mohammad.jpg'
import AllysaPics from '../assets/Allysa.jpg'
import GunterPics from '../assets/Gunter.jpg'

const testimonials = [
  {
    id: 1,
    message: "My dealings with [Civvest Energy partners] have been professional yet simple and straightforward. My questions have been answered quickly by their knowledgeable staff. I was so pleased with the first investment that I jumped at the opportunity to invest a second time, and have reached my goal for income.",
    name: "Sandra L.",
    role: "INVESTORS",
    image: SandraPics,
  },
  {
    id: 2,
    message: "The Civvest investment opportunity was brought to me by Ali, who I have known for a while. I was excited to see that I could get above-market yield since we couldn't find anything we felt was safe that generated good income-producing returns. It's a great investment for us, I just wish I had put in more.",
    name: "Muhammad S.",
    role: "INVESTOR",
    image: MohammadPics,
  },
  {
    id: 3,
    message: "I was intrigued by the attractive yields [civvest Energy] offered. After Matt explained how the Company operates…I was more excited. While I typically focus on equity investments, this offers attractive yield in a low-yield market.",
    name: "Allyssa F.",
    role: "INVESTOR",
    image: AllysaPics,
  },
  {
    id: 4,
    message: "I've been investing with Civvest for years, and it's been a game-changer for me and my business. The daily compounding interest has allowed my investments to grow exponentially, giving me a sense of financial security and peace of mind. The team's expertise and transparency have been impressive, and I'm impressed by the company's commitment to helping investors achieve their financial goals. Civvest has been a great opportunity for me, and I highly recommend it to anyone looking to grow their wealth.",
    name: "Gunter C.",
    role: "INVESTOR",
    image: GunterPics,
  }
];

const Testimonial: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 25000);

    return () => clearInterval(timer);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className='flex flex-col px-4 sm:px-6 md:px-[4em] py-8 sm:py-12 md:py-[6em] items-center'>
      <div className='flex gap-2 sm:gap-[1em] self-center items-center'>
        <IoIosChatboxes className='text-blue-600 text-2xl sm:text-[2em]'/>
        <p className='text-sm sm:text-base md:text-[1.2em] font-semibold text-center'>
          HEAR WHAT OUR BOND INVESTORS ARE SAYING
        </p>
      </div>
      <p className='flex text-[#043873] text-2xl sm:text-3xl md:text-4xl lg:text-[4.7em] font-serif font-semibold text-center mt-4'>
        Investor Testimonials
      </p>
      <div className='w-16 sm:w-20 md:w-[7em] bg-blue-400 h-1 sm:h-[0.2em] md:h-[0.3em] mb-6 sm:mb-8 md:mb-[4em] mt-2'></div>
      
      <div className='relative w-full max-w-[900px] min-h-[300px] sm:min-h-[350px] md:min-h-[400px] flex items-center justify-center px-2 sm:px-4'>
        <button
          onClick={handlePrevious}
          className='absolute left-0 sm:left-2 md:left-0 z-10 p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors'
          aria-label="Previous testimonial"
        >
          <ChevronLeft className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600' />
        </button>

        <AnimatePresence mode='wait'>
          <motion.div
            key={currentTestimonial.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className='flex flex-col items-center text-center px-2 sm:px-4 md:px-8 lg:px-[5em]'
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              src={currentTestimonial.image}
              alt={currentTestimonial.name}
              className='w-20 h-20 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px] rounded-full object-cover mb-4 sm:mb-6 md:mb-[2em] shadow-xl'
            />
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className='text-sm sm:text-base md:text-lg lg:text-[1.3em] text-gray-700 italic mb-4 sm:mb-6 md:mb-[2em] leading-relaxed sm:leading-loose'
            >
              "{currentTestimonial.message}"
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className='flex flex-col gap-1 sm:gap-[0.3em]'
            >
              <p className='text-lg sm:text-xl md:text-2xl lg:text-[1.5em] font-bold text-[#043873]'>
                {currentTestimonial.name}
              </p>
              <p className='text-sm sm:text-base md:text-[1em] text-gray-600'>
                {currentTestimonial.role}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleNext}
          className='absolute right-0 sm:right-2 md:right-0 z-10 p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors'
          aria-label="Next testimonial"
        >
          <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600' />
        </button>
      </div>

      <div className='flex gap-2 sm:gap-[0.8em] mt-6 sm:mt-8 md:mt-[3em]'>
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-blue-600 w-6 sm:w-8 md:w-10' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
