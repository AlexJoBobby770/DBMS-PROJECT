document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();
    if (!res.ok) throw new Error(stats.error || 'Failed to load stats');
    document.getElementById('totalRooms').textContent = stats.totalRooms ?? 0;
    document.getElementById('availableRooms').textContent = stats.availableRooms ?? 0;
    document.getElementById('bookedRooms').textContent = stats.bookedRooms ?? 0;
    document.getElementById('totalGuests').textContent = stats.totalGuests ?? 0;
  } catch (e) {
    console.error('Error loading stats', e);
  }
});


