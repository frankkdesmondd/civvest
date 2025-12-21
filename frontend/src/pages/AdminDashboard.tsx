import React, { useState, useEffect } from 'react';
import { FiUsers, FiTrendingUp, FiDollarSign, FiActivity, FiEdit, FiTrash2, FiPlus, FiSearch, FiBarChart2, FiPieChart, FiMenu, FiLogOut, FiHome, FiFileText, FiFile, FiExternalLink, FiAlertCircle, FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CivvestLogo from '../assets/civvest company logo.png'
import { HomeUtils } from '../utils/HomeUtils';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { PiHandWithdrawFill } from "react-icons/pi";
import axiosInstance from '../config/axios';
import { GrOverview } from "react-icons/gr";
import { useUser } from '../context/UserContext';


interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  balance: number;
  roi: number;
  referralBonus: number;
  createdAt: string;
  _count: { userInvestments: number };
}

interface Stats {
  totalUsers: number;
  totalInvestments: number;
  totalUserInvestments: number;
  totalInvestedAmount: number;
}

interface Withdrawal {
  id: string;
  userId: string;
  userInvestmentId: string;
  amount: number;
  type: 'BANK_TRANSFER' | 'CRYPTO_WALLET';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingCode?: string;
  coinHost?: string;
  walletAddress?: string;
  adminNotes?: string;
  approvedById?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  investment: {
    id: string;
    amount: number;
    returnAmount: number;
    investment: {
      title: string;
      category: string;
    };
  };
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
}

// Sidebar Component
const Sidebar: React.FC<{ activeTab: string; setActiveTab: (tab: any) => void; collapsed: boolean; setCollapsed: (val: boolean) => void; isMobile: boolean }> = ({ activeTab, setActiveTab, collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <div className={`h-screen bg-[#041a35] text-white flex flex-col transition-all duration-300 fixed left-0 top-0 z-40 ${
      collapsed ? 'w-16 sm:w-16 md:w-20' : 'w-64 sm:w-64 md:w-72'
    } ${isMobile && collapsed ? '-translate-x-full' : 'translate-x-0'}`}
    style={{ 
      height: '100vh',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: '#4B5563 #1F2937'
    }}>
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-700">
        {!collapsed && (<img src={CivvestLogo} alt='' className='w-[3.4em]'/> )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded hover:bg-gray-700">
          <FiMenu className="text-xl" />
        </button>
      </div>

      <nav className="flex-1 flex flex-col mt-4 gap-2 px-2">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 px-3 py-3 rounded-md font-semibold hover:bg-gray-700 text-gray-300">
          <FiHome className="text-lg sm:text-xl min-w-5 sm:min-w-6" />
          {!collapsed && <span>Homepage</span>}
        </button>
        
        <button
          onClick={() => {
            setActiveTab('overview');
            isMobile && setCollapsed(true);
          }}
          className={`flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded w-full text-left ${
            activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-300'
          }`}
        >
          <GrOverview className="text-lg sm:text-xl min-w-5 sm:min-w-6" />
          {!collapsed && <span>Overview</span>}
        </button>

        <button onClick={() => {
            setActiveTab('users');
            isMobile && setCollapsed(true);
          }}
          className={`flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded w-full text-left ${
            activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-300'
          }`}>
          <FiUsers className="text-xl" />
          {!collapsed && <span>Users</span>}
        </button>

        <button onClick={() => {
            setActiveTab('investments');
            isMobile && setCollapsed(true);
          }}
          className={`flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded w-full text-left ${
            activeTab === 'Investments' ? 'bg-blue-600 text-white' : 'text-gray-300'
          }`}>
          <FiTrendingUp className="text-xl" />
          {!collapsed && <span>Investments</span>}
        </button>

        <button onClick={() => {
            setActiveTab('news');
            isMobile && setCollapsed(true);
          }}
          className={`flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded w-full text-left ${
            activeTab === 'News' ? 'bg-blue-600 text-white' : 'text-gray-300'
          }`}>
          <FiFileText className="text-xl" />
          {!collapsed && <span>News</span>}
        </button>

        <button
          onClick={() => {
            setActiveTab('withdrawals');
            isMobile && setCollapsed(true);
          }}
          className={`flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded w-full text-left ${
            activeTab === 'Withdrawals' ? 'bg-blue-600 text-white' : 'text-gray-300'
          }`}
        >
          <PiHandWithdrawFill className="text-xl" />
          {!collapsed && <span>Withdrawals</span>}
        </button>

        <button
          onClick={() => {
            setActiveTab('deposits');
            isMobile && setCollapsed(true);
          }}
          className={`flex items-center gap-3 sm:gap-3 p-2 sm:p-2 hover:bg-gray-700 transition rounded w-full text-left ${
            activeTab === 'Deposits' ? 'bg-blue-600 text-white' : 'text-gray-300'
          }`}
        >
          <FiDollarSign className="text-xl" />
          {!collapsed && <span>Deposits</span>}
        </button>
      </nav>

      <div className="px-2 py-4 border-t border-gray-700">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-md font-semibold text-gray-300 hover:bg-red-600 hover:text-white">
          <FiLogOut className="text-xl" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'investments' | 'news' | 'withdrawals' | 'deposits'>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [newsPosts, setNewsPosts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAction, setBalanceAction] = useState<'SET' | 'ADD' | 'SUBTRACT'>('ADD');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [oilPrices, setOilPrices] = useState<any[]>([]);
  const [selectedUserForROI, setSelectedUserForROI] = useState<User | null>(null);
  const [roiAmount, setRoiAmount] = useState('');
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const { showToast } = useToast();
  const { updateUserById } = useUser();

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string>('');

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedWithdrawalForRejection, setSelectedWithdrawalForRejection] = useState<string | null>(null);

  // ConfirmModal States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: 'warning' | 'danger' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const [editingNews, setEditingNews] = useState<any>(null);
const [editFormData, setEditFormData] = useState({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  category: 'Energy',
  author: '',
  published: false
});
const [editImage, setEditImage] = useState<File | null>(null);
const [editImagePreview, setEditImagePreview] = useState<string>('');
const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    
    fetchAllData();
    generateOilPriceData();

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [navigate]);

  // Function to open confirm modal
  const openConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'warning' | 'danger' | 'info' = 'warning',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    setConfirmModalConfig({
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm: () => {
        onConfirm();
        setConfirmModalOpen(false);
      },
      onCancel: () => setConfirmModalOpen(false)
    });
    setConfirmModalOpen(true);
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(), 
      fetchUsers(), 
      fetchNews(), 
      fetchInvestments(), 
      fetchRecentActivities(), 
      fetchDeposits(),
      fetchWithdrawals()
    ]);
    setLoading(false);
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await axiosInstance.get('/api/withdrawals/admin/all');
      setWithdrawals(res.data);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      showToast('Failed to load withdrawal requests', 'error');
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
  openConfirmModal(
    'Approve Withdrawal',
    'Are you sure you want to approve this withdrawal request?',
    async () => {
      try {
        const response = await axiosInstance.put(
          `/api/withdrawals/admin/${withdrawalId}/status`,
          { status: 'APPROVED' }
        );
        
        showToast('Withdrawal approved!', 'success');
        
        // Update the user's balance in context if they're logged in
        if (response.data.userId && response.data.newBalance) {
          updateUserById(response.data.userId, { 
            balance: response.data.newBalance 
          });
          
          // Broadcast balance update
          window.dispatchEvent(new CustomEvent('balanceUpdated', {
            detail: {
              userId: response.data.userId,
              newBalance: response.data.newBalance,
              source: 'withdrawal-approval'
            }
          }));
        }
        
        fetchWithdrawals();
        fetchUsers();
      } catch (error: any) {
        showToast(error.response?.data?.error || 'Failed to approve withdrawal', 'error');
      }
    },
    'info',
    'Approve',
    'Cancel'
  );
};

  const handleRejectWithdrawal = async (withdrawalId: string, reason?: string) => {
    try {
      await axiosInstance.put(
        `/api/withdrawals/admin/${withdrawalId}/status`,
        { status: 'REJECTED', adminNotes: reason || 'No reason provided' }
      );
      showToast('Withdrawal rejected!', 'success');
      fetchWithdrawals();
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedWithdrawalForRejection(null);
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to reject withdrawal', 'error');
    }
  };

  const openRejectModal = (withdrawalId: string) => {
    setSelectedWithdrawalForRejection(withdrawalId);
    setShowRejectModal(true);
  };

  const handleUpdateROI = async () => {
  if (!selectedUserForROI || !roiAmount) {
    showToast('Please enter a valid ROI amount', "error");
    return;
  }

  try {
    const response = await axiosInstance.put(
      `/api/admin/users/${selectedUserForROI.id}/roi`, 
      { roi: parseFloat(roiAmount) }
    );
    
    showToast('ROI updated successfully', "success");
    
    // Update the user's context if they're currently logged in
    updateUserById(selectedUserForROI.id, { 
      roi: response.data.updatedRoi || parseFloat(roiAmount) 
    });
    
    // Broadcast ROI update event
    window.dispatchEvent(new CustomEvent('roiUpdated', {
      detail: {
        userId: selectedUserForROI.id,
        newROI: response.data.updatedRoi || parseFloat(roiAmount),
        source: 'admin-dashboard'
      }
    }));
    
    // Clear modal state
    setSelectedUserForROI(null);
    setRoiAmount('');
    
    // Refresh users list to show updated ROI
    await fetchUsers();
    
    // Also refresh stats if needed
    await fetchStats();
  } catch (error: any) {
    console.error('Update ROI error:', error);
    showToast("ROI failed to update", "error");
  }
};

  const generateOilPriceData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    setOilPrices(months.map(month => ({ month, price: Math.floor(Math.random() * 30) + 60 })));
  };

  const fetchDeposits = async () => {
    try {
      const res = await axiosInstance.get('/api/deposits/admin/all');
      setDeposits(res.data);
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    }
  };

  const handleConfirmDeposit = async (depositId: string) => {
  openConfirmModal(
    'Confirm Deposit',
    'Are you sure you want to confirm this deposit? This will update the user balance and activate their investment.',
    async () => {
      try {
        const response = await axiosInstance.put(`/api/deposits/${depositId}/status`,
          { status: 'CONFIRMED' }
        );
        
        showToast('Deposit confirmed successfully!', "success");
        
        // Update the user's balance in context if they're logged in
        if (response.data.userId && response.data.newBalance) {
          updateUserById(response.data.userId, { 
            balance: response.data.newBalance 
          });
          
          // Broadcast balance update
          window.dispatchEvent(new CustomEvent('balanceUpdated', {
            detail: {
              userId: response.data.userId,
              newBalance: response.data.newBalance,
              source: 'deposit-confirmation'
            }
          }));
        }
        
        fetchDeposits();
        fetchUsers();
      } catch (error: any) {
        showToast('Failed to confirm deposit', "error");
      }
    },
    'info',
    'Confirm',
    'Cancel'
  );
};

  const handleRejectDeposit = async (depositId: string) => {
    openConfirmModal(
      'Reject Deposit',
      'Are you sure you want to reject this deposit?',
      async () => {
        try {
          await axiosInstance.put(`/api/deposits/${depositId}/status`,
            { status: 'REJECTED' }
          );
          showToast('Deposit rejected', "success");
          fetchDeposits();
        } catch (error: any) {
          showToast('Failed to reject deposit', "error");
        }
      },
      'danger',
      'Reject',
      'Cancel'
    );
  };

  const openReceiptModal = (receiptUrl: string) => {
    setSelectedReceipt(receiptUrl);
    setShowReceiptModal(true);
  };

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/users');
      
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else if (res.data.users && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        console.error('Unexpected user data format:', res.data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await axiosInstance.get('/api/news/admin/all');
      setNewsPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  };

  const fetchInvestments = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/investments/analytics');
      setInvestments(res.data);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/recent-activities');
      setRecentActivities(res.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const handleUpdateBalance = async () => {
  if (!selectedUser || !balanceAmount) {
    showToast('Please enter a valid amount', "error");
    return;
  }

  try {
    const response = await axiosInstance.put(`/api/admin/users/${selectedUser.id}/balance`,
      { balance: parseFloat(balanceAmount), action: balanceAction }
    );
    
    showToast('Balance updated successfully', "success");
    
    // Update the user's context if they're currently logged in
    updateUserById(selectedUser.id, { 
      balance: response.data.updatedBalance || parseFloat(balanceAmount) 
    });
    
    // Broadcast balance update event
    window.dispatchEvent(new CustomEvent('balanceUpdated', {
      detail: {
        userId: selectedUser.id,
        newBalance: response.data.updatedBalance || parseFloat(balanceAmount),
        source: 'admin-dashboard'
      }
    }));
    
    setSelectedUser(null);
    setBalanceAmount('');
    fetchUsers();
  } catch (error: any) {
    showToast('Failed to update balance', "error");
  }
};


  const handleDeleteUser = async (userId: string, userName: string) => {
    openConfirmModal(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      async () => {
        try {
          await axiosInstance.delete(`/api/admin/users/${userId}`);
          showToast('User deleted', "success");
          fetchUsers();
        } catch (error: any) {
          showToast('Failed to delete user', "error");
        }
      },
      'danger',
      'Delete',
      'Cancel'
    );
  };

  const handleDeleteNews = async (id: string) => {
    openConfirmModal(
      'Delete News Post',
      'Are you sure you want to delete this news post?',
      async () => {
        try {
          await axiosInstance.delete(`/api/news/${id}`);
          showToast('News deleted', "success");
          fetchNews();
        } catch (error) {
          showToast('Failed to delete news', "error");
        }
      },
      'danger',
      'Delete',
      'Cancel'
    );
  };

  // Handle opening edit modal
const handleEditNews = (post: any) => {
  setEditingNews(post);
  setEditFormData({
    title: post.title,
    slug: post.slug || '',
    content: post.content,
    excerpt: post.excerpt || '',
    category: post.category || 'Energy',
    author: post.author || '',
    published: post.published
  });
  
  // Set image preview if exists
  if (post.imageUrl) {
    setEditImagePreview(`https://civvest-backend.onrender.com${post.imageUrl}`);
  } else {
    setEditImagePreview('');
  }
  
  setEditImage(null);
};

// Handle form field changes
const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;
  setEditFormData({
    ...editFormData,
    [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
  });
};

// Handle image change for edit
const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setEditImage(file);
    setEditImagePreview(URL.createObjectURL(file));
  }
};

// Generate slug from title for edit
const generateEditSlug = () => {
  const slug = editFormData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  setEditFormData({ ...editFormData, slug });
};

// Handle edit submission
const handleEditSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setEditLoading(true);

  try {
    const formData = new FormData();
    formData.append('title', editFormData.title);
    formData.append('slug', editFormData.slug);
    formData.append('content', editFormData.content);
    formData.append('excerpt', editFormData.excerpt);
    formData.append('category', editFormData.category);
    formData.append('author', editFormData.author);
    formData.append('published', String(editFormData.published));
    
    if (editImage) {
      formData.append('image', editImage);
    }

    await axiosInstance.put(`/api/news/${editingNews.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    showToast('News updated successfully!', 'success');
    setEditingNews(null);
    fetchNews(); // Refresh the news list
  } catch (error: any) {
    console.error('Edit news error:', error);
    showToast(error.response?.data?.error || 'Failed to update news', 'error');
  } finally {
    setEditLoading(false);
  }
};

// Reset edit modal
const resetEditModal = () => {
  setEditingNews(null);
  setEditImage(null);
  setEditImagePreview('');
  setEditFormData({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'Energy',
    author: '',
    published: false
  });
};

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.accountNumber.includes(searchTerm)
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const categoryData = investments.reduce((acc: any[], inv) => {
    const existing = acc.find(item => item.category === inv.category);
    if (existing) {
      existing.value += inv.totalInvested;
    } else {
      acc.push({ category: inv.category, value: inv.totalInvested });
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#041a35] flex flex-col items-center justify-center">
        <img src={HomeUtils[0].companyLogo} alt="" className='w-[8em]'/>
        <p className='text-white'>Page Loading......</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 z-40"
          onClick={() => setCollapsed(true)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        isMobile={isMobile}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        type={confirmModalConfig.type}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={confirmModalConfig.onCancel}
      />

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Payment Receipt</h2>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceipt('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {selectedReceipt.endsWith('.pdf') ? (
                <div className="text-center">
                  <FiFile className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">PDF Receipt</p>
                  <a
                    href={`https://civvest-backend.onrender.com${selectedReceipt}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    <FiExternalLink /> Open PDF in New Tab
                  </a>
                </div>
              ) : (
                <img
                  src={`https://civvest-backend.onrender.com${selectedReceipt}`}
                  alt="Payment Receipt"
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    console.error('Image failed to load:', selectedReceipt);
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-red-600 text-xl" />
                <h2 className="text-xl font-bold text-gray-800">Reject Withdrawal</h2>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedWithdrawalForRejection(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">
                  Please provide a reason for rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none h-32 resize-none"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be visible to the user
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      showToast('Please enter a rejection reason', 'error');
                      return;
                    }
                    if (selectedWithdrawalForRejection) {
                      handleRejectWithdrawal(selectedWithdrawalForRejection, rejectionReason);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedWithdrawalForRejection(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-[#041a35] shadow-md z-20 p-4 flex items-center justify-between">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-2xl text-white"
          >
            <FiMenu />
          </button>
          <img src={CivvestLogo} alt="Civvest" className="w-12" />
        </div>
      )}

      <div className={`flex-1 min-h-screen transition-all duration-300 overflow-y-auto ${
          isMobile ? 'ml-0 pt-16' : (collapsed ? 'ml-16 sm:ml-16 md:ml-20' : 'ml-64 sm:ml-64 md:ml-72')
        }`}
        style={{ maxHeight: '100vh' }}>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600 text-sm md:text-base">Manage your platform</p>
              </div>
              {activeTab === 'news' && (
                <button onClick={() => navigate('/admin/create-news')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
                  <FiPlus /> Create News
                </button>
              )}
            </div>

            {/* Overview Section */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-linear-to-br from-blue-500 to-blue-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-xs md:text-sm mb-1">Total Users</p>
                        <p className="text-2xl md:text-3xl font-bold">{stats.totalUsers}</p>
                      </div>
                      <div className="bg-blue-400 bg-opacity-30 p-3 md:p-4 rounded-full">
                        <FiUsers className="text-2xl md:text-3xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-green-500 to-green-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-xs md:text-sm mb-1">Investments</p>
                        <p className="text-2xl md:text-3xl font-bold">{stats.totalInvestments}</p>
                      </div>
                      <div className="bg-green-400 bg-opacity-30 p-3 md:p-4 rounded-full">
                        <FiTrendingUp className="text-2xl md:text-3xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-purple-500 to-purple-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-xs md:text-sm mb-1">Transactions</p>
                        <p className="text-2xl md:text-3xl font-bold">{stats.totalUserInvestments}</p>
                      </div>
                      <div className="bg-purple-400 bg-opacity-30 p-3 md:p-4 rounded-full">
                        <FiActivity className="text-2xl md:text-3xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-orange-500 to-orange-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-xs md:text-sm mb-1">Total Volume</p>
                        <p className="text-2xl md:text-3xl font-bold">${(stats.totalInvestedAmount / 1000).toFixed(1)}K</p>
                      </div>
                      <div className="bg-orange-400 bg-opacity-30 p-3 md:p-4 rounded-full">
                        <FiDollarSign className="text-2xl md:text-3xl" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FiBarChart2 className="text-blue-600" /> Oil Price Trends 2024
                    </h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={oilPrices}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={3} name="$/barrel" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FiPieChart className="text-green-600" /> Investment Categories
                    </h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            dataKey="value"
                            outerRadius={80}
                            label={(props) => {
                              const { name, percent } = props;
                              const safePercent = percent ? (percent * 100).toFixed(0) : "0";
                              return `${name}: ${safePercent}%`;
                            }}
                          >
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Recent Investments</h2>
                    <div className="space-y-3">
                      {recentActivities?.recentInvestments.slice(0, 5).map((activity: any) => (
                        <div key={activity.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-sm md:text-base">{activity.user.firstName} {activity.user.lastName}</p>
                            <p className="text-xs md:text-sm text-gray-600">{activity.investment.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-sm md:text-base">${activity.amount.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">New Users</h2>
                    <div className="space-y-3">
                      {recentActivities?.recentUsers.map((user: any) => (
                        <div key={user.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-sm md:text-base">{user.firstName} {user.lastName}</p>
                              <p className="text-xs md:text-sm text-gray-600 truncate max-w-[150px]">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 text-sm md:text-base">${user.balance.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Section */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">User Management</h2>
                  <div className="relative w-full sm:w-64">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="pl-10 pr-4 py-2 border rounded-lg w-full" 
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">User</th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Account #</th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Balance</th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">ROI</th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Referral Bonus</th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Investments</th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {user.firstName[0]}{user.lastName[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-sm md:text-base">{user.firstName} {user.lastName}</p>
                                <p className="text-xs md:text-sm text-gray-600 truncate max-w-[150px]">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 md:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm">
                              {user.accountNumber}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-green-600 text-sm md:text-base">
                            ${Math.floor(user.balance)}
                          </td>
                          <td className="py-4 px-4 font-bold text-purple-600 text-sm md:text-base">
                            ${Math.floor(user.roi || 0)}
                          </td>
                          <td className="py-4 px-4 font-bold text-orange-600 text-sm md:text-base">
                            ${Math.floor(user.referralBonus || 0)}
                          </td>
                          <td className="py-4 px-4 text-center text-sm md:text-base">{user._count.userInvestments}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col xs:flex-row gap-2">
                              <button 
                                onClick={() => setSelectedUser(user)} 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                              >
                                <FiEdit className="inline mr-1" /> Balance
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedUserForROI(user);
                                  setRoiAmount((user.roi || 0).toString());
                                }} 
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                              >
                                <FiEdit className="inline mr-1" /> ROI
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)} 
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Edit Balance Modal */}
                {selectedUser && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full">
                      <h2 className="text-xl md:text-2xl font-bold mb-4">Edit Balance</h2>
                      <p className="mb-2 text-sm md:text-base">User: <span className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</span></p>
                      <p className="mb-6 text-sm md:text-base">Current: <span className="font-bold text-green-600">${selectedUser.balance.toFixed(2)}</span></p>
                      <select 
                        value={balanceAction} 
                        onChange={(e) => setBalanceAction(e.target.value as any)} 
                        className="w-full px-4 py-3 border rounded-lg mb-4 text-sm md:text-base"
                      >
                        <option value="ADD">Add</option>
                        <option value="SUBTRACT">Subtract</option>
                        <option value="SET">Set</option>
                      </select>
                      <input 
                        type="number" 
                        value={balanceAmount} 
                        onChange={(e) => setBalanceAmount(e.target.value)} 
                        placeholder="Amount" 
                        className="w-full px-4 py-3 border rounded-lg mb-6 text-sm md:text-base" 
                      />
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={handleUpdateBalance} 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm md:text-base"
                        >
                          Update
                        </button>
                        <button 
                          onClick={() => { setSelectedUser(null); setBalanceAmount(''); }} 
                          className="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded-lg text-sm md:text-base"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ROI Edit Modal */}
                {selectedUserForROI && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full">
                      <h2 className="text-xl md:text-2xl font-bold mb-4">Edit ROI</h2>
                      <p className="mb-2 text-sm md:text-base">User: <span className="font-semibold">{selectedUserForROI.firstName} {selectedUserForROI.lastName}</span></p>
                      <p className="mb-6 text-sm md:text-base">Current ROI: <span className="font-bold text-purple-600">
                        ${Math.floor(selectedUserForROI.roi || 0)}
                      </span></p>
                      <input
                        type="number"
                        value={roiAmount}
                        onChange={(e) => setRoiAmount(e.target.value)}
                        placeholder="Enter new ROI amount"
                        className="w-full px-4 py-3 border rounded-lg mb-6 text-sm md:text-base"
                      />
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={handleUpdateROI} 
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold text-sm md:text-base"
                        >
                          Update ROI
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedUserForROI(null);
                            setRoiAmount('');
                          }} 
                          className="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded-lg text-sm md:text-base"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Withdrawals Section */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Withdrawal Requests</h2>
                  
                  {withdrawals.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-base md:text-lg">No withdrawal requests yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">User</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Investment</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Amount</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Type</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Date</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Status</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {withdrawals.map((withdrawal) => (
                            <tr key={withdrawal.id} className="border-b hover:bg-gray-50 transition">
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm md:text-base">
                                    {withdrawal.user.firstName} {withdrawal.user.lastName}
                                  </p>
                                  <p className="text-xs md:text-sm text-gray-600">{withdrawal.user.email}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-semibold text-gray-800 text-sm md:text-base">
                                  {withdrawal.investment.investment.title}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {withdrawal.investment.investment.category}
                                </p>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-bold text-green-600 text-sm md:text-lg">
                                  ${withdrawal.amount.toFixed(2)}
                                </p>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                                  withdrawal.type === 'BANK_TRANSFER' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {withdrawal.type === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Crypto Wallet'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="whitespace-nowrap">
                                  <p className="text-xs md:text-sm text-gray-600">
                                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(withdrawal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                                  withdrawal.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                  withdrawal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  withdrawal.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {withdrawal.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {withdrawal.status === 'PENDING' ? (
                                  <div className="flex flex-col xs:flex-row gap-2">
                                    <button
                                      onClick={() => handleApproveWithdrawal(withdrawal.id)}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => openRejectModal(withdrawal.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-xs md:text-sm">
                                    {withdrawal.status === 'APPROVED' ? 'Approved' : 
                                     withdrawal.status === 'REJECTED' ? 'Rejected' : 'Processed'}
                                    {withdrawal.approvedBy && ` by ${withdrawal.approvedBy.firstName} ${withdrawal.approvedBy.lastName}`}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <p className="text-gray-600 text-xs md:text-sm mb-2">Total Withdrawals</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-800">{withdrawals.length}</p>
                  </div>
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <p className="text-gray-600 text-xs md:text-sm mb-2">Pending</p>
                    <p className="text-2xl md:text-3xl font-bold text-yellow-600">
                      {withdrawals.filter(w => w.status === 'PENDING').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <p className="text-gray-600 text-xs md:text-sm mb-2">Approved</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-600">
                      {withdrawals.filter(w => w.status === 'APPROVED').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <p className="text-gray-600 text-xs md:text-sm mb-2">Total Amount</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600">
                      ${withdrawals
                        .filter(w => w.status === 'APPROVED')
                        .reduce((sum, w) => sum + w.amount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Investments Section */}
            {activeTab === 'investments' && (
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-6">Investment Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {investments.map((inv) => (
                    <div key={inv.id} className="border rounded-xl p-4 md:p-6 hover:shadow-lg">
                      <span className="px-2 md:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{inv.category}</span>
                      <h3 className="text-base md:text-lg font-bold mt-3">{inv.title}</h3>
                      <div className="space-y-2 mt-4 text-xs md:text-sm">
                        <div className="flex justify-between">
                          <span>Investors:</span>
                          <span className="font-semibold">{inv.totalInvestors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Invested:</span>
                          <span className="font-semibold text-green-600">${inv.totalInvested.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target:</span>
                          <span className="font-semibold">${inv.targetAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((inv.totalInvested / inv.targetAmount) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* News Section */}
            {activeTab === 'news' && (
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Title</th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Category</th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Status</th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsPosts.map((post) => (
                        <tr key={post.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4 font-semibold text-sm md:text-base">{post.title}</td>
                          <td className="py-4 px-4 text-sm md:text-base">{post.category}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 md:px-3 py-1 rounded-full text-xs ${post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-4 px-4"> {/* This td was missing! */}
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditNews(post)} 
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FiEdit />
                              </button>
                              <button 
                                onClick={() => handleDeleteNews(post.id)} 
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td> {/* Closing td tag */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Deposits Section */}
            {activeTab === 'deposits' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <p className="text-gray-600 text-xs md:text-sm mb-2">Total Deposits</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-800">{deposits.length}</p>
                  </div>
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <p className="text-gray-600 text-xs md:text-sm mb-2">Pending</p>
                    <p className="text-2xl md:text-3xl font-bold text-yellow-600">
                      {deposits.filter(d => d.status === 'PENDING').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <p className="text-gray-600 text-xs md:text-sm mb-2">Confirmed</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-600">
                      {deposits.filter(d => d.status === 'CONFIRMED').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <p className="text-gray-600 text-xs md:text-sm mb-2">Total Amount</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600">
                      ${deposits
                        .filter(d => d.status === 'CONFIRMED')
                        .reduce((sum, d) => sum + d.amount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Deposits Table */}
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Deposit Requests</h2>
                    <div className="text-sm text-gray-600">
                      Showing {deposits.length} deposit{deposits.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {deposits.length === 0 ? (
                    <div className="text-center py-8 md:py-12 text-gray-500">
                      <p className="text-base md:text-lg">No deposit requests yet</p>
                      <p className="text-sm mt-2">New deposits will appear here</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">User</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Investment</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Amount</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Network</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Date</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Status</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Receipt</th>
                            <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deposits.map((deposit) => (
                            <tr key={deposit.id} className="border-b hover:bg-gray-50 transition">
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm md:text-base">
                                    {deposit.user.firstName} {deposit.user.lastName}
                                  </p>
                                  <p className="text-xs md:text-sm text-gray-600">{deposit.user.email}</p>
                                  <p className="text-xs text-gray-500">Acc: {deposit.user.accountNumber}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-semibold text-gray-800 text-sm md:text-base">{deposit.investment.title}</p>
                                <p className="text-xs text-gray-600">{deposit.investment.returnRate} return</p>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-bold text-green-600 text-base md:text-lg">
                                  ${deposit.amount.toFixed(2)}
                                </p>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                                  deposit.network === 'ETH' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  USDT ({deposit.network})
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="whitespace-nowrap">
                                  <p className="text-xs md:text-sm text-gray-600">
                                    {new Date(deposit.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(deposit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                                  deposit.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                  deposit.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {deposit.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {deposit.receiptUrl ? (
                                  <button
                                    onClick={() => openReceiptModal(deposit.receiptUrl)}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs md:text-sm"
                                  >
                                    <FiFile className="text-base" /> View
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-xs md:text-sm">No receipt</span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                {deposit.status === 'PENDING' ? (
                                  <div className="flex flex-col xs:flex-row gap-2">
                                    <button
                                      onClick={() => handleConfirmDeposit(deposit.id)}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => handleRejectDeposit(deposit.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-xs md:text-sm whitespace-nowrap">
                                    {deposit.status === 'CONFIRMED' ? 'Confirmed' : 'Rejected'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Edit News Modal */}
{editingNews && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Edit News Post</h2>
        <button
          onClick={resetEditModal}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleEditSubmit} className="p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={editFormData.title}
              onChange={handleEditChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={generateEditSlug}
              className="text-sm text-blue-600 hover:text-blue-800 mt-1"
            >
              Generate slug from title
            </button>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Slug *</label>
            <input
              type="text"
              name="slug"
              value={editFormData.slug}
              onChange={handleEditChange}
              required
              placeholder="news-title-slug"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">URL-friendly version of the title</p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Excerpt *</label>
            <textarea
              name="excerpt"
              value={editFormData.excerpt}
              onChange={handleEditChange}
              required
              rows={3}
              placeholder="Brief summary of the news..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Content *</label>
            <textarea
              name="content"
              value={editFormData.content}
              onChange={handleEditChange}
              required
              rows={10}
              placeholder="Full news content..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category & Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Category *</label>
              <select
                name="category"
                value={editFormData.category}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Energy">Energy</option>
                <option value="Investment">Investment</option>
                <option value="Market">Market</option>
                <option value="Technology">Technology</option>
                <option value="Company">Company</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Author *</label>
              <input
                type="text"
                name="author"
                value={editFormData.author}
                onChange={handleEditChange}
                required
                placeholder="Author name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Featured Image</label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Current Image Preview */}
              {editImagePreview && (
                <div className="w-32 h-32">
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md border"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">Current/New Image</p>
                </div>
              )}
              
              {/* Upload Button */}
              <div>
                <label className="cursor-pointer inline-block">
                  <div className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-semibold flex items-center gap-2">
                    <FiUpload /> Upload New Image
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Upload a new image to replace the current one
                </p>
              </div>
            </div>
          </div>

          {/* Publish Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="published"
              id="editPublished"
              checked={editFormData.published}
              onChange={handleEditChange}
              className="w-5 h-5"
            />
            <label htmlFor="editPublished" className="text-gray-700 font-semibold cursor-pointer">
              Publish immediately
            </label>
          </div>
          <p className="text-sm text-gray-500">
            If unchecked, the post will be saved as draft
          </p>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={editLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold disabled:opacity-50"
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={resetEditModal}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-md font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminDashboard;

