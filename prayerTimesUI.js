// prayerTimesUI.js - Prayer Times UI Controller (Location-triggered version)
(function() {
  let prayerData = null;
  let updateInterval = null;
  let userPrayerLocation = null;

  // Initialize Prayer Times UI
  function initPrayerTimes() {
    createPrayerModal();
    setupEventListeners();
    hookIntoLocationButtons();
  }

  // Create Prayer Modal (NO FAB button)
  function createPrayerModal() {
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
          <div style="display: flex; align-items: center; justify-content: center; padding: 40px;">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Setup Event Listeners
  function setupEventListeners() {
    const prayerModal = document.getElementById('prayerModal');
    const closePrayerModal = document.getElementById('closePrayerModal');

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
     const fabLocate = document.getElementById('fabLocate');
     fabLocate.addEventListener('click', function (e) {
         // Show loading spinner or disable button if needed
         navigator.geolocation.getCurrentPosition(
             (position) => {
                 const lat = position.coords.latitude;
                 const lng = position.coords.longitude;

                 // Calling your prayer time function
                 showPrayerTimesForLocation(lat, lng);
             },
             (error) => {
                 console.error("Location error:", error);
                 alert("Could not fetch location. Please enable GPS or location permissions.");
             },
             {
               enableHighAccuracy: false,
               timeout: 6000,
               maximumAge: 0
             }
         );
     });

    // Hook into search functionality
    const searchBtnMobile = document.getElementById('searchBtnMobile');
    if (searchBtnMobile) {
      // We'll override the performSearch function to trigger prayer times
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
  }

  // Show Prayer Times for a specific location
  async function showPrayerTimesForLocation(latitude, longitude) {
    // Don't show if dua popup is active
    const duaPopup = document.getElementById('suggestionPopup');
    if (duaPopup && duaPopup.classList.contains('active')) {
      return;
    }

    userPrayerLocation = { latitude, longitude };

    // Open modal immediately with loading state
    const prayerModal = document.getElementById('prayerModal');
    if (prayerModal) {
      prayerModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Show loading
    const modalBody = document.getElementById('prayerModalBody');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px;">
          <div class="spinner" style="margin-bottom: 20px;"></div>
          <p style="color: #667eea; font-weight: 600; font-size: 14px;">Loading prayer times...</p>
        </div>
      `;
    }

    // Fetch prayer times
    try {
      const data = await getPrayerTimes(latitude, longitude);

      if (data.success) {
        prayerData = data;
        populateModalContent();

        // Start real-time updates
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(() => {
          updateModalContent();
        }, 1000);

        // Schedule next day's fetch at midnight
        scheduleNextDayFetch();
      } else {
        showError('Unable to load prayer times. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      showError('Failed to fetch prayer times. Please check your connection.');
    }
  }

  // Show error in modal
  function showError(message) {
    const modalBody = document.getElementById('prayerModalBody');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
          <p style="color: #dc2626; font-weight: 600; font-size: 16px; margin-bottom: 8px;">Error</p>
          <p style="color: #6b7280; font-size: 14px;">${message}</p>
        </div>
      `;
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

  // Close Prayer Modal
  function closePrayerModalHandler() {
    const prayerModal = document.getElementById('prayerModal');
    if (!prayerModal) return;

    prayerModal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Stop updates
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
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

  // Expose function globally so it can be called from anywhere
  window.showPrayerTimesPopup = showPrayerTimesForLocation;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrayerTimes);
  } else {
    initPrayerTimes();
  }
})();