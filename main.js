
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

      // Save preference in cookie (expires in 365 days)
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

    // Responsive pin icons
    function createPinIcon(url) {
      let size = [32, 32];
      if(window.innerWidth<=640) size=[20,20];
      else if(window.innerWidth<=1024) size=[25,25];
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

    // Function to detect user's device and generate appropriate maps URL
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
      mosqueLocations.forEach(m=>{
        let icon=grayPin;
        let distance=null;
        if(userLat!==null && userLng!==null){
          distance=calculateDistance(userLat,userLng,m.lat,m.lng);
          if(distance<=1) icon=redPin;
        }
        const marker=L.marker([m.lat,m.lng],{icon}).addTo(map);
        let popupContent=`<strong>${m.name}</strong>`;
        if(distance!==null) popupContent+=`<br>Distance: ${distance.toFixed(2)} km`;

        // Add Get Directions button
        const directionsUrl = getDirectionsUrl(m.lat, m.lng);
        popupContent += `<br><a href="${directionsUrl}" target="_blank" class="directions-btn">🧭 Get Directions</a>`;

        marker.bindPopup(popupContent);
        mosqueMarkers.push(marker);
      });
    }

    displayMosques();

    // Mosque List Modal Functionality
    const mosqueModal = document.getElementById('mosqueModal');
    const viewAllMosquesBtn = document.getElementById('viewAllMosquesBtn');
    const closeMosqueModal = document.getElementById('closeMosqueModal');
    const mosqueListContainer = document.getElementById('mosqueListContainer');
    const mosqueCount = document.getElementById('mosqueCount');

    function populateMosqueList() {
      mosqueListContainer.innerHTML = '';
      mosqueCount.textContent = `${mosqueLocations.length} Places`;

      mosqueLocations.forEach((mosque, index) => {
        const item = document.createElement('div');
        item.className = 'mosque-list-item';
        item.innerHTML = `
          <div class="mosque-list-number">${index + 1}</div>
          <div class="mosque-list-name">${mosque.name}</div>
        `;

        item.addEventListener('click', () => {
          // Close modal
          mosqueModal.classList.remove('active');
          document.body.style.overflow = 'auto';

          // Zoom to mosque on map
          map.setView([mosque.lat, mosque.lng], 16);

          // Find and open the marker popup
          mosqueMarkers.forEach(marker => {
            const markerLatLng = marker.getLatLng();
            if (markerLatLng.lat === mosque.lat && markerLatLng.lng === mosque.lng) {
              marker.openPopup();
            }
          });

          // Scroll to map
          document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        mosqueListContainer.appendChild(item);
      });
    }

    viewAllMosquesBtn.addEventListener('click', () => {
      populateMosqueList();
      mosqueModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    closeMosqueModal.addEventListener('click', () => {
      mosqueModal.classList.remove('active');
      document.body.style.overflow = 'auto'; // Restore scrolling
    });

    // Close modal when clicking outside
    mosqueModal.addEventListener('click', (e) => {
      if (e.target === mosqueModal) {
        mosqueModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mosqueModal.classList.contains('active')) {
        mosqueModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });

    // Autocomplete functionality
    const searchInput = document.getElementById('searchInput');
    const suggestionsList = document.getElementById('suggestionsList');
    const clearBtn = document.getElementById('clearBtn');
    let debounceTimer;

    // Show/hide clear button
    searchInput.addEventListener('input', function() {
      const query = this.value.trim();

      // Toggle clear button visibility
      if (query.length > 0) {
        clearBtn.classList.add('active');
      } else {
        clearBtn.classList.remove('active');
      }

      // Clear previous timer
      clearTimeout(debounceTimer);

      if (query.length < 2) {
        suggestionsList.classList.remove('active');
        suggestionsList.innerHTML = '';
        return;
      }

      // Debounce API calls
      debounceTimer = setTimeout(() => {
        fetchSuggestions(query);
      }, 100);
    });

    // Clear button functionality
    clearBtn.addEventListener('click', function() {
      searchInput.value = '';
      clearBtn.classList.remove('active');
      suggestionsList.classList.remove('active');
      suggestionsList.innerHTML = '';
      searchInput.focus();
    });

    function fetchSuggestions(query) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`)
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

          // Trigger search with selected suggestion
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

    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.classList.remove('active');
      }
    });

    // Perform search function
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
        radius: 1000,
      }).addTo(map);

      userMarker = L.marker([lat, lng], {
        icon: bluePin,
      }).addTo(map);
      userMarker.bindPopup(`<strong>Searched Location</strong><br>${displayName}`).openPopup();

      map.setView([lat, lng], 14);
      userLocation = { lat: lat, lng: lng };
      displayMosques(lat, lng);
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
              radius: 1000,
            }).addTo(map);

            userMarker = L.marker([userLocation.lat, userLocation.lng], {
              icon: bluePin,
            }).addTo(map);
            userMarker.bindPopup("<strong>Your Location</strong>").openPopup();

            map.setView([userLocation.lat, userLocation.lng], 14);
            displayMosques(userLocation.lat, userLocation.lng);

            statusMsg.textContent = "Location found! Showing nearby mosques within 1 km.";
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
        // Close suggestions and search
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

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
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