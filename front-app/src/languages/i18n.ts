import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  debug: true,
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        // ============ LANGUAGE ============
        lang: {
          english: "English",
          hebrew: "עברית",
          selectLanguage: "Select Language",
        },

        // ============ NAVIGATION ============
        nav: {
          home: "Home",
          search: "Search",
          myAppointments: "My Appointments",
          favorites: "Favorites",
          dashboard: "Dashboard",
          services: "Services",
          schedule: "Schedule",
          staff: "Staff / Partners",
          profile: "Profile",
          settings: "Settings",
          menu: "Menu",
        },

        // ============ AUTH - LOGIN ============
        login: {
          title: "Sign In",
          subtitle: "Welcome back",
          email: "Email",
          emailPlaceholder: "your@email.com",
          password: "Password",
          passwordPlaceholder: "Enter your password",
          button: "Sign In",
          noAccount: "Don't have an account?",
          signUp: "Sign Up",
          loading: "Signing in...",
          error: "Login failed",
          networkError: "Network error. Please try again.",
          invalidCredentials: "Invalid email or password",
        },

        // ============ AUTH - REGISTER ============
        register: {
          title: "Create Account",
          subtitle: "Join us today",
          name: "Full Name",
          namePlaceholder: "John Doe",
          email: "Email",
          emailPlaceholder: "your@email.com",
          password: "Password",
          passwordPlaceholder: "Create a strong password",
          button: "Sign Up",
          haveAccount: "Already have an account?",
          signIn: "Sign In",
          loading: "Creating account...",
          error: "Registration failed",
          networkError: "Network error. Please try again.",
        },

        // ============ SELECTION PAGE ============
        selection: {
          title: "How would you like to use BizSlot?",
          subtitle: "Select your account type to get started.",
          businessOwner: {
            title: "Business Owner",
            description:
              "Manage services, team, and growth. Everything you need to scale your local business.",
            buttonLabel: "Get Started as Owner",
          },
          customer: {
            title: "Customer",
            description:
              "Discover local services and book instantly. Manage all your appointments in one place.",
            buttonLabel: "Book a Service",
          },
          termsNotice:
            "By continuing, you agree to our Terms of Service and Privacy Policy.",
        },

        // ============ LANDING PAGE ============
        landing: {
          customer: {
            title: "Find and book the best local services",
            subtitle:
              "The easiest way to schedule your life. Verified pros at your fingertips.",
            searchPlaceholder: "Barber, Dentist, Yoga...",
            categories: "Explore Services",
            seeAll: "See all",
            exploreButton: "Explore Services",
            badges: {
              verified: "Verified Pros",
              booking: "3-click Booking",
              schedule: "Manage Schedule",
            },
          },
          owner: {
            edition: "Business Owner Edition",
            title: "Transform your business scheduling",
            subtitle:
              "Automate bookings, manage your team, and scale your operations with the most intuitive platform for professionals.",
            signupButton: "Sign up now",
            noCardRequired: "No credit card required.",
            scaleOperations: "Scale your operations",
            features: {
              availability: {
                title: "Smart Availability",
                description:
                  "Intelligent sync with your personal calendar and buffer times between sessions.",
              },
              teamCoordination: {
                title: "Team Coordination",
                description:
                  "Manage staff schedules, permissions, and performance metrics in one dashboard.",
              },
              clientGrowth: {
                title: "Client Growth",
                description:
                  "Built-in marketing tools and loyalty programs to keep your clients coming back.",
              },
            },
            stats: {
              label: "Business Impact",
              value: "Save 10 hours/week",
              description: "Average time saved on admin tasks",
            },
            howItWorks: {
              title: "How It Works",
              setup: {
                title: "1. Setup your Business",
                description:
                  "Create your professional profile and list your services in minutes.",
              },
              availability: {
                title: "2. Set Availability",
                description:
                  "Build your custom rules and automatically generate bookable slots.",
              },
              grow: {
                title: "3. Grow & Manage",
                description:
                  "Accept bookings effortlessly and track growth with deep insights.",
              },
            },
          },
        },

        // ============ SIDEBAR ============
        sidebar: {
          search: "Search",
          documentation: "Documentation",
          login: "Log In",
          signup: "Sign Up",
          followed: "Followed Businesses",
          dashboard: "Dashboard",
          logout: "Logout",
          mainSection: "Main",
          businessSection: "Business",
          accountSection: "Account",
        },

        // ============ BUTTONS ============
        buttons: {
          save: "Save",
          cancel: "Cancel",
          delete: "Delete",
          edit: "Edit",
          close: "Close",
          next: "Next",
          previous: "Previous",
          submit: "Submit",
          confirm: "Confirm",
          logout: "Logout",
          openMenu: "Open menu",
          closeMenu: "Close menu",
        },

        // ============ FORMS ============
        forms: {
          required: "This field is required",
          invalidEmail: "Please enter a valid email",
          passwordTooShort: "Password must be at least 6 characters",
          passwordMismatch: "Passwords do not match",
          confirmPassword: "Confirm Password",
          selectOption: "Select an option",
        },

        // ============ MESSAGES ============
        messages: {
          success: "Success",
          error: "Error",
          warning: "Warning",
          info: "Information",
          loading: "Loading...",
          noData: "No data available",
          tryAgain: "Try again",
        },

        // ============ VALIDATION ============
        validation: {
          required: "This field is required",
          invalidEmail: "Invalid email address",
          passwordTooWeak: "Password is too weak",
          maxLength: "Maximum length exceeded",
          minLength: "Minimum length not met",
        },

        // ============ APPOINTMENTS ============
        appointments: {
          title: "My Appointments",
          upcoming: "Upcoming",
          past: "Past",
          cancelled: "Cancelled",
          noAppointments: "No appointments yet",
          book: "Book Appointment",
          cancel: "Cancel Appointment",
          reschedule: "Reschedule",
          details: "Appointment Details",
          date: "Date",
          time: "Time",
          service: "Service",
          provider: "Service Provider",
          status: "Status",
        },

        // ============ BUSINESS ============
        business: {
          title: "Business",
          dashboard: "Dashboard",
          myServices: "My Services",
          schedule: "Schedule",
          staff: "Staff",
          settings: "Settings",
          addService: "Add Service",
          editService: "Edit Service",
          serviceName: "Service Name",
          duration: "Duration",
          price: "Price",
          description: "Description",
          addStaff: "Add Staff Member",
          inviteWorker: "Invite Worker",
        },

        // ============ PROFILE ============
        profile: {
          title: "Profile",
          myProfile: "My Profile",
          editProfile: "Edit Profile",
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email",
          phone: "Phone",
          address: "Address",
          avatar: "Profile Picture",
          changePassword: "Change Password",
          deleteAccount: "Delete Account",
        },

        // ============ SETTINGS ============
        settings: {
          title: "Settings",
          language: "Language",
          darkMode: "Dark Mode",
          notifications: "Notifications",
          privacy: "Privacy",
          about: "About",
          version: "Version",
        },

        // ============ COMMON ============
        common: {
          direction: "ltr",
          loading: "Loading...",
          pleaseWait: "Please wait...",
          back: "Back",
          home: "Home",
          about: "About",
          contact: "Contact",
          help: "Help",
          faq: "FAQ",
          terms: "Terms of Service",
          privacy: "Privacy Policy",
        },

        // ============ DIALOG ============
        dialog: {
          confirm: "Are you sure?",
          confirmDelete: "Are you sure you want to delete this?",
          confirmLogout: "Are you sure you want to log out?",
          thisActionCannotBeUndone: "This action cannot be undone.",
        },
      },
    },
    he: {
      translation: {
        // ============ LANGUAGE ============
        lang: {
          english: "English",
          hebrew: "עברית",
          selectLanguage: "בחר שפה",
        },

        // ============ NAVIGATION ============
        nav: {
          home: "בית",
          search: "חיפוש",
          myAppointments: "הפגישות שלי",
          favorites: "מועדפים",
          dashboard: "לוח בקרה",
          services: "שירותים",
          schedule: "לוח זמנים",
          staff: "צוות / שותפים",
          profile: "פרופיל",
          settings: "הגדרות",
          menu: "תפריט",
        },

        // ============ AUTH - LOGIN ============
        login: {
          title: "כניסה",
          subtitle: "ברוכים הבאים חזרה",
          email: "דוא״ל",
          emailPlaceholder: "your@email.com",
          password: "סיסמה",
          passwordPlaceholder: "הזן את הסיסמה שלך",
          button: "כניסה",
          noAccount: "אין לך חשבון?",
          signUp: "הרשמה",
          loading: "מתחבר...",
          error: "ההתחברות נכשלה",
          networkError: "שגיאת רשת. בחזור שוב.",
          invalidCredentials: "דוא״ל או סיסמה שגויים",
        },

        // ============ AUTH - REGISTER ============
        register: {
          title: "יצירת חשבון",
          subtitle: "הצטרף אלינו היום",
          name: "שם מלא",
          namePlaceholder: "יוסי כהן",
          email: "דוא״ל",
          emailPlaceholder: "your@email.com",
          password: "סיסמה",
          passwordPlaceholder: "צור סיסמה חזקה",
          button: "הרשמה",
          haveAccount: "יש לך כבר חשבון?",
          signIn: "כניסה",
          loading: "יוצר חשבון...",
          error: "ההרשמה נכשלה",
          networkError: "שגיאת רשת. בחזור שוב.",
        },

        // ============ SELECTION PAGE ============
        selection: {
          title: "איך היית רוצה להשתמש ב-BizSlot?",
          subtitle: "בחר את סוג החשבון שלך כדי להתחיל.",
          businessOwner: {
            title: "בעל עסק",
            description:
              "נהל שירותים, צוות וגדילה. כל מה שאתה צריך כדי להגדיל את העסק המקומי שלך.",
            buttonLabel: "התחל כבעל עסק",
          },
          customer: {
            title: "לקוח",
            description:
              "גלה שירותים מקומיים והזמן באופן מיידי. נהל את כל התפגישות שלך במקום אחד.",
            buttonLabel: "הזמן שירות",
          },
          termsNotice: "בהמשך, אתה מסכים לתנאי השירות ולמדיניות הפרטיות שלנו.",
        },

        // ============ LANDING PAGE ============
        landing: {
          customer: {
            title: "מצא והזמן את השירותים המקומיים הטובים ביותר",
            subtitle:
              "הדרך הקלה ביותר לתזמן את חיינו. אנשי מקצוע מאומתים בקצה האצבעות שלך.",
            searchPlaceholder: "מספרה, רופא שיניים, יוגה...",
            categories: "גלה שירותים",
            seeAll: "הצג הכל",
            exploreButton: "גלה שירותים",
            badges: {
              verified: "אנשי מקצוע מאומתים",
              booking: "הזמנה ב-3 קליקים",
              schedule: "נהל לוח זמנים",
            },
          },
          owner: {
            edition: "מהדורת בעל עסק",
            title: "נהל את יומן העסק שלך בקלות",
            subtitle:
              "אוטומציה של הזמנות, ניהול הצוות שלך והגדלת הפעולות שלך עם הפלטפורמה האינטואיטיבית ביותר לאנשי מקצוע.",
            signupButton: "הירשם עכשיו",
            noCardRequired: "לא נדרש כרטיס אשראי.",
            scaleOperations: "הגדל את הפעולות שלך",
            features: {
              availability: {
                title: "זמינות חכמה",
                description:
                  "סנכרון חכם עם הלוח השנתי האישי שלך וזמני חיץ בין הפגישות.",
              },
              teamCoordination: {
                title: "תיאום צוות",
                description:
                  "נהל לוחות זמנים של צוות, הרשאות ומדדי ביצוע בלוח בקרה אחד.",
              },
              clientGrowth: {
                title: "גדילת לקוח",
                description:
                  "כלים שיווקיים מובנים ותוכניות נאמנות כדי לשמור על הלקוחות שלך חוזרים.",
              },
            },
            stats: {
              label: "השפעה על העסק",
              value: "שמור 10 שעות בשבוע",
              description: "זמן ממוצע שחוסכו במשימות ניהול",
            },
            howItWorks: {
              title: "איך זה עובד?",
              setup: {
                title: "1. הגדר את העסק שלך",
                description: "צור פרופיל מקצועי ורשום את השירותים שלך בדקות.",
              },
              availability: {
                title: "2. הגדר זמינות",
                description:
                  "בנה את הכללים המותאמים שלך וייצר באופן אוטומטי משבצות שניתן להזמין.",
              },
              grow: {
                title: "3. גדל וניהל",
                description:
                  "קבל הזמנות ללא מאמץ ועקוב אחר הגדילה עם תובנות עמוקות.",
              },
            },
          },
        },

        // ============ SIDEBAR ============
        sidebar: {
          search: "חיפוש",
          documentation: "תיעוד",
          login: "התחברות",
          signup: "הרשמה",
          followed: "עסקים במעקב",
          dashboard: "לוח בקרה",
          logout: "התנתקות",
          mainSection: "ראשי",
          businessSection: "עסק",
          accountSection: "חשבון",
        },

        // ============ BUTTONS ============
        buttons: {
          save: "שמור",
          cancel: "ביטול",
          delete: "מחק",
          edit: "עריכה",
          close: "סגור",
          next: "הבא",
          previous: "הקודם",
          submit: "שלח",
          confirm: "אישור",
          logout: "התנתקות",
          openMenu: "פתח תפריט",
          closeMenu: "סגור תפריט",
        },

        // ============ FORMS ============
        forms: {
          required: "שדה זה חובה",
          invalidEmail: "אנא הזן דוא״ל תקף",
          passwordTooShort: "הסיסמה חייבת להיות לפחות 6 תווים",
          passwordMismatch: "הסיסמאות לא תואמות",
          confirmPassword: "אשר סיסמה",
          selectOption: "בחר אפשרות",
        },

        // ============ MESSAGES ============
        messages: {
          success: "הצלחה",
          error: "שגיאה",
          warning: "אזהרה",
          info: "מידע",
          loading: "טוען...",
          noData: "אין נתונים זמינים",
          tryAgain: "נסה שוב",
        },

        // ============ VALIDATION ============
        validation: {
          required: "שדה זה חובה",
          invalidEmail: "כתובת דוא״ל שגויה",
          passwordTooWeak: "הסיסמה חלשה מדי",
          maxLength: "אורך מקסימלי חרוג",
          minLength: "אורך מינימלי לא הושג",
        },

        // ============ APPOINTMENTS ============
        appointments: {
          title: "הפגישות שלי",
          upcoming: "קרוב",
          past: "עבר",
          cancelled: "בוטל",
          noAppointments: "אין פגישות עדיין",
          book: "הזמן פגישה",
          cancel: "ביטול הפגישה",
          reschedule: "תזמן מחדש",
          details: "פרטי הפגישה",
          date: "תאריך",
          time: "שעה",
          service: "שירות",
          provider: "ספק שירות",
          status: "סטטוס",
        },

        // ============ BUSINESS ============
        business: {
          title: "עסק",
          dashboard: "לוח בקרה",
          myServices: "השירותים שלי",
          schedule: "לוח זמנים",
          staff: "צוות",
          settings: "הגדרות",
          addService: "הוסף שירות",
          editService: "ערוך שירות",
          serviceName: "שם השירות",
          duration: "משך",
          price: "מחיר",
          description: "תיאור",
          addStaff: "הוסף חבר צוות",
          inviteWorker: "הזמן עובד",
        },

        // ============ PROFILE ============
        profile: {
          title: "פרופיל",
          myProfile: "הפרופיל שלי",
          editProfile: "ערוך פרופיל",
          firstName: "שם פרטי",
          lastName: "שם משפחה",
          email: "דוא״ל",
          phone: "טלפון",
          address: "כתובת",
          avatar: "תמונת פרופיל",
          changePassword: "שנה סיסמה",
          deleteAccount: "מחק חשבון",
        },

        // ============ SETTINGS ============
        settings: {
          title: "הגדרות",
          language: "שפה",
          darkMode: "מצב אפל",
          notifications: "התראות",
          privacy: "פרטיות",
          about: "אודות",
          version: "גרסה",
        },

        // ============ COMMON ============
        common: {
          direction: "rtl",
          loading: "טוען...",
          pleaseWait: "אנא המתן...",
          back: "חזרה",
          home: "בית",
          about: "אודות",
          contact: "צור קשר",
          help: "עזרה",
          faq: "שאלות נפוצות",
          terms: "תנאי השירות",
          privacy: "מדיניות פרטיות",
        },

        // ============ DIALOG ============
        dialog: {
          confirm: "האם אתה בטוח?",
          confirmDelete: "האם אתה בטוח שברצונך למחוק זאת?",
          confirmLogout: "האם אתה בטוח שברצונך להתנתק?",
          thisActionCannotBeUndone: "לא ניתן לבטל פעולה זו.",
        },
      },
    },
  },
  //lng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
