import React, { useState } from 'react';
import { FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa'; // Using FontAwesome icons for email and toggle eye
import backgroundImage from '../assets/images/MH_1.jpg'; // Adjust the path based on your folder structure

const ForgotPassword = () => {
  const [otpVisible, setOtpVisible] = useState(false);
  const [passwordFieldsVisible, setPasswordFieldsVisible] = useState(false); // For showing password fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill('')); // Array to store 6 digits
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle state for password visibility

  // Trigger OTP field after pressing "Enter" or clicking the button for email input
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setOtpVisible(true); // Show OTP field if the email is valid
    }
  };

  // Show password and confirm password fields after OTP is submitted
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join(''); // Combine digits into one string
    // Assuming OTP validation is successful, show password fields
    if (otpValue.length === 6) {
      setPasswordFieldsVisible(true);
    }
  };

  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (/^[0-9]$/.test(value)) { // Only allow single-digit numbers
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Focus on the next input box if a digit is entered
      if (element.nextSibling) {
        element.nextSibling.focus();
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    if (password === confirmPassword && password.length > 0) {
      alert('Password reset successfully!');
    } else {
      alert('Passwords do not match or are empty!');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        className="p-8 rounded-lg shadow-lg max-w-sm w-full"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6">Forgot Password</h2>

        <form className="space-y-6" onSubmit={handleEmailSubmit}>
          {/* Email Field */}
          <div className="relative">
            <FaEnvelope className="absolute w-6 h-6 text-gray-500 left-3 top-3" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* OTP Field (enabled after email input) */}
          {otpVisible && (
            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              ))}
            </div>
          )}

          {/* Show button to submit OTP when OTP input is visible */}
          {otpVisible && !passwordFieldsVisible && (
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold mt-4"
              onClick={handleOtpSubmit}
            >
              Submit OTP
            </button>
          )}

          {/* Password and Confirm Password fields (visible after OTP is submitted) */}
          {passwordFieldsVisible && (
            <div className="space-y-6">
              {/* Password Field */}
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="New Password"
                  required
                />
                <div className="absolute right-3 top-3 cursor-pointer" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEye className="text-gray-500" /> : <FaEyeSlash className="text-gray-500" />}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Confirm Password"
                  required
                />
                <div className="absolute right-3 top-3 cursor-pointer" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEye className="text-gray-500" /> : <FaEyeSlash className="text-gray-500" />}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold mt-4"
                onClick={handleSubmitPassword}
              >
                Reset Password
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;