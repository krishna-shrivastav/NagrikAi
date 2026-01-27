  
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const micBtn = document.getElementById("micBtn");

// Citizen profile
const age = document.getElementById("age");
const category = document.getElementById("category");
const occupation = document.getElementById("occupation");
const disability = document.getElementById("disability");
const minority = document.getElementById("minority");

// Startup profile
const isStartup = document.getElementById("isStartup");
const registration = document.getElementById("registration");
const sector = document.getElementById("sector");
const founder = document.getElementById("founder");
const stage = document.getElementById("stage");


function addBotMsg(text) {
  const div = document.createElement("div");
  div.className = "bot-msg";
  div.innerText = text;
  chatBox.appendChild(div);
  scrollToBottom();
}


function isRecommendationQuery(text) {
  const keywords = [
    "scheme batao",
    "eligible",
    "mere liye",
    "kaun si scheme",
    "startup scheme",
    "govt scheme",
    "apply kar sakta"
  ];

  return keywords.some(k => text.toLowerCase().includes(k));
}




/* ================= UTILS ================= */

function isAndroid() {
  return typeof Android !== "undefined";
}

function scrollToBottom() {
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 120);
}

/* ================= CHAT SAVE / LOAD ================= */

function saveChat() {
  if (isAndroid()) {
    Android.saveChat(chatBox.innerHTML);
  } else {
    localStorage.setItem("chatHistory", chatBox.innerHTML);
  }
}

function loadChat() {
  let saved = "";
  if (isAndroid()) {
    saved = Android.loadChat();
  } else {
    saved = localStorage.getItem("chatHistory");
  }
  if (saved) chatBox.innerHTML = saved;
}

function clearChat() {
  serviceIndex = 0;
  if (isAndroid()) {
    Android.clearChat();
  } else {
    localStorage.removeItem("chatHistory");
  }
  chatBox.innerHTML = "";
    showMainOptions();
  
    

}



function clearChat() {
  schemeIndex = 0;
  if (isAndroid()) {
    Android.clearChat();
  } else {
    localStorage.removeItem("chatHistory");
  }
  chatBox.innerHTML = "";
  showMainOptions();

}




/* ================= USER NAME ================= */

if (isAndroid()) {
  try {
    const user = Android.getUsername();
    const w = document.getElementById("welcome");
    if (w) w.innerText = "Namaste " + user;
  } catch (e) {}
}

/* ================= TTS (BOT SPEAK) ================= */

function speakBot(text) {
  const finalText =
    text + "। कृपया किसी अन्य जानकारी के लिए बताएं। ";

  if (isAndroid()) {
    Android.speak(finalText);
    return;
  }

  if (!window.speechSynthesis) return;

  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(finalText);
  utter.lang = "hi-IN";
  utter.rate = 0.95;

  const voices = speechSynthesis.getVoices();
  const hindi = voices.find(v => v.lang === "hi-IN");
  if (hindi) utter.voice = hindi;

  speechSynthesis.speak(utter);
}

function pauseTts() {
  if (isAndroid()) Android.pauseTts();
  else if (window.speechSynthesis) speechSynthesis.pause();
}

function resumeTts() {
  if (isAndroid()) Android.resumeTts();
  else if (window.speechSynthesis) speechSynthesis.resume();
}

/* ================= VOICE INPUT ================= */

let recognition = null;
let isListening = false;

if (
  !isAndroid() &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
) {
  const SR =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "IN";
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening = true;
    micBtn.innerText = "⏹️";
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.innerText = "🎤";
  };

  recognition.onresult = e => {
    input.value = e.results[0][0].transcript;
    sendMessage();
  };
}

micBtn.addEventListener("click", () => {
  if (isAndroid()) {
    Android.startMic();
  } else if (recognition) {
    recognition.start();
  } else {
    alert("Voice input supported nahi hai");
  }
});

// Android → JS callback
window.receiveVoiceInput = function (text) {
  input.value = text;
  sendMessage();
};
























/* ================= SERVICES ================= */

const allServices = [
  "Income Certificate",
  "Caste Certificate",
  "Domicile Certificate",
  "PAN Card",
  "Driving Licence",
  "Aadhaar Card",
  "Scholarship",
  "Pension",
  "Ration Card",
  "Birth Certificate",
  "Death Certificate",
  "Voter ID",
  "Passport",
  "Marriage Certificate",
  "Disability Certificate"
];


const allSchemes = [
"Beti Bachao Beti Padhao",
"Mahila E-Haat",
"Atal Pension Yojana",
"Special Intensive Revision (SIR)",
"PM Kisan Samman Nidhi",
"PM Fasal Bima Yojana",
"National Scholarship Portal",
"Ujjwala Yojana",
"Ayushman Bharat"
  ];


const allStartups = [
  "Startup India",
"PM Mudra Yojana",
"Udyam Registration",
"Stand-Up India"
  ];





function showMainOptions() {
  const div = document.createElement("div");
  div.className = "bot-msg";

  div.innerHTML = `
    <b>👇 Aap kya chahte hain?</b><br><br>
    <button class="option-btn" onclick="selectMode('services')">🧾 Government Services</button>
    <button class="option-btn" onclick="selectMode('schemes')">🏛️ Government Schemes</button>
    <button class="option-btn" onclick="selectMode('startup')">🚀 Startup & Entrepreneurs</button>
  `;

  chatBox.appendChild(div);
  scrollToBottom();
}

function selectMode(mode) {
  if (mode === "services") {
    serviceIndex = 0;
    showServiceOptions();
  }

  if (mode === "schemes") {
     schemeIndex = 0;
    showSchemeOptions();
  }

  if (mode === "startup") {
    startupIndex = 0;
    showStartupOptions();
  }
}

let serviceIndex = 0;

function showServiceOptions() {
  const div = document.createElement("div");
  div.className = "bot-msg";

  let html =
    "<b>👇 Aap kya banwana chahte hain?</b><br><br>";

  allServices
    .slice(serviceIndex, serviceIndex + 5)
    .forEach(service => {
      html += `<button class="option-btn" onclick="selectService('${service}')">${service}</button>`;
    });

  if (serviceIndex + 5 < allServices.length) {
    html += `<br><button class="option-btn other-btn" onclick="showMoreServices()">Other Services</button>`;
  }

  div.innerHTML = html;
  chatBox.appendChild(div);
  scrollToBottom();
}

function showMoreServices() {
  serviceIndex += 5;
  showServiceOptions();
}

function selectService(service) {
  input.value = service;
  sendMessage();
}




let schemeIndex = 0;

function showSchemeOptions() {
  const div = document.createElement("div");
  div.className = "bot-msg";

  let html =
    "<b>👇 Aap kya banwana chahte hain?</b><br><br>";

  allSchemes
    .slice(schemeIndex, schemeIndex + 5)
    .forEach(scheme => {
      html += `<button class="option-btn" onclick="selectScheme('${scheme}')">${scheme}</button>`;
    });

  if (schemeIndex + 5 < allSchemes.length) {
    html += `<br><button class="option-btn other-btn" onclick="showMoreSchemes()">Other Schemes</button>`;
  }

  div.innerHTML = html;
  chatBox.appendChild(div);
  scrollToBottom();
}

function showMoreSchemes() {
  schemeIndex += 5;
  showSchemeOptions();
}

function selectScheme(scheme) {
  input.value = scheme;
  sendMessage();
}



let startupIndex = 0;

function showStartupOptions() {
  const div = document.createElement("div");
  div.className = "bot-msg";

  let html =
    "<b>👇 Aap kya banwana chahte hain?</b><br><br>";

  allStartups
    .slice(startupIndex, startupIndex + 5)
    .forEach(startup => {
      html += `<button class="option-btn" onclick="selectStartup('${startup}')">${startup}</button>`;
    });

  if (startupIndex + 5 < allStartups.length) {
    html += `<br><button class="option-btn other-btn" onclick="showMoreStartups()">Other Startups</button>`;
  }

  div.innerHTML = html;
  chatBox.appendChild(div);
  scrollToBottom();
}

function showMoreStartups() {
  startupIndex += 5;
  showStartupOptions();
}

function selectStartup(startup) {
  input.value = startup;
  sendMessage();
}









/* ================= CHAT ================= */

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // USER MESSAGE
  const userDiv = document.createElement("div");
  userDiv.className = "user-msg";
  userDiv.innerText = text;
  chatBox.appendChild(userDiv);
  input.value = "";
  scrollToBottom();






   
  // API CALL
  const response = await fetch(
    "https://nagrikai-backend-production-d94b.up.railway.app/api/ai/ask",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        state: document.getElementById("state").value,
        income: document.getElementById("income").value
      })
    }
  );

  const data = await response.json();

  // BOT MESSAGE
  const bot = document.createElement("div");
  bot.className = "bot-msg";

  let html = `
    <div class="tts-bar">
      <button onclick="pauseTts()">⏸</button>
      <button onclick="resumeTts()">▶</button>
    </div>
    <b>${data.reply}</b>
  `;

  if (data.documents) {
    html += "<br><br><b>📄 Required Documents:</b><ul>";
    data.documents.forEach(d => (html += `<li>${d}</li>`));
    html += "</ul>";
  }

  if (data.steps) {
    const progressBox = document.getElementById("progressBox");
    const progressList = document.getElementById("progressList");

    if (progressBox && progressList) {
      progressBox.style.display = "block";
      progressList.innerHTML = "";
      data.steps.forEach(s => {
        const li = document.createElement("li");
        li.innerHTML = `<input type="checkbox"> ${s.text}`;
        progressList.appendChild(li);
      });
    }
  }

  if (data.link) {
    html += `<br>🔗 <a href="${data.link}" target="_blank">Official Portal</a>`;
  }

  bot.innerHTML = html;
  chatBox.appendChild(bot);
  scrollToBottom();

  saveChat();
  speakBot(data.reply);
}


body: JSON.stringify({
  message: text,
  state: state.value,
  income: income.value,

  age: age.value,
  category: category.value,
  occupation: occupation.value,
  disability: disability.value,
  minority: minority.value,

  isStartup: isStartup.value,
  registration: registration.value,
  sector: sector.value,
  founder: founder.value,
  stage: stage.value
})



/* ================= INIT ================= */

window.onload = () => {
  loadChat();
  if (!chatBox.innerHTML.trim()) {
    showMainOptions();
   
  
  }
};

input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

// AUTO SAVE (background / exit)
window.addEventListener("beforeunload", saveChat);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveChat();
});














