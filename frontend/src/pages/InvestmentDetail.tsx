import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Foot from '../components/Foot';
import InvestmentImage from '../assets/Investment Image.jpeg';
import MainBonding from '../assets/main bonding.jpg';
import { FiDollarSign, FiClock, FiArrowLeft, FiCheckCircle, FiCalendar } from 'react-icons/fi';

interface Investment {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string;
  imageUrl: string;
  minAmount: number;
  targetAmount: number;
  currentAmount: number;
  returnRate: string;
  duration: string;
  category: string;
  bondOffering: boolean;
}

const InvestmentDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [relatedInvestments, setRelatedInvestments] = useState<Investment[]>([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [expectedReturn, setExpectedReturn] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dailyROI, setDailyROI] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      fetchInvestmentDetail();
    }
  }, [slug]);

  const calculateReturns = (amount: number) => {
    if (!investment || !amount) {
      setExpectedReturn(0);
      setDailyROI(0);
      setTotalDays(0);
      return;
    }

    // Parse return rate
    const rateText = investment.returnRate;
    const rateMatch = rateText.match(/(\d+(\.\d+)?)/);
    const rate = rateMatch ? parseFloat(rateMatch[1]) / 100 : 0.15;

    // Parse duration
    const durationMatch = investment.duration.match(/(\d+)\s*(month|year|day)/i);
    let days = 0;
    
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      
      switch(unit) {
        case 'day':
          days = value;
          break;
        case 'month':
          days = value * 30;
          break;
        case 'year':
          days = value * 365;
          break;
        default:
          days = 180;
      }
    } else {
      const numMatch = investment.duration.match(/\d+/);
      if (numMatch) {
        days = parseInt(numMatch[0]) * 30;
      } else {
        days = 180;
      }
    }

    setTotalDays(days);

    // Calculate returns
    let totalReturn = 0;
    let dailyReturn = 0;
    
    if (investment.category.toLowerCase().includes('fixed')) {
      totalReturn = amount + (rate * amount);
      dailyReturn = (totalReturn - amount) / days;
    } else {
      totalReturn = amount + (rate * amount);
      dailyReturn = (rate * amount) / days;
    }

    setExpectedReturn(totalReturn);
    setDailyROI(dailyReturn);
  };

  useEffect(() => {
    const amount = parseFloat(investmentAmount);
    if (!isNaN(amount) && amount > 0 && investment) {
      calculateReturns(amount);
    } else {
      setExpectedReturn(0);
      setDailyROI(0);
      setTotalDays(0);
    }
  }, [investmentAmount, investment]);

  const fetchInvestmentDetail = async () => {
    try {
      const response = await axios.get(`https://civvest-backend.onrender.com/api/investments/${slug}`);
      const investmentData = response.data.investment;
      setInvestment(investmentData);
      
      // Fetch related investments based on whether it's a bond offering or not
      fetchRelatedInvestments(investmentData.bondOffering);
      
      // Set default investment amount to minimum
      if (investmentData.minAmount) {
        setInvestmentAmount(investmentData.minAmount.toString());
        calculateReturns(investmentData.minAmount);
      }
    } catch (error) {
      console.error('Failed to fetch investment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedInvestments = async (isBondOffering: boolean) => {
    try {
      // Fetch investments with the same bondOffering type
      const response = await axios.get('https://civvest-backend.onrender.com/api/investments', {
        params: {
          bondOffering: isBondOffering,
          status: 'ACTIVE'
        }
      });
      
      // Filter out the current investment and take up to 3 related ones
      const filtered = response.data
        .filter((inv: Investment) => inv.slug !== slug)
        .slice(0, 3);
      
      setRelatedInvestments(filtered);
    } catch (error) {
      console.error('Failed to fetch related investments:', error);
    }
  };

  const getInvestmentImage = () => {
    if (!investment) return InvestmentImage;
    
    // Use the investment's imageUrl if available
    if (investment.imageUrl && investment.imageUrl.startsWith('/')) {
      return `https://civvest-backend.onrender.com${investment.imageUrl}`;
    }
    
    // Fallback based on bondOffering status
    return investment.bondOffering ? MainBonding : InvestmentImage;
  };

  const getBackLink = () => {
    if (investment?.bondOffering) {
      return '/bond-plans';
    }
    return '/view-investment';
  };

  const formatDuration = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      if (remainingDays === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      }
      return `${years} year${years > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (remainingDays === 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
      }
      return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Investment not found</p>
          <button
            onClick={() => navigate('/view-investment')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            View All Investments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="pt-[13em] px-4 lg:px-8 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Back Button - Goes to appropriate page */}
          <button
            onClick={() => navigate(getBackLink())}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-semibold"
          >
            <FiArrowLeft /> Back to {investment.bondOffering ? 'Bond Plans' : 'Investments'}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Image & Details */}
            <div>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                <img
                  src={getInvestmentImage()}
                  alt={investment.title}
                  className="w-full h-80 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = investment.bondOffering ? MainBonding : InvestmentImage;
                  }}
                />
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{investment.title}</h1>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {investment.category}
                  </span>
                  {investment.bondOffering && (
                    <span className="px-4 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                      Bond Offering
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-6">{investment.shortDesc}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FiDollarSign />
                      <span className="text-sm">Minimum Amount</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">${investment.minAmount.toLocaleString()}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FiClock />
                      <span className="text-sm">Duration</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{investment.duration}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">About This Investment</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{investment.description}</p>
                </div>
              </div>
            </div>

            {/* Right Side - Calculator & CTA */}
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-32">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Investment Calculator</h2>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Investment Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder={`Min: $${investment.minAmount.toLocaleString()}`}
                      min={investment.minAmount}
                      step="100"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                    />
                  </div>
                  {investmentAmount && parseFloat(investmentAmount) < investment.minAmount && (
                    <p className="text-red-500 text-sm mt-2">
                      Minimum investment is ${investment.minAmount.toLocaleString()}
                    </p>
                  )}
                  
                  {/* Quick amount buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setInvestmentAmount(investment.minAmount.toString())}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      Min: ${investment.minAmount.toLocaleString()}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvestmentAmount((investment.minAmount * 2).toString())}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      2x: ${(investment.minAmount * 2).toLocaleString()}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvestmentAmount((investment.minAmount * 5).toString())}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      5x: ${(investment.minAmount * 5).toLocaleString()}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvestmentAmount((investment.minAmount * 10).toString())}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      10x: ${(investment.minAmount * 10).toLocaleString()}
                    </button>
                  </div>
                </div>

                {expectedReturn > 0 && investmentAmount && parseFloat(investmentAmount) >= investment.minAmount && (
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FiCalendar className="text-blue-600" /> 
                      Investment Returns Forecast
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600 text-sm">Your Investment</p>
                          <p className="text-xl font-bold text-gray-800">
                            ${parseFloat(investmentAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600 text-sm">Duration</p>
                          <p className="text-xl font-bold text-blue-700">{formatDuration(totalDays)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!investmentAmount || parseFloat(investmentAmount) < investment.minAmount) {
                      alert(`Minimum investment is $${investment.minAmount.toLocaleString()}`);
                      return;
                    }
                    // Pass investment data through navigation state
                    navigate(`/deposit/${investment.id}`, {
                      state: {
                        investment: {
                          id: investment.id,
                          title: investment.title,
                          minAmount: investment.minAmount,
                          returnRate: investment.returnRate,
                          duration: investment.duration
                        },
                        selectedAmount: investmentAmount,
                        dailyROI: dailyROI.toFixed(2),
                        totalDays: totalDays
                      }
                    });
                  }}
                  disabled={!investmentAmount || parseFloat(investmentAmount) < investment.minAmount}
                  className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                >
                  Proceed to Deposit
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-600 mt-1 shrink-0" />
                    <p className="text-sm text-gray-600">Secure and regulated investment platform</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-600 mt-1 shrink-0" />
                    <p className="text-sm text-gray-600">Transparent terms and conditions</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-600 mt-1 shrink-0" />
                    <p className="text-sm text-gray-600">Dedicated customer support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Investments - Show only same type (bond or regular) */}
          {relatedInvestments.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Other {investment.bondOffering ? 'Bond' : 'Investment'} Opportunities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedInvestments.map((related) => (
                  <div
                    key={related.id}
                    onClick={() => navigate(`/investment/${related.slug}`, { state: { fromBondPlans: related.bondOffering } })}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition"
                  >
                    <div className="relative h-48">
                      <img
                        src={related.bondOffering ? MainBonding : InvestmentImage}
                        alt={related.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = related.bondOffering ? MainBonding : InvestmentImage;
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full">
                          {related.returnRate}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-blue-600 font-semibold">{related.category}</span>
                      {related.bondOffering && (
                        <span className="ml-2 text-xs text-purple-600 font-semibold">Bond</span>
                      )}
                      <h3 className="font-bold text-gray-800 mt-2 mb-2">{related.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{related.shortDesc}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Min: ${related.minAmount.toLocaleString()}</span>
                        <span className="text-gray-600">{related.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <ApplicationFormModal
          investment={investment}
          amount={investmentAmount}
          onClose={() => setShowApplicationForm(false)}
        />
      )}

      <Footer />
      <Foot />
    </div>
  );
};

// Application Form Component (unchanged)
const ApplicationFormModal: React.FC<{
  investment: Investment;
  amount: string;
  onClose: () => void;
}> = ({ investment, amount, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phoneNumber: '',
    amount: amount,
    investmentPlan: investment.title
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        'http://localhost:5000/api/investment-applications',
        {
          investmentId: investment.id,
          ...formData
        },
        { withCredentials: true }
      );

      alert('Application submitted successfully! An admin will contact you shortly.');
      onClose();
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto pt-[9em]">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Investment Application</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Investment Plan</label>
            <input
              type="text"
              value={formData.investmentPlan}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Amount to Invest *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min={investment.minAmount}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestmentDetail;
