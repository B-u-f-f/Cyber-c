import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = ({ currentLanguage }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [animated, setAnimated] = useState(false);
  const [stats, setStats] = useState({
    properties: 2450,
    clients: 320,
    languages: 4,
    satisfaction: 97
  });

  // Text content based on language
  const content = {
    en: {
      title: "Real Estate Communication Assistant",
      subtitle: "Your multilingual property management solution",
      description: "Streamline your real estate tasks with our comprehensive platform. Manage clients, find properties, and communicate in multiple languages with ease.",
      features: [
        {
          title: "Client Management",
          description: "Track client preferences and requirements with our intuitive management system.",
          icon: "👥"
        },
        {
          title: "Multilingual Support",
          description: "Communicate with clients in their preferred language with our built-in translation.",
          icon: "🌐"
        },
        {
          title: "Property Listings",
          description: "Access comprehensive property listings from multiple sources in one place.",
          icon: "🏠"
        },
        {
          title: "Voice Recognition",
          description: "Use speech recognition to quickly take notes and transcribe conversations.",
          icon: "🎤"
        }
      ],
      cta: {
        auth: "Get Started",
        login: "Login",
        register: "Register",
        dashboard: "Go to Dashboard"
      },
      stats: {
        properties: "Properties",
        clients: "Clients Managed",
        languages: "Languages",
        satisfaction: "Client Satisfaction"
      },
      welcome: "Welcome back,"
    },
    hi: {
      title: "रियल एस्टेट कम्युनिकेशन असिस्टेंट",
      subtitle: "आपका बहुभाषी संपत्ति प्रबंधन समाधान",
      description: "हमारे व्यापक प्लेटफॉर्म के साथ अपने रियल एस्टेट व्यवसाय को सुव्यवस्थित करें। ग्राहकों का प्रबंधन करें, संपत्तियां खोजें, और कई भाषाओं में आसानी से संवाद करें।",
      features: [
        {
          title: "क्लाइंट प्रबंधन",
          description: "हमारे सहज प्रबंधन सिस्टम के साथ क्लाइंट प्राथमिकताओं और आवश्यकताओं को ट्रैक करें।",
          icon: "👥"
        },
        {
          title: "बहुभाषी समर्थन",
          description: "हमारे अंतर्निहित अनुवाद के साथ ग्राहकों से उनकी पसंदीदा भाषा में संवाद करें।",
          icon: "🌐"
        },
        {
          title: "संपत्ति लिस्टिंग",
          description: "एक ही स्थान पर कई स्रोतों से व्यापक संपत्ति लिस्टिंग तक पहुंचें।",
          icon: "🏠"
        },
        {
          title: "आवाज़ पहचान",
          description: "नोट्स लेने और बातचीत को ट्रांसक्राइब करने के लिए स्पीच रिकग्निशन का उपयोग करें।",
          icon: "🎤"
        }
      ],
      cta: {
        auth: "शुरू करें",
        login: "लॉगिन",
        register: "रजिस्टर",
        dashboard: "डैशबोर्ड पर जाएं"
      },
      stats: {
        properties: "संपत्तियां",
        clients: "प्रबंधित ग्राहक",
        languages: "भाषाएँ",
        satisfaction: "ग्राहक संतुष्टि"
      },
      welcome: "वापस स्वागत है,"
    },
    mr: {
      title: "रिअल इस्टेट कम्युनिकेशन असिस्टंट",
      subtitle: "आपले बहुभाषिक मालमत्ता व्यवस्थापन समाधान",
      description: "आमच्या सर्वसमावेशक प्लॅटफॉर्मसह आपला रिअल इस्टेट व्यवसाय सुरळीत करा. ग्राहकांचे व्यवस्थापन करा, मालमत्ता शोधा आणि अनेक भाषांमध्ये सहजपणे संवाद साधा.",
      features: [
        {
          title: "क्लायंट व्यवस्थापन",
          description: "आमच्या सहज व्यवस्थापन प्रणालीसह क्लायंट प्राधान्ये आणि आवश्यकता ट्रॅक करा.",
          icon: "👥"
        },
        {
          title: "बहुभाषिक समर्थन",
          description: "आमच्या अंतर्भूत अनुवादासह ग्राहकांशी त्यांच्या पसंतीच्या भाषेत संवाद साधा.",
          icon: "🌐"
        },
        {
          title: "मालमत्ता यादी",
          description: "एकाच ठिकाणी अनेक स्त्रोतांकडून सर्वसमावेशक मालमत्ता यादी अॅक्सेस करा.",
          icon: "🏠"
        },
        {
          title: "आवाज ओळख",
          description: "नोट्स घेण्यासाठी आणि संभाषणे ट्रान्स्क्राइब करण्यासाठी स्पीच रेकग्निशन वापरा.",
          icon: "🎤"
        }
      ],
      cta: {
        auth: "सुरू करा",
        login: "लॉगिन",
        register: "नोंदणी",
        dashboard: "डॅशबोर्डवर जा"
      },
      stats: {
        properties: "मालमत्ता",
        clients: "व्यवस्थापित ग्राहक",
        languages: "भाषा",
        satisfaction: "ग्राहक समाधान"
      },
      welcome: "परत स्वागत आहे,"
    },
    te: {
      title: "రియల్ ఎస్టేట్ కమ్యూనికేషన్ అసిస్టెంట్",
      subtitle: "మీ బహుభాష ఆస్తి నిర్వహణ పరిష్కారం",
      description: "మా సమగ్ర ప్లాట్‌ఫారమ్‌తో మీ రియల్ ఎస్టేట్ వ్యాపారాన్ని సులభతరం చేయండి. క్లయింట్‌లను నిర్వహించండి, ఆస్తులను కనుగొనండి మరియు అనేక భాషలలో సులభంగా కమ్యూనికేట్ చేయండి.",
      features: [
        {
          title: "క్లయింట్ నిర్వహణ",
          description: "మా సహజమైన నిర్వహణ వ్యవస్థతో క్లయింట్ ప్రాధాన్యతలు మరియు అవసరాలను ట్రాక్ చేయండి.",
          icon: "👥"
        },
        {
          title: "బహుభాష మద్దతు",
          description: "మా అంతర్నిర్మిత అనువాదంతో క్లయింట్‌లతో వారు ఇష్టపడే భాషలో కమ్యూనికేట్ చేయండి.",
          icon: "🌐"
        },
        {
          title: "ఆస్తి జాబితాలు",
          description: "ఒకే చోట అనేక మూలాల నుండి సమగ్ర ఆస్తి జాబితాలను యాక్సెస్ చేయండి.",
          icon: "🏠"
        },
        {
          title: "వాయిస్ గుర్తింపు",
          description: "నోట్స్ త్వరగా తీసుకోవడానికి మరియు సంభాషణలను ట్రాన్స్‌క్రైబ్ చేయడానికి స్పీచ్ రికగ్నిషన్‌ని ఉపయోగించండి.",
          icon: "🎤"
        }
      ],
      cta: {
        auth: "ప్రారంభించండి",
        login: "లాగిన్",
        register: "నమోదు",
        dashboard: "డాష్‌బోర్డ్‌కి వెళ్ళండి"
      },
      stats: {
        properties: "ఆస్తులు",
        clients: "నిర్వహించబడిన క్లయింట్‌లు",
        languages: "భాషలు",
        satisfaction: "క్లయింట్ సంతృప్తి"
      },
      welcome: "తిరిగి స్వాగతం,"
    }
  };

  // Get text from the language content
  const text = content[currentLanguage] || content['en'];

  useEffect(() => {
    // Animate stats after component mounts
    setAnimated(true);

    // Add scroll animation to features
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('feature-visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    const featureElements = document.querySelectorAll('.feature-card');
    if (featureElements.length > 0) {
      featureElements.forEach(feature => {
        observer.observe(feature);
      });
    }

    return () => {
      if (featureElements.length > 0) {
        featureElements.forEach(feature => {
          observer.unobserve(feature);
        });
      }
    };
  }, []);

  // Animation for counting up stats
  useEffect(() => {
    if (animated) {
      const statElements = document.querySelectorAll('.stat-value');
      
      statElements.forEach(el => {
        const target = parseInt(el.getAttribute('data-value'), 10);
        const duration = 2000; // 2 seconds
        const step = Math.ceil(target / (duration / 16)); // 16ms per frame (approx)
        let current = 0;
        
        const updateValue = () => {
          current += step;
          if (current > target) current = target;
          el.textContent = current;
          
          if (current < target) {
            requestAnimationFrame(updateValue);
          }
        };
        
        requestAnimationFrame(updateValue);
      });
    }
  }, [animated]);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{text.title}</h1>
          <p className="hero-subtitle">{text.subtitle}</p>
          <p className="hero-description">{text.description}</p>
          
          <div className="hero-cta">
            {isAuthenticated ? (
              <div className="welcome-section">
                <p className="welcome-text">{text.welcome} <span className="user-name">{user?.name}</span></p>
                <Link to="/dashboard" className="cta-button primary-button">
                  {text.cta.dashboard}
                </Link>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="cta-button primary-button">
                  {text.cta.login}
                </Link>
                <Link to="/register" className="cta-button secondary-button">
                  {text.cta.register}
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="hero-image">
          {/* Using a placeholder instead of an SVG for better compatibility */}
          <div className="hero-image-placeholder">
            <div className="placeholder-building"></div>
            <div className="placeholder-house"></div>
            <div className="placeholder-person"></div>
            <div className="placeholder-bubbles">
              <div className="speech-bubble">Hello!</div>
              <div className="speech-bubble">नमस्ते!</div>
              <div className="speech-bubble">నమస్కారం!</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-value" data-value={stats.properties}>
            0
          </div>
          <div className="stat-label">{text.stats.properties}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" data-value={stats.clients}>
            0
          </div>
          <div className="stat-label">{text.stats.clients}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" data-value={stats.languages}>
            0
          </div>
          <div className="stat-label">{text.stats.languages}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" data-value={stats.satisfaction}>
            0
          </div>
          <div className="stat-label">{text.stats.satisfaction}%</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Our Features</h2>
        <div className="features-grid">
          {text.features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to streamline your real estate business?</h2>
          <p className="cta-description">
            Join thousands of real estate professionals who are already using our platform to manage clients and properties more efficiently.
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="cta-button primary-button">
              {text.cta.auth}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;