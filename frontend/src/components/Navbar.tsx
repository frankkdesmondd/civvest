import React, { useEffect, useState, useRef } from "react";
import { HomeUtils } from "../utils/HomeUtils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Topbar from "./Topbar";
import { FiMenu, FiX, FiUser, FiLogOut, FiBell, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import ConfirmModal from "../components/ConfirmModal";
import { useUser } from "../context/UserContext";
import ProfilePicture from "../components/ProfilePicture";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  notificationId: string | null;
}

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: "",
    message: "",
    notificationId: null
  });
  const [forceRefresh, setForceRefresh] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    fetchNotifications();
    
    // Refresh user data on mount
    refreshUser();
  }, []);

  // Add event listener for profile picture updates
  useEffect(() => {
    const handleProfilePictureUpdate = () => {
      setForceRefresh(prev => prev + 1);
    };

    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate);

    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('https://civvest-backend.onrender.com/api/notifications', {
        withCredentials: true
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showDropdown || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showNotifications]);

  // Add polling for admin users to get real-time notifications
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      const interval = setInterval(() => {
        fetchNotifications();
      }, 10000); // Poll every 10 seconds for admins

      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const alwaysBluePages = [
        "/login",
        "/signin",
        "/signup",
        "/our-company",
        "/principled-approach",
        "/contact-us",
        "/news",
        "/view-investment",
        "/faq",
        "/learn-about",
        "/terms-and-services",
        "/privacy-policy",
        "/dashboard",
        "/bond-plans",
        "/admin-dashboard",
        "/news/:slug",
        "/investment/:slug",
        "/deposit/:investmentId",
        "/company-bio"
      ];

      const isDynamicRoute = 
      location.pathname.startsWith("/news/") || 
      location.pathname.startsWith("/investment/") ||
      location.pathname.startsWith("/deposit/");

    const isAlwaysBlue = alwaysBluePages.includes(location.pathname) || isDynamicRoute;
    
    setScrolled(isAlwaysBlue || window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const navLinkClass = (path: string) => `
    relative pb-3 cursor-pointer transition-all
    after:content-[''] after:absolute after:left-0 after:bottom-0
    after:h-[2px] after:w-full after:bg-blue-400 after:scale-x-0
    after:origin-left after:transition-all after:duration-300
    hover:after:scale-x-100
    ${location.pathname === path ? "after:scale-x-100" : ""}
  `;

  const closeMobileMenu = () => setMobileOpen(false);

  const handleSignOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const response = await axios.post('https://civvest-backend.onrender.com/api/auth/signout', {}, { withCredentials: true });
      console.log('Sign out response:', response.data);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: null }));
      setShowDropdown(false);
      navigate('/');
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: null }));
      setShowDropdown(false);
      navigate('/');
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowDropdown(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(`https://civvest-backend.onrender.com/api/notifications${notificationId}/read`, {}, {
        withCredentials: true
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent marking as read when deleting
    
    setConfirmModal({
      isOpen: true,
      title: "Delete Notification",
      message: "Are you sure you want to delete this notification? This action cannot be undone.",
      notificationId
    });
  };

  const handleNotificationClick = async (notificationId: string, notificationType: string) => {
    await markAsRead(notificationId);
    if (notificationType === 'WITHDRAWAL_ADMIN' && user?.role === 'ADMIN') {
      navigate('/admin-dashboard#withdrawals');
      setShowNotifications(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.notificationId) return;
    
    try {
      await axios.delete(`https://civvest-backend.onrender.com/api/notifications/${confirmModal.notificationId}`, {
        withCredentials: true
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      // Close the modal
      setConfirmModal({
        isOpen: false,
        title: "",
        message: "",
        notificationId: null
      });
    }
  };

  const handleCancelDelete = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      notificationId: null
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50" data-aos="fade-down">
        <Topbar scrolled={scrolled} />

        <div
          className={`w-full flex justify-between items-center px-[1em] lg:px-[4em] py-[1em]
            transition-colors duration-300
            ${scrolled ? "bg-[#041a35]" : "bg-transparent"}
          `}
        >
          <Link to="/" onClick={closeMobileMenu}>
            <div className="flex flex-col items-center gap-[0.04em]">
              <img
                src={HomeUtils[0].companyLogo}
                alt="Company Logo"
                className="w-[5.8em]"
              />
              <p className="text-[0.8em] text-slate-300">ENERGY PARTNERS</p>
            </div>
          </Link>

          <div className="hidden lg:flex gap-[2em] items-center text-white text-[0.9em]">
            <Link to="/our-company">
              <p className={navLinkClass("/our-company")}>Our Company</p>
            </Link>

            <Link to="/principled-approach">
              <p className={navLinkClass("/principled-approach")}>
                Principled Approach
              </p>
            </Link>

            <Link to="/view-investment">
              <p className={navLinkClass("/view-investment")}>View Investment</p>
            </Link>

            <Link to="/news">
              <p className={navLinkClass("/news")}>News</p>
            </Link>

            <Link to="/faq">
              <p className={navLinkClass("/faq")}>FAQs</p>
            </Link>

            <Link to="/contact-us">
              <p className={navLinkClass("/contact-us")}>Contact Us</p>
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                {/* NOTIFICATION BELL */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={toggleNotifications}
                    className="relative text-white hover:text-blue-400 transition"
                  >
                    <FiBell className="text-2xl" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                        <p className="text-sm font-semibold text-gray-800">Notifications</p>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => axios.put('https://civvest-backend.onrender.com/api/notifications/mark-all-read', {}, { withCredentials: true }).then(fetchNotifications)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No notifications
                        </div>
                      ) : notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <div 
                                  onClick={() => handleNotificationClick(notification.id, notification.type)}
                                  className="cursor-pointer"
                                >
                                  <p className="text-sm font-semibold text-gray-800 inline-flex items-center gap-2">
                                    {notification.title}
                                    {notification.type === 'WITHDRAWAL_ADMIN' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Withdrawal
                                      </span>
                                    )}
                                    {!notification.read && (
                                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                  {formatDate(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => deleteNotification(notification.id, e)}
                              className="text-red-500 hover:text-red-700 p-1 ml-2"
                              title="Delete notification"
                            >
                              <FiTrash2 className="text-sm" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* USER AVATAR - USING PROFILEPICTURE COMPONENT */}
                <div className="relative" ref={dropdownRef}>
                  <div className="cursor-pointer" onClick={toggleDropdown}>
                    <ProfilePicture 
                      size="md"
                      showBorder={true}
                      borderColor="border-white"
                      className="hover:opacity-90 transition-opacity"
                      forceRefresh={forceRefresh > 0}
                    />
                  </div>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <ProfilePicture 
                            size="lg"
                            showBorder={true}
                            borderColor="border-blue-500"
                            forceRefresh={forceRefresh > 0}
                          />
                          {user && (
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                              {user.accountNumber && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Acc: {user.accountNumber}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Link to="/profile" onClick={() => setShowDropdown(false)}>
                        <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer text-gray-700">
                          <FiUser className="text-lg" />
                          <span className="text-sm">My Profile</span>
                        </div>
                      </Link>

                      <Link to={user?.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard'} onClick={() => setShowDropdown(false)}>
                        <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer text-gray-700">
                          <span className="text-sm">Dashboard</span>
                        </div>
                      </Link>

                      <div
                        onClick={handleSignOut}
                        className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer text-red-600"
                      >
                        <FiLogOut className="text-lg" />
                        <span className="text-sm">Sign Out</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/signin">
                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md font-semibold">
                  Sign In
                </button>
              </Link>
            )}
          </div>

          <button
          className="lg:hidden text-white text-[3em] transition-transform duration-500
            transform active:scale-90 z-60 relative"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            transform: mobileOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          {mobileOpen ? (
            <FiX className="text-black" />
          ) : (
            <FiMenu className="text-slate-400 text-[0.8em]" />
          )}
        </button>
        </div>

        <div
          className={`
            lg:hidden fixed top-0 right-0 h-screen w-[85%]
            bg-white shadow-xl z-50 pt-[10em] px-6
            transform transition-transform duration-500
            ${mobileOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="flex flex-col gap-2 text-[0.9em] text-blue-900">
            {/* Add Sign In button at the top when user is NOT signed in */}
            {!user && (
              <>
                <Link to="/signin" onClick={closeMobileMenu}>
                  <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition bg-[#041a35] text-white text-center font-semibold">
                    Sign In
                  </p>
                </Link>
                <hr className="w-full" />
                <Link to="/signup" onClick={closeMobileMenu}>
                  <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition bg-blue-100 text-[#041a35] text-center font-semibold mb-4">
                    Create Account
                  </p>
                </Link>
                <hr className="w-full mb-4" />
              </>
            )}

            <Link to="/our-company" onClick={closeMobileMenu}>
              <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition">
                Our Company
              </p>
            </Link>
            <hr className="w-full" />
            <Link to="/principled-approach" onClick={closeMobileMenu}>
              <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition">
                Principled Approach
              </p>
            </Link>
            <hr className="w-full" />
            <Link to="/view-investment" onClick={closeMobileMenu}>
              <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition">
                View Investment
              </p>
            </Link>
            <hr className="w-full" />
            <Link to="/news" onClick={closeMobileMenu}>
              <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition">
                News
              </p>
            </Link>
            <hr className="w-full" />
            <Link to="/faq" onClick={closeMobileMenu}>
              <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition">
                FAQs
              </p>
            </Link>
            <hr className="w-full" />
            <Link to="/contact-us" onClick={closeMobileMenu}>
              <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition">
                Contact Us
              </p>
            </Link>

            {user && (
              <>
                <hr className="w-full" />
                <Link to="/profile" onClick={closeMobileMenu}>
                  <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition">
                    My Profile
                  </p>
                </Link>
                <hr className="w-full" />
                <Link to={user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard'} onClick={closeMobileMenu}>
                  <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition">
                    Dashboard
                  </p>
                </Link>
                <hr className="w-full" />
                <div onClick={handleSignOut} className="cursor-pointer">
                  <p className="hover:bg-gray-100 py-3 px-2 rounded-md transition text-red-600">
                    Sign Out
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 h-screen backdrop-blur-[1px] lg:hidden"
            onClick={closeMobileMenu}
          ></div>
        )}
      </div>

      {/* ConfirmModal - will be rendered via portal directly to body */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default Navbar;



