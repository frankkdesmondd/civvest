import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Company from './pages/Company'
import News from './pages/News'
import PrincipledApproach from './pages/PrincipledApproach'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import LearnAbout from './pages/LearnAbout'
import ViewInvestment from './pages/ViewInvestment'
import ContactUs from './pages/ContactUs'
import FAQ from './pages/FAQ'
import TermsServices from './pages/TermsServices'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import CreateNews from './pages/CreateNews'
import NewsDetail from './pages/NewsDetail'
import InvestmentDetail from './pages/InvestmentDetail'
import Transfer from './pages/Transfer'
import Deposit from './pages/Deposit'
import Profile from './pages/Profile'
import Withdrawal from './pages/Withdrawal'
import BondPlans from './pages/BondPlans'
import ScrollToTop from './components/ScrollToTop'
import ResetPassword from './pages/ResetPassword'
import CompanyBio from './pages/CompanyBio'

const App: React.FC = () => {
  return (
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/our-company' element={<Company/>}/>
          <Route path='/news' element={<News/>}/>
          <Route path='/principled-approach' element={<PrincipledApproach/>} />
          <Route path='/signin' element={<SignIn/>} />
          <Route path='/signup' element={<SignUp/>} />
          <Route path='/learn-about' element={<LearnAbout/>}/>
          <Route path='/view-investment' element={<ViewInvestment/>}/>
          <Route path='/contact-us' element={<ContactUs/>}/>
          <Route path='/faq' element={<FAQ/>}/>
          <Route path='/terms-and-services' element={<TermsServices/>}/>
          <Route path='/privacy-policy' element={<PrivacyPolicy/>}/>
          <Route path='/forgot-password' element={<ForgotPassword/>} />
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/create-news" element={<CreateNews />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/investment/:slug" element={<InvestmentDetail />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/deposit/:investmentId" element={<Deposit />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/withdrawal" element={<Withdrawal />} />
          <Route path="/bond-plans" element={<BondPlans />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/company-bio" element={<CompanyBio />} />
        </Routes>
      </Router>
  )
}

export default App
