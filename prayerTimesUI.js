// prayerTimesUI.js - Prayer Times UI Controller (User-triggered version)
(function() {
  let prayerData = null;
  let updateInterval = null;
  let userPrayerLocation = null;

  // Initialize Prayer Times UI
  function initPrayerTimes() {
    createPrayerUI();
    setupEventListeners();
    hookIntoLocationButtons();
    // NO automatic location fetch - only on user action
  }

  // Create Prayer Times UI Elements
  function createPrayerUI() {
    // Create FAB Container (hidden initially)
    const fabContainer = document.createElement('div');
    fabContainer.className = 'prayer-fab-container';
    fabContainer.id = 'prayerFabContainer';
    fabContainer.style.display = 'none'; // Hidden until prayer times are loaded
    fabContainer.innerHTML = `
      <button class="prayer-fab-loading" id="prayerFab">
        <div class="spinner"></div>
      </button>
    `;
    document.body.appendChild(fabContainer);

    // Create Modal
    const modal = document.createElement('div');
    modal.className = 'prayer-modal';
    modal.id = 'prayerModal';
    modal.innerHTML = `
      <div class="prayer-modal-content">
        <div class="prayer-modal-handle"></div>
        <div class="prayer-modal-header">
          <h2 class="prayer-modal-title">Prayer Times</h2>
          <button class="prayer-modal-close" id="closePrayerModal" aria-label="Close">✕</button>
        </div>
        <div class="prayer-modal-body" id="prayerModalBody">
          <!-- Content will be populated here -->
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Setup Event Listeners
  function setupEventListeners() {
    const prayerFab = document.getElementById('prayerFab');
    const prayerModal = document.getElementById('prayerModal');
    const closePrayerModal = document.getElementById('closePrayerModal');

    if (prayerFab) {
      prayerFab.addEventListener('click', () => {
        // Don't open if dua popup is active
        const duaPopup = document.getElementById('suggestionPopup');
        if (duaPopup && duaPopup.classList.contains('active')) {
          return;
        }

        if (prayerData) {
          openPrayerModal();
        }
      });
    }

    if (closePrayerModal) {
      closePrayerModal.addEventListener('click', closePrayerModalHandler);
    }

    if (prayerModal) {
      prayerModal.addEventListener('click', (e) => {
        if (e.target === prayerModal) {
          closePrayerModalHandler();
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && prayerModal && prayerModal.classList.contains('active')) {
        // Only close prayer modal if dua popup is not active
        const duaPopup = document.getElementById('suggestionPopup');
        if (!duaPopup || !duaPopup.classList.contains('active')) {
          closePrayerModalHandler();
        }
      }
    });
  }

  // Hook into existing location buttons
  function hookIntoLocationButtons() {
    // Hook into the FAB locate button
    const fabLocate = document.getElementById('fabLocate');
    if (fabLocate) {
      fabLocate.addEventListener('click', function() {
        // Wait for location to be set by main.js, then show prayer times
        setTimeout(() => {
          if (window.userLocation) {
            showPrayerTimesForLocation(window.userLocation.lat, window.userLocation.lng);
          }
        }, 2000); // Wait 2 seconds for location to be fetched and set
      });
    }

    // Hook into search functionality by overriding performSearch
    const originalPerformSearch = window.performSearch;
    if (typeof originalPerformSearch === 'function') {
      window.performSearch = function(lat, lng, displayName) {
        // Call original function
        originalPerformSearch(lat, lng, displayName);

        // Show prayer times after search
        setTimeout(() => {
          showPrayerTimesForLocation(lat, lng);
        }, 500);
      };
    }
  }

  // Show Prayer Times for a specific location
  async function showPrayerTimesForLocation(latitude, longitude) {
    userPrayerLocation = { latitude, longitude };

    // Show FAB with loading state
    const fabContainer = document.getElementById('prayerFabContainer');
    const prayerFab = document.getElementById('prayerFab');

    if (fabContainer) {
      fabContainer.style.display = 'flex';
    }

    if (prayerFab) {
      prayerFab.className = 'prayer-fab-loading';
      prayerFab.innerHTML = '<div class="spinner"></div>';
    }

    // Fetch prayer times
    try {
      const data = await getPrayerTimes(latitude, longitude);

      if (data.success) {
        prayerData = data;
        updateFAB();

        // Start update interval (every second)
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(() => {
          updateFAB();
        }, 1000);

        // Schedule next day's fetch at midnight
        scheduleNextDayFetch();
      } else {
        // Hide FAB on error
        if (fabContainer) {
          fabContainer.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      // Hide FAB on error
      if (fabContainer) {
        fabContainer.style.display = 'none';
      }
    }
  }

  // Schedule Next Day's Fetch
  function scheduleNextDayFetch() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      if (userPrayerLocation) {
        showPrayerTimesForLocation(userPrayerLocation.latitude, userPrayerLocation.longitude);
      }
    }, timeUntilMidnight);
  }

  // Update FAB
  function updateFAB() {
    if (!prayerData) return;

    const prayerFab = document.getElementById('prayerFab');
    if (!prayerFab) return;

    const prayerStatus = getPrayerStatus(prayerData.timings);

    if (prayerStatus) {
      prayerFab.className = 'prayer-fab';
      prayerFab.innerHTML = `
        <span class="prayer-fab-prayer">${prayerStatus.type === 'prayer' ? 'ONGOING' : 'UPCOMING'}</span>
        <span class="prayer-fab-time">${prayerStatus.name}: ${formatTime12Hour(prayerStatus.startTime)} - ${formatTime12Hour(prayerStatus.endTime)}</span>
        <div class="prayer-fab-badge">
          <span class="prayer-fab-badge-text">⏱ ${prayerStatus.formatted}</span>
        </div>
      `;
    }
  }

  // Open Prayer Modal
  function openPrayerModal() {
    const prayerModal = document.getElementById('prayerModal');
    if (!prayerModal || !prayerData) return;

    // Populate modal content
    populateModalContent();

    // Show modal
    prayerModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Start real-time updates in modal
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => {
      updateModalContent();
      updateFAB();
    }, 1000);
  }

  // Close Prayer Modal
  function closePrayerModalHandler() {
    const prayerModal = document.getElementById('prayerModal');
    if (!prayerModal) return;

    prayerModal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Reset to FAB-only updates
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => {
      updateFAB();
    }, 1000);
  }

  // Populate Modal Content
  function populateModalContent() {
    const modalBody = document.getElementById('prayerModalBody');
    if (!modalBody || !prayerData) return;

    const prayerStatus = getPrayerStatus(prayerData.timings);
    const prayerList = [
      { name: 'Fajr', time: prayerData.timings.fajr, endTime: prayerData.timings.sunrise },
      { name: 'Dhuhr', time: prayerData.timings.dhuhr, endTime: prayerData.timings.asr },
      { name: 'Asr', time: prayerData.timings.asr, endTime: prayerData.timings.maghrib },
      { name: 'Maghrib', time: prayerData.timings.maghrib, endTime: prayerData.timings.isha },
      { name: 'Isha', time: prayerData.timings.isha, endTime: prayerData.timings.fajr }
    ];

    const forbiddenTimes = getForbiddenTimes(prayerData.timings);

    // Calculate circle progress
    const circumference = 2 * Math.PI * 53;
    const progressOffset = circumference - (prayerStatus.progress / 100) * circumference;

    modalBody.innerHTML = `
      <div class="prayer-main-content">
        <div class="prayer-timings-column">
          ${prayerList.map(prayer => {
            const isCurrent = prayerStatus.type === 'prayer' && prayer.name === prayerStatus.name;
            return `
              <div class="prayer-timing-row ${isCurrent ? 'current' : ''}">
                <span class="prayer-timing-name">${prayer.name}</span>
                <span class="prayer-timing-time">${formatTime12Hour(prayer.time)} - ${formatTime12Hour(prayer.endTime)}</span>
              </div>
            `;
          }).join('')}
        </div>

        <div class="prayer-circular-timer">
          <div class="prayer-circle-container">
            <svg class="prayer-circle-svg" width="130" height="130">
              <defs>
                <linearGradient id="prayerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle class="prayer-circle-bg" cx="65" cy="65" r="53"></circle>
              <circle
                class="prayer-circle-progress"
                cx="65"
                cy="65"
                r="53"
                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${progressOffset};"
              ></circle>
            </svg>
            <div class="prayer-circle-inner">
              <span class="prayer-countdown-text" id="prayerCountdown">${prayerStatus.formatted}</span>
            </div>
          </div>

          <div class="prayer-current-info">
            <div class="prayer-current-label">${prayerStatus.label}</div>
          </div>

          <div class="prayer-date-container">
            <div class="prayer-english-date">${getEnglishDate()}</div>
            <div class="prayer-hijri-date">${getHijriDate()}</div>
          </div>
        </div>
      </div>

      <div class="prayer-forbidden-section">
        <div class="prayer-forbidden-title">Forbidden Prayer Times</div>
        <div class="prayer-forbidden-list">
          ${forbiddenTimes.map(item => `
            <div class="prayer-forbidden-row">
              <span class="prayer-forbidden-label">${item.label}</span>
              <span class="prayer-forbidden-time">${item.start} - ${item.end}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="prayer-footer">
        <div class="prayer-sun-times">
          <span class="prayer-sun-text">🌅 Sunrise: ${formatTime12Hour(prayerData.timings.sunrise)}</span>
          <span class="prayer-sun-text">🌇 Sunset: ${formatTime12Hour(prayerData.timings.maghrib)}</span>
        </div>
        <div class="prayer-hanafi-badge">
          <span class="prayer-hanafi-text">* Hanafi Fiqh</span>
        </div>
      </div>
    `;
  }

  // Update Modal Content (Real-time)
  function updateModalContent() {
    if (!prayerData) return;

    const prayerCountdown = document.getElementById('prayerCountdown');
    const prayerStatus = getPrayerStatus(prayerData.timings);

    if (prayerCountdown && prayerStatus) {
      prayerCountdown.textContent = prayerStatus.formatted;
    }

    // Update circle progress
    const progressCircle = document.querySelector('.prayer-circle-progress');
    if (progressCircle && prayerStatus) {
      const circumference = 2 * Math.PI * 53;
      const progressOffset = circumference - (prayerStatus.progress / 100) * circumference;
      progressCircle.style.strokeDashoffset = progressOffset;
    }
  }

  // Expose function globally for manual triggering
  window.showPrayerTimesPopup = showPrayerTimesForLocation;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrayerTimes);
  } else {
    initPrayerTimes();
  }
})();