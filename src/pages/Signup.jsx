import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { signupUser } from '../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { FaLinkedin, FaInstagram, FaGithub, FaFacebook, FaTwitter } from 'react-icons/fa';

export default function Signup() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await dispatch(signupUser({
        name: form.name,
        email: form.email,
        password: form.password
      }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
      console.error('Signup error:', err);
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
          <h1 className="text-4xl font-bold text-white mb-6">Join us today!</h1>
          <p className="text-blue-100 text-lg">Create your account and start managing your projects efficiently.</p>
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
            
          </div>
          
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
                      placeholder="Hanumant Pisal"
                    />
                  </div>
                </div>

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
                      autoComplete="new-password"
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


                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Privacy Policy</a>
                  </label>
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
                        Creating account...
                      </>
                    ) : (
                      'Create account'
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
