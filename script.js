const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const micBtn = document.getElementById("micBtn");

/* ================= UTILS ================= */

function isAndroid() {
  return typeof Android !== "undefined";
}

function scrollToBottom() {
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 100);
}

/* ================= CHAT SAVE ================= */

function saveChat() {
  if (isAndroid()) {
    Android.saveChat(chatBox.innerHTML);
  } else {
    localStorage.setItem("chatHistory", chatBox.innerHTML);
  }
}


window.onload = ()=>{
  if(window.Android){
    chatBox.innerHTML = Android.loadChat();
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
  if (isAndroid()) {
    Android.clearChat();
  } else {
    localStorage.removeItem("chatHistory");
  }
  chatBox.innerHTML = "";
  showServiceOptions();
}


if(window.Android){
  const user = Android.getUsername();
  document.getElementById("welcome").innerText =
    "Namaste " + user;
}



/* ================= TTS (BOT SPEAK) ================= */

function speakBot(text) {
  if (isAndroid()) {
    Android.speak(text + "। कृपया किसी अन्य जानकारी के लिए बताएं।");
    return;
  }

  if (!window.speechSynthesis) return;

  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(
    text + "। कृपया किसी अन्य जानकारी के लिए बताएं।"
  );
  utter.lang = "hi-IN";
  utter.rate = 0.95;

  const voices = speechSynthesis.getVoices();
  const hindi = voices.find(v => v.lang === "hi-IN");
  if (hindi) utter.voice = hindi;

  speechSynthesis.speak(utter);
}

/* ================= VOICE INPUT ================= */

let recognition;
let isListening = false;

if (!isAndroid() && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "hi-IN";

  recognition.onstart = () => {
    isListening = true;
    micBtn.innerText = "⏹️";
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.innerText = "🎤";
  };

  recognition.onerror = () => {
    alert("🎤 Voice input error");
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

// Android → JS
window.receiveVoiceInput = function (text) {
  input.value = text;
  sendMessage();
};

/* ================= SERVICES ================= */

const allServices = [
  "Income Certificate","Caste Certificate","Domicile Certificate","PAN Card",
  "Driving Licence","Aadhaar Card","Scholarship","Pension","Ration Card",
  "Birth Certificate","Death Certificate","Voter ID","Passport",
  "Marriage Certificate","Disability Certificate"
];

let serviceIndex = 0;

function showServiceOptions() {
  const div = document.createElement("div");
  div.className = "bot-msg";

  let html = "<b>👇 Aap kya banwana chahte hain?</b><br><br>";
  allServices.slice(serviceIndex, serviceIndex + 5).forEach(s => {
    html += `<button class="option-btn" onclick="selectService('${s}')">${s}</button>`;
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

/* ================= CHAT ================= */

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const user = document.createElement("div");
  user.className = "user-msg";
  user.innerText = text;
  chatBox.appendChild(user);
  input.value = "";
  scrollToBottom();

  const response = await fetch(
    "https://nagrikai-backend-production.up.railway.app/api/ai/ask",
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

  const bot = document.createElement("div");
  bot.className = "bot-msg";

  let html = `<b>${data.reply}</b>`;

  if (data.documents) {
    html += "<br><br><b>📄 Required Documents:</b><ul>";
    data.documents.forEach(d => html += `<li>${d}</li>`);
    html += "</ul>";
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

/* ================= INIT ================= */

window.onload = () => {
  loadChat();
  if (!chatBox.innerHTML.trim()) {
    showServiceOptions();
  }
};

input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});


// 🔥 AUTO SAVE WHEN USER LEAVES / BACKGROUND
window.addEventListener("beforeunload", () => {
  saveChat();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveChat();
  }
});



/* ================= TTS CONTROL (ADD) ================= */

// Android TTS pause
function pauseTts() {
  if (isAndroid()) {
    Android.pauseTts();
  } else if (window.speechSynthesis) {
    speechSynthesis.pause();
  }
}

// Android TTS resume
function resumeTts() {
  if (isAndroid()) {
    Android.resumeTts();
  } else if (window.speechSynthesis) {
    speechSynthesis.resume();
  }
}

/* ================= BOT UI WITH CONTROLS ================= */

// override bot speak UI safely
function appendBotMessage(htmlText, plainTextForVoice) {
  const bot = document.createElement("div");
  bot.className = "bot-msg";

  bot.innerHTML = `
    <div class="tts-bar">
      <button onclick="pauseTts()">⏸</button>
      <button onclick="resumeTts()">▶</button>
    </div>
    <div class="bot-text">${htmlText}</div>
  `;

  chatBox.appendChild(bot);
  scrollToBottom();
  saveChat();
  speakBot(plainTextForVoice);
}

/* ================= CLEAR FIX ================= */

const _clearChat = clearChat; // backup

clearChat = function () {
  serviceIndex = 0;              // 🔥 RESET SERVICES
  _clearChat();                  // existing clear
  showServiceOptions();          // show options again
};



