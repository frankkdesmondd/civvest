import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Foot from '../components/Foot'
import { usePageTitle } from "../hooks/usePageTitle";

const PrivacyPolicy: React.FC = () => {
  usePageTitle("Privacy Policy");

  return (
    <div>
      <Navbar/>
      <div className='flex flex-col items-start text-start mt-[14em] gap-[3em] px-[2em] lg:px-[4em]'>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'>Privacy Policy</h1>
          <p className='flex flex-wrap'>Effective Date: 11/17/2023</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'>1. Introduction</h1>
          <p className='flex flex-wrap'> Welcome to 
          civvest.com, owned and operated by civvest Energy Partners(“we,”
          “us,” or “our”). We value your privacy and are committed to protecting your
          personal information. This Privacy Policy explains how we collect, use, disclose,
          and safeguard your information when you use our website.</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'>2. Information We Collect</h1>
          <p className='flex flex-wrap'> We may collect the following types of information when you visit civvest.com:</p>
          <p className='flex flex-wrap'>– Log Information: We collect information that your browser sends whenever you
            visit our website. This may include your IP address, browser type, pages visited,
            and timestamps
          </p>
          <p className='flex flex-wrap'>– Cookies and Similar Technologies: We use cookies and similar technologies to
            enhance your experience on our website. Cookies are small text files that are
            placed on your device to track your usage patterns</p>
          <p className='flex flex-wrap'>
            – Contact Information: If you contact us through our website, we may collect your name, email address, phone number, and any other information you provide
          </p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'> 3. How We Use Your Information</h1>
          <p className='flex flex-wrap'>We use the collected information for various purposes, including:</p>
          <p>– Website Improvement: Analyzing usage patterns and user preferences to
           improve our website’s functionality and content</p>
          <p>
            – Communication: Responding to your inquiries, providing information about our
            services, and sending updates
          </p>
          <p>
            – Personalization: Customizing your experience on our website by remembering
             your preferences and showing content relevant to you
          </p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'>4. Third-Party Disclosure</h1>
          <p className='flex flex-wrap'> We may share your information with third parties under the following circumstances:</p>
          <p>– Service Providers: We may engage third-party service providers to assist us in various aspects of our operations, such as website analytics or communication services.</p>
          <p>
            – Legal Compliance: We may disclose your information if required by law or in
             response to valid legal requests.
          </p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'>5. Your Choices</h1>
          <p className='flex flex-wrap'>– Cookies: You can usually set your browser to refuse cookies or indicate when a cookie is being sent. However, some features of our website may not function properly without cookies</p>
          <p>– Marketing Communications: You can choose to opt-out of receiving marketing communications from us by following the unsubscribe instructions in the communication.</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'>6. Data Security</h1>
          <p className='flex flex-wrap'> We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of data transmission over the internet or electronic storage is completely secure.</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'> 7. Links to Other Websites</h1>
          <p className='flex flex-wrap'>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these websites. We encourage you to read the privacy policies of any linked site.</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'>8. Children’s Privacy</h1>
          <p className='flex flex-wrap'>Our website is not intended for individuals under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us to have it removed.</p>
        </div>
        <div className='flex flex-col gap-[1em]'>
          <h1 className='flex text-[2.7em] font-semibold'>9. Changes to this Privacy Policy</h1>
          <p className='flex flex-wrap'> We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The updated policy will be posted on our website.</p>
        </div>
        <div className='flex flex-col gap-[1em] mb-[4em]'>
          <h1 className='flex text-[2.7em] font-semibold'>10. Contact Us</h1>
          <p className='flex flex-wrap'> If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
          <p className='flex font-bold text-[#0d2e92]'>Civvest Energy Partners</p>
          <div className=''>
            <p> Address: 2911 Turtle Creek Blvd Ste 570, Dallas, TX 75219</p>
            <p>Phone: +19292481175</p>
            <p>Email: info@civvest.com</p>
          </div>
          <p>Thank you for using civvest.com and agreeing to our Terms of Service.</p>
        </div>
      </div>
      <Footer/>
      <Foot/>
    </div>
  )
}

export default PrivacyPolicy