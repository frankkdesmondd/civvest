import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const AnimatedCounter = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let targetNum = 0;

    if (value.includes('%')) {
      targetNum = parseFloat(value.replace('%', ''));
    } else if (value.includes('M')) {
      targetNum = parseFloat(value.replace(/[$M]/g, ''));
    } else if (value.includes('k')) {
      targetNum = parseFloat(value.replace(/[k+]/g, ''));
    }

    let startTime: number | null = null;
    const duration = 2000; // 2 seconds

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = easeOutQuart * targetNum;

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(targetNum);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  const formatValue = () => {
    if (value.includes('%')) {
      return Math.round(count) + '%';
    } else if (value.includes('M')) {
      return '$' + Math.round(count) + 'M';
    } else if (value.includes('k')) {
      return count.toFixed(2) + 'k+';
    }
    return Math.round(count).toString();
  };

  return <span ref={ref}>{formatValue()}</span>;
};

const TrackRecord: React.FC = () => {
  return (
    <div className='flex flex-col bg-[#041a35] py-[7em] items-center px-[4em]'>
      <p className='flex font-bold text-white text-[1em]'>A TRACK RECORD OF SUCCESS</p>
      <p className='flex font-bold text-white text-[1.7em] lg:text-[3em]'>TRUSTED BY BONDHOLDERS</p>
      <div className='flex flex-col lg:flex-row gap-[3em] justify-between text-white w-full'>
        <div className='flex flex-col gap-[1em] items-center'>
          <p className='flex text-blue-400 text-[4em] font-bold'>
            <AnimatedCounter value="97%" />
          </p>
          <p className='flex font-bold text-white text-[1.2em]'>SATISFIED BONDHOLDERS</p>
          <p className=''>Based on Investor Poll-8.21.25¹</p>
        </div>
        <div className='flex flex-col gap-[1em] items-center'>
          <p className='flex text-blue-400 text-[4em] font-bold'>
            <AnimatedCounter value="$194M" />
          </p>
          <p className='flex font-bold text-white text-[1.2em]'>PAID TO BONDHOLDERS</p>
          <p className=''>Inception-9.30.25²</p>
        </div>
        <div className='flex flex-col gap-[1em] items-center'>
          <p className='flex text-blue-400 text-[4em] font-bold'>
            <AnimatedCounter value="2.48k+" />
          </p>
          <p className='flex font-bold text-white text-[1.2em]'>BONDHOLDERS LIKE YOU</p>
          <p className=''>Inception-9.30.25³</p>
        </div>
      </div>
      <div className='flex flex-col text-gray-400 mt-[4em] gap-[1.5em]'>
        <p>NOTE: Past performance does not guarantee future results.</p>
        <p>The following information is based on internal feedback collected during Civvest Energy Partners’ quarterly investor update held on 8/21/2025. A total of 479 investors participated in the poll. Out of these respondents, 436 investors (91%) reported being “Very Satisfied” with their experience, while 29 investors (6%) reported being “Somewhat Satisfied.” An additional 12 investors selected “Neutral.”</p>
        <p>The total returns reported below reflect the combined interest payments and accrued returns issued to all Civvest Energy Partners investors through 9/30/2025. This amount includes all ROI distributions paid directly to our investors as part of our partnership programs with U.S. oil-producing companies.</p>
        <p>This figure does not include payments made to outside businesses, vendors, or financing partners.</p>
        <p>These numbers are consistent with the operational and financial disclosures provided in Civvest Energy Partners’ periodic reporting and internal performance summaries.</p>
      </div>
    </div>
  )
}

export default TrackRecord;