// // Mosque locations


// const mosqueLocations = [

//      { lat: 23.7330997, lng: 90.3840055, name: "ঢাকা নিউ মার্কেট বায়তুল আমান জামে মসজিদ" },
//      { lat: 23.7384379, lng: 90.3891563, name: "কাটাবন মসজিদ" },
//      { lat: 23.7294178, lng: 90.4127594, name: "বায়তুল মোকাররম জাতীয় মসজিদ" },
//      { lat: 23.7381504, lng: 90.3685832, name: "Shimanto Square Rooftop Jame Mosque" },
//      { lat: 23.7368804, lng: 90.3864357, name: "ইস্টার্ন মল্লিকা শপিং কমপ্লেক্স (ছাদে)" },
//      { lat: 23.734676, lng: 90.39474, name: "ঢাকা বিশ্ববিদ্যালয় কেন্দ্রীয় জামে মসজিদ" },
//      { lat: 23.8742161, lng: 90.3995441, name: "North Tower (Market) 8th floor, Uttara House Building" },
//      { lat: 23.745376, lng: 90.3679045, name: "Ibn Sina Diagnostic and Imaging Center (Basement)" },
//      { lat: 23.7511665, lng: 90.3906431, name: "বসুন্ধরা শপিং কমপ্লেক্স (Level 4, Western Part of the mall)" },
//      { lat: 23.745376, lng: 90.3679045, name: "টুইন টাওয়ার শপিং সেন্টার (৪র্থ তলা)" },
//      { lat: 23.733941, lng: 90.3831743, name: "চাঁদনি চকের ৩য় তলায় (নিউমার্কেটের উল্টোদিকে)" },
//      { lat: 23.7528438, lng: 90.3793711, name: "স্কয়ার হসপিটাল" },
//      { lat: 23.7455451, lng: 90.4056452, name: "রমনা থানা জামে মসজিদ" },
//      { lat: 23.762141, lng: 90.331442, name: "আল-আমিন জামে মসজিদ (শাহজাহান রোড)" },
//      { lat: 23.8046453, lng: 90.2756757, name: "ইউনাইটেড হাসপাতাল লিমিটেড" },
//      { lat: 23.7364024, lng: 90.3800207, name: "নায়েম জামে মসজিদ" },
//      { lat: 23.7442267, lng: 90.3700607, name: "বায়তুল আমান মসজিদ (ধানমন্ডি ৮)" },
//      { lat: 23.7554966, lng: 90.3731674, name: "জেনেটিক প্লাজা ১ম তলা (ধানমন্ডি ২৭)" },
//      { lat: 23.745608, lng: 90.411977, name: "মৌচাক মার্কেট (৪র্থ তলা)" },
//      { lat: 23.7386662, lng: 90.3828502, name: "বায়তুল মা'মুর মসজিদ, সায়েন্সল্যাব (২য় তলা)" },
//      { lat: 23.8023381, lng: 90.4023117, name: "Bangladesh Navy Headquarters Mosque" },
//      { lat: 23.7937869, lng: 90.4126031, name: "গুলশান ২ ডিসিসি সুপার মার্কেট" },
//      { lat: 23.8007575, lng: 90.405201, name: "গুলশান সোসাইটি জামে মসজিদ" },
//      { lat: 23.7637473, lng: 90.3852519, name: "উত্তর মণিপুরী পাড়া জামে মসজিদ" },
//      { lat: 23.7415845, lng: 90.4078696, name: "Capital Siraj Centre (Bailey Road)" },
//      { lat: 23.7388837, lng: 90.4031417, name: "Circuit House Jame Mosque" },
//      { lat: 23.7387333, lng: 90.411505, name: "Masjid As Siddique Complex, Shantinagar" },
//      { lat: 23.7390265, lng: 90.4123732, name: "Eastern Plus Shopping Complex" },
//      { lat: 23.7503749, lng: 90.3721352, name: "মসজিদ-উত-তাকওয়া" },
//      { lat: 23.7996102, lng: 90.4455599, name: "Masjid Al Mustafa" },
//      { lat: 22.2816046, lng: 91.7886261, name: "বিএনএস ঈশা খান মসজিদ" },
//      { lat: 23.7806962, lng: 90.4079559, name: "মসজিদে গাউসুল আজম" },
//      { lat: 23.8695983, lng: 90.3977706, name: "Uttara 7 No Sector Jame Mosjid" },
//      { lat: 23.8617235, lng: 90.4030247, name: "Uttara 4 No Sector Jame Mosjid" },
//      { lat: 23.756045, lng: 90.3725928, name: "Rapa Plaza (5th floor)" },
//      { lat: 23.8135411, lng: 90.4194757, name: "যমুনা ফিউচার পার্ক (Level-5)" },
//      { lat: 23.7432458, lng: 90.4051305, name: "মনোয়ারা হসপিটাল (প্রা:) লিমিটেড (বেইলী রোড)" },
//      { lat: 24.7610107, lng: 90.4062004, name: "গোলপুকুর পাড় আহলে হাদীস জামে মসজিদ" },
//      { lat: 23.8642761, lng: 90.3937878, name: "মসজিদ আল-মাগফিরাহ" },
//      { lat: 23.8108299, lng: 90.3638027, name: "মাদ্রাসায়ে দারুল উলুম জামে মাসজিদ" },
//      { lat: 23.7351315, lng: 90.3844759, name: "Nurjahan Super Market (4th Floor)" },
//      { lat: 23.8757843, lng: 90.3905213, name: "Uttara Sector 11 Baitun Nur Jame Masjid" },
//      { lat: 23.8734465, lng: 90.3790575, name: "Baitun Noor Jaame Masjid" },
//      { lat: 23.7804734, lng: 90.4090101, name: "Female Prayer Hall, Masjid-e-Gausul Azam" },
//      { lat: 24.7427573, lng: 90.4039432, name: "কাজী নাজিমুদ্দিন আহলেহাদীছ জামে মসজিদ" },
//      { lat: 22.2457031, lng: 91.8121038, name: "Shah Amanat International Airport" },
//      { lat: 22.327246, lng: 91.8077981, name: "Lucky Plaza (5th Floor)" },
//      { lat: 22.3485518, lng: 91.8227226, name: "VIP Tower" },
//      { lat: 22.363333, lng: 91.8357196, name: "পার্কভিউ হসপিটাল লিমিটেড" },
//      { lat: 22.3593115, lng: 91.8238642, name: "Blue View Healthcare Ltd" },
//      { lat: 22.3611729, lng: 91.8271077, name: "মিমি সুপার মার্কেট" },
//      { lat: 22.3411767, lng: 91.8366974, name: "আন্দরকিল্লা শাহী জামে মসজিদ" },
//      { lat: 22.3568482, lng: 91.82471, name: "Mehedibag CDA Jame Mosque" },
//      { lat: 22.3617259, lng: 91.8271378, name: "Afmi Plaza (Top Floor)" },
//      { lat: 22.2353771, lng: 91.7927707, name: "Patenga Sea Beach Hazrat Khoaz Khizir Jaame Masjid" },
//      { lat: 22.3620433, lng: 91.8217946, name: "Sanmar Ocean City" },
//      { lat: 22.3371614, lng: 91.8308592, name: "Golam Rasul Market (4th floor)" },
//      { lat: 22.3400747, lng: 91.8398454, name: "ইসলামী ব্যাংক লিমিটেড (Teribazar)" },
//      { lat: 22.3272985, lng: 91.8125538, name: "Akhtaruzzaman Center (Ground floor)" },
//      { lat: 22.3429126, lng: 91.8345002, name: "Kadam Mobarak Shahi Jame Masjid" },
//      { lat: 22.3478123, lng: 91.8194247, name: "Ameen Center (2nd floor)" },
//      { lat: 22.3570752, lng: 91.8374316, name: "Bali Arcade" },
//      { lat: 22.3578816, lng: 91.8373068, name: "Moti Complex (3rd floor)" },
//      { lat: 22.3677924, lng: 91.8317302, name: "Mosjide Belal" },
//      { lat: 22.3346994, lng: 91.83275, name: "Baitul Ikram Jame Mosque" },
//      { lat: 23.7733537, lng: 90.3913189, name: "Shaheenbag Kendrio Boro Masjid" },
//      { lat: 23.7607185, lng: 90.4404913, name: "Hazi Noorbanu Jame Mosjid" },
//      { lat: 23.7828226, lng: 90.3935689, name: "Mohakhali DOHS Mosque" },
//      { lat: 23.7667828, lng: 90.4440343, name: "আল আকসা জামে মসজিদ" },
//      { lat: 23.8228731, lng: 90.3906175, name: "ASW Mega Food Park, ECB Chottor" },
//      { lat: 22.351114, lng: 91.8299907, name: "Bangladesh Petroleum Corporation Jame Mosque" },
//      { lat: 23.8009571, lng: 90.4514271, name: "Masjid Al Mustafa" },
//      { lat: 23.7174756, lng: 90.4059408, name: "PeyalaWala Jame Masjid ~ Bangshal" },
//      { lat: 23.7173601, lng: 90.4203193, name: "Rajdhani Super Market" },
//      { lat: 23.7941634, lng: 90.3510566, name: "জামিউল ফাত্তাহ সাদা মাজার মসজিদ" },
//      { lat: 23.7446139, lng: 90.4115303, name: "Anarkoli Super Market (5th floor)" },
//      { lat: 23.7463096, lng: 90.4121631, name: "Fortune Shopping Mal (Top floor)" },
//      { lat: 23.7625246, lng: 90.4362479, name: "Farazy Hospital Limited - Banasree" },
//      { lat: 23.80676, lng: 90.368966, name: "Shah Ali Plaza, Mirpur-10" },
//      { lat: 23.8294917, lng: 90.4194361, name: "Rajuk Trade Centre Mall (Top floor)" },
//      { lat: 23.1656775, lng: 89.2080697, name: "Collectorate Mosque" },
//      { lat: 23.8684861, lng: 90.3885656, name: "Baitul Aman Jame Masjid, Uttara Sector 14" },





// ];



// let mosqueLocations = [];
// // Load from Firebase
// import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
// import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
// const firebaseConfig = {
//   apiKey: "AIzaSyALo1YQ2M1GeoH9mORVV7dYSOl2FSCTc84",
//   authDomain: "herprayerplace.firebaseapp.com",
//   projectId: "herprayerplace",
//   storageBucket: "herprayerplace.firebasestorage.app",
//   messagingSenderId: "956020903317",
//   appId: "1:956020903317:web:030c848fbaa10d3e86ba9c"
// };
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// async function loadMosques() {
//   try {
//     const querySnapshot = await getDocs(collection(db, 'mosques'));
//     mosqueLocations = [];
//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       mosqueLocations.push({
//         name: data.name,
//         lat: data.lat,
//         lng: data.lng
//       });
//     });
//     displayMosques();
//   } catch (error) {
//     console.error('Error loading mosques:', error);
//   }
// }
// loadMosques();