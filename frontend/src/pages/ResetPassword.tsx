import React, { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { resetPassword } from "../services/authServices"
import { FiEye, FiEyeOff, FiCheck, FiAlertCircle } from "react-icons/fi"

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validatePassword = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }
    if (password !== confirmPassword) {
      return "Passwords do not match"
    }
    return null
  }

  const handleReset = async () => {
    const validationError = validatePassword()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const res = await resetPassword(token, password)
      setMessage(res.message)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/signin")
      }, 3000)
      
    } catch (err: any) {
      setError(err.error || "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#041a35] text-white px-6">
        <div className="w-full max-w-md bg-[#0a2c52] p-8 rounded-2xl text-center">
          <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
          <p className="mb-6 text-gray-300">
            This password reset link is invalid or has expired. Please request a new password reset.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-blue-600 py-3 rounded-md hover:bg-blue-700 font-semibold"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#041a35] text-white px-6 py-10">
      <div className="w-full max-w-md bg-[#0a2c52] p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Create New Password</h2>
          <p className="text-gray-300">Enter a strong password to secure your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start">
            <FiAlertCircle className="text-red-400 mr-3 mt-0.5" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-start">
            <FiCheck className="text-green-400 mr-3 mt-0.5" />
            <div>
              <span className="text-green-200 font-semibold">{message}</span>
              <p className="text-green-300 text-sm mt-1">Redirecting to login page...</p>
            </div>
          </div>
        )}

        {/* New Password */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2 text-sm font-medium">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-3 pr-12 rounded-md bg-[#041a35] text-white placeholder-gray-500 border border-[#1e3a5f] focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {password.length > 0 && password.length < 8 && (
            <p className="text-red-400 text-xs mt-2">Password too short (min 8 characters)</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-8">
          <label className="block text-gray-300 mb-2 text-sm font-medium">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your new password"
              className="w-full px-4 py-3 pr-12 rounded-md bg-[#041a35] text-white placeholder-gray-500 border border-[#1e3a5f] focus:border-blue-500 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="text-red-400 text-xs mt-2">Passwords do not match</p>
          )}
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-blue-600 py-3 rounded-md hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting Password...
            </>
          ) : "Reset Password"}
        </button>

        <div className="mt-6 pt-6 border-t border-[#1e3a5f] text-center">
          <p className="text-gray-400 text-sm">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/signin")}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>

      {/* Password Strength Tips */}
      <div className="w-full max-w-md mt-6 text-sm text-gray-400">
        <p className="font-medium mb-2">Password Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use at least 8 characters</li>
          <li>Include uppercase and lowercase letters</li>
          <li>Add numbers and special characters</li>
          <li>Avoid common words or personal information</li>
        </ul>
      </div>
    </div>
  )
}

export default ResetPassword