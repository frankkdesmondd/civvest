import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ContactUsImage from "../assets/contact page picture.jpg";
import ContactBody from "../components/ContactBody";
import Footer from "../components/Footer";
import Foot from "../components/Foot";
import { FiSend } from "react-icons/fi";
import AOS from "aos";
import "aos/dist/aos.css";
import axiosInstance from "../config/axios";
import { useSEO } from "../hooks/useSEO";
import { useToast } from "../context/ToastContext"; // Adjust the import path

const ContactUs: React.FC = () => {
  useSEO({
    title: "Contact Us",
    description: "Encountering any issues or have any question? Feel free to contact us",
    keywords: "Civvest company, energy company, executive team, oil and gas investment, renewable energy company, Texas energy",
    image: "https://www.civvest.com/civvest main.jpeg", 
    url: "https://www.civvest.com/contact-us",
    type: "website"
  });
  
  // Use your toast context
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    accreditedInvestor: false
  });
  
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });

    AOS.refresh();
  }, []);

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
          "name": "Contact us",
          "item": "https://www.civvest.com/contact-us"
        }
      ]
    });
    document.head.appendChild(breadcrumbScript);
    
    return () => {
      breadcrumbScript.remove();
    };
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    if (!formData.accreditedInvestor) errors.accreditedInvestor = "You must confirm accredited investor status";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show error toast for form validation
      showToast("Please fill in all required fields correctly", "error");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/api/contact', {
        ...formData,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        // Show success toast
        showToast("Message sent successfully! We'll get back to you soon.", "success");
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          accreditedInvestor: false
        });
      } else {
        // Show error toast from server response
        showToast(response.data.error || "Failed to send message", "error");
      }
    } catch (err: any) {
      console.error("Contact form error:", err);
      // Show error toast for network/server errors
      showToast(err.response?.data?.error || "Failed to send message. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
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

      {/* HERO SECTION */}
      <section
        className="relative w-full min-h-screen flex flex-col items-center pt-20 px-[3em] md:px-10 pb-32 md:pb-52" data-aos="fade-up"
        style={{
          backgroundImage: `url(${ContactUsImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* DARK BLUE OVERLAY */}
        <div className="absolute inset-0 bg-[#043873]/70"></div>

        {/* BLUE FADE FROM BOTTOM */}
        <div className="absolute bottom-0 left-0 w-full h-[95%] bg-linear-to-t from-[#043873] to-transparent"></div>

        {/* HERO TITLE AND DESCRIPTION */}
        <div className="flex flex-col items-center mt-[11em] z-10 gap-4 text-center" data-aos="fade-up">
          <p className="text-[3em] lg:text-[5em] text-white font-serif leading-tight">
            Contact us to invest
          </p>
          <p className="text-white text-base md:text-xl leading-[1.2em]">
            Civvest Energy Partners offers accredited investors exclusive access to high potential opportunities in the oil and gas sector designed to strengthen portfolios through strategic energy asset acquisition.
          </p>
        </div>

        {/* CONTACT FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-10 w-full max-w-6xl z-10">

          {/* LEFT INPUTS */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-1">
              <label className="text-white text-sm sm:text-base">Name* (required)</label>
              <div className={`bg-white rounded-lg ${formErrors.name ? 'ring-2 ring-red-500' : ''}`}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full py-3 px-3 outline-none border-none rounded-lg"
                />
              </div>
              {formErrors.name && (
                <p className="text-red-300 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white text-sm sm:text-base">Email* (required)</label>
              <div className={`bg-white rounded-lg ${formErrors.email ? 'ring-2 ring-red-500' : ''}`}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full py-3 px-3 outline-none border-none rounded-lg"
                />
              </div>
              {formErrors.email && (
                <p className="text-red-300 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white text-sm sm:text-base">Phone* (required)</label>
              <div className={`bg-white rounded-lg ${formErrors.phone ? 'ring-2 ring-red-500' : ''}`}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full py-3 px-3 outline-none border-none rounded-lg"
                />
              </div>
              {formErrors.phone && (
                <p className="text-red-300 text-xs mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          {/* RIGHT MESSAGE */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-white text-sm sm:text-base">Leave A Message (optional):</label>
            <div className="bg-white rounded-lg">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full py-3 px-3 resize-none h-48 lg:h-[14.2em] outline-none border-none rounded-lg"
              ></textarea>
            </div>
          </div>
        </form>

        {/* ACCREDITED INVESTOR & BUTTON */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mt-6 items-start lg:items-center max-w-6xl w-full z-10">
          <div className="flex flex-col lg:flex-1 gap-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="accreditedInvestor"
                checked={formData.accreditedInvestor}
                onChange={handleChange}
                className={`w-5 h-3 ${formErrors.accreditedInvestor ? 'ring-2 ring-red-500' : ''}`}
              />
              <p className="text-white text-sm sm:text-base">
                Accredited Investor status:* (required)
              </p>
            </div>
            {formErrors.accreditedInvestor && (
              <p className="text-red-300 text-xs ml-6">{formErrors.accreditedInvestor}</p>
            )}
            <p className="text-white text-xs sm:text-sm ml-0 lg:ml-6">
              I certify that I had an individual income over $200,000 (or joint income with my spouse for more than $300,000) in each of the past two years and reasonably expect to reach the same level in the current year, AND/OR I have an individual net worth in excess of $1,000,000.
            </p>
          </div>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center outline-none border border-white bg-inherit rounded-xl px-6 py-3 text-base sm:text-lg cursor-pointer hover:bg-[#244772] hover:text-white hover:border-[#244772] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                Contact Us To Invest Today
              </>
            )}
          </button>
        </div>

        {/* FORM SUBMISSION NOTE */}
        <div className="mt-6 max-w-6xl w-full z-10">
          <p className="text-gray-300 text-sm text-center">
            By submitting this form, you agree to be contacted by Civvest Energy Partners. 
            We respect your privacy and will not share your information with third parties.
          </p>
        </div>

      </section>

      <ContactBody/>
      <Footer/>
      <Foot/>
    </div>
  );
};

export default ContactUs;

