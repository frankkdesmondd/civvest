import React from 'react';
import Navbar from '../components/Navbar';
import HomeSection from '../components/HomeSection';
import NextBody from '../components/NextBody';
import Downbody from '../components/Downbody';
import SecondBody from '../components/SecondBody';
import Footer from '../components/Footer';
import Foot from '../components/Foot';
import { usePageTitle } from '../hooks/usePageTitle';

const Home: React.FC = () => {
  usePageTitle("Welcome")

  return (
    <>
      <Navbar />

      <HomeSection />

      {/* Other sections */}
      <NextBody />
      <Downbody />
      <SecondBody />
      <Footer />
      <Foot />
    </>
  );
};

export default Home;
