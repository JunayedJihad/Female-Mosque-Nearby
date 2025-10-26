// prayerTimes.js - Prayer Times API Service
const API_URL = 'https://api.aladhan.com/v1/timings';

/**
 * Fetch prayer times using Hanafi calculation method
 */
async function getPrayerTimes(latitude, longitude, date = new Date()) {
  try {
    const timestamp = Math.floor(date.getTime() / 1000);

    // Hanafi Method Parameters:
    // method=1 (University of Islamic Sciences, Karachi - used in Bangladesh)
    // school=1 (Hanafi jurisprudence for Asr time)
    const url = `${API_URL}/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=1&school=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 200 && data.data) {
      const timings = data.data.timings;
      const date = data.data.date.readable;

      return {
        success: true,
        date: date,
        hijriDate: await getHijriDate(data.data.date.hijri),
        timings: {
          fajr: timings.Fajr,
          sunrise: timings.Sunrise,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
        },
        nextPrayer: await getNextPrayer(timings, latitude, longitude),
      };
    }

    return { success: false, error: 'Invalid response' };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get next prayer and time remaining
 */
async function getNextPrayer(timings, latitude, longitude) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: 'Fajr', time: timings.Fajr },
    { name: 'Dhuhr', time: timings.Dhuhr },
    { name: 'Asr', time: timings.Asr },
    { name: 'Maghrib', time: timings.Maghrib },
    { name: 'Isha', time: timings.Isha },
  ];

  // Check if any prayer is remaining today
  for (let prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;

    if (prayerTime > currentTime) {
      const timeRemaining = prayerTime - currentTime;
      const hoursLeft = Math.floor(timeRemaining / 60);
      const minutesLeft = timeRemaining % 60;

      return {
        name: prayer.name,
        time: prayer.time,
        timeRemaining: {
          hours: hoursLeft,
          minutes: minutesLeft,
          total: timeRemaining,
        },
        formatted: hoursLeft > 0
          ? `${hoursLeft}h ${minutesLeft}m`
          : `${minutesLeft}m`,
        tomorrow: false,
      };
    }
  }

  // If no prayer remaining today, fetch tomorrow's Fajr
  try {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = Math.floor(tomorrow.getTime() / 1000);

    const url = `${API_URL}/${tomorrowTimestamp}?latitude=${latitude}&longitude=${longitude}&method=1&school=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 200 && data.data) {
      const tomorrowFajr = data.data.timings.Fajr;
      const [fajrHours, fajrMinutes] = tomorrowFajr.split(':').map(Number);

      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const minutesUntilMidnight = (24 * 60) - nowMinutes;
      const minutesAfterMidnight = fajrHours * 60 + fajrMinutes;
      const totalTimeRemaining = minutesUntilMidnight + minutesAfterMidnight;

      const hoursLeft = Math.floor(totalTimeRemaining / 60);
      const minutesLeft = totalTimeRemaining % 60;

      return {
        name: 'Fajr',
        time: tomorrowFajr,
        timeRemaining: {
          hours: hoursLeft,
          minutes: minutesLeft,
          total: totalTimeRemaining,
        },
        formatted: hoursLeft > 0
          ? `${hoursLeft}h ${minutesLeft}m`
          : `${minutesLeft}m`,
        tomorrow: true,
      };
    }
  } catch (error) {
    console.error('Error fetching tomorrow\'s Fajr:', error);
  }

  return {
    name: 'Fajr',
    time: timings.Fajr,
    tomorrow: true,
    timeRemaining: null,
  };
}

/**
 * Convert 24-hour to 12-hour format
 */
function formatTime12Hour(time24) {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  return `${hour12}:${minutes} ${period}`;
}

/**
 * Get prayer status with countdown
 */
function getPrayerStatus(timings) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();

  const [fajrH, fajrM] = timings.fajr.split(':').map(Number);
  const [sunriseH, sunriseM] = timings.sunrise.split(':').map(Number);
  const [dhuhrH, dhuhrM] = timings.dhuhr.split(':').map(Number);
  const [asrH, asrM] = timings.asr.split(':').map(Number);
  const [maghribH, maghribM] = timings.maghrib.split(':').map(Number);
  const [ishaH, ishaM] = timings.isha.split(':').map(Number);

  const fajrStart = fajrH * 60 + fajrM;
  const sunriseTime = sunriseH * 60 + sunriseM;
  const dhuhrStart = dhuhrH * 60 + dhuhrM;
  const asrStart = asrH * 60 + asrM;
  const maghribStart = maghribH * 60 + maghribM;
  const ishaStart = ishaH * 60 + ishaM;

  // Fajr Prayer (from Fajr to Sunrise)
  if (currentMinutes >= fajrStart && currentMinutes < sunriseTime) {
    const remaining = sunriseTime - currentMinutes;
    const hours = Math.floor(remaining / 60);
    const mins = remaining % 60;
    const secs = 60 - currentSeconds;
    const totalDuration = sunriseTime - fajrStart;
    const progress = (remaining / totalDuration) * 100;

    return {
      type: 'prayer',
      name: 'Fajr',
      label: 'Fajr Prayer',
      startTime: timings.fajr,
      endTime: timings.sunrise,
      remaining: { hours, minutes: mins, seconds: secs },
      formatted: hours > 0 ?
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}` :
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      progress
    };
  }

  // Between Sunrise and Dhuhr
  if (currentMinutes >= sunriseTime && currentMinutes < dhuhrStart) {
    const remaining = dhuhrStart - currentMinutes;
    const hours = Math.floor(remaining / 60);
    const mins = remaining % 60;
    const secs = 60 - currentSeconds;

    return {
      type: 'upcoming',
      name: 'Dhuhr',
      label: 'Upcoming Dhuhr in',
      startTime: timings.dhuhr,
      endTime: timings.asr,
      remaining: { hours, minutes: mins, seconds: secs },
      formatted: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      progress: 0
    };
  }

  // Dhuhr Prayer
  if (currentMinutes >= dhuhrStart && currentMinutes < asrStart) {
    const remaining = asrStart - currentMinutes;
    const hours = Math.floor(remaining / 60);
    const mins = remaining % 60;
    const secs = 60 - currentSeconds;
    const totalDuration = asrStart - dhuhrStart;
    const progress = (remaining / totalDuration) * 100;

    return {
      type: 'prayer',
      name: 'Dhuhr',
      label: 'Dhuhr Prayer',
      startTime: timings.dhuhr,
      endTime: timings.asr,
      remaining: { hours, minutes: mins, seconds: secs },
      formatted: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      progress
    };
  }

  // Asr Prayer
  if (currentMinutes >= asrStart && currentMinutes < maghribStart) {
    const remaining = maghribStart - currentMinutes;
    const hours = Math.floor(remaining / 60);
    const mins = remaining % 60;
    const secs = 60 - currentSeconds;
    const totalDuration = maghribStart - asrStart;
    const progress = (remaining / totalDuration) * 100;

    return {
      type: 'prayer',
      name: 'Asr',
      label: 'Asr Prayer',
      startTime: timings.asr,
      endTime: timings.maghrib,
      remaining: { hours, minutes: mins, seconds: secs },
      formatted: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      progress
    };
  }

  // Maghrib Prayer
  if (currentMinutes >= maghribStart && currentMinutes < ishaStart) {
    const remaining = ishaStart - currentMinutes;
    const hours = Math.floor(remaining / 60);
    const mins = remaining % 60;
    const secs = 60 - currentSeconds;
    const totalDuration = ishaStart - maghribStart;
    const progress = (remaining / totalDuration) * 100;

    return {
      type: 'prayer',
      name: 'Maghrib',
      label: 'Maghrib Prayer',
      startTime: timings.maghrib,
      endTime: timings.isha,
      remaining: { hours, minutes: mins, seconds: secs },
      formatted: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      progress
    };
  }

  // Isha Prayer
  if (currentMinutes >= ishaStart || currentMinutes < fajrStart) {
    let remaining;

    if (currentMinutes >= ishaStart) {
      remaining = (24 * 60) - currentMinutes + fajrStart;
    } else {
      remaining = fajrStart - currentMinutes;
    }

    const hours = Math.floor(remaining / 60);
    const mins = remaining % 60;
    const secs = 60 - currentSeconds;
    const totalDuration = (24 * 60) - ishaStart + fajrStart;
    const progress = (remaining / totalDuration) * 100;

    return {
      type: 'prayer',
      name: 'Isha',
      label: 'Isha Prayer',
      startTime: timings.isha,
      endTime: timings.fajr,
      remaining: { hours, minutes: mins, seconds: secs },
      formatted: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      progress
    };
  }

  return null;
}

/**
 * Get Hijri date - prioritize manual override from Firebase with auto-increment
 */
async function getHijriDate(hijriData) {
  // Try to get manual override from Firebase
  try {
    const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');

    // Initialize Firebase if not already done
    let db;
    if (getApps().length === 0) {
      const firebaseConfig = {
        apiKey: "AIzaSyALo1YQ2M1GeoH9mORVV7dYSOl2FSCTc84",
        authDomain: "herprayerplace.firebaseapp.com",
        projectId: "herprayerplace",
        storageBucket: "herprayerplace.firebasestorage.app",
        messagingSenderId: "956020903317",
        appId: "1:956020903317:web:030c848fbaa10d3e86ba9c"
      };
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } else {
      db = getFirestore();
    }

    const hijriRef = doc(db, 'settings', 'hijriDate');
    const hijriSnap = await getDoc(hijriRef);

    if (hijriSnap.exists()) {
      const data = hijriSnap.data();
      const setDate = new Date(data.updatedAt || data.createdAt);
      const today = new Date();

      // Calculate days difference
      const daysDiff = Math.floor((today - setDate) / (1000 * 60 * 60 * 24));

      // Add days to the Hijri day
      let currentDay = data.day + daysDiff;
      let currentMonth = data.month;
      let currentYear = data.year;

      // Handle month overflow (Islamic months are typically 29-30 days)
      // Simplified: assume 30 days per month for auto-increment
      while (currentDay > 30) {
        currentDay -= 30;

        // Move to next month
        const months = [
          'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
          'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban",
          'Ramadan', 'Shawwal', "Dhu al-Qi'dah", "Dhu al-Hijjah"
        ];

        const currentMonthIndex = months.indexOf(currentMonth);
        if (currentMonthIndex === 11) {
          // New year
          currentMonth = months[0];
          currentYear++;
        } else {
          currentMonth = months[currentMonthIndex + 1];
        }
      }

      return `${currentDay} ${currentMonth} ${currentYear}`;
    }
  } catch (error) {
    console.log('No manual Hijri override found, using API data');
  }

  // Fallback to API data
  if (!hijriData) {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formatter.format(now);
    } catch (error) {
      return 'Hijri Date Unavailable';
    }
  }

  const day = hijriData.day;
  const monthName = hijriData.month.en;
  const year = hijriData.year;

  return `${day} ${monthName} ${year}`;
}

/**
 * Get English date
 */
function getEnglishDate() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[now.getDay()];
  const date = now.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  return `${day}\n${date} ${month} ${year}`;
}

/**
 * Get forbidden prayer times
 */
function getForbiddenTimes(timings) {
  const [sunriseH, sunriseM] = timings.sunrise.split(':').map(Number);
  const [dhuhrH, dhuhrM] = timings.dhuhr.split(':').map(Number);
  const [maghribH, maghribM] = timings.maghrib.split(':').map(Number);

  const formatForbiddenTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return formatTime12Hour(time24);
  };

  return [
    {
      label: 'After Sunrise',
      start: formatTime12Hour(timings.sunrise),
      end: formatForbiddenTime((sunriseH * 60 + sunriseM) + 15)
    },
    {
      label: 'Before Dhuhr',
      start: formatForbiddenTime((dhuhrH * 60 + dhuhrM) - 6),
      end: formatTime12Hour(timings.dhuhr)
    },
    {
      label: 'Before Sunset',
      start: formatForbiddenTime((maghribH * 60 + maghribM) - 15),
      end: formatTime12Hour(timings.maghrib)
    }
  ];
}