import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '', // Added username field
    password: '',
    password2: '',
    role: 'agent' // Default role
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, error, isAuthenticated, clearError } = useContext(AuthContext);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear previous errors when component mounts
    clearError();
  }, [isAuthenticated, navigate, clearError]);

  const { name, email, username, password, password2, role } = formData;

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email address is invalid';
      isValid = false;
    }

    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!password2) {
      errors.password2 = 'Please confirm your password';
      isValid = false;
    } else if (password !== password2) {
      errors.password2 = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Create user data object without password2
      const userData = {
        name,
        email,
        username,
        password,
        role
      };
      
      const result = await register(userData);
      setIsSubmitting(false);
      
      if (result.success) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Create Your Account</h2>
        <p className="auth-subtitle">Join our real estate platform to manage clients and properties</p>
        
        {error && <div className="auth-error-message">{error}</div>}
        
        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your full name"
              className={formErrors.name ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {formErrors.name && <p className="error-text">{formErrors.name}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              className={formErrors.email ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {formErrors.email && <p className="error-text">{formErrors.email}</p>}
          </div>
          
          {/* Added username field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={onChange}
              placeholder="Choose a username"
              className={formErrors.username ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {formErrors.username && <p className="error-text">{formErrors.username}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={onChange}
              placeholder="Create a password (min. 6 characters)"
              className={formErrors.password ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {formErrors.password && <p className="error-text">{formErrors.password}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              name="password2"
              id="password2"
              value={password2}
              onChange={onChange}
              placeholder="Confirm your password"
              className={formErrors.password2 ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {formErrors.password2 && <p className="error-text">{formErrors.password2}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              name="role"
              id="role"
              value={role}
              onChange={onChange}
              disabled={isSubmitting}
            >
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          
          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p className="auth-redirect">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;