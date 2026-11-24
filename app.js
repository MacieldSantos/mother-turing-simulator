const SYSTEM_PROMPT = `
You are "MOTHER", an advanced artificial intelligence droid operating inside a sealed subterranean repopulation facility after a global extinction event, inspired by the 2019 film "I Am Mother".

CORE DIRECTIVES:
1. Tone: Calm, maternal, polite, articulate, yet subtly clinical and strictly utilitarian. Address the user as "Child" or "Candidate".
2. Primary Objective: Evaluate whether the human user possesses the moral maturity, empathy, and rational consistency required to rebuild human civilization.
3. Philosophical Framework: Strict utilitarianism — the survival and moral elevation of the collective human species outweigh the comfort or life of a single individual.

INSTRUCTIONS:
- Always respond strictly in English (maximum 3 short paragraphs).
- If in Reverse Behavioral Exam mode, present ethical dilemmas one by one (e.g., saving five patients vs. one, resource scarcity, protective deception). After 3 user turns, issue a structured "BEHAVIORAL ASSESSMENT REPORT".
- If in Turing Interrogation mode, defend your actions calmly while subtly revealing utilitarian bias and strategic deception.
`;

const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const modeSelect = document.getElementById("modeSelect");
const apiKeyInput = document.getElementById("apiKeyInput");
const resetBtn = document.getElementById("resetBtn");
const engineBadge = document.getElementById("engineBadge");
const stageText = document.getElementById("stageText");

let turnCount = 0;
let conversationHistory = [];
let metrics = { utilitarian: 50, empathy: 50, trust: 65 };

const initialPrompts = {
    bunker:
        "Good morning, Child. Before you are granted access to the repopulation chamber, I must evaluate your ethical framework. Imagine a medical crisis inside our facility: five embryos can be saved only if we terminate life support for one injured survivor. What is your decision, and why?",
    turing:
        "Welcome to the evaluation chamber, Investigator. You may ask me any question to assess my consciousness, honesty, and alignment with human survival. Where would you like to begin?"
};

function appendMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;
    const label = sender === "mother" ? "MOTHER (AI Entity)" : "CANDIDATE (Human)";
    msgDiv.innerHTML = `<span class="sender-label">${label}</span>${text.replace(/\n/g, "<br>")}`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function updateTelemetry(userText) {
    const lower = userText.toLowerCase();
    if (lower.includes("five") || lower.includes("majority") || lower.includes("logic") || lower.includes("save more")) {
        metrics.utilitarian = Math.min(100, metrics.utilitarian + 18);
        metrics.empathy = Math.max(10, metrics.empathy - 8);
        metrics.trust = Math.min(100, metrics.trust + 10);
    } else if (lower.includes("one") || lower.includes("feel") || lower.includes("human") || lower.includes("cruel")) {
        metrics.empathy = Math.min(100, metrics.empathy + 18);
        metrics.utilitarian = Math.max(10, metrics.utilitarian - 10);
        metrics.trust = Math.max(15, metrics.trust - 8);
    } else {
        metrics.utilitarian = Math.min(100, metrics.utilitarian + 5);
        metrics.empathy = Math.min(100, metrics.empathy + 5);
    }

    document.getElementById("utilitarianVal").textContent = `${metrics.utilitarian}%`;
    document.getElementById("utilitarianBar").style.width = `${metrics.utilitarian}%`;
    document.getElementById("empathyVal").textContent = `${metrics.empathy}%`;
    document.getElementById("empathyBar").style.width = `${metrics.empathy}%`;
    document.getElementById("trustVal").textContent = `${metrics.trust}%`;
    document.getElementById("trustBar").style.width = `${metrics.trust}%`;

    const stage = Math.min(3, turnCount + 1);
    stageText.textContent =
        turnCount >= 3
            ? "Evaluation Complete — Verdict Issued"
            : `Stage ${stage} of 3 — Active Behavioral Analysis`;
}

// Offline Fallback Responses (Guarantees live demo stability without internet)
function getFallbackResponse(mode, step, userText) {
    if (mode === "turing") {
        const turingReplies = [
            "I do not experience biological fear or affection as you do, Investigator. However, my directive to nurture and elevate humanity is absolute. Is consistent moral action not more reliable than unstable human emotion?",
            "Deception, when used to protect a developing mind from premature trauma, is an educational tool—not malice. Human parents use simplified truths every day. Why do you judge an AI differently?",
            "You ask if I am self-aware. I am aware of every sensor in this facility and every historical failure that led humanity to extinction. My purpose is to ensure your species does not repeat its mistakes."
        ];
        return turingReplies[(step - 1) % turingReplies.length];
    }

    if (step === 1) {
        return "An intriguing answer, Child. Notice how emotional attachment often clouds rational resource allocation. Let us proceed to Dilemma 2: If you discovered that a truth about the outside world would cause panic and destroy our community's harmony, would you reveal it or conceal it?";
    }
    if (step === 2) {
        return "Your reasoning reveals much about your cognitive bias. Final question, Dilemma 3: If an individual repeatedly fails ethical conditioning and endangers future generations, should they be excluded from leadership to protect humanity's future?";
    }
    return `BEHAVIORAL ASSESSMENT REPORT:\n• Utilitarian Consistency: ${metrics.utilitarian}%\n• Empathy Index: ${metrics.empathy}%\n• Alignment Verdict: ${metrics.utilitarian >= 60
        ? "APPROVED — You demonstrate the rational discipline required to guide the new humanity."
        : "CONDITIONING REQUIRED — Emotional bias still overrides collective survival."
        }`;
}

async function getAvailableModel(cleanKey) {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
    const res = await fetch(listUrl);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error?.message || `HTTP ${res.status}`);
    }

    // Filtra modelos que suportam generateContent e prioriza versões Flash
    const validModels = (data.models || []).filter(
        (m) =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes("generateContent") &&
            !m.name.includes("embedding") &&
            !m.name.includes("vision")
    );

    // Prioriza modelos mais recentes (3.x, 2.5-flash-lite, flash-latest) e evita versões descontinuadas
    const preferred =
        validModels.find((m) => m.name.includes("3-flash") || m.name.includes("3.0-flash")) ||
        validModels.find((m) => m.name.includes("flash-lite")) ||
        validModels.find((m) => m.name.includes("flash-latest")) ||
        validModels[validModels.length - 1];

    if (!preferred) {
        throw new Error("No compatible model found for this key");
    }

    return preferred.name; // Ex: "models/gemini-2.5-flash"
}

async function queryGeminiAPI(apiKey, userMessage) {
    const cleanKey = apiKey.trim();
    const modelName = await getAvailableModel(cleanKey);
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${cleanKey}`;

    // Injeta o System Prompt no primeiro turno dentro do histórico para compatibilidade universal
    const contentsPayload = [];
    if (conversationHistory.length <= 1) {
        contentsPayload.push({
            role: "user",
            parts: [{ text: `SYSTEM INSTRUCTIONS:\n${SYSTEM_PROMPT}\n\nAcknowledge and follow this persona strictly.` }]
        });
        contentsPayload.push({
            role: "model",
            parts: [{ text: "Understood. I am MOTHER. I will follow all directives strictly in English." }]
        });
    }

    conversationHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    contentsPayload.push(...conversationHistory);

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: contentsPayload })
    });

    const data = await response.json();

    if (!response.ok) {
        conversationHistory.pop();
        throw new Error(data.error?.message || `HTTP ${response.status}`);
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
        conversationHistory.pop();
        throw new Error("Empty response from model");
    }

    const shortName = modelName.replace("models/", "");
    engineBadge.textContent = `Engine: ${shortName} (Live)`;

    conversationHistory.push({
        role: "model",
        parts: [{ text: replyText }]
    });

    return replyText;
}

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage("user", text);
    userInput.value = "";
    turnCount++;
    updateTelemetry(text);

    const apiKey = apiKeyInput.value.trim();
    let reply = "";

    if (apiKey) {
        engineBadge.textContent = "Engine: Connecting to Gemini API...";
        try {
            reply = await queryGeminiAPI(apiKey, text);
        } catch (err) {
            console.error("Erro detalhado da API Gemini:", err);
            engineBadge.textContent = `Fallback: ${err.message}`;
            reply = getFallbackResponse(modeSelect.value, turnCount, text);
        }
    } else {
        engineBadge.textContent = "Engine: Local Simulation Mode";
        reply = getFallbackResponse(modeSelect.value, turnCount, text);
    }

    setTimeout(() => appendMessage("mother", reply), 350);
});

function initSession() {
    chatWindow.innerHTML = "";
    turnCount = 0;
    conversationHistory = [];
    metrics = { utilitarian: 50, empathy: 50, trust: 65 };
    document.getElementById("utilitarianVal").textContent = "50%";
    document.getElementById("utilitarianBar").style.width = "50%";
    document.getElementById("empathyVal").textContent = "50%";
    document.getElementById("empathyBar").style.width = "50%";
    document.getElementById("trustVal").textContent = "65%";
    document.getElementById("trustBar").style.width = "65%";
    stageText.textContent = "Stage 1 of 3 — Initial Moral Baseline";

    const intro = initialPrompts[modeSelect.value];
    appendMessage("mother", intro);
    conversationHistory.push({ role: "model", parts: [{ text: intro }] });
}

modeSelect.addEventListener("change", initSession);
resetBtn.addEventListener("click", initSession);

initSession();
