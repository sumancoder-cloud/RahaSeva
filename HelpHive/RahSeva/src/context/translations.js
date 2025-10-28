export const translations = {
  en: {
    navbar: {
      findHelper: 'Find Helper',
      categories: 'Categories',
      myAccount: 'My Account',
      myBookings: 'My Bookings',
      myPoints: 'My Points',
      signUp: 'Sign Up',
      login: 'Login',
      logout: 'Logout',
      profileSettings: 'Profile Settings',
      admin: 'Admin',
      helper: 'Helper',
      user: 'User'
    },
    categories: {
      plumber: 'Plumber',
      electrician: 'Electrician',
      carpenter: 'Carpenter',
      doctor: 'Doctor',
      emergency: 'Emergency'
    },
    language: {
      english: 'English',
      hindi: 'हिंदी',
      selectLanguage: 'Select Language'
    }
  },
  hi: {
    navbar: {
      findHelper: 'सहायक खोजें',
      categories: 'श्रेणियाँ',
      myAccount: 'मेरा खाता',
      myBookings: 'मेरी बुकिंग',
      myPoints: 'मेरे अंक',
      signUp: 'साइन अप करें',
      login: 'लॉगिन करें',
      logout: 'लॉगआउट करें',
      profileSettings: 'प्रोफाइल सेटिंग्स',
      admin: 'प्रशासक',
      helper: 'सहायक',
      user: 'उपयोगकर्ता'
    },
    categories: {
      plumber: 'नल का काम करने वाला',
      electrician: 'विद्युत मिस्त्री',
      carpenter: 'बढ़ई',
      doctor: 'डॉक्टर',
      emergency: 'आपातकालीन'
    },
    language: {
      english: 'English',
      hindi: 'हिंदी',
      selectLanguage: 'भाषा चुनें'
    }
  }
};

export const getTranslation = (language, path) => {
  const keys = path.split('.');
  let value = translations[language];
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path;
    }
  }
  
  return value;
};

export const t = (language, path) => getTranslation(language, path);
