import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./SpeechRecognition.css";

const realEstateKeywords = [
  "apartment", "house", "villa", "rent", "buy", "sell", "location", "neighborhood",
  "bedroom", "bathroom", "furnished", "mortgage", "loan", "property", "real estate",
  "broker", "agent", "square feet", "budget", "price", "balcony", "garage", "view"
];

const SpeechRecognitionComponent = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("hi");
  const [realEstateInfo, setRealEstateInfo] = useState("No real estate keywords detected.");
  const [notes, setNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);


  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Try Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setTranscription(transcript.trim());
      highlightKeywords(transcript.trim());
      getRealEstateInfo(transcript.trim());
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
    };

    recognitionRef.current = recognition;
  }, []);


  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscription("");
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };


  const highlightKeywords = (text) => {
    if (!text) return;
    let highlighted = text;

    realEstateKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      highlighted = highlighted.replace(regex, `<span class="highlight">${keyword}</span>`);
    });

    setHighlightedText(highlighted);
  };


  const getRealEstateInfo = (text) => {
    if (!text) return;

    const matchedKeywords = realEstateKeywords.filter((keyword) =>
      text.toLowerCase().includes(keyword)
    );

    if (matchedKeywords.length > 0) {
      let suggestions = matchedKeywords.map((keyword) => {
        if (["apartment", "house", "villa"].includes(keyword)) {
          return `<li>🏠 <a href="/properties" target="_blank">Search for ${keyword} listings</a></li>`;
        }
        if (["rent", "buy", "sell"].includes(keyword)) {
          return `<li>💰 <a href="/properties" target="_blank">Check ${keyword} prices</a></li>`;
        }
        if (["mortgage", "loan"].includes(keyword)) {
          return `<li>🏦 <a href="https://www.bankbazaar.com/home-loan.html" target="_blank">Compare mortgage rates</a></li>`;
        }
        if (["location", "neighborhood"].includes(keyword)) {
          return `<li>📍 <a href="/top-locations" target="_blank">Find best locations</a></li>`;
        }
        return `<li>🔍 More details on ${keyword}</li>`;
      });

      setRealEstateInfo(`
        <strong>Detected Keywords:</strong> ${matchedKeywords.join(", ")}
        <div class="real-estate-suggestions">
          <h4>Suggested Actions:</h4>
          <ul>${suggestions.join("")}</ul>
        </div>
      `);
    } else {
      setRealEstateInfo("No real estate keywords detected.");
    }
  };


  const translateText = async () => {
    if (!transcription.trim()) {
      alert("No text to translate!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/live-translate", {
        text: transcription,
        sourceLanguage: "en",
        targetLanguage: targetLanguage // Fix: Ensure correct state reference
      });

      setTranslatedText(response.data.translation);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Translation failed.");
    }
  };


  const saveNote = () => {
    if (transcription.trim()) {
      const newNote = {
        id: Date.now(),
        text: transcription,
        translatedText: translatedText,
        date: new Date().toLocaleString()
      };
      setNotes([...notes, newNote]);
      setTranscription("");
      setTranslatedText("");
      setHighlightedText("");
    }
  };

  return (
    <div className="speech-recognition-container">
      <h2>🎙 Real-Time Speech Recognition</h2>

      <button onClick={toggleListening} className={`speech-btn ${isListening ? "active" : ""}`}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>

      <button onClick={isRecording ? stopRecording : startRecording} className="record-btn">
        {isRecording ? "Stop Recording" : "Record Audio"}
      </button>

      <button onClick={saveNote} className="save-btn">
        Save Note
      </button>

      <h3>Transcribed Text:</h3>
      <p dangerouslySetInnerHTML={{ __html: highlightedText || "Start speaking..." }} />

      <h3>Translation:</h3>
      <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
        <option value="hi">Hindi</option>
        <option value="mr">Marathi</option>
        <option value="te">Telugu</option>
        <option value="es">Spanish</option>
      </select>
      <button onClick={translateText} className="translate-btn">Translate</button>
      <p>{translatedText || "Translation will appear here..."}</p>

      <h3>Real Estate Information:</h3>
      <p dangerouslySetInnerHTML={{ __html: realEstateInfo }} />

      {audioURL && (
        <div>
          <h3>Recorded Audio:</h3>
          <audio src={audioURL} controls />
        </div>
      )}
    </div>
  );
};

export default SpeechRecognitionComponent;
