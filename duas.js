// Collection of Duas from Quran and Hadith
const duas = [
     { text: "Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing.", reference: "Quran 2:127" },
     { text: "Our Lord, and make us Muslims [in submission] to You and from our descendants a Muslim nation [in submission] to You. And show us our rites [of worship] and accept our repentance. Indeed, You are the Accepting of Repentance, the Merciful.", reference: "Quran 2:128" },
     { text: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.", reference: "Quran 2:201" },
     { text: "Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.", reference: "Quran 2:250" },
     { text: "Our Lord, do not impose blame upon us if we have forgotten or erred.", reference: "Quran 2:286" },
     { text: "Our Lord, and lay not upon us a burden like that which You laid upon those before us.", reference: "Quran 2:286" },
     { text: "Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people.", reference: "Quran 2:286" },
     { text: "Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.", reference: "Quran 3:8" },
     { text: "Our Lord, surely You will gather the people for a Day about which there is no doubt. Indeed, Allah does not fail in His promise.", reference: "Quran 3:9" },
     { text: "Our Lord, indeed we have believed, so forgive us our sins and protect us from the punishment of the Fire.", reference: "Quran 3:16" },
     { text: "Our Lord, we have believed in what You revealed and have followed the messenger, so register us among the witnesses.", reference: "Quran 3:53" },
     { text: "Our Lord, forgive us our sins and the excess [committed] in our affairs and plant firmly our feet and give us victory over the disbelieving people.", reference: "Quran 3:147" },
     { text: "Our Lord, You did not create this aimlessly; exalted are You; then protect us from the punishment of the Fire.", reference: "Quran 3:191" },
     { text: "Our Lord, indeed whoever You admit to the Fire – You have disgraced him, and for the wrongdoers there are no helpers.", reference: "Quran 3:192" },
     { text: "Our Lord, indeed we have heard a caller calling to faith, [saying], 'Believe in your Lord,' and we have believed.", reference: "Quran 3:193" },
     { text: "Our Lord, so forgive us our sins and remove from us our misdeeds and cause us to die among the righteous.", reference: "Quran 3:193" },
     { text: "Our Lord, and grant us what You promised us through Your messengers and do not disgrace us on the Day of Resurrection. Indeed, You do not fail in [Your] promise.", reference: "Quran 3:194" },
     { text: "Our Lord, we have believed, so register us among the witnesses.", reference: "Quran 5:83" },
     { text: "Our Lord, send down to us a table [spread with food] from the heaven to be for us a festival for the first of us and the last of us and a sign from You. And provide for us, and You are the best of providers.", reference: "Quran 5:114" },
     { text: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.", reference: "Quran 7:23" },
     { text: "Our Lord, do not place us with the wrongdoing people.", reference: "Quran 7:47" },
     { text: "Our Lord, decide between us and our people in truth, and You are the best of those who give decision.", reference: "Quran 7:89" },
     { text: "Our Lord, pour upon us patience and let us die as Muslims [in submission to You].", reference: "Quran 7:126" },
     { text: "Our Lord, make us not [objects of] trial for the wrongdoing people. And save us by Your mercy from the disbelieving people.", reference: "Quran 10:85–86" },
     { text: "Our Lord, indeed You know what we conceal and what we declare, and nothing is hidden from Allah on the earth or in the heaven.", reference: "Quran 14:38" },
     { text: "My Lord, make me an establisher of prayer, and [many] from my descendants. Our Lord, and accept my supplication.", reference: "Quran 14:40" },
     { text: "Our Lord, forgive me and my parents and the believers the Day the account is established.", reference: "Quran 14:41" },
     { text: "Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.", reference: "Quran 18:10" },
     { text: "Our Lord, indeed we are afraid that he will hasten [punishment] against us or that he will transgress.", reference: "Quran 20:45" },
     { text: "Our Lord, we have believed, so forgive us and have mercy upon us, and You are the best of the merciful.", reference: "Quran 23:109" },
     { text: "Our Lord, avert from us the punishment of Hell. Indeed, its punishment is ever adhering; Indeed, it is evil as a settlement and residence.", reference: "Quran 25:65–66" },
     { text: "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us a leader for the righteous.", reference: "Quran 25:74" },
     { text: "Our Lord is Forgiving and Appreciative.", reference: "Quran 35:34" },
     { text: "Our Lord, You have encompassed all things in mercy and knowledge, so forgive those who have repented and followed Your way and protect them from the punishment of Hellfire.", reference: "Quran 40:7" },
     { text: "Our Lord, and admit them to gardens of perpetual residence which You have promised them and whoever was righteous among their forefathers, their spouses and their offspring. Indeed, it is You who is the Exalted in Might, the Wise. And protect them from the evil consequences [of their deeds].", reference: "Quran 40:8–9" },
     { text: "Our Lord, forgive us and our brothers who preceded us in faith and put not in our hearts [any] resentment toward those who have believed.", reference: "Quran 59:10" },
     { text: "Our Lord, indeed You are Kind and Merciful.", reference: "Quran 59:10" },
     { text: "Our Lord, upon You we have relied, and to You we have returned, and to You is the destination.", reference: "Quran 60:4" },
     { text: "Our Lord, make us not [objects of] torment for the disbelievers and forgive us, our Lord. Indeed, You are the Exalted in Might, the Wise.", reference: "Quran 60:5" },
     { text: "Our Lord, perfect for us our light and forgive us. Indeed, You are over all things competent.", reference: "Quran 66:8" }
];


// Keep track of shown duas to avoid immediate repeats
let shownDuas = [];

// Function to get a random dua (avoiding recent repeats)
function getRandomDua() {
     // Reset if all duas have been shown
     if (shownDuas.length >= duas.length) {
          shownDuas = [];
     }

     // Get available duas
     const availableDuas = duas.filter((_, index) => !shownDuas.includes(index));

     // Pick random from available
     const randomIndex = Math.floor(Math.random() * availableDuas.length);
     const selectedDua = availableDuas[randomIndex];

     // Mark as shown
     const originalIndex = duas.indexOf(selectedDua);
     shownDuas.push(originalIndex);

     return selectedDua;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
     module.exports = { duas, getRandomDua };
}