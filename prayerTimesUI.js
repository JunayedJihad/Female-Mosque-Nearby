// prayerTimesUI.js - Prayer Times UI Controller (User-triggered version - FIXED)
(function() {
  let prayerData = null;
  let updateInterval = null;
  let userPrayerLocation = null;

  // Initialize Prayer Times UI
  function initPrayerTimes() {
    console.log('Prayer Times UI Initializing...');
    createPrayerUI();
    setupEventListeners();

    // Delay hooking to ensure main.js is fully loaded
    setTimeout(() => {
      hookIntoLocationButtons();
    }, 1000);
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
    console.log('Prayer FAB created (hidden)');

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
    console.log('Prayer Modal created');
  }

  // Setup Event Listeners
  function setupEventListeners() {
    const prayerFab = document.getElementById('prayerFab');
    const prayerModal = document.getElementById('prayerModal');
    const closePrayerModal = document.getElementById('closePrayerModal');

    if (prayerFab) {
      prayerFab.addEventListener('click', () => {
        console.log('Prayer FAB clicked');
        // Don't open if dua popup is active
        const duaPopup = document.getElementById('suggestionPopup');
        if (duaPopup && duaPopup.classList.contains('active')) {
          console.log('Dua popup is active, not opening prayer modal');
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
    console.log('Hooking into location buttons...');

    // Hook into the FAB locate button
    const fabLocate = document.getElementById('fabLocate');
    if (fabLocate) {
      console.log('Found fabLocate button, adding listener');

      // Clone the button to remove all existing event listeners
      const newFabLocate = fabLocate.cloneNode(true);
      fabLocate.parentNode.replaceChild(newFabLocate, fabLocate);

      // Add the original functionality back by calling the main.js function
      newFabLocate.addEventListener('click', function() {
        console.log('Location button clicked - triggering geolocation');

        const originalContent = newFabLocate.innerHTML;
        newFabLocate.innerHTML = '⏳';
        newFabLocate.disabled = true;
        newFabLocate.style.opacity = '0.7';

        if (!map) {
          newFabLocate.innerHTML = originalContent;
          newFabLocate.disabled = false;
          newFabLocate.style.opacity = '1';
          alert('Map is still loading, please try again in a moment');
          return;
        }

        if ("geolocation" in navigator) {
          showToast('📍 Requesting location access...');

          navigator.geolocation.getCurrentPosition(
            function (position) {
              window.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };

              if (userMarker) map.removeLayer(userMarker);
              if (radiusCircle) map.removeLayer(radiusCircle);

              radiusCircle = L.circle([window.userLocation.lat, window.userLocation.lng], {
                color: "#667eea",
                fillColor: "#a78bfa",
                fillOpacity: 0.2,
                radius: currentRadius * 1000,
              }).addTo(map);

              userMarker = L.marker([window.userLocation.lat, window.userLocation.lng], {
                icon: bluePin,
              }).addTo(map);
              userMarker.bindPopup("<strong>Your Location</strong>").openPopup();

              map.setView([window.userLocation.lat, window.userLocation.lng], 14);
              displayMosques(window.userLocation.lat, window.userLocation.lng);

              newFabLocate.innerHTML = originalContent;
              newFabLocate.disabled = false;
              newFabLocate.style.opacity = '1';

              showToast('✅ Location found!');

              // NOW SHOW PRAYER TIMES
              console.log('Showing prayer times for location:', window.userLocation);
              setTimeout(() => {
                showPrayerTimesForLocation(window.userLocation.lat, window.userLocation.lng);
              }, 300); // Reduced from 1500ms to 300ms
            },
            function (error) {
              newFabLocate.innerHTML = originalContent;
              newFabLocate.disabled = false;
              newFabLocate.style.opacity = '1';

              let errorMsg = "";
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMsg = "❌ Location access denied. Please enable location permissions in your browser settings.";
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMsg = "❌ Location unavailable. Please check your device settings.";
                  break;
                case error.TIMEOUT:
                  errorMsg = "❌ Location request timed out. Please try again.";
                  break;
                default:
                  errorMsg = "❌ Unable to get your location. Please try again.";
              }

              showToast(errorMsg, 4000);
            },
            {
              enableHighAccuracy: false,  // Faster location (WiFi/network instead of GPS)
              timeout: 5000,              // 5 second timeout
              maximumAge: 300000,         // Accept location cached within last 5 minutes
            }
          );
        } else {
          newFabLocate.innerHTML = originalContent;
          newFabLocate.disabled = false;
          newFabLocate.style.opacity = '1';
          showToast("❌ Location is not supported by your browser.", 3000);
        }
      });
    } else {
      console.error('fabLocate button not found!');
    }

    // Hook into search functionality
    console.log('Checking for performSearch function...');
    if (typeof window.performSearch === 'function') {
      console.log('Found performSearch, overriding it');
      const originalPerformSearch = window.performSearch;

      window.performSearch = function(lat, lng, displayName) {
        console.log('performSearch called with:', lat, lng, displayName);
        // Call original function
        originalPerformSearch(lat, lng, displayName);

        // Show prayer times after search
        setTimeout(() => {
          console.log('Showing prayer times for searched location');
          showPrayerTimesForLocation(lat, lng);
        }, 300); // Reduced from 800ms to 300ms
      };
    } else {
      console.error('performSearch function not found!');
    }
  }

  // Show Prayer Times for a specific location
  async function showPrayerTimesForLocation(latitude, longitude) {
    console.log('showPrayerTimesForLocation called:', latitude, longitude);
    userPrayerLocation = { latitude, longitude };

    // Show FAB with loading state
    const fabContainer = document.getElementById('prayerFabContainer');
    const prayerFab = document.getElementById('prayerFab');

    if (fabContainer) {
      fabContainer.style.display = 'flex';
      console.log('Prayer FAB container shown');
    }

    if (prayerFab) {
      prayerFab.className = 'prayer-fab-loading';
      prayerFab.innerHTML = '<div class="spinner"></div>';
    }

    // Fetch prayer times
    try {
      console.log('Fetching prayer times...');
      const data = await getPrayerTimes(latitude, longitude);
      console.log('Prayer times data:', data);

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
        console.log('Prayer times loaded successfully');
      } else {
        console.error('Failed to load prayer times:', data.error);
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
            <div class="prayer-hijri-date">${getHijriDate(prayerData.hijriDate)}</div>
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

  console.log('Prayer Times UI script loaded');
})();