import React, { useState, useEffect } from 'react';
import { fetchPendingAdmins, approveAdmin } from '../api/endpoints';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OwnerDashboardPage() {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPendingAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPendingAdmins();
      setPendingAdmins(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load pending administrators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingAdmins();
  }, []);

  const handleApprove = async (adminId) => {
    setError('');
    setSuccess('');
    try {
      await approveAdmin(adminId);
      setSuccess('Administrator approved successfully!');
      loadPendingAdmins();
    } catch (err) {
      setError(err.message || 'Failed to approve administrator.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-rose-600" /> Platform Gatekeeper
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Approve pending college sports administrators to grant dashboard access.
        </p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm">{success}</div>}

      {/* Roster Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-white">
          <h2 className="text-sm font-bold text-slate-900">Pending Approvals ({pendingAdmins.length})</h2>
          <p className="text-xs text-slate-400 mt-1">These accounts require immediate validation.</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : pendingAdmins.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-60 animate-bounce" />
            <p className="text-sm font-semibold text-slate-600">Roster Clean!</p>
            <p className="text-xs text-slate-400 mt-1">All sports administrators have been validated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Assigned College</th>
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pendingAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-bold">{admin.name}</td>
                    <td className="px-6 py-4 text-slate-600">{admin.email}</td>
                    <td className="px-6 py-4 text-slate-600">{admin.college?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{admin.employeeId || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleApprove(admin.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Approve Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
