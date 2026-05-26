import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Clock } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await axios.post('http://localhost:8089/api/auth/register', formData);
      const { role } = formData;
      if (role !== 'CUSTOMER' && role !== 'ADMIN') {
        // Non-customer roles need approval
        setPendingApproval(true);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to register. Please try again.');
    }
  };

  if (pendingApproval) {
    return (
      <div className="min-h-[calc(100vh-104px)] bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted</h2>
            <p className="text-gray-600 mb-6">Your account is pending admin approval. You'll be able to log in once an administrator reviews and approves your account.</p>
            <p className="text-sm text-gray-500 mb-4">Role requested: <span className="font-semibold">{formData.role.replace(/_/g, ' ')}</span></p>
            <Link to="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-104px)] bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-center">
              Registration successful! Redirecting to login...
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                error.toLowerCase().includes('pending admin approval') ? (
                  <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm rounded-md"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="SALES_CONSULTANT">Sales Consultant</option>
                    <option value="SERVICE_ADVISOR">Service Advisor</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="PARTS_MANAGER">Parts Manager</option>
                    <option value="FINANCE_OFFICER">Finance Officer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="AUDITOR">Auditor</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-colors"
                >
                  Sign up
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
