import { useEffect, useRef, useState } from "react";
import { generateComplaint, sendMessage } from "./services/api";
import "./App.css";

const copy = {
  en: {
    navLabel: "CYBER SAFETY ASSISTANCE",
    badge: "AI-POWERED GUIDANCE",
    title: "Prepare your cybercrime complaint with confidence.",
    description:
      "CyberHelp guides you through a conversation, gathers the important details, and prepares a complaint draft for you to review.",
    start: "Start complaint assistance",
    language: "Language",
    howTitle: "How it works",
    step1: "Describe what happened",
    step2: "Answer a few guided questions",
    step3: "Review and download your draft",
    safetyTitle: "Important safety note",
    safetyText:
      "Never share passwords, OTPs, PINs, CVVs, recovery codes, or complete bank/card details. This demo does not submit a complaint or create an FIR.",
    officialText: "For official reporting, visit the National Cyber Crime Reporting Portal.",
    chatTitle: "CyberHelp assistant",
    chatSubtitle: "Tell me what happened. I will ask one question at a time.",
    inputPlaceholder: "Type your answer here...",
    send: "Send",
    typing: "CyberHelp is preparing a response…",
    makeDraft: "Generate complaint draft",
    draftHint: "Once you have shared the main details, generate a draft to review.",
    backHome: "Back to home",
    reviewTitle: "Review your complaint draft",
    reviewSubtitle:
      "Check every detail carefully. Edit anything that is incorrect or missing before using this draft.",
    copy: "Copy complete draft",
    copied: "Copied!",
    download: "Download PDF",
    backChat: "Back to chat",
    startOver: "Start new complaint",
    confirmStartOver:
      "Start a new complaint? Your current conversation and draft will be cleared.",
    disclaimer:
      "This is an AI-generated draft for review only. It is not legal advice and has not been submitted to any authority.",
    errorPrefix: "Something went wrong: ",
    initialMessage:
      "Hello! I am CyberHelp. I can help you prepare a cybercrime complaint draft. Please describe what happened. Do not share passwords, OTPs, PINs, CVVs, or complete banking details.",
    emptyDraft: "The assistant could not create a draft. Please try again.",
    printTitle: "Cybercrime Complaint Draft",
  },
  hi: {
    navLabel: "साइबर सुरक्षा सहायता",
    badge: "AI आधारित मार्गदर्शन",
    title: "अपनी साइबर अपराध शिकायत का मसौदा आसानी से तैयार करें।",
    description:
      "CyberHelp बातचीत के माध्यम से आवश्यक जानकारी एकत्र करता है और आपके लिए समीक्षा योग्य शिकायत का मसौदा तैयार करता है।",
    start: "शिकायत सहायता शुरू करें",
    language: "भाषा",
    howTitle: "यह कैसे काम करता है",
    step1: "बताएं कि क्या हुआ",
    step2: "कुछ आसान सवालों के जवाब दें",
    step3: "मसौदे की समीक्षा करें और डाउनलोड करें",
    safetyTitle: "महत्वपूर्ण सुरक्षा सूचना",
    safetyText:
      "पासवर्ड, OTP, PIN, CVV, रिकवरी कोड या बैंक/कार्ड की पूरी जानकारी साझा न करें। यह डेमो शिकायत जमा नहीं करता और FIR दर्ज नहीं करता।",
    officialText: "आधिकारिक शिकायत दर्ज करने के लिए राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल पर जाएं।",
    chatTitle: "CyberHelp सहायक",
    chatSubtitle: "बताएं कि क्या हुआ। मैं एक बार में एक सवाल पूछूंगा।",
    inputPlaceholder: "अपना जवाब यहां लिखें...",
    send: "भेजें",
    typing: "CyberHelp जवाब तैयार कर रहा है…",
    makeDraft: "शिकायत का मसौदा बनाएं",
    draftHint: "मुख्य जानकारी साझा करने के बाद समीक्षा के लिए मसौदा बनाएं।",
    backHome: "होम पर वापस जाएं",
    reviewTitle: "शिकायत के मसौदे की समीक्षा करें",
    reviewSubtitle:
      "मसौदे का ध्यान से निरीक्षण करें। गलत या अधूरी जानकारी को उपयोग करने से पहले संपादित करें।",
    copy: "पूरा मसौदा कॉपी करें",
    copied: "कॉपी हो गया!",
    download: "PDF डाउनलोड करें",
    backChat: "चैट पर वापस जाएं",
    startOver: "नई शिकायत शुरू करें",
    confirmStartOver:
      "नई शिकायत शुरू करें? आपकी मौजूदा बातचीत और मसौदा मिट जाएगा।",
    disclaimer:
      "यह केवल समीक्षा के लिए AI द्वारा तैयार किया गया मसौदा है। यह कानूनी सलाह नहीं है और किसी अधिकारी को जमा नहीं किया गया है।",
    errorPrefix: "कुछ गलत हुआ: ",
    initialMessage:
      "नमस्ते! मैं CyberHelp हूं। मैं साइबर अपराध की शिकायत का मसौदा तैयार करने में आपकी मदद करूंगा। कृपया बताएं कि क्या हुआ। पासवर्ड, OTP, PIN, CVV या पूरी बैंक जानकारी साझा न करें।",
    emptyDraft: "मसौदा तैयार नहीं हो सका। कृपया दोबारा प्रयास करें।",
    printTitle: "साइबर अपराध शिकायत का मसौदा",
  },
};

const printStyles = `
  .print-only {
    display: none;
  }

  @media print {
    @page {
      size: A4;
      margin: 18mm;
    }

    body * {
      visibility: hidden !important;
    }

    #complaint-print,
    #complaint-print * {
      visibility: visible !important;
    }

    #complaint-print {
      display: block !important;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      margin: 0 !important;
      padding: 0 !important;
      color: #000 !important;
      background: #fff !important;
      box-shadow: none !important;
    }

    #complaint-print h1 {
      margin: 0 0 20px;
      color: #000 !important;
      font-size: 20pt;
    }

    #complaint-print pre {
      margin: 0;
      color: #000 !important;
      background: #fff !important;
      border: 0 !important;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      font-family: Arial, "Noto Sans Devanagari", sans-serif;
      font-size: 11pt;
      line-height: 1.55;
    }
  }
`;

function isDraftConfirmation(message) {
  const value = message.trim().toLowerCase();

  const simpleConfirmation =
    /^(yes|yeah|yep|sure|go ahead|please do|do it|generate it|make it)[.! ]*$/.test(value);

  const detailedConfirmation =
    /^(yes|yeah|yep|sure|please|go ahead)\b/.test(value) &&
    /\b(generate|create|prepare|make)\b/.test(value) &&
    /\b(complaint|draft)\b/.test(value);

  return simpleConfirmation || detailedConfirmation;
}

function App() {
  const [language, setLanguage] = useState("en");
  const [screen, setScreen] = useState("home");
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
const messageListRef = useRef(null);
  const t = copy[language];

  useEffect(() => {
  const messageList = messageListRef.current;

  if (!messageList) return;

  messageList.scrollTo({
    top: messageList.scrollHeight,
    behavior: "smooth",
  });
}, [messages, loading]);

  function startChat(selectedLanguage = language) {
    setLanguage(selectedLanguage);
    setMessages([
      { role: "model", text: copy[selectedLanguage].initialMessage },
    ]);
    setHistory([]);
    setInput("");
    setDraft("");
    setError("");
    setCopied(false);
    setScreen("chat");
  }

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);

    if (screen === "chat") {
      startChat(nextLanguage);
    }

    if (screen === "review") {
      setScreen("home");
      setDraft("");
      setCopied(false);
      setError("");
    }
  }

  async function handleSend(event) {
    event.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = input.trim();

    setInput("");
    setError("");

    if (
      history.length >= 2 &&
      isDraftConfirmation(userMessage)
    ) {
      setMessages(previousMessages => [
        ...previousMessages,
        { role: "user", text: userMessage }
      ]);

      await handleGenerateDraft();
      return;
    }

    setLoading(true);

    setMessages(previousMessages => [
      ...previousMessages,
      { role: "user", text: userMessage }
    ]);

    try {
      const data = await sendMessage(
        userMessage,
        history,
        language
      );

      setHistory(data.history);

      setMessages(previousMessages => [
        ...previousMessages,
        { role: "model", text: data.reply }
      ]);

    } catch (requestError) {
      setError(requestError.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateDraft() {
    if (loading || history.length < 2) return;

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const data = await generateComplaint(history, language);
      setDraft(data.draft || t.emptyDraft);
      setScreen("review");
    } catch (requestError) {
      setError(t.errorPrefix + (requestError.message || "Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!draft.trim()) return;

    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access was unavailable. Select and copy the text manually.");
    }
  }

  function handleDownload() {
    if (!draft.trim()) return;
    setError("");
    window.print();
  }

  function handleStartOver() {
    if (loading) return;

    const hasProgress =
      messages.some((message) => message.role === "user") ||
      history.length > 0 ||
      Boolean(draft.trim());

    if (hasProgress && !window.confirm(t.confirmStartOver)) return;

    setScreen("home");
    setMessages([]);
    setHistory([]);
    setDraft("");
    setError("");
    setInput("");
    setCopied(false);
  }

  return (
    <div className="app-shell">
      <style>{printStyles}</style>

      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={handleStartOver}
          aria-label="CyberHelp home"
          disabled={loading}
        >
          <span className="brand-mark">C</span>
          <span>CyberHelp</span>
        </button>

        <div className="topbar-right">
          <span className="topbar-label">{t.navLabel}</span>
          <label className="language-control">
            <span>{t.language}</span>
            <select
              value={language}
              onChange={(event) => changeLanguage(event.target.value)}
              disabled={loading}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </label>
        </div>
      </header>

      <main className="main-content">
        {screen === "home" && (
          <section className="hero-layout">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="status-dot" />
                {t.badge}
              </div>
              <h1>{t.title}</h1>
              <p className="hero-description">{t.description}</p>
              <button
                className="primary-button start-button"
                type="button"
                onClick={() => startChat()}
              >
                {t.start}<span aria-hidden="true">→</span>
              </button>
              <div className="trust-line">
                <span className="shield-icon">✓</span>
                <span>Guided questions · Editable draft · No account required</span>
              </div>
            </div>

            <div className="hero-card">
              <div className="hero-card-top">
                <span className="mini-icon">⌁</span>
                <span>YOUR REPORT, STEP BY STEP</span>
              </div>
              <div className="steps-list">
                <div className="step-item">
                  <span className="step-number">01</span>
                  <div>
                    <strong>{t.step1}</strong>
                    <small>Start with your own words</small>
                  </div>
                </div>
                <div className="step-line" />
                <div className="step-item">
                  <span className="step-number">02</span>
                  <div>
                    <strong>{t.step2}</strong>
                    <small>Gemini guides the conversation</small>
                  </div>
                </div>
                <div className="step-line" />
                <div className="step-item">
                  <span className="step-number">03</span>
                  <div>
                    <strong>{t.step3}</strong>
                    <small>You stay in control of the draft</small>
                  </div>
                </div>
              </div>
              <div className="hero-card-foot">
                <span className="pulse-dot" /> English and Hindi supported
              </div>
            </div>
          </section>
        )}

        {screen === "chat" && (
          <section className="workspace">
            <div className="workspace-heading">
              <div>
                <div className="eyebrow">
                  <span className="status-dot" />AI ASSISTANCE
                </div>
                <h1>{t.chatTitle}</h1>
                <p>{t.chatSubtitle}</p>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={handleStartOver}
                disabled={loading}
              >
                {t.backHome}
              </button>
            </div>

            <div className="chat-card">
              <div className="chat-card-header">
                <div className="assistant-avatar">C</div>
                <div>
                  <strong>CyberHelp</strong>
                  <small>Complaint preparation assistant</small>
                </div>
                <span className="online-label">
                  <span className="status-dot" /> Online
                </span>
              </div>

             <div className="message-list" ref={messageListRef}>
                {messages.map((message, index) => (
                  <div
                    className={`message-row ${
                      message.role === "user" ? "user-row" : "bot-row"
                    }`}
                    key={index}
                  >
                    {message.role === "model" && (
                      <div className="message-avatar">C</div>
                    )}
                    <div
                      className={`message-bubble ${
                        message.role === "user" ? "user-bubble" : "bot-bubble"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {loading && <div className="typing-indicator">{t.typing}</div>}
             
              </div>

              {error && <div className="error-message">{error}</div>}

              <form className="chat-input-area" onSubmit={handleSend}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t.inputPlaceholder}
                  disabled={loading}
                  maxLength={3000}
                />
                <button
                  className="primary-button send-button"
                  type="submit"
                  disabled={loading || !input.trim()}
                >
                  {t.send}<span aria-hidden="true">↑</span>
                </button>
              </form>
              <div className="chat-footer-note">
                Do not share passwords, OTPs, PINs, CVVs or full banking credentials.
              </div>
            </div>

            <div className="draft-action-row">
              <div>
                <strong>{t.draftHint}</strong>
                <small>The draft is not submitted automatically.</small>
              </div>
              <button
                className="secondary-button"
                type="button"
                onClick={handleGenerateDraft}
                disabled={loading || history.length < 2}
              >
                {t.makeDraft}<span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        )}

        {screen === "review" && (
          <section className="workspace review-workspace">
            <div className="workspace-heading">
              <div>
                <div className="eyebrow">
                  <span className="status-dot" />DRAFT READY FOR REVIEW
                </div>
                <h1>{t.reviewTitle}</h1>
                <p>{t.reviewSubtitle}</p>
              </div>
            </div>

            <div className="review-card">
              <div className="review-card-header">
                <div>
                  <strong>Cybercrime complaint</strong>
                  <small>Editable document · Draft only</small>
                </div>
                <span className="draft-tag">NOT SUBMITTED</span>
              </div>

              <textarea
                className="draft-editor"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setCopied(false);
                }}
                spellCheck="true"
              />

              <div className="review-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleCopy}
                  disabled={!draft.trim()}
                >
                  {copied ? t.copied : t.copy}
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={handleDownload}
                  disabled={!draft.trim()}
                >
                  {t.download}<span aria-hidden="true">↓</span>
                </button>
              </div>

              <div id="complaint-print" className="print-only">
                <h1>{t.printTitle}</h1>
                <pre>{draft}</pre>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="review-bottom-row">
              <button
                className="text-button"
                type="button"
                onClick={() => setScreen("chat")}
              >
                ← {t.backChat}
              </button>
              <button
                className="text-button"
                type="button"
                onClick={handleStartOver}
              >
                {t.startOver}
              </button>
            </div>
            <p className="disclaimer">{t.disclaimer}</p>
          </section>
        )}

        <section className="safety-panel">
          <div className="safety-icon">!</div>
          <div>
            <strong>{t.safetyTitle}</strong>
            <p>{t.safetyText}</p>
            <a
              href="https://cybercrime.gov.in/"
              target="_blank"
              rel="noreferrer"
            >
              {t.officialText} ↗
            </a>
            <p className="urgent-note">
              For urgent financial cyber fraud in India, contact your bank promptly
              and call 1930 for assistance with reporting.
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} CyberHelp · Academic project prototype</span>
        <span>Not an official government service</span>
      </footer>
    </div>
  );
}

export default App;