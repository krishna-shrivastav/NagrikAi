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
  if (isAndroid()) Android.saveChat(chatBox.innerHTML);
  else localStorage.setItem("chatHistory", chatBox.innerHTML);
}

function loadChat() {
  const saved = isAndroid()
    ? Android.loadChat()
    : localStorage.getItem("chatHistory");
  if (saved) chatBox.innerHTML = saved;
}

function clearChat() {
  if (isAndroid()) Android.clearChat();
  else localStorage.removeItem("chatHistory");
  chatBox.innerHTML = "";
}

/* ================= USER ================= */

if (window.Android) {
  document.getElementById("welcome").innerText =
    "Namaste " + Android.getUsername();
}

/* ================= TTS ================= */

let currentUtterance = null;

function speakBot(text) {
  const finalText = text + "। कृपया किसी अन्य जानकारी के लिए बताएं।";

  if (isAndroid()) {
    Android.speak(finalText);
    return;
  }

  speechSynthesis.cancel();
  currentUtterance = new SpeechSynthesisUtterance(finalText);
  currentUtterance.lang = "hi-IN";
  currentUtterance.rate = 0.95;
  speechSynthesis.speak(currentUtterance);
}

function pauseTts() {
  isAndroid() ? Android.pauseTts() : speechSynthesis.pause();
}

function resumeTts() {
  isAndroid() ? Android.resumeTts() : speechSynthesis.resume();
}

/* ================= VOICE INPUT + TRACKER ================= */

let recognition;
let isListening = false;

const voiceTracker = document.createElement("div");
voiceTracker.innerText = "🎧 Listening...";
voiceTracker.style.display = "none";
voiceTracker.style.fontSize = "12px";
voiceTracker.style.color = "green";
micBtn.after(voiceTracker);

if (!isAndroid() && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "hi-IN";

  recognition.onstart = () => {
    isListening = true;
    micBtn.innerText = "⏹️";
    voiceTracker.style.display = "block";
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.innerText = "🎤";
    voiceTracker.style.display = "none";
  };

  recognition.onresult = e => {
    input.value = e.results[0][0].transcript;
    sendMessage();
  };
}

micBtn.onclick = () => {
  if (isAndroid()) Android.startMic();
  else if (recognition) isListening ? recognition.stop() : recognition.start();
};

window.receiveVoiceInput = text => {
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
let currentService = "";

function showServiceOptions() {
  const bot = document.createElement("div");
  bot.className = "bot-msg";

  let html = "<b>👇 Aap kaunsa service chahte hain?</b><br><br>";

  allServices.slice(serviceIndex, serviceIndex + 5).forEach(s => {
    html += `<button class="option-btn" onclick="selectService('${s}')">${s}</button>`;
  });

  if (serviceIndex + 5 < allServices.length) {
    html += `<br><button class="option-btn other-btn" onclick="showMoreServices()">Other Services</button>`;
  }

  bot.innerHTML = html;
  chatBox.appendChild(bot);
  scrollToBottom();
}

function showMoreServices() {
  serviceIndex += 5;
  showServiceOptions();
}

function selectService(service) {
  currentService = service;
  input.value = service;
  sendMessage();
}

/* ================= PROGRESS TRACKER ================= */

function showProgressTracker() {
  const tracker = document.createElement("div");
  tracker.className = "progress-tracker";
  tracker.innerHTML = `
    <div id="step1">✔ Service Selected</div>
    <div id="step2">⏳ Documents</div>
    <div id="step3">⏳ Application</div>
    <div id="step4">⏳ Status Tracking</div>
  `;
  chatBox.appendChild(tracker);
  scrollToBottom();
}

function updateProgress(step) {
  const el = document.getElementById(step);
  if (el) el.innerText = "✔ " + el.innerText.replace("⏳", "").replace("✔", "");
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

  if (text === currentService) {
    showProgressTracker();
  }

  const res = await fetch(
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

  const data = await res.json();

  appendBotMessage(`<b>${data.reply}</b>`, data.reply);

  if (data.documents) updateProgress("step2");
  if (data.link) updateProgress("step3");

  saveChat();
}

/* ================= BOT MESSAGE ================= */

function appendBotMessage(html, voice) {
  const bot = document.createElement("div");
  bot.className = "bot-msg";

  bot.innerHTML = `
    <div class="tts-bar">
      <button onclick="pauseTts()">⏸</button>
      <button onclick="resumeTts()">▶</button>
    </div>
    <div class="bot-text">${html}</div>
  `;

  chatBox.appendChild(bot);
  scrollToBottom();
  speakBot(voice);
}

/* ================= INIT ================= */

window.onload = () => {
  loadChat();
  if (!chatBox.innerHTML.trim()) showServiceOptions();
};

/* ================= AUTO SAVE ================= */

window.addEventListener("beforeunload", saveChat);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveChat();
});

/* ================= CLEAR FIX ================= */

const _clearChat = clearChat;
clearChat = function () {
  serviceIndex = 0;
  currentService = "";
  _clearChat();
  showServiceOptions();
};
