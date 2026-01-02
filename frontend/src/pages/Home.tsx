import React, {useEffect} from 'react';
import Navbar from '../components/Navbar';
import HomeSection from '../components/HomeSection';
import NextBody from '../components/NextBody';
import Downbody from '../components/Downbody';
import SecondBody from '../components/SecondBody';
import Footer from '../components/Footer';
import Foot from '../components/Foot';
import { useSEO } from "../hooks/useSEO";

const Home: React.FC = () => {
  useSEO({
    title: "Welcome",
    description: "Civvest Energy Partners. Invest in oil and get maximum returns from a minimum price to the price f your choice",
    keywords: "Civvest company, energy company, executive team, oil and gas investment, renewable energy company, Texas energy",
    image: "https://www.civvest.com/civvest main.jpeg", 
    url: "https://www.civvest.com",
    type: "website"
  });

  useEffect(() => {
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.civvest.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Company Bio",
          "item": "https://www.civvest.com/"
        }
      ]
    });
    document.head.appendChild(breadcrumbScript);
    
    return () => {
      breadcrumbScript.remove();
    };
  }, []);

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Civvest Energy Partners",
          "url": "https://www.civvest.com",
          "logo": "https://www.civvest.com/civvest main.jpeg",
          "description": "Leading renewable energy investment platform providing sustainable energy solutions",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Dallas, Texas",
            "addressCountry": "USA"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "(192)924-81175",
            "contactType": "Customer Service"
          }
        })}
      </script>

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

