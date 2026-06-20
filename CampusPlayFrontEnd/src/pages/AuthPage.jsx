import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchColleges, createCollege } from '../api/endpoints';
import { User, Briefcase, Lock, Mail, Phone, BookOpen, GraduationCap, Building } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'ADMIN'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    collegeId: '',
    collegeName: '',
    rollNumber: '',
    branch: '',
    year: '1',
    employeeId: '',
  });

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const data = await fetchColleges();
        setColleges(data);
      } catch (err) {
        console.error('Failed to load colleges:', err);
      }
    };
    loadColleges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login({ email: formData.email, password: formData.password });
    } catch (err) {
      if (err.message.includes('403') || err.message.includes('approval')) {
        setError('Your admin account is pending owner approval.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role,
      phoneNumber: formData.phoneNumber,
      approved: role === 'STUDENT',
      enabled: true,
    };

    let selectedCollegeId = formData.collegeId;

    if (role === 'STUDENT') {
      userData.rollNumber = formData.rollNumber;
      userData.branch = formData.branch;
      userData.year = formData.year ? parseInt(formData.year, 10) : undefined;

      if (!selectedCollegeId) {
        setError('Please select a college.');
        setLoading(false);
        return;
      }
    } else {
      userData.employeeId = formData.employeeId;

      if (!formData.collegeName.trim()) {
        setError('Please enter your college name.');
        setLoading(false);
        return;
      }
    }

    try {
      if (role === 'ADMIN') {
        const newCollege = await createCollege({
          name: formData.collegeName,
          address: 'Not Specified',
        });
        selectedCollegeId = newCollege.id;
      }

      await register(userData, selectedCollegeId);

      if (role === 'ADMIN') {
        setSuccess('Registration submitted. Status: "Pending Owner Approval"');
      } else {
        setSuccess('Registration successful! You can now log in.');
      }

      setFormData({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        collegeId: '',
        collegeName: '',
        rollNumber: '',
        branch: '',
        year: '1',
        employeeId: '',
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Branding header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-2xl mb-4">
            CP
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">CampusPlay</h2>
          <p className="mt-2 text-sm text-slate-500">College Sports Slot Booking System</p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'signup'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium">
            ✅ {success}
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'login' && (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-md">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && (
          <form className="mt-8 space-y-5" onSubmit={handleSignup}>
            {/* Role Swapper tabs (Student vs Admin only - no Owner!) */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex-1 py-2 text-center rounded font-semibold transition-colors ${
                  role === 'STUDENT'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <GraduationCap className="inline w-3.5 h-3.5 mr-1" /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex-1 py-2 text-center rounded font-semibold transition-colors ${
                  role === 'ADMIN'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Briefcase className="inline w-3.5 h-3.5 mr-1" /> Sports Admin
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create Password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              {/* College Field - Dropdown select for students, Text Input for admins */}
              {role === 'STUDENT' ? (
                <div className="relative">
                  <Building className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    name="collegeId"
                    required
                    value={formData.collegeId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors appearance-none"
                  >
                    <option value="">Select College</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="relative">
                  <Building className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="collegeName"
                    required
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="Enter College Name (e.g. MLRIT)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                  />
                </div>
              )}

              {/* STUDENT specific details */}
              {role === 'STUDENT' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      name="rollNumber"
                      required
                      value={formData.rollNumber}
                      onChange={handleChange}
                      placeholder="Roll No"
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="branch"
                      required
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="Branch"
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>
                  <div>
                    <select
                      name="year"
                      required
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-600 transition-colors"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ADMIN specific details */}
              {role === 'ADMIN' && (
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="employeeId"
                    required
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="Employee ID"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
