// ==========================================================================
// Taslim Alwataniah - Multi-Page Complaint Portal Logic Code
// ==========================================================================

// Global State
let complaints = [];
let currentUser = null;

// Auth Check (runs immediately on script load)
function initAuth() {
  const sessionData = localStorage.getItem('taslim_currentUser');
  if (sessionData) {
    currentUser = JSON.parse(sessionData);
  }

  // Admin access check ONLY for admin.html
  if (window.location.href.includes('admin.html')) {
    if (!currentUser || currentUser.role !== 'admin') {
      window.location.href = 'login.html';
    }
  }
}

// Run auth check immediately
initAuth();

// Session Helpers
function handleSignOut() {
  localStorage.removeItem('taslim_currentUser');
  window.location.href = 'index.html';
}

function adaptUIForRole() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer || document.querySelector('.nav-user-info')) return;

  if (currentUser && currentUser.role === 'admin') {
    // Render Admin Profile & Sign Out
    const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A';
    const userHtml = `
      <div class="nav-user-info">
        <div class="nav-user-profile">
          <div class="user-avatar">${initial}</div>
          <div class="user-details">
            <span class="user-name">${currentUser.name}</span>
            <span class="user-role-badge tip-badge admin-theme" style="width: auto; margin-top: 2px;">Admin</span>
          </div>
        </div>
        <button class="btn-signout" onclick="handleSignOut()">Sign Out</button>
      </div>
    `;
    navContainer.insertAdjacentHTML('beforeend', userHtml);
  } else {
    // Hide Admin tab for non-admins
    const tabAdmin = document.getElementById('tab-admin');
    if (tabAdmin) tabAdmin.style.display = 'none';

    // Inject Admin Login button
    const loginHtml = `
      <div class="nav-user-info" style="border: none; padding-left: 0; margin-left: auto;">
        <a href="login.html" class="btn btn-secondary" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Admin Login</a>
      </div>
    `;
    navContainer.insertAdjacentHTML('beforeend', loginHtml);
  }
}

// DOM Content Loaded Handler
document.addEventListener("DOMContentLoaded", async () => {
  // Load data from API
  await loadComplaints();

  // Initialize UI adaptations
  adaptUIForRole();

  // If we are on the Admin Dashboard page, render table and statistics
  if (document.getElementById('complaints-table')) {
    filterComplaints();
  }
});

// Interactive Radio Card Selection Handler
function selectPlatform(platformName) {
  // Update hidden field value
  const hiddenInput = document.getElementById('selected-platform');
  if (hiddenInput) {
    hiddenInput.value = platformName;
  }

  // Visual selection updates
  const cards = document.querySelectorAll('.platform-card');
  cards.forEach(card => card.classList.remove('selected'));

  const selectedCard = document.getElementById(`platform-card-${platformName.toLowerCase()}`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
    // Click matching child radio button if triggered programmatically
    const radio = selectedCard.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }

  // Remove validation error outline if visible
  const platformError = document.getElementById('platform-error');
  if (platformError) {
    platformError.style.display = 'none';
  }
}

// Textarea Character Count Updater
function updateCharCounter() {
  const textarea = document.getElementById('complaint-text');
  const counter = document.getElementById('char-counter');
  if (textarea && counter) {
    const count = textarea.value.length;
    counter.textContent = `${count} / 1000`;
  }
}

// Clear and reset form fields
function resetForm() {
  const form = document.getElementById('complaint-form');
  if (!form) return;
  
  form.reset();

  // Reset Platform Cards styles
  const cards = document.querySelectorAll('.platform-card');
  cards.forEach(card => card.classList.remove('selected'));
  
  const hiddenInput = document.getElementById('selected-platform');
  if (hiddenInput) {
    hiddenInput.value = '';
  }

  // Remove styling error states
  const inputs = form.querySelectorAll('.form-input');
  inputs.forEach(input => input.classList.remove('error'));

  // Reset char counter
  const charCounter = document.getElementById('char-counter');
  if (charCounter) {
    charCounter.textContent = '0 / 1000';
  }
}

// Form Submission Handler
async function submitComplaint(event) {
  event.preventDefault();

  const form = document.getElementById('lodge-form');
  let isFormValid = true;

  // 1. Validate Worker Selection
  const workerSelect = document.getElementById('worker-select');
  if (workerSelect) {
    if (!workerSelect.value || workerSelect.value === '') {
      workerSelect.classList.add('error');
      isFormValid = false;
    } else {
      workerSelect.classList.remove('error');
    }
  }

  // 2. Validate Rider Name
  const riderName = document.getElementById('rider-name');
  if (riderName) {
    if (!riderName.value.trim()) {
      riderName.classList.add('error');
      isFormValid = false;
    } else {
      riderName.classList.remove('error');
    }
  }

  // 3. Validate Phone
  const riderPhone = document.getElementById('rider-phone');
  if (riderPhone) {
    if (!riderPhone.value.trim()) {
      riderPhone.classList.add('error');
      isFormValid = false;
    } else {
      riderPhone.classList.remove('error');
    }
  }

  // 4. Validate Rider ID
  const riderId = document.getElementById('rider-id');
  if (riderId) {
    if (!riderId.value.trim()) {
      riderId.classList.add('error');
      isFormValid = false;
    } else {
      riderId.classList.remove('error');
    }
  }

  // 5. Validate Platform Selection
  const selectedPlatformInput = document.getElementById('selected-platform');
  const selectedPlatform = selectedPlatformInput ? selectedPlatformInput.value : '';
  const platformError = document.getElementById('platform-error');
  if (!selectedPlatform) {
    if (platformError) platformError.style.display = 'block';
    isFormValid = false;
  } else {
    if (platformError) platformError.style.display = 'none';
  }

  // 6. Validate Complaint Details
  const complaintText = document.getElementById('complaint-text');
  if (complaintText) {
    if (!complaintText.value.trim()) {
      complaintText.classList.add('error');
      isFormValid = false;
    } else {
      complaintText.classList.remove('error');
    }
  }

  // Stop submission if validation checks fail
  if (!isFormValid) {
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // If valid, generate Complaint Object
  const randomTicketNum = Math.floor(10000 + Math.random() * 90000);
  const ticketId = `TA-${randomTicketNum}`;
  
  const newComplaint = {
    id: ticketId,
    worker: workerSelect.value,
    riderName: riderName.value.trim(),
    riderPhone: riderPhone.value.trim(),
    riderId: riderId.value.trim(),
    platform: selectedPlatform,
    details: complaintText.value.trim()
  };

  try {
    const res = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComplaint)
    });
    
    if (res.ok) {
      window.location.href = `success.html?id=${ticketId}`;
    } else {
      const errorData = await res.json();
      alert("Database error: " + (errorData.error || "Failed to save."));
    }
  } catch (err) {
    console.error("API Error:", err);
    alert("Network error: Could not connect to backend server.");
  }
}

// API Integration: Fetch Complaints
async function loadComplaints() {
  try {
    const res = await fetch('api.php');
    if (res.ok) {
      complaints = await res.json();
    } else {
      console.error("Failed to load complaints from backend.");
      complaints = [];
    }
  } catch (err) {
    console.error("Network error fetching complaints:", err);
    complaints = [];
  }
}

// Render Dashboard & Recalculate Metrics
function filterComplaints() {
  const searchInput = document.getElementById('search-input');
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  
  const workerSelect = document.getElementById('filter-worker');
  const workerFilter = workerSelect ? workerSelect.value : 'all';
  
  const platformSelect = document.getElementById('filter-platform');
  const platformFilter = platformSelect ? platformSelect.value : 'all';

  const filtered = complaints.filter(item => {
    // Search matching: rider name, rider ID, or ticket ID
    const matchesSearch = item.riderName.toLowerCase().includes(searchQuery) || 
                          item.riderId.toLowerCase().includes(searchQuery) ||
                          item.id.toLowerCase().includes(searchQuery);

    // Worker matching
    const matchesWorker = workerFilter === 'all' || item.worker === workerFilter;

    // Platform matching
    const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;

    return matchesSearch && matchesWorker && matchesPlatform;
  });

  renderTable(filtered);
  calculateMetrics();
}

function renderTable(dataList) {
  const tbody = document.getElementById('complaints-tbody');
  const emptyState = document.getElementById('table-empty-state');
  const table = document.getElementById('complaints-table');

  if (!tbody) return;
  tbody.innerHTML = '';

  if (dataList.length === 0) {
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  dataList.forEach(item => {
    const tr = document.createElement('tr');
    
    // Formatting date
    const date = new Date(item.timestamp);
    const dateString = date.toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric' 
    }) + ' ' + date.toLocaleTimeString(undefined, { 
      hour: '2-digit', minute: '2-digit' 
    });

    // Badge styling logic
    let platformClass = 'badge-talabat';
    if (item.platform === 'Noon') platformClass = 'badge-noon';
    if (item.platform === 'Keeta') platformClass = 'badge-keeta';

    tr.innerHTML = `
      <td><span style="font-weight: 600; color: var(--accent-primary); font-family: var(--font-display);">${item.id}</span></td>
      <td><span style="font-size: 0.8rem; color: var(--text-secondary);">${dateString}</span></td>
      <td><span class="badge badge-worker">${item.worker}</span></td>
      <td>
        <div style="font-weight: 500;">${item.riderName}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">ID: ${item.riderId} | ${item.riderPhone}</div>
        <div style="margin-top: 0.25rem;"><span class="badge ${platformClass}">${item.platform}</span></div>
      </td>
      <td>
        <div style="max-width: 250px; font-size: 0.85rem; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.details}">
          ${item.details}
        </div>
      </td>
      <td style="text-align: center;">
        <button class="action-btn-view" onclick="viewComplaintDetails('${item.id}')" title="Read Full Comment">👁️</button>
        <button class="action-btn-danger" onclick="deleteComplaint('${item.id}')" title="Delete">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function calculateMetrics() {
  const total = complaints.length;
  const totalEl = document.getElementById('stat-total-complaints');
  if (totalEl) totalEl.textContent = total;

  const topWorkerEl = document.getElementById('stat-top-worker');
  const topPlatformEl = document.getElementById('stat-top-platform');

  if (total === 0) {
    if (topWorkerEl) topWorkerEl.textContent = '-';
    if (topPlatformEl) topPlatformEl.textContent = '-';
    return;
  }

  // Count per worker
  const workerCounts = {};
  const platformCounts = {};

  complaints.forEach(item => {
    workerCounts[item.worker] = (workerCounts[item.worker] || 0) + 1;
    platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
  });

  // Top worker
  let topWorker = '-';
  let maxWorkerCount = 0;
  for (const [w, count] of Object.entries(workerCounts)) {
    if (count > maxWorkerCount) {
      maxWorkerCount = count;
      topWorker = w;
    }
  }

  // Top platform
  let topPlatform = '-';
  let maxPlatformCount = 0;
  for (const [p, count] of Object.entries(platformCounts)) {
    if (count > maxPlatformCount) {
      maxPlatformCount = count;
      topPlatform = p;
    }
  }

  if (topWorkerEl) topWorkerEl.textContent = `${topWorker} (${maxWorkerCount})`;
  if (topPlatformEl) topPlatformEl.textContent = `${topPlatform} (${maxPlatformCount})`;
}

// Delete Single Complaint API
async function deleteComplaint(id) {
  if (confirm(`Are you sure you want to delete incident file ${id}?`)) {
    try {
      const res = await fetch('api.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        complaints = complaints.filter(c => c.id !== id);
        filterComplaints();
      } else {
        alert("Failed to delete record from backend.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Network error during deletion.");
    }
  }
}

// Clear All System Data records (UI only, to be safe)
function clearAllComplaints() {
  if (confirm("CRITICAL WARNING: Due to backend security, clearing all records at once is restricted to database admins. This will only clear your current view.")) {
    complaints = [];
    filterComplaints();
  }
}

// Export Lodged Records to CSV format
function exportToCSV() {
  if (complaints.length === 0) {
    alert("No files in system directory to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  // CSV Headers
  csvContent += "Reference ID,Date/Time,Target Worker,Rider Name,Rider Phone,Rider ID,Platform,Complaint Details\n";

  // CSV Rows escape values helper
  complaints.forEach(item => {
    const escapedName = `"${item.riderName.replace(/"/g, '""')}"`;
    const escapedPhone = `"${item.riderPhone.replace(/"/g, '""')}"`;
    const escapedRiderId = `"${item.riderId.replace(/"/g, '""')}"`;
    const escapedDetails = `"${item.details.replace(/"/g, '""')}"`;
    const dateString = new Date(item.timestamp).toISOString();

    csvContent += `${item.id},${dateString},${item.worker},${escapedName},${escapedPhone},${escapedRiderId},${item.platform},${escapedDetails}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Taslim_Complaints_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
}

// Removed seedMockData() because we are using a live database.

// Modal Handlers for Viewing Full Complaint
function viewComplaintDetails(id) {
  const item = complaints.find(c => c.id === id);
  if (!item) return;

  const modal = document.getElementById('complaint-modal');
  if (!modal) return;

  // Format date
  const date = new Date(item.timestamp);
  const dateString = date.toLocaleDateString(undefined, { 
    year: 'numeric', month: 'short', day: 'numeric' 
  }) + ' ' + date.toLocaleTimeString(undefined, { 
    hour: '2-digit', minute: '2-digit' 
  });

  // Populate info
  document.getElementById('modal-ref-id').textContent = item.id;
  document.getElementById('modal-date').textContent = dateString;
  document.getElementById('modal-worker').textContent = item.worker;
  
  const platformEl = document.getElementById('modal-platform');
  platformEl.textContent = item.platform;
  platformEl.className = 'modal-info-value badge';
  if (item.platform === 'Talabat') platformEl.classList.add('badge-talabat');
  else if (item.platform === 'Noon') platformEl.classList.add('badge-noon');
  else if (item.platform === 'Keeta') platformEl.classList.add('badge-keeta');

  // Rider Profile
  document.getElementById('modal-rider-name').textContent = item.riderName;
  document.getElementById('modal-rider-id').textContent = `ID: ${item.riderId}`;
  document.getElementById('modal-rider-phone').textContent = `Phone: ${item.riderPhone}`;

  // Full Comment
  document.getElementById('modal-complaint-text').textContent = item.details;

  // Show Modal
  modal.style.display = 'flex';
}

function closeComplaintModal() {
  const modal = document.getElementById('complaint-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}
