import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchSportsByCollege,
  createSport,
  updateSport,
  fetchFacilitiesBySport,
  createFacility,
  fetchBookingsByCollege,
  cancelBooking,
} from '../api/endpoints';
import { Plus, HelpCircle, LayoutGrid, Edit, Power, Image, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const collegeId = user?.college?.id;
  const collegeName = user?.college?.name || 'College';

  // State
  const [sports, setSports] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [collegeBookings, setCollegeBookings] = useState([]);

  const [sportsLoading, setSportsLoading] = useState(false);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Forms
  const [sportName, setSportName] = useState('');
  const [sportDesc, setSportDesc] = useState('');
  const [sportImage, setSportImage] = useState('');
  const [editingSportId, setEditingSportId] = useState(null);

  const [selectedSportForFacility, setSelectedSportForFacility] = useState('');
  const [facilityName, setFacilityName] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadSports = useCallback(async () => {
    if (!collegeId) return;
    setSportsLoading(true);
    try {
      const data = await fetchSportsByCollege(collegeId);
      setSports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSportsLoading(false);
    }
  }, [collegeId]);

  const loadBookings = useCallback(async () => {
    if (!collegeId) return;
    setBookingsLoading(true);
    try {
      const data = await fetchBookingsByCollege(collegeId);
      setCollegeBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  }, [collegeId]);

  const loadFacilities = useCallback(async (sportId) => {
    if (!sportId) {
      setFacilities([]);
      return;
    }
    setFacilitiesLoading(true);
    try {
      const data = await fetchFacilitiesBySport(sportId);
      setFacilities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFacilitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSports();
    loadBookings();
  }, [loadSports, loadBookings]);

  useEffect(() => {
    loadFacilities(selectedSportForFacility);
  }, [selectedSportForFacility, loadFacilities]);

  const handleCreateOrUpdateSport = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!sportName.trim()) {
      setErrorMsg('Sport name is required.');
      return;
    }

    try {
      const sportData = {
        name: sportName,
        description: sportDesc,
        imageUrl: sportImage,
        active: editingSportId ? sports.find((s) => s.id === editingSportId)?.active : true,
      };

      if (editingSportId) {
        await updateSport(editingSportId, sportData);
        setSuccessMsg(`Sport "${sportName}" updated successfully!`);
        setEditingSportId(null);
      } else {
        await createSport(sportData, collegeId);
        setSuccessMsg(`Sport "${sportName}" registered successfully!`);
      }

      setSportName('');
      setSportDesc('');
      setSportImage('');
      loadSports();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save sport.');
    }
  };

  const handleEditSport = (sport) => {
    setEditingSportId(sport.id);
    setSportName(sport.name);
    setSportDesc(sport.description || '');
    setSportImage(sport.imageUrl || '');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleToggleSportActive = async (sport) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updated = await updateSport(sport.id, {
        name: sport.name,
        description: sport.description,
        imageUrl: sport.imageUrl,
        active: !sport.active,
      });
      setSuccessMsg(`Sport "${sport.name}" ${updated.active ? 'activated' : 'deactivated'} successfully!`);
      loadSports();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle status.');
    }
  };

  const handleCancelEdit = () => {
    setEditingSportId(null);
    setSportName('');
    setSportDesc('');
    setSportImage('');
  };

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedSportForFacility) {
      setErrorMsg('Please select a sport.');
      return;
    }
    if (!facilityName.trim()) {
      setErrorMsg('Facility name is required.');
      return;
    }

    try {
      await createFacility(
        { name: facilityName, active: true },
        selectedSportForFacility
      );
      setSuccessMsg(`Facility "${facilityName}" created successfully!`);
      setFacilityName('');
      loadFacilities(selectedSportForFacility);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create facility.');
    }
  };

  const handleRejectClick = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking reservation?')) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await cancelBooking(bookingId);
      setSuccessMsg('Reservation rejected successfully.');
      loadBookings();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reject booking.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <LayoutGrid className="w-6 h-6 text-emerald-600" /> {collegeName} Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome, {user?.name}. Manage sports, court inventories, and student rosters.
        </p>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Management Windows */}
        <div className="space-y-8 lg:col-span-1">
          {/* Sports Manager Window */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" /> {editingSportId ? 'Update Sport Profile' : 'Create Sport Profile'}
              </h2>
              {editingSportId && (
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-0.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleCreateOrUpdateSport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Sport Name</label>
                <input
                  type="text"
                  value={sportName}
                  onChange={(e) => setSportName(e.target.value)}
                  placeholder="e.g. Badminton"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Description</label>
                <textarea
                  value={sportDesc}
                  onChange={(e) => setSportDesc(e.target.value)}
                  placeholder="Short description..."
                  rows="2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Image URL</label>
                <input
                  type="text"
                  value={sportImage}
                  onChange={(e) => setSportImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={sportsLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                {editingSportId ? 'Save Changes' : 'Register Sport'}
              </button>
            </form>
          </div>

          {/* Facility Inventory Window */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Plus className="w-4 h-4 text-emerald-600" /> Link Court / Facility
            </h2>
            <form onSubmit={handleCreateFacility} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Select Sport</label>
                <select
                  value={selectedSportForFacility}
                  onChange={(e) => setSelectedSportForFacility(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                >
                  <option value="">Choose...</option>
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Facility Name</label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="e.g. Court 3"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={facilitiesLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                Link Facility
              </button>
            </form>

            {selectedSportForFacility && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Existing Facilities</h4>
                {facilitiesLoading ? (
                  <LoadingSpinner />
                ) : facilities.length === 0 ? (
                  <p className="text-xs text-slate-400">No courts listed yet.</p>
                ) : (
                  <div className="space-y-1">
                    {facilities.map((f) => (
                      <div key={f.id} className="text-xs py-1 px-2.5 bg-slate-50 border border-slate-100 rounded text-slate-600">
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Roster Views */}
        <div className="lg:col-span-2 space-y-8">
          {/* Existing Sports Roster */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-white">
              <h2 className="text-sm font-bold text-slate-900">Existing Sports Roster</h2>
              <p className="text-xs text-slate-400 mt-1">Manage and edit your registered sports categories.</p>
            </div>
            {sportsLoading ? (
              <div className="p-6"><LoadingSpinner /></div>
            ) : sports.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No sports created yet.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {sports.map((sport) => (
                  <div key={sport.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-3">
                      {sport.imageUrl ? (
                        <img src={sport.imageUrl} alt={sport.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                          <Image className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{sport.name}</h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${sport.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {sport.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs">{sport.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditSport(sport)}
                        className="p-1 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit Sport"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleSportActive(sport)}
                        className={`p-1 border rounded transition-colors ${sport.active ? 'hover:bg-red-50 border-slate-200 text-slate-500 hover:text-red-600' : 'hover:bg-emerald-50 border-slate-200 text-slate-500 hover:text-emerald-600'}`}
                        title={sport.active ? 'Deactivate Sport' : 'Activate Sport'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Global Booking Roster */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-white">
              <h2 className="text-sm font-bold text-slate-900">Global Booking Roster</h2>
              <p className="text-xs text-slate-400 mt-1">Review active court reservations in your campus.</p>
            </div>

            {bookingsLoading ? (
              <LoadingSpinner />
            ) : collegeBookings.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No bookings recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Sport</th>
                      <th className="px-5 py-3">Facility</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Slot</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-xs">
                    {collegeBookings.map((b) => (
                      <tr key={b.bookingId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-slate-900 font-bold">{b.studentName}</td>
                        <td className="px-5 py-3.5 text-slate-600">{b.sportName}</td>
                        <td className="px-5 py-3.5 text-slate-600">{b.facilityName}</td>
                        <td className="px-5 py-3.5 text-slate-600">{b.bookingDate}</td>
                        <td className="px-5 py-3.5 text-slate-600">{b.timeSlotInterval}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              b.status === 'BOOKED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : b.status === 'REJECTED' || b.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-slate-50 text-slate-600 border-slate-100'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {b.status === 'BOOKED' && (
                            <button
                              onClick={() => handleRejectClick(b.bookingId)}
                              className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                            >
                              Reject
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
      </div>
    </div>
  );
}
