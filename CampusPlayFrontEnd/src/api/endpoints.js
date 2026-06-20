import BASE_URL from './config';

async function parseError(response, defaultMsg) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      const errorData = await response.json();
      return errorData.message || errorData.error || JSON.stringify(errorData);
    } catch (e) {
      // ignore and fallback to text
    }
  }
  try {
    const text = await response.text();
    return text || defaultMsg;
  } catch (e) {
    return defaultMsg;
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function registerUser(userData, collegeId) {
  const response = await fetch(
    `${BASE_URL}/api/auth/register?collegeId=${collegeId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response, 'Registration failed'));
  }

  return response.json();
}

export async function loginUser(credentials) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Login failed'));
  }

  return response.json();
}

// ─── Colleges ────────────────────────────────────────────────────────────────

export async function fetchColleges() {
  const response = await fetch(`${BASE_URL}/api/colleges`);

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch colleges'));
  }

  return response.json();
}

export async function createCollege(collegeData) {
  const response = await fetch(`${BASE_URL}/api/colleges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(collegeData),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to create college'));
  }

  return response.json();
}


// ─── Sports ──────────────────────────────────────────────────────────────────

export async function fetchSportsByCollege(collegeId) {
  const response = await fetch(`${BASE_URL}/api/sports/college/${collegeId}`);

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch sports'));
  }

  return response.json();
}

export async function createSport(sportData, collegeId) {
  const response = await fetch(
    `${BASE_URL}/api/sports?collegeId=${collegeId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sportData),
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to create sport'));
  }

  return response.json();
}

export async function updateSport(id, sportData) {
  const response = await fetch(`${BASE_URL}/api/sports/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sportData),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to update sport'));
  }

  return response.json();
}


// ─── Facilities ──────────────────────────────────────────────────────────────

export async function fetchFacilitiesBySport(sportId) {
  const response = await fetch(`${BASE_URL}/api/facilities/sport/${sportId}`);

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch facilities'));
  }

  return response.json();
}

export async function createFacility(facilityData, sportId) {
  const response = await fetch(
    `${BASE_URL}/api/facilities?sportId=${sportId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facilityData),
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to create facility'));
  }

  return response.json();
}

// ─── Slots ───────────────────────────────────────────────────────────────────

export async function fetchSlots() {
  const response = await fetch(`${BASE_URL}/api/slots/sport/0`);

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch slots'));
  }

  return response.json();
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function createBooking(bookingData) {
  const response = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Booking failed'));
  }

  return response.json();
}

export async function cancelBooking(id) {
  const response = await fetch(`${BASE_URL}/api/bookings/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to cancel booking'));
  }

  return response.text();
}

export async function fetchUserBookings(userId) {
  const response = await fetch(`${BASE_URL}/api/bookings/user/${userId}`);

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch user bookings'));
  }

  return response.json();
}

export async function fetchBookingsByFacilityAndDate(facilityId, date) {
  const response = await fetch(
    `${BASE_URL}/api/bookings/facility/${facilityId}/date/${date}`
  );

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch bookings'));
  }

  return response.json();
}

export async function fetchBookingsByCollege(collegeId) {
  const response = await fetch(
    `${BASE_URL}/api/bookings/college/${collegeId}`
  );

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch college bookings'));
  }

  return response.json();
}

// ─── Owner / Admin Management ────────────────────────────────────────────────

export async function fetchPendingAdmins() {
  const response = await fetch(`${BASE_URL}/api/owner/pendingAdmins`);

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch pending admins'));
  }

  return response.json();
}

export async function approveAdmin(id) {
  const response = await fetch(`${BASE_URL}/api/owner/approveAdmin/${id}`, {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to approve admin'));
  }

  return response.text();
}
