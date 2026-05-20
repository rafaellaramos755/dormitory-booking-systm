import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: '', user_type: 'tenant'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password') checkPasswordStrength(e.target.value);
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[@$!%*?&#]/)) score++;
    const text = score <= 2 ? 'Weak' : score <= 4 ? 'Medium' : 'Strong';
    setPasswordStrength({ score, text });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return false; }
    if (passwordStrength.score < 3) { setError('Please use a stronger password'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    if (result.success) navigate('/login');
    else setError(result.message || 'Registration failed');
    setLoading(false);
  };

  const getStrengthColor = () => {
    if (passwordStrength.score <= 2) return '#e74c3c';
    if (passwordStrength.score <= 4) return '#f39c12';
    return '#27ae60';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register for DormiFind</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label><FaUser /> Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
          <div className="form-group"><label><FaEnvelope /> Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
          <div className="form-group">
            <label><FaLock /> Password</label>
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar"><div className="strength-fill" style={{ width: `${(passwordStrength.score / 5) * 100}%`, background: getStrengthColor() }}></div></div>
                <span style={{ color: getStrengthColor() }}>{passwordStrength.text}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label><FaLock /> Confirm Password</label>
            <div className="password-wrapper">
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
          </div>
          <div className="form-group"><label><FaPhone /> Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} required /></div>
          <div className="form-group"><label><FaMapMarkerAlt /> Address</label><textarea name="address" value={formData.address} onChange={handleChange} rows="2" /></div>
          <div className="form-group"><label>I am a:</label><select name="user_type" value={formData.user_type} onChange={handleChange}><option value="tenant">Tenant</option><option value="owner">Owner</option></select></div>
          <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}

export default Register;