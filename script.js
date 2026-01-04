


const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");

/* ---------------- SERVICE LIST ---------------- */
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


// 📱 Mobile + Desktop auto scroll fix
function scrollToBottom() {
  if (!chatBox) return;

  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 100);
}

let speechUtterance = null;
let isPaused = false;


function botSpeak(text){
  if(window.Android){
    Android.speak(text);
  }
}

function saveChat(){
  if(window.Android){
    Android.saveChat(chatBox.innerHTML);
  }
}

window.onload = ()=>{
  if(window.Android){
    chatBox.innerHTML = Android.loadChat();
  }
}








function speakText(text) {
  if (!window.speechSynthesis) return;

  speechSynthesis.cancel(); // purani voice band

  speechUtterance = new SpeechSynthesisUtterance(text);
  speechUtterance.lang = "hi-IN";
  speechUtterance.rate = 0.95;
  speechUtterance.pitch = 1;

  const voices = speechSynthesis.getVoices();
  const hindiVoice = voices.find(v =>
    v.lang === "hi-IN" || v.name.toLowerCase().includes("hindi")
  );

  if (hindiVoice) speechUtterance.voice = hindiVoice;

  speechSynthesis.speak(speechUtterance);
  isPaused = false;

  updateTtsButton();
}



function toggleSpeech() {
  if (!speechSynthesis.speaking) return;

  if (!isPaused) {
    speechSynthesis.pause();
    isPaused = true;
  } else {
    speechSynthesis.resume();
    isPaused = false;
  }

  updateTtsButton();
}


function updateTtsButton() {
  const btn = document.getElementById("ttsToggleBtn");
  if (!btn) return;

  btn.innerText = isPaused ? "▶" : "⏸";
}


speechSynthesis.cancel();
isPaused = false;
updateTtsButton();




let serviceIndex = 0;

/* ---------------- SERVICE OPTIONS UI ---------------- */

function showServiceOptions() {
  const botDiv = document.createElement("div");
  botDiv.className = "bot-msg";

  let html = "<b>👇 Aap kya banwana chahte hain?</b><br><br>";

  const next = allServices.slice(serviceIndex, serviceIndex + 5);

  next.forEach(service => {
    html += `<button class="option-btn" onclick="selectService('${service}')">${service}</button>`;
  });

  if (serviceIndex + 5 < allServices.length) {
    html += `<br><button class="option-btn other-btn" onclick="showMoreServices()">Other Services</button>`;
  }

  botDiv.innerHTML = html;
  chatBox.appendChild(botDiv);
 scrollToBottom();

}

function showMoreServices() {
  serviceIndex += 5;
  showServiceOptions();
}

function selectService(service) {
  input.value = service;
  sendMessage();
  scrollToBottom();
}



// save chat



function saveChat() {
  const chatBox = document.getElementById("chatBox");
  localStorage.setItem("chatHistory", chatBox.innerHTML);
}

function loadChat() {
  const chatBox = document.getElementById("chatBox");
  const savedChat = localStorage.getItem("chatHistory");
  if (savedChat) {
    chatBox.innerHTML = savedChat;
  }
}

function clearChat() {
  localStorage.removeItem("chatHistory");
  location.reload();
}

/* ---------------- CHAT SEND ---------------- */

async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  // show user message
  const userDiv = document.createElement("div");
  userDiv.className = "user-msg";
  userDiv.innerText = userText;
  chatBox.appendChild(userDiv);
  input.value = "";
scrollToBottom();

  

  // collect profile data
  const state = document.getElementById("state").value;
  const income = document.getElementById("income").value;

  // backend call
  const response = await fetch("https://nagrikai-backend-production.up.railway.app/api/ai/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userText,
      state,
      income
    })
  });

  const data = await response.json();

  // show bot reply
  const botDiv = document.createElement("div");
  botDiv.className = "bot-msg";
let html = ` <button class="tts-btn" onclick="toggleSpeech()">⏸</button>
  <div class="bot-text">
    ${data.reply}
  </div>`;

// DOCUMENTS
if (data.documents) {
  html += "<br><br><b>📄 Required Documents:</b><ul>";
  data.documents.forEach(doc => {
    html += `<li>${doc}</li>`;
  });
  html += "</ul>";
}

// OFFICIAL LINK
if (data.link) {
  html += `<br>🔗 <a href="${data.link}" target="_blank">
    Official Portal
  </a>`;
}

botDiv.innerHTML = html;
chatBox.appendChild(botDiv);
  scrollToBottom();

saveChat();

speakText(data.reply);




  // progress tracker
  if (data.steps) {
    const progressBox = document.getElementById("progressBox");
    const progressList = document.getElementById("progressList");

    progressBox.style.display = "block";
    progressList.innerHTML = "";

    const steps = data.steps.map(s => ({
      text: s.text,
      done: false
    }));

    steps.forEach(step => {
      const li = document.createElement("li");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      li.appendChild(cb);
      li.append(" " + step.text);
      progressList.appendChild(li);
    });
  }
if (data.warnings) {
  html += "<br/><b>⚠ Important Warnings:</b><ul>";
  data.warnings.forEach(w => {
    html += `<li>${w}</li>`;
  });
  html += "</ul>";
}

  chatBox.scrollTop = chatBox.scrollHeight;
}

/* ---------------- ENTER KEY SUPPORT ---------------- */

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});


function speakText(text) {
  if (!window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);

  // Force Hindi India
  utterance.lang = "hi-IN";
  utterance.rate = 0.95;
  utterance.pitch = 1;

  // Best Hindi voice select
  const voices = speechSynthesis.getVoices();
  const hindiVoice = voices.find(v =>
    v.lang === "hi-IN" || v.name.toLowerCase().includes("hindi")
  );

  if (hindiVoice) {
    utterance.voice = hindiVoice;
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}



/* ---------------- INITIAL LOAD ---------------- */

window.onload = () => {
  loadChat();       // 🔥 Purani chat wapas
  showServiceOptions();
};



/* ======================================================
   🎤 VOICE TYPING (SPEECH TO TEXT) – HINDI INDIA
   ====================================================== */

// let recognition;
// let isListening = false;

// const micBtn = document.getElementById("micBtn");
// const userInput = document.getElementById("userInput");

// if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
//   const SpeechRecognition =
//     window.SpeechRecognition || window.webkitSpeechRecognition;

//   recognition = new SpeechRecognition();
//   recognition.lang = "hi-IN"; // 🇮🇳 Hindi (India)
//   recognition.continuous = false;
//   recognition.interimResults = false;

//   // 🎙 Start listening
//   micBtn.addEventListener("click", () => {
//     if (!isListening) {
//       recognition.start();
//       isListening = true;
//       micBtn.innerText = "⏺"; // recording indicator
//       micBtn.style.background = "#dc2626";
//     } else {
//       recognition.stop();
//     }
//   });

//   // 🎧 Result received
//   recognition.onresult = event => {
//     const transcript = event.results[0][0].transcript;
//     userInput.value = transcript;
//   };

//   // 🛑 Stop
//   recognition.onend = () => {
//     isListening = false;
//     micBtn.innerText = "🎤";
//     micBtn.style.background = "#2563eb";
//   };

//   // ❌ Error handling
//   recognition.onerror = event => {
//     console.error("Speech recognition error:", event.error);
//     isListening = false;
//     micBtn.innerText = "🎤";
//     micBtn.style.background = "#2563eb";
//     alert("🎤 Voice input ka access allow karein (browser permission).");
//   };
// } else {
//   micBtn.disabled = true;
//   micBtn.title = "Voice typing supported nahi hai is browser me";
// }


/* ================= VOICE INPUT FIX ================= */

const micBtn = document.getElementById("micBtn");
const inputField = document.getElementById("userInput");

let recognition;
let isListening = false;

// Browser support check
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = "hi-IN"; // ✅ Indian Hindi
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add("listening");
    micBtn.innerText = "⏹️";
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove("listening");
    micBtn.innerText = "🎤";
  };

  recognition.onerror = (e) => {
    console.error("Voice error:", e);
    alert("🎤 Voice input error. Please try again.");
    recognition.stop();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    inputField.value = transcript;
  };

  micBtn.addEventListener("click", () => {
    if (!isListening) {
      recognition.start();   // ✅ MUST be on button click
    } else {
      recognition.stop();
    }
  });

} else {
  alert("❌ Voice input supported nahi hai is browser me.");
}


