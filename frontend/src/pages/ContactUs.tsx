import React, { useState } from "react";
import Navbar from "../components/Navbar";
import ContactUsImage from "../assets/contact page picture.jpg";
import ContactBody from "../components/ContactBody";
import Footer from "../components/Footer";
import Foot from "../components/Foot";
import { usePageTitle } from "../hooks/usePageTitle";
import axios from "axios";
import { FiCheck, FiAlertCircle, FiSend } from "react-icons/fi";

const ContactUs: React.FC = () => {
  usePageTitle("Contact Us");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    accreditedInvestor: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
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
      setError("Please fill in all required fields correctly");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      const response = await axios.post('https://civvest-backend.onrender.com/api/contact', {
        ...formData,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          accreditedInvestor: false
        });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError(response.data.error || "Failed to send message");
      }
    } catch (err: any) {
      console.error("Contact form error:", err);
      setError(err.response?.data?.error || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      <Navbar />

      {/* HERO SECTION */}
      <section
        className="relative w-full min-h-screen flex flex-col items-center pt-20 px-[3em] md:px-10 pb-32 md:pb-52"
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
        <div className="flex flex-col items-center mt-[11em] z-10 gap-4 text-center">
          <p className="text-[3.5em] lg:text-[5em] text-white font-serif leading-tight">
            Contact us to invest
          </p>
          <p className="text-white text-base md:text-xl leading-[1.2em]">
            Civvest Energy Partners offers accredited investors exclusive access to high potential opportunities in the oil and gas sector designed to strengthen portfolios through strategic energy asset acquisition.
          </p>
        </div>

        {/* SUCCESS/ERROR MESSAGES */}
        {success && (
          <div className="w-full max-w-6xl z-20 mb-4">
            <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg flex items-start">
              <FiCheck className="mr-3 mt-1 shrink-0" />
              <div>
                <p className="font-semibold">Message Sent Successfully!</p>
                <p className="text-sm mt-1">Thank you for contacting Civvest. We'll get back to you shortly at {formData.email}.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full max-w-6xl z-20 mb-4">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-start">
              <FiAlertCircle className="mr-3 mt-1 shrink-0" />
              <div>
                <p className="font-semibold">Error Sending Message</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

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
