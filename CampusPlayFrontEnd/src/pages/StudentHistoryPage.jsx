import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserBookings, cancelBooking } from '../api/endpoints';
import { CalendarRange, XOctagon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function StudentHistoryPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchUserBookings(user.id);
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const handleCancelClick = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(bookingId);
      loadBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <CalendarRange className="w-6 h-6 text-emerald-600" /> My Booking History
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View all your current and past sport slots reservations.
        </p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

      {/* Bookings Grid/Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarRange className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No reservations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Sport</th>
                  <th className="px-6 py-4">Facility / Court</th>
                  <th className="px-6 py-4">Reservation Date</th>
                  <th className="px-6 py-4">Time Interval</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-900">{b.sportName}</td>
                    <td className="px-6 py-4 text-slate-600">{b.facilityName}</td>
                    <td className="px-6 py-4 text-slate-600">{b.bookingDate}</td>
                    <td className="px-6 py-4 text-slate-600">{b.timeSlotInterval}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {b.status === 'BOOKED' && (
                        <button
                          onClick={() => handleCancelClick(b.bookingId)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <XOctagon className="w-3.5 h-3.5" /> Cancel Slot
                        </button>
                      )}
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
