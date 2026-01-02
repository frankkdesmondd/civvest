import React, {useEffect} from 'react'
import { useSEO } from "../hooks/useSEO";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Foot from '../components/Foot';

const TermsServices: React.FC = () => {
  useSEO({
    title: "Terms and Services",
    description: "Take a look at Civvest terms and services while using our platform",
    keywords: "Civvest company, energy company, executive team, oil and gas investment, renewable energy company, Texas energy",
    image: "https://www.civvest.com/civvest main.jpeg", 
    url: "https://www.civvest.com/terms-and-services",
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
          "name": "Terms and Services",
          "item": "https://www.civvest.com/terms-and-services"
        }
      ]
    });
    document.head.appendChild(breadcrumbScript);
    
    return () => {
      breadcrumbScript.remove();
    };
  }, []);
  
  return (
    <div>
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
            "telephone": "(929) 248-1175",
            "contactType": "Customer Service"
          }
        })}
      </script>

      <Navbar/>
      <div className='flex flex-col items-start text-start mt-[14em] gap-[3em] px-[2em] lg:px-[4em]'>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'>Terms Of Services</h1>
          <p className='flex flex-wrap'>Effective Date: 11/17/2023</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.4em] lg:text-[2.7em] font-semibold'>1. Acceptance of Terms</h1>
          <p className='flex flex-wrap'>Welcome to civvest.com, owned and operated by civvest Energy Partners (“we,”
            “us,” or “our”). By accessing or using our website, you agree to comply with and be bound by these Terms of Service. If you do not agree with these terms, please do not use our website</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.2em] lg:text-[2.7em] font-semibold'>2. Use of the Website</h1>
          <p className='flex flex-wrap'>You may use our website for lawful purposes only. You agree not to use the website for any illegal or unauthorized purpose that violates these Terms of Service.</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.2em] lg:text-[2.7em] font-semibold'>3. Intellectual Property</h1>
          <p className='flex flex-wrap'>All content, logos, trademarks, and other intellectual property on 
            civvest.com are owned by Civvest Energy Partners or its licensors. You are not permitted to use, reproduce, distribute, or modify any of our intellectual property without prior written consent.</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.2em] lg:text-[2.7em] font-semibold'> 4. User Content</h1>
          <p className='flex flex-wrap'>By submitting content to our website, you grant Civvest Energy Partners a non exclusive, royalty-free, worldwide, perpetual, and irrevocable right to use, reproduce, modify, adapt, publish, translate, distribute, and display the content.</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.2em] lg:text-[2.7em] font-semibold'>5. Disclaimer of Warranties</h1>
          <p className='flex flex-wrap'>Our website is provided “as is” and “as available” without any warranties of any kind, whether express or implied. We do not guarantee the accuracy,completeness, or reliability of the content on our website</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.2em] lg:text-[2.7em] font-semibold'>6. Limitation of Liability</h1>
          <p className='flex flex-wrap'>To the maximum extent permitted by law, Civvest Energy Partners and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.2em] lg:text-[2.7em] font-semibold'>7. Indemnification</h1>
          <p className='flex flex-wrap'>You agree to indemnify and hold Civvest Energy Partners, its officers, directors, employees, and agents harmless from any claims, liabilities, damages, losses, and expenses arising out of your use of the website or violation of these Terms of Service</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.2em] lg:text-[2.7em] font-semibold'>8. Changes to the Terms</h1>
          <p className='flex flex-wrap'>We reserve the right to modify or replace these Terms of Service at any time. The updated terms will be posted on our website, and your continued use of the website after any changes constitutes your acceptance of the updated terms.</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.2em] lg:text-[2.7em] font-semibold'>9. Termination</h1>
          <p className='flex flex-wrap'>We reserve the right to suspend or terminate your access to our website at our sole discretion, without prior notice, for any reason, including but not limited to a breach of these Terms of Service</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.2em] lg:text-[2.7em] font-semibold'>10. Governing Law</h1>
          <p className='flex flex-wrap'>These Terms of Service shall be governed by and construed in accordance with the laws of the state of Texas, without regard to its conflict of law principles.</p>
        </div>
        <div className='flex flex-col gap-[1em] mb-[4em]'>
          <h1 className='flex text-[2.2em] lg:text-[2.7em] font-semibold'>11. Contact Us</h1>
          <p className='flex flex-wrap'>If you have any questions, concerns, or inquiries regarding these Terms of Service, please contact us</p>
          <p className='flex font-bold text-[#0d2e92]'>Civvest Energy Partners</p>
          <div className=''>
            <p>Address: Dallas, Texas 75219</p>
            <p>Phone: (929) 248-1175</p>
            <p>Email: admin@civvest.com</p>
          </div>
          <p>Thank you for using civvest.com and agreeing to our Terms of Service.</p>
        </div>
      </div>
      <Footer/>
      <Foot/>
    </div>
  )
}

export default TermsServices



