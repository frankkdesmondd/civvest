import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCopy, FiCheck, FiEdit2, FiSave, FiCreditCard, FiDollarSign, FiTrash2, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { HomeUtils } from '../utils/HomeUtils';
import { useUser } from '../context/UserContext';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import axiosInstance from '../config/axios';

interface Wallet {
  id: string;
  coinHost: string;
  walletAddress: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  balance: number;
  country: string | null;
  state: string | null;
  address: string | null;
  phone: string | null;
  referralCode: string;
  referralLink: string;
  createdAt: string;
  bankName: string | null;
  accountName: string | null;
  bankAccountNumber: string | null;
  routingCode: string | null;
  wallets: Wallet[];
  profilePicture: string | null;
}

type TabType = 'profile' | 'bank' | 'wallets';

const Profile: React.FC = () => {
  const { user, refreshUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    country: '',
    state: '',
    address: '',
    phone: '',
    bankName: '',
    accountName: '',
    bankAccountNumber: '',
    routingCode: ''
  });

  const [newWallet, setNewWallet] = useState({
    coinHost: '',
    walletAddress: ''
  });
  const [addingWallet, setAddingWallet] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePictureUpdated = async () => {
    // Refresh user data to get updated profile picture
    await refreshUser();
    setProfileUpdated(!profileUpdated);
    
    // Dispatch event to update all profile picture components
    window.dispatchEvent(new CustomEvent('profilePictureUpdated'));
  };

  const fetchProfile = async () => {
  try {
    // Use /profile without additional /api since axiosInstance adds it
   const response = await axiosInstance.get('/api/profile');
    setProfile(response.data);
    setFormData({
      country: response.data.country || '',
      state: response.data.state || '',
      address: response.data.address || '',
      phone: response.data.phone || '',
      bankName: response.data.bankName || '',
      accountName: response.data.accountName || '',
      bankAccountNumber: response.data.bankAccountNumber || '',
      routingCode: response.data.routingCode || ''
    });
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    showToast('Failed to load profile', 'error');
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/api/profile', formData);
      showToast('Profile updated successfully!', 'success');
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddWallet = async () => {
    if (!newWallet.coinHost || !newWallet.walletAddress) {
      showToast('Please fill in all wallet fields', 'error');
      return;
    }

    setAddingWallet(true);
    try {
      await axiosInstance.post(
        '/api/profile/wallets',
        newWallet,
        { withCredentials: true }
      );
      showToast('Wallet added successfully!', 'success');
      setNewWallet({ coinHost: '', walletAddress: '' });
      fetchProfile();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to add wallet', 'error');
    } finally {
      setAddingWallet(false);
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to delete this wallet?')) return;

    try {
      await axiosInstance.delete(
        `/api/profile/wallets/${walletId}`,
        { withCredentials: true }
      );
      showToast('Wallet deleted successfully!', 'success');
      fetchProfile();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to delete wallet', 'error');
    }
  };

  const copyReferralLink = () => {
    if (profile?.referralLink) {
      navigator.clipboard.writeText(profile.referralLink);
      setCopied(true);
      showToast('Referral link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#041a35] flex flex-col items-center justify-center">
        <img src={HomeUtils[0].companyLogo} alt="" className='w-[8em]'/>
        <p className='text-white'>Page Loading......</p>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-8 border-b">
            <div className="shrink-0">
              <ProfilePictureUpload
                userId={user.id}
                currentPicture={user.profilePicture}
                firstName={user.firstName}
                lastName={user.lastName}
                onPictureUpdated={handlePictureUpdated}
                size="lg"
                showControls={true}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  Account: {profile.accountNumber}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  Balance: ${profile.balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiUser className="inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                activeTab === 'bank'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiCreditCard className="inline mr-2" />
              Bank Details
            </button>
            <button
              onClick={() => setActiveTab('wallets')}
              className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                activeTab === 'wallets'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiDollarSign className="inline mr-2" />
              Crypto Wallets
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2"
                >
                  <FiEdit2 /> {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Fixed Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">First Name</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiUser className="text-gray-500" />
                    <span className="text-gray-800">{profile.firstName}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">Last Name</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiUser className="text-gray-500" />
                    <span className="text-gray-800">{profile.lastName}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">Email</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiMail className="text-gray-500" />
                    <span className="text-gray-800">{profile.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                </div>

                {/* <div>
                  <label className="block text-gray-600 text-sm mb-2">Member Since</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-800">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div> */}
              </div>

              {/* Editable Fields */}
              <h4 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Country</label>
                  {editing ? (
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Enter your country"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiMapPin className="text-gray-500" />
                      <span className="text-gray-800">{profile.country || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">State/Province</label>
                  {editing ? (
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter your state"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiMapPin className="text-gray-500" />
                      <span className="text-gray-800">{profile.state || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-600 text-sm mb-2">Address</label>
                  {editing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your full address"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiMapPin className="text-gray-500" />
                      <span className="text-gray-800">{profile.address || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">Phone Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiPhone className="text-gray-500" />
                      <span className="text-gray-800">{profile.phone || 'Not set'}</span>
                    </div>
                  )}
                </div>
              </div>

              {editing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}

              {/* Referral Section */}
              <div className="mt-8 bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Your Referral Link</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Share this link with friends and earn rewards when they invest!
                </p>
                <div className="flex items-center gap-2 bg-white p-4 rounded-lg border-2 border-blue-200">
                  <input
                    type="text"
                    value={profile.referralLink}
                    readOnly
                    className="flex-1 bg-transparent text-gray-800 text-sm outline-none"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-2 text-blue-600 font-semibold"
                  >
                    {copied ? (
                      <>
                        <FiCheck /> Copied!
                      </>
                    ) : (
                      <>
                        <FiCopy /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Referral Code:</strong> {profile.referralCode}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BANK TAB */}
          {activeTab === 'bank' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Bank Account Details</h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2"
                >
                  <FiEdit2 /> {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Add your bank details for easy withdrawals
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Bank Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="Enter bank name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiCreditCard className="text-gray-500" />
                      <span className="text-gray-800">{profile.bankName || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">Account Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      placeholder="Enter account name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiUser className="text-gray-500" />
                      <span className="text-gray-800">{profile.accountName || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">Account Number</label>
                  {editing ? (
                    <input
                      type="text"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleInputChange}
                      placeholder="Enter account number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-800">{profile.bankAccountNumber || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">Routing Code</label>
                  {editing ? (
                    <input
                      type="text"
                      name="routingCode"
                      value={formData.routingCode}
                      onChange={handleInputChange}
                      placeholder="Enter routing code"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-800">{profile.routingCode || 'Not set'}</span>
                    </div>
                  )}
                </div>
              </div>

              {editing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <FiSave /> {saving ? 'Saving...' : 'Save Bank Details'}
                </button>
              )}
            </div>
          )}

          {/* WALLETS TAB */}
          {activeTab === 'wallets' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Crypto Wallets</h3>
              <p className="text-gray-600 mb-6">
                Add your cryptocurrency wallets for withdrawals
              </p>

              {/* Add New Wallet */}
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiPlus /> Add New Wallet
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Coin/Host</label>
                    <input
                      type="text"
                      value={newWallet.coinHost}
                      onChange={(e) => setNewWallet({ ...newWallet, coinHost: e.target.value })}
                      placeholder="e.g., Bitcoin, Ethereum, USDT"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Wallet Address</label>
                    <input
                      type="text"
                      value={newWallet.walletAddress}
                      onChange={(e) => setNewWallet({ ...newWallet, walletAddress: e.target.value })}
                      placeholder="Enter wallet address"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddWallet}
                  disabled={addingWallet}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {addingWallet ? 'Adding...' : 'Add Wallet'}
                </button>
              </div>

              {/* Saved Wallets */}
              <h4 className="font-bold text-gray-800 mb-4">Your Saved Wallets</h4>
              {profile.wallets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FiDollarSign className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No wallets added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-800">{wallet.coinHost}</p>
                          <p className="text-xs text-gray-500">
                            Added {new Date(wallet.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteWallet(wallet.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-800 break-all font-mono">
                          {wallet.walletAddress}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;





