import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { FaLinkedin, FaInstagram, FaGithub, FaFacebook, FaTwitter } from 'react-icons/fa';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const resultAction = await dispatch(loginUser(form));
      
      if (loginUser.fulfilled.match(resultAction)) {
        navigate('/dashboard');
      } else if (loginUser.rejected.match(resultAction)) {
        
        setError(resultAction.payload || 'An error occurred during login. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-800 p-12 flex-col justify-between">
        <div className="flex items-center space-x-3">
          
          <span className="text-white text-xl font-extrabold">Trello-Lite</span>
        </div>
        
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-white mb-6">Welcome back!</h1>
          <p className="text-blue-100 text-lg">Sign in to access your dashboard and manage your projects efficiently.</p>
        </div>
        
        <div className="flex space-x-4">
          <a href="https://www.linkedin.com/in/hanumant-pisal-5111a2236/" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors duration-200">
            <span className="sr-only">LinkedIn</span>
            <FaLinkedin className="h-6 w-6" />
          </a>
          <a href="https://www.instagram.com/software_engg96/" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors duration-200">
            <span className="sr-only">Instagram</span>
            <FaInstagram className="h-6 w-6" />
          </a>
          <a href="https://www.facebook.com/hanumant.pisal.79" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors duration-200">
            <span className="sr-only">Facebook</span>
            <FaFacebook className="h-6 w-6" />
          </a>
          <a href="https://github.com/Hanumant-Pisal" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors duration-200">
            <span className="sr-only">GitHub</span>
            <FaGithub className="h-6 w-6" />
          </a>
          <a href="#" className="text-blue-200 hover:text-white transition-colors duration-200">
            <span className="sr-only">Twitter</span>
            <FaTwitter className="h-6 w-6" />
          </a>
        </div>
      </div>
      
      
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md lg:w-96">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.793.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">Rasta.ai</span>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          </div>

          {error && (
            <div className="mt-6 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
                      placeholder="hanumant@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>

                  
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>
              
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
