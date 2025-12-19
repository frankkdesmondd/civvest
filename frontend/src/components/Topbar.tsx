import React from 'react';
import { Link } from 'react-router-dom';

interface TopbarProps {
  scrolled: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ scrolled }) => {
  return (
    <nav
      className={`w-full px-[2em] lg:px-[3em] flex justify-between items-center py-[0.8em] transition-colors duration-300
        ${scrolled ? 'bg-[#e7f2ff]' : 'bg-transparent'}
      `}
    >
      <p
        className={`hidden lg:flex text-[0.9em] transition-colors duration-300
          ${scrolled ? 'text-[#041a35]' : 'text-white'}
        `}
      >
        Call us to inquire about investing: (929) 248-1175
      </p>

      <p
        className={`flex lg:hidden text-[0.72em] transition-colors duration-300
          ${scrolled ? 'text-[#041a35]' : 'text-white'}
        `}
      >
        Call us to inquire about investing: (929) 248-1175
      </p>

      
      <div className="hidden items-center gap-4 lg:flex">
        <Link to='/learn-about'>
        <p
          className={`text-[0.9em] transition-colors duration-300
            ${scrolled ? 'text-[#041a35]' : 'text-white'}
          `}
        >
          Oil Investing Benefits
        </p>
        </Link>

        <div
          className={`h-[0.8em] w-[0.05em] transition-colors hidden lg:flex duration-300
            ${scrolled ? 'bg-[#041a35]' : 'bg-white'}
          `}
        ></div>

        <Link to='/contact-us'>
        <p
          className={`text-[0.9em] transition-colors duration-300
            ${scrolled ? 'text-[#041a35]' : 'text-white'}
          `}
        >
          Contact Us to Invest
        </p>
        </Link>

      </div>
    </nav>
  );
};

export default Topbar;




