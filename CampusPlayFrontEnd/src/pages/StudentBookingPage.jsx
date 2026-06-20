import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchSportsByCollege,
  fetchFacilitiesBySport,
  fetchSlots,
  fetchBookingsByFacilityAndDate,
  createBooking,
} from '../api/endpoints';
import { Calendar, HelpCircle, Activity, ShieldAlert, CheckCircle2, Check } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return timeStr;
};

const normalizeInterval = (intervalStr) => {
  if (!intervalStr) return '';
  const parts = intervalStr.split('-');
  if (parts.length === 2) {
    return `${formatTime(parts[0].trim())} - ${formatTime(parts[1].trim())}`;
  }
  return intervalStr;
};

const DEFAULT_SLOTS = [
  { id: 1, startTime: '06:00:00', endTime: '06:40:00', active: true },
  { id: 2, startTime: '06:40:00', endTime: '07:20:00', active: true },
  { id: 3, startTime: '07:20:00', endTime: '08:00:00', active: true },
  { id: 4, startTime: '08:00:00', endTime: '08:40:00', active: true },
  { id: 5, startTime: '08:40:00', endTime: '09:20:00', active: true },
  { id: 6, startTime: '15:00:00', endTime: '15:40:00', active: true },
  { id: 7, startTime: '15:40:00', endTime: '16:20:00', active: true },
  { id: 8, startTime: '16:20:00', endTime: '17:00:00', active: true },
  { id: 9, startTime: '17:00:00', endTime: '17:40:00', active: true },
  { id: 10, startTime: '17:40:00', endTime: '18:20:00', active: true },
  { id: 11, startTime: '18:20:00', endTime: '19:00:00', active: true },
];

const getSportFallbackGradient = (sportId) => {
  const gradients = [
    'from-emerald-500 to-teal-700',
    'from-blue-500 to-indigo-700',
    'from-orange-500 to-red-700',
    'from-purple-500 to-pink-700',
    'from-amber-500 to-yellow-600',
  ];
  return gradients[(sportId || 0) % gradients.length];
};

export default function StudentBookingPage() {
  const { user } = useAuth();

  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const getMaxDateString = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 4);
    return maxDate.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({}); // map of facilityId -> Set of slotInterval strings
  const [selectedSlot, setSelectedSlot] = useState(null); // { facilityId, slotId, courtName, slotKey }

  const [sportsLoading, setSportsLoading] = useState(false);
  const [matrixLoading, setMatrixLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fallbackWarning, setFallbackWarning] = useState(false);

  // 1. Fetch sports on mount/user change
  useEffect(() => {
    const loadSports = async () => {
      if (!user?.college?.id) return;
      setSportsLoading(true);
      try {
        const data = await fetchSportsByCollege(user.college.id);
        setSports(data);
        if (data.length > 0) {
          setSelectedSport(data[0]);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to load sports list.');
      } finally {
        setSportsLoading(false);
      }
    };
    loadSports();
  }, [user]);

  // 2. Fetch facilities, slots, and bookings
  const loadMatrix = useCallback(async () => {
    if (!selectedSport) return;
    setMatrixLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setFallbackWarning(false);
    try {
      const [facData, slotsData] = await Promise.all([
        fetchFacilitiesBySport(selectedSport.id),
        fetchSlots(),
      ]);
      setFacilities(facData);
      
      if (!slotsData || slotsData.length === 0) {
        setSlots(DEFAULT_SLOTS);
        setFallbackWarning(true);
      } else {
        setSlots(slotsData);
      }

      // Fetch bookings for each facility
      const bookedMap = {};
      await Promise.all(
        facData.map(async (fac) => {
          try {
            const bookingsData = await fetchBookingsByFacilityAndDate(fac.id, selectedDate);
            // bookingsData is list of BookingResponse
            const bookedSet = new Set(
              bookingsData
                .filter((b) => b.status === 'BOOKED')
                .map((b) => normalizeInterval(b.timeSlotInterval))
            );
            bookedMap[fac.id] = bookedSet;
          } catch (err) {
            console.error(`Failed to load bookings for facility ${fac.id}:`, err);
            bookedMap[fac.id] = new Set();
          }
        })
      );
      setBookedSlots(bookedMap);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to load court timeslots.');
    } finally {
      setMatrixLoading(false);
    }
  }, [selectedSport, selectedDate]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    setSelectedSlot(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleDateChange = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSelectSlot = (court, slot) => {
    const slotKey = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
    if (selectedSlot && selectedSlot.facilityId === court.id && selectedSlot.slotId === slot.id) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot({
        facilityId: court.id,
        slotId: slot.id,
        courtName: court.name,
        slotKey,
      });
    }
  };

  const handleBookSlot = async (facilityId, slotId) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await createBooking({
        userId: user.id,
        facilityId,
        slotId,
        bookingDate: selectedDate,
      });
      setSuccessMessage('Slot booked successfully!');
      setSelectedSlot(null);
      loadMatrix(); // Reload matrix
    } catch (err) {
      setErrorMessage(err.message || 'Failed to book slot.');
    }
  };

  const getRollingDaysList = () => {
    const list = [];
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      list.push({
        dateStr,
        label: i === 0 ? 'Today' : `${weekdayNames[d.getDay()]} ${d.getDate()}`,
      });
    }
    return list;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl bg-emerald-950 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 p-6 sm:p-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800 text-emerald-200 text-xs font-semibold rounded-full mb-3 uppercase tracking-wide">
            🏟 {user?.college?.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Reserve Your Court</h1>
          <p className="mt-2 text-sm text-emerald-300 max-w-xl">
            Book slots up to 4 days in advance. Limit: Maximum 2 bookings per sport daily.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
      </div>

      {/* Section 1: Choose Sport (Visual cards with images) */}
      <div className="mb-8">
        <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" /> Choose Sport
        </h2>
        {sportsLoading ? (
          <div className="py-8"><LoadingSpinner /></div>
        ) : sports.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-sm text-slate-400">
            No sports registered in your college.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sports.map((sport) => {
              const isSelected = selectedSport?.id === sport.id;
              const fallbackColor = getSportFallbackGradient(sport.id);
              return (
                <button
                  key={sport.id}
                  onClick={() => handleSportChange(sport)}
                  className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-305 hover:scale-[1.02] cursor-pointer flex flex-col ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500 shadow-md bg-emerald-50/10'
                      : 'border-slate-200 bg-white hover:border-slate-350 hover:shadow-xs'
                  }`}
                >
                  {/* Sport Image & Overlay */}
                  <div className="h-24 w-full relative overflow-hidden bg-slate-100 shrink-0">
                    {sport.imageUrl ? (
                      <img
                        src={sport.imageUrl}
                        alt={sport.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback gradient under image */}
                    <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${fallbackColor} flex items-center justify-center`}>
                      <Activity className="w-8 h-8 text-white/30" />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>

                    {/* Active Checkmark Badge */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 bg-emerald-650 text-white p-1 rounded-full shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Sport Label */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs group-hover:text-emerald-700 transition-colors uppercase tracking-wider line-clamp-1">
                        {sport.name}
                      </h3>
                      {sport.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                          {sport.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Date Selector & Booking Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Date Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Choose Date
            </h2>
            
            {/* Input Picker - STRICT 4-DAY ADVANCE ROLLING */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={getTodayDateString()}
              max={getMaxDateString()}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 mb-4 transition-colors bg-slate-50 hover:bg-slate-100/50 cursor-pointer"
            />
            
            {/* Quick selectors for rolling 4 days */}
            <div className="grid grid-cols-5 gap-1">
              {getRollingDaysList().map((day) => (
                <button
                  key={day.dateStr}
                  onClick={() => handleDateChange(day.dateStr)}
                  className={`py-2 rounded text-center text-[10px] font-bold transition-all cursor-pointer ${
                    selectedDate === day.dateStr
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-350 text-slate-600'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Booking Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Validation Engine Warnings - STRICT SPEC */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border-l-4 border-red-600 text-red-800 rounded-r-lg flex items-start gap-3 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Booking Validation Error</h4>
                <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 rounded-r-lg flex items-start gap-3 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Booking Confirmed</h4>
                <p className="text-xs text-emerald-700 mt-1">{successMessage}</p>
              </div>
            </div>
          )}

          {/* The Visual Grid / Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            {fallbackWarning && (
              <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-r-lg text-xs">
                ⚠️ Timeslots are not seeded in the database. Showing fallback timeslots. Restart your backend server to seed database.
              </div>
            )}

            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedSport?.name || 'Sports'} Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selected date: <span className="font-semibold text-slate-600">{selectedDate}</span>
                </p>
              </div>
              {/* Grid Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600"></span> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-700 border border-emerald-950 ring-2 ring-emerald-450"></span> Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-red-600 border border-red-700"></span> Occupied
                </span>
              </div>
            </div>

            {matrixLoading ? (
              <LoadingSpinner />
            ) : !selectedSport ? (
              <div className="text-center py-12 text-slate-400">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a sport above to view available courts.</p>
              </div>
            ) : facilities.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No courts/facilities created for "{selectedSport.name}" yet.</p>
              </div>
            ) : (
              /* Visual Grid Columns - STRICT SPEC */
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {facilities.map((court) => {
                    const facilityBookings = bookedSlots[court.id] || new Set();
                    return (
                      <div key={court.id} className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100 uppercase tracking-wide">
                          ⚡ {court.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {slots.length === 0 ? (
                            <div className="col-span-2 text-center text-xs text-slate-400 py-4">
                              No active timeslots available.
                            </div>
                          ) : (
                            slots.map((slot) => {
                              const slotKey = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
                              const occupied = facilityBookings.has(slotKey);
                              const isSelected = selectedSlot && selectedSlot.facilityId === court.id && selectedSlot.slotId === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  disabled={occupied}
                                  onClick={() => handleSelectSlot(court, slot)}
                                  className={`py-2 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                                    occupied
                                      ? 'bg-red-600 text-white border border-red-700 cursor-not-allowed opacity-90'
                                      : isSelected
                                      ? 'bg-emerald-700 text-white border-2 border-emerald-950 ring-2 ring-emerald-450 scale-[1.03] shadow-md font-extrabold'
                                      : 'bg-emerald-500 text-white border border-emerald-600 hover:bg-emerald-600 hover:scale-[1.02] shadow-sm'
                                  }`}
                                >
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Slot Booking Confirmation Panel */}
                {selectedSlot && (
                  <div className="mt-8 p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
                    <div>
                      <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Ready to Book Court
                      </h3>
                      <p className="text-xs text-emerald-700 mt-1">
                        You have selected <span className="font-extrabold uppercase">{selectedSlot.courtName}</span> for{' '}
                        <span className="font-extrabold">{selectedSlot.slotKey}</span> on <span className="font-extrabold">{selectedDate}</span>.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedSlot(null)}
                        className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleBookSlot(selectedSlot.facilityId, selectedSlot.slotId)}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        Book Slot
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
