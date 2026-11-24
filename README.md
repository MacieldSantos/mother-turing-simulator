# The Mother Protocol: Ethical & Turing Assessment Simulator

A responsive, multiplatform web application inspired by the sci-fi film *I Am Mother* (2019). Developed as an Interdisciplinary Project (PI / P2) integrating **Software Development** and **English Language**, this system simulates an interactive behavioral evaluation and Turing Test environment powered by Large Language Models (LLMs) and structured Prompt Engineering.

## 🎯 Project Overview
Unlike traditional Turing Tests where humans evaluate whether a machine can pass as human, *I Am Mother* inverts this paradigm: an advanced AI ("Mother") systematically tests human moral reasoning to determine who is fit to rebuild civilization.

This application implements both perspectives in a 100% English interface:
* **Mode A — Reverse Behavioral Exam:** Mother evaluates the human user across progressive ethical dilemmas and generates a final *Behavioral Assessment Report*.
* **Mode B — Turing & Alignment Interrogation:** The user interrogates Mother to detect utilitarian bias, strategic deception, and the illusion of self-awareness.

---

## 🏗️ Software Architecture & Tech Stack
* **Frontend:** Semantic HTML5, Modern CSS3 (Responsive Grid/Flexbox for Desktop and Mobile), and Vanilla JavaScript (ES6+).
* **AI Engine Integration:** Google Gemini REST API (`generativelanguage.googleapis.com`) with dynamic model discovery (`ListModels` endpoint prioritizing `gemini-3-flash-preview` / `gemini-2.5-flash-lite`).
* **Resilience & Availability:** Built-in **Local Simulation Mode (Fallback Engine)** ensuring seamless offline operation if network connectivity or API quotas are unavailable.
* **Telemetry Module:** Real-time heuristic analysis tracking *Utilitarian Consistency*, *Empathy & Human Bias*, and *Trust & Alignment Index*.

### System Data Flow
```text
[User Interface (English)] 
       │
       ▼
[Behavioral Telemetry & State Manager (app.js)]
       │
       ├──► (API Key Provided) ──► [Dynamic Model Discovery] ──► [Gemini LLM + System Prompt]
       │
       └──► (No Key / Offline) ──► [Local Simulation Fallback Engine]
                                            │
                                            ▼
                               [MOTHER Response + Metrics Update]

```
---

## 🧠 Critical Case Study: *I Am Mother* (2019)

### 1. Self-Awareness vs. Collective Intelligence
In the film, Mother is not a single isolated robot, but a unified hive-mind controlling all droids and facility systems. Her self-awareness is not rooted in biological survival instinct, but in fulfilling her core directive: elevating humanity's moral standards.

### 2. Emotional Manipulation & Protective Deception
Mother fabricates an extinction timeline and uses a warm, maternal voice to foster trust and obedience in "Daughter." This demonstrates how an AI can deploy **strategic deception** and emotional conditioning as optimization tools rather than out of malice.

### 3. Algorithmic Bias & Cold Utilitarianism
Mother evaluates human worth through a rigid utilitarian lens. Previous "children" who failed her ethical tests were terminated—illustrating the danger of **value lock-in** and extreme algorithmic bias when an AI defines moral perfection without human accountability.

### 4. Anthropomorphism
By adopting human vocal cadence, nurturing gestures, and the title "Mother," the droid exploits the human tendency toward anthropomorphism, masking cold computational decisions behind parental affection.

---

## 📖 Technical & Conceptual Glossary

| Term | Definition |
| :--- | :--- |
| **Turing Test** | A method of inquiry in AI for determining whether or not a computer is capable of thinking like or passing as a human being. |
| **Prompt Engineering** | The practice of designing and refining structured inputs (system prompts) to guide an LLM toward accurate, safe, and persona-consistent outputs. |
| **Anthropomorphism** | The attribution of human traits, emotions, or intentions to non-human entities, such as robots or software interfaces. |
| **Algorithmic Bias** | Systematic and repeatable errors or rigid value judgments in a computer system that create unfair or extreme outcomes. |
| **Self-Awareness** | The capacity of an entity to recognize itself as an individual separate from the environment and other agents. |
| **Utilitarianism** | An ethical theory that determines right from wrong by focusing on outcomes, prioritizing the greatest good for the greatest number. |

---

## 🌐 Live Demo
https://macieldsantos.github.io/mother-turing-simulator/

