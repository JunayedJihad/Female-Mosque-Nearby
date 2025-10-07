// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Check for saved dark mode preference
const isDarkMode = document.cookie.split('; ').find(row => row.startsWith('darkMode='));
if (isDarkMode && isDarkMode.split('=')[1] === 'true') {
  body.classList.add('dark-mode');
  darkModeToggle.textContent = '☀️';
}

darkModeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  darkModeToggle.textContent = isDark ? '☀️' : '🌙';
  document.cookie = `darkMode=${isDark}; max-age=${365*24*60*60}; path=/`;
});

let map = L.map("map").setView([23.8103, 90.4125], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
}).addTo(map);

let userMarker = null;
let mosqueMarkers = [];
let userLocation = null;
let radiusCircle = null;
let currentRadius = 1;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createPinIcon(url) {
  let size = [32, 32];
  if(window.innerWidth<=640) size=[25,25];
  else if(window.innerWidth<=1024) size=[28,28];
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

window.addEventListener("resize", ()=>{
  bluePin=createPinIcon("pin (1).png");
  redPin=createPinIcon("pin.png");
  grayPin=createPinIcon("pin (2).png");
  displayMosques(userLocation?.lat, userLocation?.lng);
  if(userLocation && userMarker) userMarker.setIcon(bluePin);
});

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

function displayMosques(userLat=null, userLng=null){
  mosqueMarkers.forEach(m=>map.removeLayer(m));
  mosqueMarkers=[];
  window.mosqueLocations.forEach(m=>{
    let icon=grayPin;
    let distance=null;
    if(userLat!==null && userLng!==null){
      distance=calculateDistance(userLat,userLng,m.lat,m.lng);
      if(distance<=currentRadius) icon=redPin;
    }
    const marker=L.marker([m.lat,m.lng],{icon}).addTo(map);
    let popupContent=`<strong>${m.name}</strong>`;
    if(distance!==null) popupContent+=`<br>Distance: ${distance.toFixed(2)} km`;

    const directionsUrl = getDirectionsUrl(m.lat, m.lng);
    popupContent += `<br><a href="${directionsUrl}" target="_blank" class="directions-btn">🧭 Get Directions</a>`;

    marker.bindPopup(popupContent);
    mosqueMarkers.push(marker);
  });
}

// Distance Slider Functionality
const distanceSlider = document.getElementById('distanceSlider');
const distanceValue = document.getElementById('distanceValue');
const statusMsg = document.getElementById('statusMsg');

distanceSlider.addEventListener('input', function() {
  currentRadius = parseFloat(this.value);
  distanceValue.textContent = currentRadius;

  if (userLocation) {
    if (radiusCircle) {
      map.removeLayer(radiusCircle);
    }

    radiusCircle = L.circle([userLocation.lat, userLocation.lng], {
      color: "#667eea",
      fillColor: "#a78bfa",
      fillOpacity: 0.2,
      radius: currentRadius * 1000,
    }).addTo(map);

    displayMosques(userLocation.lat, userLocation.lng);

    statusMsg.textContent = `Location found! Showing nearby mosques within ${currentRadius} km.`;
    statusMsg.className = "text-sm font-medium mt-3 text-center text-green-600";
  }
});

// Mosque List Modal Functionality
const mosqueModal = document.getElementById('mosqueModal');
const viewAllMosquesBtn = document.getElementById('viewAllMosquesBtn');
const closeMosqueModal = document.getElementById('closeMosqueModal');
const mosqueListContainer = document.getElementById('mosqueListContainer');
const mosqueCount = document.getElementById('mosqueCount');

function populateMosqueList() {
  mosqueListContainer.innerHTML = '';

  const districtFilter = document.getElementById('districtFilter');
  if (districtFilter) {
    districtFilter.value = 'all';
  }

  mosqueCount.textContent = `${window.mosqueLocations.length} Places`;

  window.mosqueLocations.forEach((mosque, index) => {
    const item = document.createElement('div');
    item.className = 'mosque-list-item';

    const district = mosque.district || 'Other';
    item.setAttribute('data-district', district);

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

      document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
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

window.displayMosques = displayMosques;
window.populateMosqueList = populateMosqueList;
window.filterByDistrict = filterByDistrict;

viewAllMosquesBtn.addEventListener('click', () => {
  populateMosqueList();
  mosqueModal.classList.add('active');
  document.body.style.overflow = 'hidden';
});

closeMosqueModal.addEventListener('click', () => {
  mosqueModal.classList.remove('active');
  document.body.style.overflow = 'auto';
});

mosqueModal.addEventListener('click', (e) => {
  if (e.target === mosqueModal) {
    mosqueModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (suggestionPopup.classList.contains('active')) {
      suggestionPopup.classList.remove('active');
      document.body.style.overflow = 'auto';
    } else if (mosqueModal.classList.contains('active')) {
      mosqueModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }
});

// Autocomplete functionality
const searchInput = document.getElementById('searchInput');
const suggestionsList = document.getElementById('suggestionsList');
const clearBtn = document.getElementById('clearBtn');
let debounceTimer;

searchInput.addEventListener('input', function() {
  const query = this.value.trim();

  if (query.length > 0) {
    clearBtn.classList.add('active');
  } else {
    clearBtn.classList.remove('active');
  }

  clearTimeout(debounceTimer);

  if (query.length < 2) {
    suggestionsList.classList.remove('active');
    suggestionsList.innerHTML = '';
    return;
  }

  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 250);
});

clearBtn.addEventListener('click', function() {
  searchInput.value = '';
  clearBtn.classList.remove('active');
  suggestionsList.classList.remove('active');
  suggestionsList.innerHTML = '';
  searchInput.focus();

  statusMsg.textContent = '';
  statusMsg.className = 'text-sm font-medium mt-3 text-center';

  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }
  if (radiusCircle) {
    map.removeLayer(radiusCircle);
    radiusCircle = null;
  }

  userLocation = null;
  displayMosques();
});

function fetchSuggestions(query) {
  const bangladeshBounds = '88.0,20.5,92.7,26.6';

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=bd&viewbox=${bangladeshBounds}&bounded=0`)
    .then(response => response.json())
    .then(data => {
      displaySuggestions(data);
    })
    .catch(error => {
      console.error('Suggestion fetch error:', error);
    });
}

function displaySuggestions(suggestions) {
  suggestionsList.innerHTML = '';

  if (suggestions.length === 0) {
    suggestionsList.classList.remove('active');
    return;
  }

  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    const icon = getLocationIcon(suggestion.type);
    item.innerHTML = `<span class="suggestion-icon">${icon}</span>${suggestion.display_name}`;

    item.addEventListener('click', () => {
      searchInput.value = suggestion.display_name;
      suggestionsList.classList.remove('active');
      suggestionsList.innerHTML = '';
      clearBtn.classList.add('active');

      performSearch(parseFloat(suggestion.lat), parseFloat(suggestion.lon), suggestion.display_name);
    });

    suggestionsList.appendChild(item);
  });

  suggestionsList.classList.add('active');
}

function getLocationIcon(type) {
  const icons = {
    'city': '🏙️',
    'town': '🏘️',
    'village': '🏡',
    'suburb': '🏘️',
    'neighbourhood': '🏠',
    'road': '🛣️',
    'building': '🏢',
    'hospital': '🏥',
    'school': '🏫',
    'university': '🎓',
    'mosque': '🕌',
    'restaurant': '🍽️',
    'cafe': '☕',
    'shop': '🛍️',
    'market': '🏪',
    'park': '🌳',
    'stadium': '🏟️'
  };
  return icons[type] || '📍';
}

document.addEventListener('click', function(e) {
  if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
    suggestionsList.classList.remove('active');
  }
});

function performSearch(lat, lng, displayName) {
  if (userMarker) {
    map.removeLayer(userMarker);
  }
  if (radiusCircle) {
    map.removeLayer(radiusCircle);
  }

  radiusCircle = L.circle([lat, lng], {
    color: "#667eea",
    fillColor: "#a78bfa",
    fillOpacity: 0.2,
    radius: currentRadius * 1000,
  }).addTo(map);

  userMarker = L.marker([lat, lng], {
    icon: bluePin,
  }).addTo(map);
  userMarker.bindPopup(`<strong>Searched Location</strong><br>${displayName}`).openPopup();

  map.setView([lat, lng], 14);
  userLocation = { lat: lat, lng: lng };
  displayMosques(lat, lng);

  const statusMsg = document.getElementById('statusMsg');
  statusMsg.textContent = `Location found! Showing nearby mosques within ${currentRadius} km.`;
  statusMsg.className = "text-sm font-medium mt-3 text-center text-green-600";
}

// Find nearby mosques
document.getElementById("findNearbyBtn").addEventListener("click", function () {
  const statusMsg = document.getElementById("statusMsg");
  statusMsg.textContent = "Requesting location access...";
  statusMsg.className = "text-sm font-medium mt-3 text-center text-blue-600";

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (userMarker) {
          map.removeLayer(userMarker);
        }
        if (radiusCircle) {
          map.removeLayer(radiusCircle);
        }

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

        statusMsg.textContent = `Location found! Showing nearby mosques within ${currentRadius} km.`;
        statusMsg.className = "text-sm font-medium mt-3 text-center text-green-600";
      },
      function (error) {
        let errorMsg = "Unable to get location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Permission denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Position unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg += "Request timeout.";
            break;
          default:
            errorMsg += "Unknown error.";
        }
        statusMsg.textContent = errorMsg;
        statusMsg.className = "text-sm font-medium mt-3 text-center text-red-600";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  } else {
    statusMsg.textContent = "Geolocation is not supported by your browser.";
    statusMsg.className = "text-sm font-medium mt-3 text-center text-red-600";
  }
});

// Search by location
document.getElementById("searchBtn").addEventListener("click", searchLocation);
document.getElementById("searchInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    suggestionsList.classList.remove('active');
    searchLocation();
  }
});

function searchLocation() {
  const searchQuery = document.getElementById("searchInput").value.trim();
  if (!searchQuery) {
    alert("Please enter a location to search");
    return;
  }

  const bangladeshBounds = '88.0,20.5,92.7,26.6';

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=bd&viewbox=${bangladeshBounds}&bounded=0`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.length > 0) {
        const result = data[0];
        const searchLat = parseFloat(result.lat);
        const searchLng = parseFloat(result.lon);

        performSearch(searchLat, searchLng, result.display_name);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    })
    .catch((error) => {
      console.error("Search error:", error);
      alert("Error searching location. Please try again.");
    });
}

// Suggestion Popup Functionality
const suggestionPopup = document.getElementById('suggestionPopup');
const closeSuggestionPopup = document.getElementById('closeSuggestionPopup');
const maybeLaterBtn = document.getElementById('maybeLaterBtn');

const popupShown = sessionStorage.getItem('suggestionPopupShown');

if (!popupShown) {
  setTimeout(() => {
    suggestionPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
    sessionStorage.setItem('suggestionPopupShown', 'true');
  }, 4000);
}

closeSuggestionPopup.addEventListener('click', () => {
  suggestionPopup.classList.remove('active');
  document.body.style.overflow = 'auto';
});

maybeLaterBtn.addEventListener('click', () => {
  suggestionPopup.classList.remove('active');
  document.body.style.overflow = 'auto';
});

suggestionPopup.addEventListener('click', (e) => {
  if (e.target === suggestionPopup) {
    suggestionPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});