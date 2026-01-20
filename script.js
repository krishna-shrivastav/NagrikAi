/* =========================================================
   NAGRIKAI – FINAL SCRIPT.JS (ANDROID + WEB SAFE)
   ========================================================= */

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
  showServiceOptions();
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
    text + "। कृपया किसी अन्य जानकारी के लिए बताएं।";

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
  recognition.lang = "hi-IN";
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

// AUTO SAVE (background / exit)
window.addEventListener("beforeunload", saveChat);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveChat();
});

