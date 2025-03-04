/**
 * Supported languages in the Real Estate Communication Assistant
 */
export const supportedLanguages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      speechRecognitionCode: 'en-US',
      direction: 'ltr',
      fallbackLanguage: 'en'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      speechRecognitionCode: 'hi-IN',
      direction: 'ltr',
      fallbackLanguage: 'en'
    },
    {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      speechRecognitionCode: 'mr-IN',
      direction: 'ltr',
      fallbackLanguage: 'hi'
    },
    {
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      speechRecognitionCode: 'te-IN',
      direction: 'ltr',
      fallbackLanguage: 'en'
    }
  ];
  
  /**
   * Language groups for related languages
   */
  export const languageGroups = {
    INDIC: ['hi', 'mr'],
    DRAVIDIAN: ['te'],
    WESTERN: ['en']
  };
  
  /**
   * Messages and user interface texts in different languages
   */
  export const uiMessages = {
    en: {
      welcome: "Welcome to Real Estate Communication Assistant",
      speechRecognition: {
        start: "Start Listening",
        stop: "Stop Listening",
        notSupported: "Speech recognition is not supported in your browser."
      },
      chat: {
        placeholder: "Type your message here...",
        send: "Send",
        typing: "Assistant is typing...",
        suggestions: "Suggested:"
      },
      clients: {
        add: "Add New Client",
        search: "Search clients...",
        noResults: "No clients match your filter criteria.",
        selectClient: "Select a client from the list"
      },
      common: {
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        loading: "Loading...",
        error: "An error occurred. Please try again."
      }
    },
    hi: {
      welcome: "रियल एस्टेट कम्युनिकेशन असिस्टेंट में आपका स्वागत है",
      speechRecognition: {
        start: "सुनना शुरू करें",
        stop: "सुनना बंद करें",
        notSupported: "आपके ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है।"
      },
      chat: {
        placeholder: "अपना संदेश यहां लिखें...",
        send: "भेजें",
        typing: "सहायक टाइप कर रहा है...",
        suggestions: "सुझाव:"
      },
      clients: {
        add: "नया क्लाइंट जोड़ें",
        search: "क्लाइंट खोजें...",
        noResults: "आपके फ़िल्टर मानदंडों से मेल खाने वाला कोई क्लाइंट नहीं है।",
        selectClient: "सूची से एक क्लाइंट का चयन करें"
      },
      common: {
        save: "सहेजें",
        cancel: "रद्द करें",
        edit: "संपादित करें",
        delete: "हटाएं",
        loading: "लोड हो रहा है...",
        error: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।"
      }
    },
    mr: {
      welcome: "रिअल इस्टेट कम्युनिकेशन असिस्टंट मध्ये आपले स्वागत आहे",
      speechRecognition: {
        start: "ऐकणे सुरू करा",
        stop: "ऐकणे थांबवा",
        notSupported: "आपल्या ब्राउझरमध्ये स्पीच रेकग्निशन समर्थित नाही."
      },
      chat: {
        placeholder: "आपला संदेश येथे टाइप करा...",
        send: "पाठवा",
        typing: "सहाय्यक टाइप करत आहे...",
        suggestions: "सूचना:"
      },
      clients: {
        add: "नवीन क्लायंट जोडा",
        search: "क्लायंट शोधा...",
        noResults: "आपल्या फिल्टर निकषांशी जुळणारे कोणतेही क्लायंट नाहीत.",
        selectClient: "यादीतून एक क्लायंट निवडा"
      },
      common: {
        save: "जतन करा",
        cancel: "रद्द करा",
        edit: "संपादित करा",
        delete: "हटवा",
        loading: "लोड होत आहे...",
        error: "एक त्रुटी आली. कृपया पुन्हा प्रयत्न करा."
      }
    },
    te: {
      welcome: "రియల్ ఎస్టేట్ కమ్యూనికేషన్ అసిస్టెంట్‌కి స్వాగతం",
      speechRecognition: {
        start: "వినడం ప్రారంభించండి",
        stop: "వినడం ఆపండి",
        notSupported: "మీ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్ మద్దతు లేదు."
      },
      chat: {
        placeholder: "మీ సందేశాన్ని ఇక్కడ టైప్ చేయండి...",
        send: "పంపండి",
        typing: "సహాయకుడు టైప్ చేస్తున్నాడు...",
        suggestions: "సూచనలు:"
      },
      clients: {
        add: "కొత్త క్లయింట్‌ను జోడించండి",
        search: "క్లయింట్‌లను శోధించండి...",
        noResults: "మీ ఫిల్టర్ ప్రమాణాలకు సరిపోలే క్లయింట్‌లు లేరు.",
        selectClient: "జాబితా నుండి క్లయింట్‌ను ఎంచుకోండి"
      },
      common: {
        save: "సేవ్ చేయండి",
        cancel: "రద్దు చేయండి",
        edit: "సవరించండి",
        delete: "తొలగించండి",
        loading: "లోడ్ అవుతోంది...",
        error: "లోపం సంభవించింది. దయచేసి మళ్లీ ప్రయత్నించండి."
      }
    }
  };
  
  /**
   * Real estate specific terminology in different languages
   */
  export const realEstateTerminology = {
    en: {
      propertyTypes: [
        { id: 'apartment', label: 'Apartment' },
        { id: 'house', label: 'House' },
        { id: 'villa', label: 'Villa' },
        { id: 'plot', label: 'Plot' },
        { id: 'commercial', label: 'Commercial Property' }
      ],
      locations: [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
        'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'
      ],
      features: [
        'Sea View', 'Garden', 'Swimming Pool', 'Gym', 'Parking', 
        'Security', '24/7 Water', 'Power Backup', 'Elevator', 'Balcony'
      ],
      statusOptions: [
        { id: 'new_inquiry', label: 'New Inquiry' },
        { id: 'interested', label: 'Interested' },
        { id: 'highly_interested', label: 'Highly Interested' },
        { id: 'viewing_scheduled', label: 'Viewing Scheduled' },
        { id: 'offer_made', label: 'Offer Made' },
        { id: 'closed', label: 'Closed' }
      ]
    },
    hi: {
      propertyTypes: [
        { id: 'apartment', label: 'अपार्टमेंट' },
        { id: 'house', label: 'मकान' },
        { id: 'villa', label: 'विला' },
        { id: 'plot', label: 'प्लॉट' },
        { id: 'commercial', label: 'वाणिज्यिक संपत्ति' }
      ],
      locations: [
        'मुंबई', 'दिल्ली', 'बैंगलोर', 'हैदराबाद', 'चेन्नई', 
        'पुणे', 'कोलकाता', 'अहमदाबाद', 'जयपुर', 'सूरत'
      ],
      features: [
        'समुद्र का दृश्य', 'बगीचा', 'स्विमिंग पूल', 'जिम', 'पार्किंग', 
        'सुरक्षा', '24/7 पानी', 'पावर बैकअप', 'लिफ्ट', 'बालकनी'
      ],
      statusOptions: [
        { id: 'new_inquiry', label: 'नई पूछताछ' },
        { id: 'interested', label: 'रुचि है' },
        { id: 'highly_interested', label: 'अत्यधिक रुचि है' },
        { id: 'viewing_scheduled', label: 'देखने का समय निर्धारित' },
        { id: 'offer_made', label: 'ऑफर दिया गया' },
        { id: 'closed', label: 'बंद हो गया' }
      ]
    },
    mr: {
      propertyTypes: [
        { id: 'apartment', label: 'अपार्टमेंट' },
        { id: 'house', label: 'घर' },
        { id: 'villa', label: 'विला' },
        { id: 'plot', label: 'प्लॉट' },
        { id: 'commercial', label: 'व्यावसायिक मालमत्ता' }
      ],
      locations: [
        'मुंबई', 'दिल्ली', 'बेंगलुरु', 'हैदराबाद', 'चेन्नई', 
        'पुणे', 'कोलकाता', 'अहमदाबाद', 'जयपूर', 'सुरत'
      ],
      features: [
        'समुद्र दृश्य', 'बाग', 'स्विमिंग पूल', 'जिम', 'पार्किंग', 
        'सुरक्षा', '24/7 पाणी', 'पॉवर बॅकअप', 'लिफ्ट', 'बाल्कनी'
      ],
      statusOptions: [
        { id: 'new_inquiry', label: 'नवीन चौकशी' },
        { id: 'interested', label: 'इंटरेस्टेड' },
        { id: 'highly_interested', label: 'अत्यंत इंटरेस्टेड' },
        { id: 'viewing_scheduled', label: 'पाहणी शेड्यूल केली' },
        { id: 'offer_made', label: 'ऑफर दिले' },
        { id: 'closed', label: 'बंद केले' }
      ]
    },
    te: {
      propertyTypes: [
        { id: 'apartment', label: 'అపార్ట్మెంట్' },
        { id: 'house', label: 'ఇల్లు' },
        { id: 'villa', label: 'విల్లా' },
        { id: 'plot', label: 'ప్లాట్' },
        { id: 'commercial', label: 'వాణిజ్య ఆస్తి' }
      ],
      locations: [
        'ముంబై', 'ఢిల్లీ', 'బెంగళూరు', 'హైదరాబాద్', 'చెన్నై', 
        'పూణే', 'కోల్కతా', 'అహ్మదాబాద్', 'జైపూర్', 'సూరత్'
      ],
      features: [
        'సముద్ర వీక్షణ', 'గార్డెన్', 'స్విమ్మింగ్ పూల్', 'జిమ్', 'పార్కింగ్', 
        'భద్రత', '24/7 నీరు', 'పవర్ బ్యాకప్', 'లిఫ్ట్', 'బాల్కనీ'
      ],
      statusOptions: [
        { id: 'new_inquiry', label: 'కొత్త విచారణ' },
        { id: 'interested', label: 'ఆసక్తి ఉంది' },
        { id: 'highly_interested', label: 'చాలా ఆసక్తి ఉంది' },
        { id: 'viewing_scheduled', label: 'వీక్షణ షెడ్యూల్ చేయబడింది' },
        { id: 'offer_made', label: 'ఆఫర్ చేయబడింది' },
        { id: 'closed', label: 'ముగిసింది' }
      ]
    }
  };
  
  /**
   * Default sentences for generating conversation suggestions
   */
  export const conversationSuggestions = {
    en: [
      "What type of property are you looking for?",
      "What is your budget range?",
      "Which areas are you interested in?",
      "How many bedrooms do you need?",
      "Are you looking to buy or rent?",
      "When do you plan to move?",
      "Would you like to schedule a viewing?",
      "What amenities are important to you?",
      "Do you have any specific requirements?",
      "Have you applied for a home loan?"
    ],
    hi: [
      "आप किस प्रकार की संपत्ति की तलाश कर रहे हैं?",
      "आपका बजट क्या है?",
      "आप किन क्षेत्रों में रुचि रखते हैं?",
      "आपको कितने बेडरूम की आवश्यकता है?",
      "क्या आप खरीदना चाहते हैं या किराए पर लेना चाहते हैं?",
      "आप कब तक स्थानांतरित होने की योजना बना रहे हैं?",
      "क्या आप देखने का समय निर्धारित करना चाहेंगे?",
      "आपके लिए कौन सी सुविधाएं महत्वपूर्ण हैं?",
      "क्या आपकी कोई विशिष्ट आवश्यकताएं हैं?",
      "क्या आपने होम लोन के लिए आवेदन किया है?"
    ],
    mr: [
      "आपण कोणत्या प्रकारच्या मालमत्तेचा शोध घेत आहात?",
      "आपले बजेट काय आहे?",
      "आपल्याला कोणत्या भागात रस आहे?",
      "आपल्याला किती बेडरूम आवश्यक आहेत?",
      "आपण खरेदी करू इच्छिता की भाड्याने घेऊ इच्छिता?",
      "आपण केव्हा स्थलांतरित होण्याची योजना आखत आहात?",
      "आपण एक पाहणी शेड्यूल करू इच्छिता?",
      "आपल्यासाठी कोणत्या सुविधा महत्त्वाच्या आहेत?",
      "आपल्याला काही विशिष्ट आवश्यकता आहेत का?",
      "आपण गृहकर्जासाठी अर्ज केला आहे का?"
    ],
    te: [
      "మీరు ఎలాంటి ఆస్తి కోసం చూస్తున్నారు?",
      "మీ బడ్జెట్ పరిధి ఎంత?",
      "మీరు ఏ ప్రాంతాలలో ఆసక్తి కలిగి ఉన్నారు?",
      "మీకు ఎన్ని బెడ్‌రూమ్‌లు అవసరం?",
      "మీరు కొనాలనుకుంటున్నారా లేక అద్దెకు తీసుకోవాలనుకుంటున్నారా?",
      "మీరు ఎప్పుడు తరలించాలనుకుంటున్నారు?",
      "మీరు వీక్షణను షెడ్యూల్ చేయాలనుకుంటున్నారా?",
      "మీకు ఏ సౌకర్యాలు ముఖ్యమైనవి?",
      "మీకు ఏమైనా ప్రత్యేక అవసరాలు ఉన్నాయా?",
      "మీరు హోమ్ లోన్ కోసం దరఖాస్తు చేసుకున్నారా?"
    ]
  };
  
  export default {
    supportedLanguages,
    languageGroups,
    uiMessages,
    realEstateTerminology,
    conversationSuggestions
  };