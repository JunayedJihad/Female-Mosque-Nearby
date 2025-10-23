// Global variables
let map, userMarker, mosqueMarkers = [], userLocation = null, radiusCircle = null, currentRadius = 1;

// Dark Mode
const body = document.body;
const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');

// Check for saved dark mode preference
const isDarkMode = document.cookie.split('; ').find(row => row.startsWith('darkMode='));
if (isDarkMode && isDarkMode.split('=')[1] === 'true') {
  body.classList.add('dark-mode');
  if (darkModeToggleMobile) darkModeToggleMobile.textContent = '☀️';
}

if (darkModeToggleMobile) {
  darkModeToggleMobile.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    darkModeToggleMobile.textContent = isDark ? '☀️' : '🌙';
    document.cookie = `darkMode=${isDark}; max-age=${365*24*60*60}; path=/`;
  });
}

// Initialize map
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMap);
} else {
  initializeMap();
}

function initializeMap() {
  const mapElement = document.getElementById('mapMobile');

  if (!mapElement) {
    console.error('Map element not found!');
    return;
  }

  map = L.map(mapElement).setView([23.8103, 90.4125], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);

  setTimeout(() => {
    map.invalidateSize();
    if (window.mosqueLocations && window.mosqueLocations.length > 0) {
      displayMosques();
    }
  }, 100);
}

// Helper functions
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createPinIcon(url) {
  let size = [25, 25];
  return L.icon({
    iconUrl: url,
    iconSize: size,
    iconAnchor: [size[0]/2, size[1]],
    popupAnchor: [0, -size[1]],
  });
}

let bluePin = createPinIcon("pin (1).png");
let redPin = createPinIcon("pin.png");
let grayPin = createPinIcon("pin (2).png");

function getDirectionsUrl(lat, lng) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  if (isIOS) {
    return `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
  } else if (isAndroid) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  } else {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  }
}

function displayMosques(userLat = null, userLng = null) {
  if (!map) return;
  mosqueMarkers.forEach(m => map.removeLayer(m));
  mosqueMarkers = [];

  window.mosqueLocations.forEach(m => {
    let icon = grayPin;
    let distance = null;
    if (userLat !== null && userLng !== null) {
      distance = calculateDistance(userLat, userLng, m.lat, m.lng);
      if (distance <= currentRadius) icon = redPin;
    }
    const marker = L.marker([m.lat, m.lng], {icon}).addTo(map);
    let popupContent = `<strong>${m.name}</strong>`;
    if (distance !== null) popupContent += `<br>Distance: ${distance.toFixed(2)} km`;

    const directionsUrl = getDirectionsUrl(m.lat, m.lng);
    popupContent += `<br><a href="${directionsUrl}" target="_blank" class="directions-btn">🧭 Get Directions</a>`;

    marker.bindPopup(popupContent);
    mosqueMarkers.push(marker);
  });
}

function getLocationIcon(type) {
  const icons = {
    'city': '🏙️', 'town': '🏘️', 'village': '🏡', 'suburb': '🏘️',
    'neighbourhood': '🏠', 'road': '🛣️', 'building': '🏢', 'hospital': '🏥',
    'school': '🏫', 'university': '🎓', 'mosque': '🕌', 'restaurant': '🍽️',
    'cafe': '☕', 'shop': '🛍️', 'market': '🏪', 'park': '🌳', 'stadium': '🏟️'
  };
  return icons[type] || '📍';
}

function performSearch(lat, lng, displayName) {
  if (!map) return;

  if (userMarker) map.removeLayer(userMarker);
  if (radiusCircle) map.removeLayer(radiusCircle);

  radiusCircle = L.circle([lat, lng], {
    color: "#667eea",
    fillColor: "#a78bfa",
    fillOpacity: 0.2,
    radius: currentRadius * 1000,
  }).addTo(map);

  userMarker = L.marker([lat, lng], {icon: bluePin}).addTo(map);
  userMarker.bindPopup(`<strong>Searched Location</strong><br>${displayName}`).openPopup();

  map.setView([lat, lng], 14);
  userLocation = { lat, lng };
  displayMosques(lat, lng);
}

window.displayMosques = displayMosques;

// Distance Slider
const distanceSliderMobile = document.getElementById('distanceSliderMobile');
const distanceValueMobile = document.getElementById('distanceValueMobile');

if (distanceSliderMobile) {
  distanceSliderMobile.addEventListener('input', function() {
    currentRadius = parseFloat(this.value);
    if (distanceValueMobile) distanceValueMobile.textContent = currentRadius;

    if (userLocation && map) {
      if (radiusCircle) map.removeLayer(radiusCircle);
      radiusCircle = L.circle([userLocation.lat, userLocation.lng], {
        color: "#667eea",
        fillColor: "#a78bfa",
        fillOpacity: 0.2,
        radius: currentRadius * 1000,
      }).addTo(map);
      displayMosques(userLocation.lat, userLocation.lng);
    }
  });
}

// Mosque List Modal
const mosqueModal = document.getElementById('mosqueModal');
const viewAllMosquesBtnMobile = document.getElementById('viewAllMosquesBtnMobile');
const closeMosqueModal = document.getElementById('closeMosqueModal');
const mosqueListContainer = document.getElementById('mosqueListContainer');
const mosqueCount = document.getElementById('mosqueCount');

function populateMosqueList() {
  mosqueListContainer.innerHTML = '';

  const districtFilter = document.getElementById('districtFilter');
  if (districtFilter) districtFilter.value = 'all';

  mosqueCount.textContent = `${window.mosqueLocations.length} Places`;

  window.mosqueLocations.forEach((mosque, index) => {
    const item = document.createElement('div');
    item.className = 'mosque-list-item';
    item.setAttribute('data-district', mosque.district || 'Other');

    item.innerHTML = `
      <div class="mosque-list-number">${index + 1}</div>
      <div class="mosque-list-name">${mosque.name}</div>
    `;

    item.addEventListener('click', () => {
      mosqueModal.classList.remove('active');
      document.body.style.overflow = 'auto';
      map.setView([mosque.lat, mosque.lng], 16);

      mosqueMarkers.forEach(marker => {
        const markerLatLng = marker.getLatLng();
        if (markerLatLng.lat === mosque.lat && markerLatLng.lng === mosque.lng) {
          marker.openPopup();
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    mosqueListContainer.appendChild(item);
  });
}

function filterByDistrict() {
  const selectedDistrict = document.getElementById('districtFilter').value;
  const allItems = document.querySelectorAll('.mosque-list-item');
  let visibleCount = 0;

  allItems.forEach(item => {
    const itemDistrict = item.getAttribute('data-district');
    if (selectedDistrict === 'all' || itemDistrict === selectedDistrict) {
      item.style.display = 'flex';
      visibleCount++;
      item.querySelector('.mosque-list-number').textContent = visibleCount;
    } else {
      item.style.display = 'none';
    }
  });

  const mosqueCount = document.getElementById('mosqueCount');
  if (selectedDistrict === 'all') {
    mosqueCount.textContent = `${window.mosqueLocations.length} Places`;
  } else {
    mosqueCount.textContent = `${visibleCount} Places in ${selectedDistrict}`;
  }
}

window.populateMosqueList = populateMosqueList;
window.filterByDistrict = filterByDistrict;

if (viewAllMosquesBtnMobile) {
  viewAllMosquesBtnMobile.addEventListener('click', () => {
    populateMosqueList();
    mosqueModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

if (closeMosqueModal) {
  closeMosqueModal.addEventListener('click', () => {
    mosqueModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
}

if (mosqueModal) {
  mosqueModal.addEventListener('click', (e) => {
    if (e.target === mosqueModal) {
      mosqueModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
}

// Escape key handler
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const suggestionPopup = document.getElementById('suggestionPopup');
    if (suggestionPopup && suggestionPopup.classList.contains('active')) {
      suggestionPopup.classList.remove('active');
      document.body.style.overflow = 'auto';
    } else if (mosqueModal && mosqueModal.classList.contains('active')) {
      mosqueModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }
});

// Hamburger Menu
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileSidebar = document.getElementById('mobileSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('active');
    mobileSidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', () => {
    hamburgerBtn.classList.remove('active');
    mobileSidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });
}

// Sidebar Menu Items
const sidebarViewAll = document.getElementById('sidebarViewAll');
const sidebarSuggest = document.getElementById('sidebarSuggest');

if (sidebarViewAll) {
  sidebarViewAll.addEventListener('click', () => {
    populateMosqueList();
    mosqueModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    hamburgerBtn.classList.remove('active');
    mobileSidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });
}

if (sidebarSuggest) {
  sidebarSuggest.addEventListener('click', () => {
    window.open('https://forms.gle/jp5V7YSX4GH7Gwpt6', '_blank');
    hamburgerBtn.classList.remove('active');
    mobileSidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });
}

// FAB Buttons
const fabSearch = document.getElementById('fabSearch');
const bottomSearchPanel = document.getElementById('bottomSearchPanel');

if (fabSearch) {
  fabSearch.addEventListener('click', () => {
    bottomSearchPanel.classList.toggle('active');
  });
}

// Close bottom panel when clicking outside
document.addEventListener('click', (e) => {
  if (bottomSearchPanel &&
      bottomSearchPanel.classList.contains('active') &&
      !bottomSearchPanel.contains(e.target) &&
      fabSearch &&
      !fabSearch.contains(e.target)) {
    bottomSearchPanel.classList.remove('active');
  }
});

// Swipe down to close bottom panel
let touchStartY = 0;
let touchEndY = 0;

const searchPanelHandle = document.getElementById('searchPanelHandle');

if (bottomSearchPanel && searchPanelHandle) {
  searchPanelHandle.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  searchPanelHandle.addEventListener('touchmove', (e) => {
    touchEndY = e.touches[0].clientY;
  }, { passive: true });

  searchPanelHandle.addEventListener('touchend', () => {
    const swipeDistance = touchEndY - touchStartY;
    if (swipeDistance > 50) {
      bottomSearchPanel.classList.remove('active');
    }
  });

  bottomSearchPanel.addEventListener('click', (e) => {
    if (e.target === bottomSearchPanel) {
      bottomSearchPanel.classList.remove('active');
    }
  });
}

// Dua Popup
const suggestionPopup = document.getElementById('suggestionPopup');
const closeSuggestionPopup = document.getElementById('closeSuggestionPopup');
const closeBtn = document.getElementById('closeBtn');
const showMoreDuaBtn = document.getElementById('showMoreDuaBtn');

const popupShown = sessionStorage.getItem('duaPopupShown');

// Function to update dua with animation
function updateDuaContent() {
  const dua = getRandomDua();
  const duaTextElement = document.getElementById('duaText');
  const duaReferenceElement = document.getElementById('duaReference');

  if (duaTextElement && duaReferenceElement) {
    // Fade out
    duaTextElement.classList.add('fade-out');
    duaReferenceElement.classList.add('fade-out');

    setTimeout(() => {
      // Update content
      duaTextElement.textContent = dua.text;
      duaReferenceElement.textContent = dua.reference;

      // Fade in
      duaTextElement.classList.remove('fade-out');
      duaTextElement.classList.add('fade-in');
      duaReferenceElement.classList.remove('fade-out');
      duaReferenceElement.classList.add('fade-in');

      // Remove animation classes after animation completes
      setTimeout(() => {
        duaTextElement.classList.remove('fade-in');
        duaReferenceElement.classList.remove('fade-in');
      }, 300);
    }, 300);
  }
}

// Show popup on page load
if (!popupShown && suggestionPopup) {
  setTimeout(() => {
    updateDuaContent();
    suggestionPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
    sessionStorage.setItem('duaPopupShown', 'true');
  }, 1000);
}

// Show More button - loads another dua
if (showMoreDuaBtn) {
  showMoreDuaBtn.addEventListener('click', () => {
    updateDuaContent();
  });
}

// Close button handlers
if (closeSuggestionPopup) {
  closeSuggestionPopup.addEventListener('click', () => {
    suggestionPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    suggestionPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
}

// Click outside to close
if (suggestionPopup) {
  suggestionPopup.addEventListener('click', (e) => {
    if (e.target === suggestionPopup) {
      suggestionPopup.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
}

// Mobile Search Functionality - UPDATED: Search on button click only
const searchInputMobile = document.getElementById('searchInputMobile');
const searchBtnMobile = document.getElementById('searchBtnMobile');

// Create clear button and suggestions list
let clearBtnMobile = document.getElementById('clearBtnMobile');
if (!clearBtnMobile && searchInputMobile) {
  const wrapper = document.createElement('div');
  wrapper.className = 'mobile-search-input-wrapper';
  wrapper.style.position = 'relative';
  searchInputMobile.parentNode.insertBefore(wrapper, searchInputMobile);
  wrapper.appendChild(searchInputMobile);

  clearBtnMobile = document.createElement('button');
  clearBtnMobile.id = 'clearBtnMobile';
  clearBtnMobile.className = 'clear-btn-mobile';
  clearBtnMobile.innerHTML = '✕';
  clearBtnMobile.setAttribute('aria-label', 'Clear search');
  wrapper.appendChild(clearBtnMobile);

  const suggestionsListMobile = document.createElement('div');
  suggestionsListMobile.id = 'suggestionsListMobile';
  suggestionsListMobile.className = 'suggestions-list-mobile';
  suggestionsListMobile.style.display = 'none';
  wrapper.appendChild(suggestionsListMobile);
}

let suggestionsListMobile = document.getElementById('suggestionsListMobile');

// REMOVED: Auto-suggest on input - Now only shows/hides clear button
if (searchInputMobile) {
  searchInputMobile.addEventListener('input', function() {
    const query = this.value.trim();

    if (clearBtnMobile) {
      clearBtnMobile.style.display = query.length > 0 ? 'flex' : 'none';
    }

    // Hide suggestions when typing (only show after search button click)
    if (suggestionsListMobile) {
      suggestionsListMobile.style.display = 'none';
      suggestionsListMobile.innerHTML = '';
    }
  });

  // Allow Enter key to trigger search
  searchInputMobile.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchBtnMobile) {
        searchBtnMobile.click();
      }
    }
  });
}

if (clearBtnMobile) {
  clearBtnMobile.addEventListener('click', function(e) {
    e.stopPropagation();
    if (searchInputMobile) {
      searchInputMobile.value = '';
      searchInputMobile.focus();
    }
    clearBtnMobile.style.display = 'none';
    if (suggestionsListMobile) {
      suggestionsListMobile.style.display = 'none';
      suggestionsListMobile.innerHTML = '';
    }
  });
}

// UPDATED: Fetch suggestions only when search button is clicked
function fetchSuggestionsMobile(query) {
  const bangladeshBounds = '88.0,20.5,92.7,26.6';

  // Show loading state
  if (suggestionsListMobile) {
    suggestionsListMobile.innerHTML = '<div class="suggestion-item-mobile" style="color: #667eea;">🔍 Searching...</div>';
    suggestionsListMobile.style.display = 'block';
  }

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=bd&viewbox=${bangladeshBounds}&bounded=0`)
    .then(response => response.json())
    .then(data => {
      displaySuggestionsMobile(data, query);
    })
    .catch(error => {
      console.error('Mobile suggestion fetch error:', error);
      if (suggestionsListMobile) {
        suggestionsListMobile.innerHTML = '<div class="suggestion-item-mobile" style="color: #ef4444;">❌ Error searching. Please try again.</div>';
      }
    });
}

function displaySuggestionsMobile(suggestions, searchQuery) {
  const suggestionsListMobile = document.getElementById('suggestionsListMobile');
  if (!suggestionsListMobile) return;

  suggestionsListMobile.innerHTML = '';

  if (suggestions.length === 0) {
    // Show "not found" message
    const noResultItem = document.createElement('div');
    noResultItem.className = 'suggestion-item-mobile';
    noResultItem.style.color = '#ef4444';
    noResultItem.style.cursor = 'default';
    noResultItem.innerHTML = `❌ No results found for "<strong>${searchQuery}</strong>"<br><span style="font-size: 12px; color: #6b7280;">Try a different search term</span>`;
    suggestionsListMobile.appendChild(noResultItem);
    suggestionsListMobile.style.display = 'block';
    return;
  }

  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = 'suggestion-item-mobile';

    const icon = getLocationIcon(suggestion.type);
    item.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${suggestion.display_name}`;

    item.addEventListener('click', () => {
      const searchInputMobile = document.getElementById('searchInputMobile');
      if (searchInputMobile) searchInputMobile.value = suggestion.display_name;
      suggestionsListMobile.style.display = 'none';
      suggestionsListMobile.innerHTML = '';

      const clearBtnMobile = document.getElementById('clearBtnMobile');
      if (clearBtnMobile) clearBtnMobile.style.display = 'none';

      performSearch(parseFloat(suggestion.lat), parseFloat(suggestion.lon), suggestion.display_name);

      const bottomSearchPanel = document.getElementById('bottomSearchPanel');
      if (bottomSearchPanel) bottomSearchPanel.classList.remove('active');
    });

    suggestionsListMobile.appendChild(item);
  });

  suggestionsListMobile.style.display = 'block';
}

// Close mobile suggestions when clicking outside
document.addEventListener('click', function(e) {
  const suggestionsListMobile = document.getElementById('suggestionsListMobile');
  const searchInputMobile = document.getElementById('searchInputMobile');
  const clearBtnMobile = document.getElementById('clearBtnMobile');
  const searchBtnMobile = document.getElementById('searchBtnMobile');
  const mobileSearchWrapper = document.querySelector('.mobile-search-input-wrapper');

  // Don't close if clicking search button
  if (searchBtnMobile && searchBtnMobile.contains(e.target)) {
    return;
  }

  if (mobileSearchWrapper && !mobileSearchWrapper.contains(e.target)) {
    if (suggestionsListMobile) {
      suggestionsListMobile.style.display = 'none';
    }
  }
});

// Clear search when bottom panel closes
if (bottomSearchPanel) {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class') {
        if (!bottomSearchPanel.classList.contains('active')) {
          if (searchInputMobile) searchInputMobile.value = '';
          if (clearBtnMobile) clearBtnMobile.style.display = 'none';
          if (suggestionsListMobile) {
            suggestionsListMobile.style.display = 'none';
            suggestionsListMobile.innerHTML = '';
          }
        }
      }
    });
  });

  observer.observe(bottomSearchPanel, { attributes: true });
}

// UPDATED: Search Button - Now shows suggestions instead of direct search
if (searchBtnMobile) {
  searchBtnMobile.addEventListener("click", () => {
    const query = searchInputMobile ? searchInputMobile.value.trim() : '';
    if (!query) {
      alert("Please enter a location to search");
      return;
    }

    // Fetch and display suggestions
    fetchSuggestionsMobile(query);
  });
}

// Find Nearby Location (FAB Button)
const fabLocate = document.getElementById('fabLocate');

if (fabLocate) {
  fabLocate.addEventListener('click', () => {
    const originalContent = fabLocate.innerHTML;
    fabLocate.innerHTML = '⏳';
    fabLocate.disabled = true;
    fabLocate.style.opacity = '0.7';

    if (!map) {
      fabLocate.innerHTML = originalContent;
      fabLocate.disabled = false;
      fabLocate.style.opacity = '1';
      alert('Map is still loading, please try again in a moment');
      return;
    }

    if ("geolocation" in navigator) {
      showToast('📍 Requesting location access...');

      navigator.geolocation.getCurrentPosition(
        function (position) {
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (userMarker) map.removeLayer(userMarker);
          if (radiusCircle) map.removeLayer(radiusCircle);

          radiusCircle = L.circle([userLocation.lat, userLocation.lng], {
            color: "#667eea",
            fillColor: "#a78bfa",
            fillOpacity: 0.2,
            radius: currentRadius * 1000,
          }).addTo(map);

          userMarker = L.marker([userLocation.lat, userLocation.lng], {
            icon: bluePin,
          }).addTo(map);
          userMarker.bindPopup("<strong>Your Location</strong>").openPopup();

          map.setView([userLocation.lat, userLocation.lng], 14);
          displayMosques(userLocation.lat, userLocation.lng);

          fabLocate.innerHTML = originalContent;
          fabLocate.disabled = false;
          fabLocate.style.opacity = '1';

          showToast('✅ Location found!');
        },
        function (error) {
          fabLocate.innerHTML = originalContent;
          fabLocate.disabled = false;
          fabLocate.style.opacity = '1';

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
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      fabLocate.innerHTML = originalContent;
      fabLocate.disabled = false;
      fabLocate.style.opacity = '1';

      showToast("❌ Location is not supported by your browser.", 3000);
    }
  });
}

// Toast notification function
function showToast(message, duration = 2500) {
  const existingToast = document.getElementById('locationToast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'locationToast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(45, 55, 72, 0.95);
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.3s ease;
    max-width: 90%;
    text-align: center;
  `;

  if (!document.getElementById('toastStyles')) {
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      @keyframes slideUp {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, duration);
}