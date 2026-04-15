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

        // ============ THEME ============
        theme: {
          switchToDark: "Switch to dark mode",
          switchToLight: "Switch to light mode",
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
          confirmPassword: "Confirm Password",
          confirmPasswordPlaceholder: "Re-enter your password",
          button: "Sign Up",
          haveAccount: "Already have an account?",
          signIn: "Sign In",
          loading: "Creating account...",
          error: "Registration failed",
          networkError: "Network error. Please try again.",
          orContinueWith: "Or continue with",
          inviteBanner: "You've been invited to join a business team! Create your account below and your invitation will be accepted automatically.",
          inviteExpired: "This invitation link has expired. Please ask the business owner to send a new one.",
          inviteInvalid: "This invitation link is invalid. Please ask the business owner for a new invitation.",
          validation: {
            nameRequired: "Full name is required",
            emailInvalid: "Please enter a valid email address",
            passwordTooShort: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a digit",
            passwordMismatch: "Passwords do not match",
          },
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

        // ============ HOME PAGE (logged-out landing) ============
        homePage: {
          hero: {
            headline: "Book appointments with local businesses, effortlessly.",
            description:
              "BizSlot connects customers with local businesses for quick, hassle-free appointment booking — and gives owners the tools to manage it all.",
            ctaFind: "Find a Business",
            ctaList: "List Your Business",
            alreadyHaveAccount: "Already have an account?",
            logIn: "Log in",
          },
          customers: {
            label: "For Customers",
            title: "Booking made simple",
            subtitle: "From searching to confirmed — it takes less than a minute.",
            howItWorksTitle: "How it works",
            steps: {
              signUp: {
                title: "Sign Up",
                description: "Create a free account in seconds — no credit card required.",
              },
              search: {
                title: "Search a Business",
                description:
                  "Browse by category or location and explore business profiles with real photos and reviews.",
              },
              book: {
                title: "Book an Appointment",
                description:
                  "Pick an available time slot and confirm instantly — you'll get a notification right away.",
              },
            },
            features: {
              categories: "Browse by category (barbers, trainers, nail artists & more)",
              map: "Map view to find businesses near you",
              slots: "See real-time available slots",
              confirmation: "Instant booking confirmation",
            },
            cta: "Get Started for Free",
          },
          owners: {
            label: "For Business Owners",
            title: "Grow your business",
            subtitle:
              "Get online in minutes. Manage your schedule, services, and customers — all in one place.",
            howItWorksTitle: "How it works",
            steps: {
              signUp: {
                title: "Sign Up",
                description: "Create your BizSlot account as a business owner.",
              },
              create: {
                title: "Create Your Business",
                description:
                  "Set up your public business page with a name, category, logo, and description.",
              },
              services: {
                title: "Add Services & Schedule",
                description:
                  "Define your services with pricing, duration, and working hours. Block holidays with ease.",
              },
              launch: {
                title: "Start Getting Customers",
                description:
                  "Go live — customers can find you, view your page, and book appointments instantly.",
              },
            },
            features: {
              businessPage: "Custom public business page",
              pricing: "Service & pricing management",
              schedule: "Full schedule control with exception dates",
              analytics: "Appointments dashboard & analytics",
              reviews: "Customer reviews",
            },
            cta: "List Your Business",
          },
        },

        // ============ CUSTOMER HOME ============
        customerHome: {
          greeting: "Hello, {{name}}!",
          greetingSubUpcoming: "You have an upcoming appointment.",
          greetingSubEmpty: "No appointments yet — find a business to get started.",
          searchPlaceholder: "Search for a business...",
          nextAppointment: {
            label: "Next Appointment",
            viewAll: "View all appointments",
            empty: "No upcoming appointments.",
            findBusiness: "Find a business →",
          },
          recentBusinesses: {
            label: "Recently Booked",
            empty: "You haven't booked with anyone yet.",
            explore: "Explore businesses →",
          },
          pendingReviews: {
            label: "Leave a Review",
          },
        },

        // ============ PARTNER HOME ============
        partnerHome: {
          greeting: "Hello, {{name}}!",
          workingAt: "Working at {{name}}",
          nextAppointment: {
            label: "Next Appointment",
            viewAll: "View all appointments",
            empty: "No upcoming appointments. Enjoy your free time!",
          },
          stats: {
            today: "Today",
            thisWeek: "This Week",
          },
          assignedServices: {
            label: "My Services",
            empty: "No services assigned yet.",
          },
          workplace: {
            label: "My Workplace",
            viewPage: "View business page",
          },
          becomeOwner: {
            title: "Start your own business",
            subtitle: "Upgrade your account to Business Owner and list your own services on BizSlot.",
            cta: "Become a Business Owner",
            error: "Something went wrong. Please try again.",
          },
        },

        // ============ OWNER HOME ============
        ownerHome: {
          greeting: "Hello, {{name}}!",
          noBusinessPrompt: "Welcome! Ready to list your business?",
          completeSetup: "Complete Setup",
          businessSubtitle: "{{name}}",
          yourBusinesses: "Your Businesses",
          todaySchedule: {
            label: "Today's Schedule",
            viewAll: "View full schedule",
            empty: "No appointments today.",
            manage: "Manage schedule →",
            more: "+{{count}} more",
          },
          quickActions: {
            label: "Quick Actions",
            businessPage: "My Business Page",
            services: "Manage Services",
            schedule: "Manage Schedule",
            dashboard: "View Dashboard",
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
          businessPage: "Business Page",
          services: "Services",
          schedule: "Schedule",
          staffPartners: "Staff / Partners",
          createBusiness: "Create your business",
          myBusinesses: "My Businesses",
          noBusinesses: "No businesses found.",
          addAnotherBusiness: "Add another business",
          myWorkplace: "My Workplace",
          myShifts: "My Shifts",
          favorites: "Favorites",
          noFollowed: "No followed businesses yet.",
          loading: "Loading…",
          signedIn: "Signed in",
          notSignedIn: "Not signed in",
          adminSection: "Admin",
          adminDashboard: "Admin Dashboard",
          categoryRequests: "Category Requests",
        },

        // ============ ADMIN ============
        admin: {
          categoryRequests: {
            title: "Category Requests",
            subtitle: "Review and approve AI-suggested categories from business owners",
            loadError: "Failed to load category requests.",
            approveError: "Failed to approve request. Please try again.",
            rejectError: "Failed to reject request. Please try again.",
            requester: "Requested by",
            description: "Service description",
            aiSuggestion: "AI Suggestion",
            noName: "No name suggested",
            noAiSuggestion: "No AI suggestion — please enter a name manually.",
            addName: "Add name",
            edit: "Edit",
            editTitle: "Override AI suggestion",
            namePlaceholder: "Category name (e.g. Personal Training)",
            iconPlaceholder: "Material icon name (e.g. fitness_center)",
            approve: "Approve",
            reject: "Reject",
            empty: {
              title: "All caught up!",
              text: "No pending category requests.",
            },
          },
        },

        // ============ NOTIFICATION SETTINGS PAGE ============
        notificationSettings: {
          description: "Choose which in-app notifications you receive for your business.",
          newBooking: "New Booking",
          newBookingDesc: "Get notified when a customer books an appointment",
          cancellation: "Cancellation",
          cancellationDesc: "Get notified when a customer cancels their appointment",
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
          goBack: "Go back",
          follow: "Follow",
          unfollow: "Unfollow",
          menu: "Menu",
        },

        // ============ FORMS ============
        forms: {
          required: "This field is required",
          invalidEmail: "Please enter a valid email",
          passwordTooShort: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a digit",
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
          subtitle: "Update your name, email, or password.",
          nameLabel: "Name",
          emailLabel: "Email",
          namePlaceholder: "Your name",
          emailPlaceholder: "Your email",
          changePasswordOptional: "(optional)",
          currentPasswordLabel: "Current Password",
          currentPasswordPlaceholder: "Enter current password",
          newPasswordLabel: "New Password",
          newPasswordPlaceholder: "Enter new password",
          confirmPasswordLabel: "Confirm New Password",
          confirmPasswordPlaceholder: "Confirm new password",
          saveChanges: "Save Changes",
          error: {
            loadFailed: "Failed to load profile. Please try again.",
            saveFailed: "Failed to save profile.",
            networkError: "Network error. Please try again.",
            nameRequired: "Name is required.",
            emailRequired: "Email is required.",
            currentPasswordRequired: "Current password is required.",
            newPasswordRequired: "New password is required.",
            passwordTooShort: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a digit.",
            passwordMismatch: "Passwords do not match.",
          },
          success: {
            updated: "Profile updated successfully.",
          },
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

        // ============ NOTIFICATIONS ============
        notifications: {
          title: "Notifications",
          empty: "No notifications yet",
          markAllRead: "Mark all as read",

          timeAgo: {
            justNow: "just now",
            minutesAgo: "{{count}}m ago",
            hoursAgo: "{{count}}h ago",
            daysAgo: "{{count}}d ago",
          },

          appointmentBooked: {
            ownerTitle: "New Appointment",
            ownerBody: "{{clientName}} booked {{serviceName}} on {{date}}",
            customerTitle: "Booking Confirmed",
            customerBody: "Your {{serviceName}} appointment at {{businessName}} on {{date}} is confirmed",
          },
          appointmentCancelled: {
            ownerTitle: "Appointment Cancelled",
            ownerBody: "{{clientName}} cancelled their {{serviceName}} appointment on {{date}}",
            customerTitle: "Appointment Cancelled",
            customerBody: "Your {{serviceName}} appointment at {{businessName}} on {{date}} was cancelled by the business",
          },
          appointmentReminder: {
            title: "Appointment Reminder",
            body: "Reminder: {{serviceName}} at {{businessName}} is tomorrow at {{date}}",
          },
          reviewPrompt: {
            title: "How was your visit?",
            body: "How was your appointment at {{businessName}}? Leave a review!",
          },
          invitationReceived: {
            title: "You've been invited!",
            body: "{{businessName}} has invited you to join their team. Tap to view.",
          },
        },

        // ============ COMMON ============
        common: {
          direction: "ltr",
          loading: "Loading...",
          pleaseWait: "Please wait...",
          back: "Back",
          home: "Home",
          unknownError: "Unknown error",
          saving: "Saving...",
          saved: "Saved",
          errorOccurred: "An error occurred. Please try again.",
          about: "About",
          contact: "Contact",
          help: "Help",
          faq: "FAQ",
          terms: "Terms of Service",
          privacy: "Privacy Policy",
          durationMin: "{{count}} min",
          durationHour: "{{count}}h",
          durationHourMin: "{{count}}h {{minutes}}m",
        },

        // ============ DIALOG ============
        dialog: {
          confirm: "Are you sure?",
          confirmDelete: "Are you sure you want to delete this?",
          confirmLogout: "Are you sure you want to log out?",
          thisActionCannotBeUndone: "This action cannot be undone.",
        },

        // ============ CALENDAR / DATE PICKER ============
        calendar: {
          months: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
          days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
          daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          daysFull: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          prevMonth: "Previous month",
          nextMonth: "Next month",
          loading: "Loading availability…",
          error: "Failed to load availability",
          selected: "(selected)",
          unavailable: "(unavailable)",
        },

        // ============ SEARCH ============
        search: {
          placeholder: "Search for salons, doctors...",
          clearAriaLabel: "Clear search",
          filterAriaLabel: "Filter categories",
          filters: {
            title: "Filters",
            closePanelAriaLabel: "Close filter panel",
            categories: "Categories",
            availableOn: "Available on",
            clear: "Clear",
            timeRange: "Time range (optional)",
            timeTo: "to",
            all: "All",
          },
          emptyState: {
            title: "Explore Businesses",
            text: "Search for your favorite salons, doctors, fitness centers, and more",
          },
          list: {
            error: "Something went wrong",
            noResults: "No results found",
            noResultsHint: "Try adjusting your search or filters",
            featuredBusinesses: "Featured Businesses",
            seeAll: "See all",
            nearYou: "Near You",
            searchResults: "Search Results",
            loadingMore: "Loading more results...",
            noMoreResults: "No more results to load",
          },
          map: {
            loadFailed: "Map failed to load",
            zoomIn: "Zoom in",
            zoomOut: "Zoom out",
            centerLocation: "Center on your location",
            results: "results",
            bookNow: "Book Now",
            loading: "Loading results...",
            noResults: "No results found",
            noResultsHint: "Try adjusting your search",
          },
        },

        // ============ STAFF MANAGEMENT ============
        staff: {
          title: "Staff Management",
          inviteButton: "Invite Staff",
          teamMembers: "Team Members",
          pendingInvitations: "Pending Invitations",
          joined: "Joined {{date}}",
          expires: "Expires {{date}}",
          cancel: "Cancel",
          cancelling: "Cancelling…",
          error: {
            loadFailed: "Failed to load staff data.",
            saveFailed: "Failed to save assignments.",
            inviteFailed: "Failed to send invitation.",
          },
          empty: {
            title: "No staff members yet",
            text: "Invite someone by email to get started.",
          },
          inviteModal: {
            title: "Invite Staff Member",
            emailLabel: "Email address",
            emailPlaceholder: "worker@example.com",
            messageLabel: "Message (optional)",
            messagePlaceholder: "Add a personal note...",
            submitButton: "Send Invitation",
          },
          detail: {
            performance: "Performance (This Month)",
            appointments: "Appointments",
            thisPeriod: "this period",
            revenue: "Revenue",
            fromCompleted: "from completed",
            completion: "Completion",
            completionRate: "completion rate",
            avgRating: "Avg Rating",
            comingSoon: "Coming soon",
            noData: "No data available.",
            serviceAssignments: "Service Assignments",
            noServices: "No services available for this business.",
            saveAssignments: "Save Assignments",
            removeFromBusiness: "Remove from business",
          },
          remove: {
            title: "Remove Staff Member",
            message:
              "Remove {{name}} from your business? They will lose access immediately.",
            confirmLabel: "Remove",
          },
          inactiveSection: "Past Members",
          inactive: {
            removed: "Removed",
            declined: "Declined invitation",
            expired: "Invitation expired",
          },
        },

        // ============ INVITATIONS ============
        invitations: {
          title: "Business Invitations",
          pendingCount_one: "{{count}} pending invite",
          pendingCount_other: "{{count}} pending invites",
          invitedAt: "Invited {{date}}",
          expiresIn_one: "Expires in {{count}} day",
          expiresIn_other: "Expires in {{count}} days",
          expiresToday: "Expires today",
          status: {
            accepted: "Accepted",
            declined: "Declined",
            expired: "Expired",
          },
          actions: {
            accept: "Accept",
            decline: "Decline",
          },
          sections: {
            pending: "Pending",
            past: "Past",
          },
          empty: {
            title: "No invitations yet",
            text: "When a business owner invites you to join their team, it will appear here.",
          },
          error: {
            loadFailed: "Failed to load invitations.",
          },
        },

        // ============ REVIEWS ============
        reviews: {
          title: "Reviews",
          avgSuffix: "avg",
          modal: {
            title: "Leave a Review",
            placeholder: "Share your experience (optional)",
            submitButton: "Submit Review",
            submitting: "Submitting…",
            cancel: "Cancel",
            errorNoRating: "Please select a star rating.",
            errorSubmit: "Failed to submit review. Please try again.",
            starAriaLabel_one: "Rate {{count}} star",
            starAriaLabel_other: "Rate {{count}} stars",
          },
          viewModal: {
            title: "Customer Review",
            noComment: "No written comment left.",
            close: "Close",
            closeAriaLabel: "Close",
          },
          filters: {
            title: "Filters",
            clearAll: "Clear all",
            service: "Service",
            allServices: "All services",
            rating: "Rating",
            all: "All",
            from: "From",
            to: "To",
          },
          empty: {
            noMatch: "No reviews match your filters",
            noReviews: "No reviews yet",
          },
          clearFilters: "Clear filters",
          loadMore: "Load more reviews",
          loadMoreNote: "More reviews may exist — clear filters to load all",
          flag: {
            title: "Flag Review",
            subtitle: "Describe why this review is inappropriate",
            placeholder:
              "e.g. This review contains false information or abusive language…",
            submitButton: "Submit Flag",
            submitting: "Submitting…",
            cancel: "Cancel",
            errorSubmit: "Failed to flag the review. Please try again.",
            alreadyFlagged: "Already flagged",
            flagAsInappropriate: "Flag as inappropriate",
            pendingNote:
              "Pending admin review — still visible on public page until reviewed",
            dismissedNote:
              "Flag reviewed and dismissed by admin — this review cannot be re-flagged",
          },
          badge: {
            flagged: "Flagged",
            flagDismissed: "Flag Dismissed",
          },
        },

        // ============ DASHBOARD (Business Owner) ============
        dashboard: {
          editPage: "Edit Page",
          followers: "Followers",
          performance: "Performance",
          noData: "No data for this period",
          selectMetrics: "Select metrics above to display analytics",
          setupBusiness: "Set up your business",
          error: {
            noBusinessFound: "No business found. Please complete onboarding.",
            voidFailed: "Failed to void appointment. Please try again.",
            loadFailed: "Failed to load business.",
          },
          cancelAppt: {
            title: "Cancel completed appointment?",
            message:
              "This will mark the appointment as canceled. Use this only if the service did not take place.",
            confirm: "Yes, cancel it",
            cancel: "Keep it",
          },
          metrics: {
            totalBookings: "Total Bookings",
            revenue: "Revenue",
            revenueSubtext: "Estimated from service prices",
            topService: "Top Service",
            cancellations: "Cancellations",
            noAppointments: "No appointments",
            cancellationRate: "{{rate}}% cancellation rate",
            avgValue: "Avg Booking Value",
            revenuePerAppt: "Revenue per appointment",
            uniqueCustomers: "Unique Customers",
            individualClient: "individual client",
            individualClients: "individual clients",
            busiestDay: "Busiest Day",
            mostBookingsDay: "Most bookings on this day",
            appointment: "appointment",
            appointments: "appointments",
            noDataYet: "No data yet",
            bookings: "bookings",
          },
          manage: "Manage",
          reviews: "Reviews",
          upcomingAppointments: "Upcoming Appointments",
          completedAppointments: "Completed Appointments",
          viewAll: "View all",
          viewAllAppointments: "+{{count}} more — View all",
          manageAll: "Manage all appointments →",
          noUpcoming: {
            title: "No upcoming appointments",
            text: "New bookings will appear here.",
          },
          noCompleted: "No completed appointments yet",
          markedNotCompleted: "Marked as not completed",
          noReview: "No review yet",
          canceling: "Canceling…",
          didntHappen: "Didn't happen",
          confirmed: "Confirmed",
          businessDashboard: "Business Dashboard",
          avgSuffix: "avg",
          reviewCount_one: "{{count}} review",
          reviewCount_other: "{{count}} reviews",
          noReviewsYet: "No reviews yet",
          notificationSettings: "Notification Settings",
          notificationSettingsSubtext: "Manage which notifications you receive",
          servicesHours: "Services & Hours",
          servicesHoursDesc: "Edit working hours, breaks & availability",
          viewPublicPage: "View Public Page",
          viewPublicPageDesc: "See your page as customers see it",
          editBusinessPage: "Edit Business Page",
          editBusinessPageDesc: "Update info, photos, and description",
          staffManagement: "Staff Management",
          staffManagementDesc: "Invite, assign services & view performance",
        },

        // ============ CUSTOMER DASHBOARD ============
        customerDashboard: {
          title: "My Dashboard",
          myActivity: "My Activity",
          selectMetrics: "Select metrics above to display your activity",
          noDataPeriod: "No data for this period",
          upcomingAppointments: "Upcoming Appointments",
          viewAll: "View all",
          manageAll: "Manage all appointments →",
          quickActions: "Quick Actions",
          myAppointments: "My Appointments",
          myAppointmentsDesc: "View, manage & cancel bookings",
          discoverBusinesses: "Discover Businesses",
          discoverBusinessesDesc: "Find and book new services",
          myProfile: "My Profile",
          myProfileDesc: "Update your account details",
          businessInvitations: "Business Invitations",
          pendingInvites_one: "{{count}} pending invite waiting for you",
          pendingInvites_other: "{{count}} pending invites waiting for you",
          followedBusinesses: "Followed Businesses",
          discoverMore: "Discover more",
          noFollowed: {
            title: "No followed businesses yet",
            text: "Follow businesses to get quick access and re-book your favourite services.",
          },
          noUpcoming: {
            title: "No upcoming appointments",
            text: "Book a service to get started.",
          },
          findBusiness: "Find a business",
          exploreBusinesses: "Explore businesses",
          confirmed: "Confirmed",
          metrics: {
            totalBookings: "Total Bookings",
            completed: "Completed",
            cancellations: "Cancellations",
            noAppointments: "No appointments",
            totalSpent: "Total Spent",
            favBusiness: "Favourite Business",
            favService: "Favourite Service",
            noDataYet: "No data yet",
            appointment: "appointment",
            appointments: "appointments",
          },
        },

        // ============ CUSTOMER APPOINTMENTS PAGE ============
        customerAppointments: {
          title: "My Appointments",
          tabs: {
            upcoming: "Upcoming",
            past: "Past",
          },
          status: {
            confirmed: "Confirmed",
            canceled: "Canceled",
            completed: "Completed",
          },
          empty: {
            upcoming: "No upcoming appointments",
            past: "No past appointments",
            text: "Book a service to get started.",
          },
          findBusiness: "Find a business",
          cancel: "Cancel",
          canceling: "Canceling…",
          notCompleted: "Business marked as Not Completed",
          reviewed: "Reviewed",
          leaveReview: "Leave a Review",
          error: {
            loadFailed: "Failed to load appointments.",
          },
          cancelDialog: {
            title: "Cancel appointment?",
            message:
              "Are you sure you want to cancel this appointment? This action cannot be undone.",
            confirm: "Yes, cancel it",
            cancel: "Keep it",
          },
        },

        // ============ ADD TO CALENDAR ============
        addToCalendar: {
          button: "Add to Calendar",
          ariaLabel: "Add appointment to calendar",
          google: "Google Calendar",
          ics: "Download .ics",
        },

        // ============ STAFF DASHBOARD ============
        staffDashboard: {
          title: "Staff Dashboard",
          subtitle: "Staff member",
          myServices: "My Services",
          noServices: {
            title: "No services assigned yet",
            text: "Your business owner will assign services to you.",
          },
          viewSchedule: "View Schedule",
          editAvailability: "Edit Availability",
          upcoming: "Upcoming Appointments",
          noUpcoming: {
            title: "No upcoming appointments",
            text: "New bookings will appear here.",
          },
          completed: "Completed Appointments",
          noCompleted: "No completed appointments yet",
          didntHappen: "Didn't happen",
          canceling: "Canceling…",
          markedNotCompleted: "Marked as not completed",
          noReview: "No review yet",
          error: {
            voidFailed: "Failed to void appointment. Please try again.",
          },
          cancelDialog: {
            title: "Cancel completed appointment?",
            message:
              "This will mark the appointment as canceled. Use this only if the service did not take place.",
            confirm: "Yes, cancel it",
            cancel: "Keep it",
          },
        },

        // ============ BOOKING ============
        booking: {
          errorServiceNotFound: "Service not found.",
          errorLoadFailed: "Failed to load booking details.",
          errorSomethingWrong: "Something went wrong.",
          goBack: "Go back",
          slotTaken: "That slot was just taken. Please pick another time.",
          errorTryAgain: "Something went wrong. Please try again.",
          confirmed: {
            header: "Booking Confirmed",
            title: "You're booked!",
            subtitle: "Your appointment has been confirmed.",
            confirmationCode: "Confirmation #",
            business: "Business",
            service: "Service",
            date: "Date",
            time: "Time",
            total: "Total",
            viewAppointments: "View in your appointments",
            backToBusiness: "Back to Business Page",
          },
          pickDate: "Pick a date",
          availableTimes: "Available times",
          noSlots: "No available slots for this date.",
          summary: "Booking summary",
          summaryService: "Service",
          summaryDate: "Date",
          summaryTime: "Time",
          summaryTotal: "Total",
          confirmButton: "Confirm Booking",
          confirming: "Confirming…",
        },

        // ============ ONBOARDING ============
        onboarding: {
          pageTitle: "Set up your business",
          steps: {
            businessInfo: "Business Info",
            services: "Services",
            done: "Done",
          },
          error: {
            businessNameRequired: "Business name is required.",
            addressRequired: "Address is required.",
            addressFromSuggestions:
              "Please select an address from the suggestions.",
            phoneRequired: "Phone number is required.",
            serviceNameRequired: "Service name is required.",
            durationInvalid: "Duration must be a positive number (minutes).",
            categoryRequired: "Category is required.",
          },
          step1: {
            title: "Tell us about your business",
            subtitle:
              "This information will appear on your public business page.",
            businessNameLabel: "Business name *",
            addressLabel: "Address *",
            phoneLabel: "Phone *",
            descriptionLabel: "Description",
            businessNamePlaceholder: "e.g. John's Barbershop",
            addressPlaceholder: "e.g. 123 Main St, Tel Aviv",
            phonePlaceholder: "e.g. +972-50-0000000",
            descriptionPlaceholder:
              "A short description of your business (optional)",
          },
          step2: {
            title: "Add your services",
            subtitle:
              "Add at least one service. You can add more later from your dashboard.",
            newService: "New service",
            addAnother: "Add another service",
            serviceNameLabel: "Service name *",
            descriptionLabel: "Description",
            durationLabel: "Duration (min) *",
            priceLabel: "Price (₪)",
            categoryLabel: "Category *",
            categoryPlaceholder: "Select a category...",
            categorySearchPlaceholder: "Search categories...",
            categoryNoResults: "No matching categories",
            categoryNotFound: "Can't find your category? Describe it →",
            categoryNotFoundComingSoon: "AI category suggestions — coming soon",
            categorySuggestTitle: "Describe your service",
            categorySuggestPlaceholder: "e.g. I cut men's hair and style beards",
            categorySuggestButton: "Find matching categories",
            categorySuggestLoading: "Finding matches…",
            categorySuggestError: "AI is unavailable. Please pick a category manually.",
            categorySuggestNoneMatch: "None of these fit → Request a new category",
            categorySuggestBack: "← Back to list",
            categoryPreviewTitle: "No match found — AI suggestion",
            categoryPreviewSubtext: "Suggested new category",
            categoryPreviewFailed: "Could not generate a suggestion. You can still pick manually.",
            categoryPreviewBody: "This name will be submitted for admin review. Your service will be listed as Uncategorized in the meantime.",
            categoryPreviewPickManually: "Pick manually",
            categoryRequestTitle: "Request a new category",
            categoryRequestBody: "We'll suggest a generic name based on your description and submit it for admin review. You can skip category assignment for now or pick the closest existing one.",
            categoryRequestConfirm: "Submit for review",
            categoryRequestLoading: "Submitting…",
            categoryRequestSuccess: "Request submitted — an admin will review it soon.",
            categoryRequestError: "Failed to submit request. Please try again.",
            categoryUncategorizedNote: "Your service is set to Uncategorized until the request is approved.",
            addServiceButton: "Add service",
            serviceNamePlaceholder: "e.g. Haircut",
            serviceDescPlaceholder: "e.g. Classic haircut with wash and dry",
            durationPlaceholder: "e.g. 30",
            pricePlaceholder: "e.g. 80",
          },
          step3: {
            title: "You're all set!",
            subtitle:
              "{{businessName}} has been created successfully. Your services are live and customers can start booking.",
            scheduleAlert:
              "Want to set up your working hours? Head to your dashboard to configure your schedule and availability.",
            goToDashboard: "Go to Dashboard",
          },
        },

        // ============ SERVICE EDIT ============
        serviceEdit: {
          title: "Edit Service",
          subtitle: "Update service details and category",
          nameLabel: "Service name *",
          namePlaceholder: "e.g. Haircut",
          descriptionLabel: "Description",
          descriptionPlaceholder: "Short description of the service",
          durationLabel: "Duration (min) *",
          priceLabel: "Price (₪)",
          categoryLabel: "Category *",
          saveButton: "Save Changes",
          savedSuccess: "Service updated successfully.",
          error: {
            loadFailed: "Failed to load service.",
            notFound: "Service not found.",
            saveFailed: "Failed to save service. Please try again.",
          },
        },

        // ============ SERVICE SELECTION ============
        serviceSelection: {
          title: "Services & Hours",
          subtitle: "Select a service to manage its schedule",
          empty: {
            title: "No services yet",
            text: "Add services from your business page first.",
            goToBusinessPage: "Go to business page →",
          },
          error: {
            loadFailed: "Failed to load services.",
          },
          upcoming: "{{count}} upcoming",
          editService: "Edit service details",
          editAvailability: "Edit availability & working hours",
          hint: "Use the calendar icon to manage working hours. Use the edit icon to update service details.",
        },

        // ============ SCHEDULE EDITOR ============
        scheduleEditor: {
          serviceDefault: "Service",
          loadError: "Could not load schedule data. Please try again.",
          backAriaLabel: "Back to business page",
          title: "Working Hours",
          noHrs: "no hrs",
          closedShort: "closed",
          open: "Open",
          closedLabel: "Closed",
          workingHoursLabel: "Working Hours",
          removeHoursAriaLabel: "Remove hours",
          addHours: "Add hours",
          breaksLabel: "Breaks",
          noBreaks: "No breaks added",
          removeBreakAriaLabel: "Remove break",
          addBreak: "Add break",
          markedClosed:
            "Marked as closed — no slots will be generated for this day.",
          fixIssues: "Please fix the following issues:",
          savedSuccess: "Schedule saved successfully.",
          saveAll: "Save All Changes",
          generateTitle: "Generate Available Slots",
          generateDesc:
            "After saving your working hours, generate bookable slots for a date range. Rule priority: Date Exceptions > Recurring Rules > Weekly Hours, then breaks subtracted.",
          from: "From",
          to: "To",
          generateButton: "Generate Slots",
          failedSave: "Failed to save schedule. {{msg}}",
          failedGenerate: "Failed to generate slots. {{msg}}",
          dayAddedAsWorking:
            "{{day}} added as a working day. New slots will appear after running slot generation.",
          dayHoursExpanded:
            "{{day}} hours expanded. Run slot generation to fill the new window.",
          breakRemovedFrom:
            "Break removed from {{day}}. Run slot generation to fill that window with new slots.",
          dayHoursIncomplete: "{{day}}: Working hours are incomplete.",
          dayStartBeforeEnd: "{{day}}: Start time must be before end time.",
          dayBreakIncomplete: "{{day}}: A break has incomplete times.",
          dayBreakStartBeforeEnd:
            "{{day}}: Break start must be before its end.",
          dayBreakWithinHours: "{{day}}: Break must fall within working hours.",
          clickToBlock:
            "Click a future date to block it. Click a blocked date to unblock it.",
          unblockAriaLabel: "Unblock date",
          blockTitle: "Block {{date}}",
          reasonLabel: "Reason (optional)",
          reasonPlaceholder: "e.g. Public Holiday",
          blockDateButton: "Block Date",
          scheduleChangeTitle: "Schedule change detected",
          reviewBeforeSaving: "Review the impact before saving.",
          freeSlots_one: "1 available slot",
          freeSlots_other: "{{count}} available slots",
          willBeRemovedIfDelete:
            "will be removed if you choose to delete free slots.",
          appointmentsBooked_one: "1 appointment is booked",
          appointmentsBooked_other: "{{count}} appointments are booked",
          duringAffectedHours: "during the affected hours. They are",
          notCanceled: "not canceled automatically",
          cancelIndividuallyFrom: "— cancel them individually from the",
          schedulePage: "Schedule page",
          deleteAndSave_one: "Delete 1 free slot & Save",
          deleteAndSave_other: "Delete {{count}} free slots & Save",
          keepSlotsAndSave: "Keep existing slots & Save",
          understoodSave: "Understood, Save anyway",
          gotItSave: "Got it, Save",
          goBack: "Go back",
          blockDateTitle: "Block {{date}}?",
          reasonPrefix: "Reason: {{reason}}",
          freeSlotsHidden_one: "1 available slot",
          freeSlotsHidden_other: "{{count}} available slots",
          willBeHiddenAutoRestored:
            "will be hidden automatically and restored if you unblock this date.",
          appointmentsOnDate_one: "1 appointment is",
          appointmentsOnDate_other: "{{count}} appointments are",
          bookedOnDateNotCanceled:
            "booked on this date and are not canceled automatically. Cancel them individually from the",
          blockDateConfirm: "Block date",
          failedUpdateBlocked:
            "Failed to update blocked dates. Please try again.",
          fillAllFieldsDay:
            "Please fill in all fields and select at least one day.",
          startBeforeEnd: "Start date must be before end date.",
          startTimeBeforeEndTime: "Start time must be before end time.",
          failedCreateRule: "Failed to create rule. Please try again.",
          failedDeleteRule: "Failed to delete rule.",
          fillDateAndTime: "Please fill in the date, start time, and end time.",
          failedCreateException:
            "Failed to create date exception. Please try again.",
          failedDeleteException: "Failed to delete date exception.",
          addRecurringRuleTitle: "Add recurring rule?",
          removeRecurringRuleTitle: "Remove recurring rule?",
          reviewImpact: "Review the impact on existing slots.",
          freeSlotsRule_one: "1 free slot",
          freeSlotsRule_other: "{{count}} free slots",
          fallOutsideNewRuleHours_one:
            "falls outside the new rule's hours and can be removed.",
          fallOutsideNewRuleHours_other:
            "fall outside the new rule's hours and can be removed.",
          existWithinRulePeriod_one:
            "exists within this rule's period and can be removed.",
          existWithinRulePeriod_other:
            "exist within this rule's period and can be removed.",
          appointmentsPeriod_one: "1 appointment is booked",
          appointmentsPeriod_other: "{{count}} appointments are booked",
          inPeriodNotCanceled:
            "in this period — they are not canceled automatically. Cancel individually from the",
          deleteAndAddRule_one: "Delete 1 free slot & Add Rule",
          deleteAndAddRule_other: "Delete {{count}} free slots & Add Rule",
          deleteAndRemoveRule_one: "Delete 1 free slot & Remove Rule",
          deleteAndRemoveRule_other:
            "Delete {{count}} free slots & Remove Rule",
          keepSlotsAndAddRule: "Keep slots & Add Rule",
          keepSlotsAndRemoveRule: "Keep slots & Remove Rule",
          understoodAddRule: "Understood, Add Rule",
          understoodRemoveRule: "Understood, Remove Rule",
          appointmentsBookedOn_one: "1 appointment booked on {{date}}",
          appointmentsBookedOn_other:
            "{{count}} appointments booked on {{date}}",
          slotsHiddenCancelFrom:
            "Available slots hidden automatically. Cancel booked appointments individually from the",
          addExceptionTitle: "Add date exception?",
          removeExceptionTitle: "Remove date exception?",
          freeSlotsExc_one: "1 free slot",
          freeSlotsExc_other: "{{count}} free slots",
          fallOutsideExcHours_one: "falls outside the exception's hours.",
          fallOutsideExcHours_other: "fall outside the exception's hours.",
          existWithinExcPeriod_one: "exists within this exception's period.",
          existWithinExcPeriod_other: "exist within this exception's period.",
          appointmentsExc_one: "1 appointment",
          appointmentsExc_other: "{{count}} appointments",
          bookedNotCanceledCancelFrom:
            "booked on this date — not canceled automatically. Cancel from the",
          deleteAndAddException_one: "Delete 1 free slot & Add Exception",
          deleteAndAddException_other:
            "Delete {{count}} free slots & Add Exception",
          deleteAndRemoveException_one: "Delete 1 free slot & Remove Exception",
          deleteAndRemoveException_other:
            "Delete {{count}} free slots & Remove Exception",
          keepSlotsAndAddException: "Keep slots & Add Exception",
          keepSlotsAndRemoveException: "Keep slots & Remove Exception",
          understoodAddException: "Understood, Add Exception",
          understoodRemoveException: "Understood, Remove Exception",
          blockedDatesTab: "Blocked Dates",
          dateExceptionTab: "Date Exception",
          recurringRulesTab: "Recurring Rules",
          blockedDatesTitle: "Blocked Dates",
          dateExceptionTitle: "Date Exception",
          recurringRulesTitle: "Recurring Rules",
          blockedDatesListHeader: "Blocked dates",
          blockedCellLabel: "blocked",
          blockedDatesTooltip:
            "Block specific dates when you are unavailable — e.g. holidays, vacations, or one-off closures. Blocked dates override ALL other rules: no slots will be generated and existing available slots are hidden. Booked appointments are NOT canceled automatically.",
          dateExceptionTooltip:
            "Set custom working hours for a single specific date — e.g. a shorter day before a holiday or a one-off late opening. This overrides both Weekly Hours and Recurring Rules for that date. The date must still have slots generated after adding the exception.",
          recurringRulesTooltip:
            "Temporarily override your weekly hours for a date range. Useful for seasonal schedule changes (e.g. shorter summer hours) or temporary adjustments on specific days. Priority: Recurring rules override Weekly Hours but are overridden by Date Exceptions.",
          noDateExceptions: "No date exceptions added.",
          addExceptionHeader: "Add exception",
          dateLabel: "Date",
          startTimeLabel: "Start time",
          endTimeLabel: "End time",
          addDateExceptionButton: "Add Date Exception",
          noRecurringRules: "No recurring rules added.",
          addRuleHeader: "Add rule",
          daysOfWeekLabel: "Days of week",
          addRecurringRuleButton: "Add Recurring Rule",
        },

        // ============ PUBLIC BUSINESS PAGE ============
        publicBusiness: {
          manageSchedule: "Manage schedule",
          editServiceAriaLabel: "Edit service",
          deleteServiceAriaLabel: "Delete service",
          checkingAvailability: "Checking availability…",
          noUpcomingSlots: "No upcoming slots available",
          book: "Book",
          selectCategory: "— Select category —",
          durationPositive: "Must be a positive number",
          priceNotNegative: "Cannot be negative",
          addService: "Add Service",
          editServiceTitle: "Edit Service",
          nameLabel: "Name",
          namePlaceholder: "e.g. Haircut",
          descriptionOptionalLabel: "Description (optional)",
          descriptionShortPlaceholder: "Short description",
          durationLabel: "Duration (min)",
          priceLabel: "Price ($)",
          categoryLabel: "Category",
          cancelEdit: "Cancel edit",
          editingTitle: "Editing: {{name}}",
          bannerAlt: "Business banner",
          uploading: "Uploading…",
          uploadBanner: "Upload banner",
          changeBanner: "Change banner",
          addBanner: "Add banner",
          logoAlt: "Business logo",
          changeLogoAriaLabel: "Change logo",
          businessNamePlaceholder: "Business name",
          reviewCount_one: "({{count}} review)",
          reviewCount_other: "({{count}} reviews)",
          upload: "Upload",
          searchCardImageLabel: "Search Card Image",
          searchCardImageDesc:
            "Shown on search & discovery pages. If not set, your logo is used instead.",
          searchCardPreviewAlt: "Search card preview",
          changeImage: "Change image",
          uploadImage: "Upload image",
          remove: "Remove",
          descriptionLabel: "Description",
          descriptionEditPlaceholder: "Tell customers about your business…",
          addressLabel: "Address",
          addressPlaceholder: "Search for an address...",
          phoneLabel: "Phone",
          following: "Following",
          follow: "Follow",
          followerCount_one: "{{count}} follower",
          followerCount_other: "{{count}} followers",
          themeColorLabel: "Theme Color",
          themeColorHint: "Live preview updates the page colors",
          saveChanges: "Save changes",
          servicesTitle: "Services",
          addServiceLink: "Add service",
          noServicesListed: "This business hasn't listed any services yet.",
          noServicesYet: "No services yet. Add your first one above.",
          reviewsTitle: "Reviews",
          noReviewsYet: "No reviews yet. Be the first to leave one!",
          loadMoreReviews: "Load more reviews",
          saveFailed: "Failed to save. Please try again.",
          serviceFormSaveFailed: "Failed to save service.",
          notFound: "Business not found",
          notFoundDesc: "This business page doesn't exist or has been removed.",
          goBack: "Go back",
        },

        // ============ SHARE ============
        share: {
          button: "Share",
          modalTitle: "Share {{name}}",
          tabLink: "Copy Link",
          tabQR: "QR Code",
          linkDescription: "Copy the link and share it anywhere.",
          copyButton: "Copy Link",
          copied: "Link copied!",
          copyFallback: "Copy this link:",
          qrDescription: "Let customers scan this code to open your page.",
          downloadQR: "Download QR Code",
        },

        // ============ BUSINESS SCHEDULE PAGE ============
        businessSchedule: {
          failedLoadSlots: "Failed to load slot data.",
          failedLoadAppointments: "Failed to load appointments.",
          failedVoid: "Failed to void appointment. Please try again.",
          markDidntHappenTitle: "Mark as didn't happen?",
          cancelTitle: "Cancel appointment?",
          markDidntHappenMsg: "This will void the completed appointment and notify the record. Use only if the service did not take place.",
          cancelMsg: "Are you sure you want to cancel this appointment? This action cannot be undone.",
          yesVoidIt: "Yes, void it",
          yesCancelIt: "Yes, cancel it",
          keepIt: "Keep it",
          scheduleLabel: "Schedule",
          appointmentsSlots: "Appointments & slots",
          listView: "List",
          slotsView: "Slots",
          viewPage: "View page",
          filters: "Filters",
          dateRange: "Date range",
          from: "From",
          to: "To",
          apply: "Apply",
          clear: "Clear",
          service: "Service",
          allServices: "All services",
          timeFrom: "Time from",
          timeTo: "Time to",
          includeCanceled: "Include canceled appointments",
          appointmentCount_one: "1 appointment",
          appointmentCount_other: "{{count}} appointments",
          noAppointmentsFound: "No appointments found",
          noAppointments: "No appointments",
          tryAdjusting: "Try adjusting your filters or expanding the date range.",
          viewReview: "View review",
          noReviewLeft: "No review left",
          markedNotCompleted: "Marked as not completed",
          canceling: "Canceling…",
          cancel: "Cancel",
          cancelAppointment: "Cancel appointment",
          voiding: "Voiding…",
          didntHappen: "Didn't happen",
          noServices: "No services",
          thisWeek: "This week",
          nextWeek: "Next week",
          next30Days: "Next 30 days",
          refresh: "Refresh",
          bookedCount: "{{count}} booked",
          freeCount: "{{count}} free",
          noServicesConfigured: "No services configured yet.",
          noSlotsInRange: "No slots in this range",
          generateSlotsHint: "Generate slots for this service from Services & Hours.",
          canceled: "Canceled",
          completed: "Completed",
          scheduled: "Scheduled",
        },

        // ============ ACCESSIBILITY ============
        accessibility: {
          buttonLabel: "Accessibility settings",
          panelTitle: "Accessibility",
          fontSize: {
            label: "Font Size",
            sm: "Small",
            default: "Default",
            lg: "Large",
            xl: "Extra Large",
          },
          highContrast: {
            label: "High Contrast",
            description: "Increases contrast for better readability",
          },
          reduceMotion: {
            label: "Reduce Motion",
            description: "Disables animations and transitions",
          },
          reset: "Reset to defaults",
        },

        // ============ TUTORIALS ============
        tutorials: {
          common: {
            back: "Back",
            next: "Next",
            skip: "Skip",
            finish: "Got it!",
            stepOf: "Step {{current}} of {{total}}",
          },
          search: {
            step1: {
              title: "Search for a business",
              body: "Type a business name or keyword into the search bar to find what you're looking for.",
            },
            step2: {
              title: "Filter by category",
              body: "Use the category chips to narrow results by service type — barber, nail artist, and more.",
            },
            step3: {
              title: "Switch views",
              body: "Toggle between list view and map view to explore businesses near your location.",
            },
          },
          booking: {
            step1: {
              title: "Pick a date",
              body: "Choose a date from the calendar to see available time slots for this service.",
            },
            step2: {
              title: "Select a time slot",
              body: "Tap any available time to select it. It will be reserved for a short time while you confirm.",
            },
            step3: {
              title: "Confirm your booking",
              body: "Review the summary and tap Confirm Booking. You'll receive a confirmation right away.",
            },
          },
          onboarding: {
            step1: {
              title: "Welcome! Let's set up your business",
              body: "Let's set up your business profile. It only takes a few minutes.",
            },
            step2: {
              title: "Business name & category",
              body: "Give your business a name and pick the category that fits best.",
            },
            step3: {
              title: "Location",
              body: "Add your address so customers can find you on the map.",
            },
            step4: {
              title: "Services",
              body: "Add the services you offer — name, duration, and price.",
            },
            step5: {
              title: "All done!",
              body: "That's it! You can always update these details later from your dashboard.",
            },
          },
          "owner-dashboard": {
            step1: {
              title: "Your business at a glance",
              body: "Here's a snapshot of your business — total appointments, revenue, and more.",
            },
            step2: {
              title: "Upcoming appointments",
              body: "Manage today's and upcoming appointments from here.",
            },
            step3: {
              title: "Edit your business page",
              body: "Go to your public business page to update services, photos, and info.",
            },
            step4: {
              title: "Manage schedule",
              body: "Set your working hours and availability rules here.",
            },
            step5: {
              title: "Staff section",
              body: "Invite and manage your team members from the Staff tab.",
            },
          },
          "business-edit": {
            step1: {
              title: "You're in edit mode",
              body: "You're now editing your public business page. Changes are saved as you go.",
            },
            step2: {
              title: "Logo & banner",
              body: "Upload your logo and a banner image to make your page stand out.",
            },
            step3: {
              title: "Theme color",
              body: "Pick a color to personalize your business page.",
            },
            step4: {
              title: "Services list",
              body: "Add, edit, or remove the services you offer here.",
            },
            step5: {
              title: "Preview your page",
              body: "Exit edit mode to see how customers will see your page.",
            },
          },
          "schedule-editor": {
            step1: {
              title: "Weekly working hours",
              body: "Set your regular working hours for each day of the week.",
            },
            step2: {
              title: "Break times",
              body: "Add breaks (e.g., lunch) within your working hours — no slots are generated during breaks.",
            },
            step3: {
              title: "Date exceptions",
              body: "Block specific dates — holidays, vacations, or days off.",
            },
            step4: {
              title: "Save your schedule",
              body: "Don't forget to save your schedule so customers see accurate availability.",
            },
          },
          "staff-management": {
            step1: {
              title: "Your team",
              body: "Your current team members are listed here.",
            },
            step2: {
              title: "Invite staff",
              body: "Invite a new staff member by email. They'll receive a link to join.",
            },
            step3: {
              title: "Pending invitations",
              body: "Invitations you've sent appear here until accepted or expired.",
            },
            step4: {
              title: "Service assignment",
              body: "Assign staff members to the services they perform.",
            },
            step5: {
              title: "Remove a member",
              body: "You can remove a staff member at any time from their profile.",
            },
          },
          "staff-home": {
            step1: {
              title: "Welcome to your staff portal!",
              body: "Here's a quick overview of your home page as a staff member.",
            },
            step2: {
              title: "Your workplace",
              body: "This is the business you work at. Tap the icon to view the public business page.",
            },
            step3: {
              title: "Assigned services",
              body: "These are the services you're assigned to perform. Customers can book you for these.",
            },
            step4: {
              title: "Next appointment",
              body: "Your next upcoming appointment is shown here at a glance.",
            },
            step5: {
              title: "Quick stats",
              body: "A summary of your upcoming workload — appointments today and this week.",
            },
            step6: {
              title: "Manage your schedule",
              body: "Use the schedule editor to set your own availability so customers only see slots when you're truly available.",
            },
          },
          "staff-schedule-editor": {
            step1: {
              title: "Weekly availability",
              body: "Set the days and hours you're available to take appointments.",
            },
            step2: {
              title: "Break times",
              body: "Block out breaks so you're not booked during lunch or downtime.",
            },
            step3: {
              title: "Date exceptions",
              body: "Block specific dates when you're unavailable — holiday, day off, etc.",
            },
            step4: {
              title: "Save your schedule",
              body: "Save your schedule so customers only see slots when you're truly available.",
            },
          },
          "date-exceptions": {
            step1: {
              title: "Block dates",
              body: "Tap a date to mark it as unavailable — e.g. public holidays or vacations. No slots will be generated on blocked dates.",
            },
            step2: {
              title: "Date exceptions",
              body: "Set custom working hours for a single day — useful for shorter or longer days on specific dates.",
            },
            step3: {
              title: "Recurring rules",
              body: "Override your weekly hours for a date range — handy for seasonal schedule changes.",
            },
          },
          "customer-dashboard": {
            step1: {
              title: "Your upcoming appointments",
              body: "Your next bookings are shown here so you always know what's coming up.",
            },
            step2: {
              title: "Followed businesses",
              body: "Businesses you follow appear here for quick access — tap one to view their page or book again.",
            },
            step3: {
              title: "Quick links",
              body: "Jump straight to your full appointment history, invitations, or the search page from here.",
            },
          },
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

        // ============ THEME ============
        theme: {
          switchToDark: "עבור למצב כהה",
          switchToLight: "עבור למצב בהיר",
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
          confirmPassword: "אימות סיסמה",
          confirmPasswordPlaceholder: "הזן את הסיסמה שוב",
          button: "הרשמה",
          haveAccount: "יש לך כבר חשבון?",
          signIn: "כניסה",
          loading: "יוצר חשבון...",
          error: "ההרשמה נכשלה",
          networkError: "שגיאת רשת. בחזור שוב.",
          orContinueWith: "או המשך עם",
          inviteBanner: "הוזמנת להצטרף לצוות עסק! צור חשבון למטה וההזמנה תאושר אוטומטית.",
          inviteExpired: "קישור ההזמנה פג תוקף. בקש מבעל העסק לשלוח הזמנה חדשה.",
          inviteInvalid: "קישור ההזמנה אינו תקין. בקש מבעל העסק הזמנה חדשה.",
          validation: {
            nameRequired: "שם מלא הוא שדה חובה",
            emailInvalid: "יש להזין כתובת דוא״ל תקינה",
            passwordTooShort: "הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה וספרה",
            passwordMismatch: "הסיסמאות אינן תואמות",
          },
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

        // ============ HOME PAGE (logged-out landing) ============
        homePage: {
          hero: {
            headline: "הזמן פגישות עם עסקים מקומיים, בקלות.",
            description:
              "BizSlot מחבר לקוחות עם עסקים מקומיים להזמנת פגישות מהירה וחלקה — ונותן לבעלי העסק את הכלים לנהל הכל.",
            ctaFind: "מצא עסק",
            ctaList: "הוסף את העסק שלך",
            alreadyHaveAccount: "כבר יש לך חשבון?",
            logIn: "כניסה",
          },
          customers: {
            label: "ללקוחות",
            title: "הזמנה פשוטה",
            subtitle: "מחיפוש לאישור — לוקח פחות מדקה.",
            howItWorksTitle: "איך זה עובד",
            steps: {
              signUp: {
                title: "הירשם",
                description: "צור חשבון חינמי בשניות — ללא כרטיס אשראי.",
              },
              search: {
                title: "חפש עסק",
                description:
                  "עיין לפי קטגוריה או מיקום וחקור פרופילי עסקים עם תמונות אמיתיות וביקורות.",
              },
              book: {
                title: "הזמן פגישה",
                description:
                  "בחר משבצת זמן פנויה ואשר מיידית — תקבל התראה מיד.",
              },
            },
            features: {
              categories: "עיין לפי קטגוריה (מספרות, מאמנים, אמני ציפורניים ועוד)",
              map: "תצוגת מפה למציאת עסקים בסביבתך",
              slots: "ראה משבצות זמן פנויות בזמן אמת",
              confirmation: "אישור הזמנה מיידי",
            },
            cta: "התחל בחינם",
          },
          owners: {
            label: "לבעלי עסקים",
            title: "הגדל את העסק שלך",
            subtitle:
              "התחל תוך דקות. נהל את לוח הזמנים, השירותים והלקוחות — במקום אחד.",
            howItWorksTitle: "איך זה עובד",
            steps: {
              signUp: {
                title: "הירשם",
                description: "צור חשבון BizSlot כבעל עסק.",
              },
              create: {
                title: "צור את העסק שלך",
                description:
                  "הגדר דף עסק ציבורי עם שם, קטגוריה, לוגו ותיאור.",
              },
              services: {
                title: "הוסף שירותים ולוח זמנים",
                description:
                  "הגדר שירותים עם מחיר, משך וזמני עבודה. חסום חגים בקלות.",
              },
              launch: {
                title: "התחל לקבל לקוחות",
                description:
                  "היה פעיל — לקוחות יוכלו למצוא אותך, לצפות בדף שלך ולהזמין פגישות מיידית.",
              },
            },
            features: {
              businessPage: "דף עסק ציבורי מותאם אישית",
              pricing: "ניהול שירותים ומחירים",
              schedule: "שליטה מלאה בלוח הזמנים עם תאריכים חריגים",
              analytics: "לוח בקרה לפגישות ואנליטיקה",
              reviews: "ביקורות לקוחות",
            },
            cta: "הוסף את העסק שלך",
          },
        },

        // ============ CUSTOMER HOME ============
        customerHome: {
          greeting: "שלום, {{name}}!",
          greetingSubUpcoming: "יש לך פגישה קרובה.",
          greetingSubEmpty: "עדיין אין פגישות — מצא עסק כדי להתחיל.",
          searchPlaceholder: "חפש עסק...",
          nextAppointment: {
            label: "הפגישה הקרובה",
            viewAll: "צפה בכל הפגישות",
            empty: "אין פגישות קרובות.",
            findBusiness: "מצא עסק ←",
          },
          recentBusinesses: {
            label: "עסקים שהוזמנו לאחרונה",
            empty: "עדיין לא הזמנת אצל אף אחד.",
            explore: "גלה עסקים ←",
          },
          pendingReviews: {
            label: "השאר ביקורת",
          },
        },

        // ============ PARTNER HOME ============
        partnerHome: {
          greeting: "שלום, {{name}}!",
          workingAt: "עובד ב{{name}}",
          nextAppointment: {
            label: "הפגישה הקרובה",
            viewAll: "צפה בכל הפגישות",
            empty: "אין פגישות קרובות. תהנה מהזמן החופשי!",
          },
          stats: {
            today: "היום",
            thisWeek: "השבוע",
          },
          assignedServices: {
            label: "השירותים שלי",
            empty: "לא הוקצו שירותים עדיין.",
          },
          workplace: {
            label: "מקום העבודה שלי",
            viewPage: "צפה בדף העסק",
          },
          becomeOwner: {
            title: "פתח עסק משלך",
            subtitle: "שדרג את חשבונך לבעל עסק והוסף את השירותים שלך ל-BizSlot.",
            cta: "הפוך לבעל עסק",
            error: "אירעה שגיאה. נסה שוב.",
          },
        },

        // ============ OWNER HOME ============
        ownerHome: {
          greeting: "שלום, {{name}}!",
          noBusinessPrompt: "ברוך הבא! מוכן להוסיף את העסק שלך?",
          completeSetup: "השלם הגדרה",
          businessSubtitle: "{{name}}",
          yourBusinesses: "העסקים שלך",
          todaySchedule: {
            label: "לוח היום",
            viewAll: "צפה בלוח המלא",
            empty: "אין פגישות היום.",
            manage: "נהל לוח זמנים ←",
            more: "+{{count}} נוספים",
          },
          quickActions: {
            label: "פעולות מהירות",
            businessPage: "דף העסק שלי",
            services: "ניהול שירותים",
            schedule: "ניהול לוח זמנים",
            dashboard: "לוח הבקרה",
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
          businessPage: "דף עסק",
          services: "שירותים",
          schedule: "לוח זמנים",
          staffPartners: "צוות / שותפים",
          createBusiness: "צור את העסק שלך",
          myBusinesses: "העסקים שלי",
          noBusinesses: "לא נמצאו עסקים.",
          addAnotherBusiness: "הוסף עסק נוסף",
          myWorkplace: "מקום העבודה שלי",
          myShifts: "המשמרות שלי",
          favorites: "מועדפים",
          noFollowed: "אין עדיין עסקים במעקב.",
          loading: "טוען…",
          signedIn: "מחובר",
          notSignedIn: "לא מחובר",
          adminSection: "ניהול",
          adminDashboard: "לוח בקרה ניהול",
          categoryRequests: "בקשות קטגוריה",
        },

        // ============ ADMIN ============
        admin: {
          categoryRequests: {
            title: "בקשות קטגוריה",
            subtitle: "סקור ואשר קטגוריות שהוצעו על ידי בעלי עסקים",
            loadError: "טעינת הבקשות נכשלה.",
            approveError: "אישור הבקשה נכשל. נסה שנית.",
            rejectError: "דחיית הבקשה נכשלה. נסה שנית.",
            requester: "בוקש על ידי",
            description: "תיאור השירות",
            aiSuggestion: "הצעת בינה מלאכותית",
            noName: "לא הוצע שם",
            noAiSuggestion: "אין הצעת AI — יש להזין שם ידנית.",
            addName: "הוסף שם",
            edit: "ערוך",
            editTitle: "דרוס הצעת AI",
            namePlaceholder: "שם קטגוריה (למשל: אימון אישי)",
            iconPlaceholder: "שם אייקון Material (למשל: fitness_center)",
            approve: "אשר",
            reject: "דחה",
            empty: {
              title: "הכל מסודר!",
              text: "אין בקשות קטגוריה ממתינות.",
            },
          },
        },

        // ============ NOTIFICATION SETTINGS PAGE ============
        notificationSettings: {
          description: "בחר אילו התראות בתוך האפליקציה אתה מקבל עבור העסק שלך.",
          newBooking: "הזמנה חדשה",
          newBookingDesc: "קבל התראה כאשר לקוח קובע תור",
          cancellation: "ביטול",
          cancellationDesc: "קבל התראה כאשר לקוח מבטל תור",
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
          goBack: "חזרה",
          follow: "עקוב",
          unfollow: "הפסק לעקוב",
          menu: "תפריט",
        },

        // ============ FORMS ============
        forms: {
          required: "שדה זה חובה",
          invalidEmail: "אנא הזן דוא״ל תקף",
          passwordTooShort: "הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה וספרה",
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
          subtitle: "עדכן את שמך, דוא״ל, או סיסמה.",
          nameLabel: "שם",
          emailLabel: "דוא״ל",
          namePlaceholder: "השם שלך",
          emailPlaceholder: "הדוא״ל שלך",
          changePasswordOptional: "(אופציונלי)",
          currentPasswordLabel: "סיסמה נוכחית",
          currentPasswordPlaceholder: "הזן סיסמה נוכחית",
          newPasswordLabel: "סיסמה חדשה",
          newPasswordPlaceholder: "הזן סיסמה חדשה",
          confirmPasswordLabel: "אשר סיסמה חדשה",
          confirmPasswordPlaceholder: "אשר סיסמה חדשה",
          saveChanges: "שמור שינויים",
          error: {
            loadFailed: "טעינת הפרופיל נכשלה. אנא נסה שוב.",
            saveFailed: "שמירת הפרופיל נכשלה.",
            networkError: "שגיאת רשת. אנא נסה שוב.",
            nameRequired: "שם חובה.",
            emailRequired: "דוא״ל חובה.",
            currentPasswordRequired: "סיסמה נוכחית חובה.",
            newPasswordRequired: "סיסמה חדשה חובה.",
            passwordTooShort: "הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה וספרה.",
            passwordMismatch: "הסיסמאות לא תואמות.",
          },
          success: {
            updated: "הפרופיל עודכן בהצלחה.",
          },
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

        // ============ NOTIFICATIONS ============
        notifications: {
          title: "התראות",
          empty: "אין התראות עדיין",
          markAllRead: "סמן הכל כנקרא",

          timeAgo: {
            justNow: "עכשיו",
            minutesAgo: "לפני {{count}} דקות",
            hoursAgo: "לפני {{count}} שעות",
            daysAgo: "לפני {{count}} ימים",
          },

          appointmentBooked: {
            ownerTitle: "תור חדש",
            ownerBody: "{{clientName}} קבע תור ל{{serviceName}} בתאריך {{date}}",
            customerTitle: "ההזמנה אושרה",
            customerBody: "תורך ל{{serviceName}} אצל {{businessName}} בתאריך {{date}} אושר",
          },
          appointmentCancelled: {
            ownerTitle: "תור בוטל",
            ownerBody: "{{clientName}} ביטל את תור ה{{serviceName}} בתאריך {{date}}",
            customerTitle: "תור בוטל",
            customerBody: "תורך ל{{serviceName}} אצל {{businessName}} בתאריך {{date}} בוטל על ידי העסק",
          },
          appointmentReminder: {
            title: "תזכורת לתור",
            body: "תזכורת: {{serviceName}} אצל {{businessName}} מחר בשעה {{date}}",
          },
          reviewPrompt: {
            title: "איך היה הביקור?",
            body: "איך היה התור שלך אצל {{businessName}}? השאר ביקורת!",
          },
          invitationReceived: {
            title: "קיבלת הזמנה!",
            body: "{{businessName}} הזמינו אותך להצטרף לצוות שלהם. לחץ לצפייה.",
          },
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
          unknownError: "שגיאה לא ידועה",
          saving: "שומר...",
          saved: "נשמר",
          errorOccurred: "אירעה שגיאה. אנא נסה שוב.",
          durationMin: "{{count}} דק׳",
          durationHour: "{{count}} ש׳",
          durationHourMin: "{{count}} ש׳ {{minutes}} דק׳",
        },

        // ============ DIALOG ============
        dialog: {
          confirm: "האם אתה בטוח?",
          confirmDelete: "האם אתה בטוח שברצונך למחוק זאת?",
          confirmLogout: "האם אתה בטוח שברצונך להתנתק?",
          thisActionCannotBeUndone: "לא ניתן לבטל פעולה זו.",
        },

        // ============ CALENDAR / DATE PICKER ============
        calendar: {
          months: [
            "ינואר",
            "פברואר",
            "מרץ",
            "אפריל",
            "מאי",
            "יוני",
            "יולי",
            "אוגוסט",
            "ספטמבר",
            "אוקטובר",
            "נובמבר",
            "דצמבר",
          ],
          days: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"],
          daysShort: ["שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת", "ראשון"],
          daysFull: [
            "יום שני",
            "יום שלישי",
            "יום רביעי",
            "יום חמישי",
            "יום שישי",
            "שבת",
            "יום ראשון",
          ],
          prevMonth: "חודש קודם",
          nextMonth: "חודש הבא",
          loading: "טוען זמינות…",
          error: "טעינת הזמינות נכשלה",
          selected: "(נבחר)",
          unavailable: "(לא זמין)",
        },

        // ============ SEARCH ============
        search: {
          placeholder: "חפש מספרות, רופאים...",
          clearAriaLabel: "נקה חיפוש",
          filterAriaLabel: "סנן קטגוריות",
          filters: {
            title: "מסננים",
            closePanelAriaLabel: "סגור לוח מסננים",
            categories: "קטגוריות",
            availableOn: "זמין ב",
            clear: "נקה",
            timeRange: "טווח שעות (אופציונלי)",
            timeTo: "עד",
            all: "הכל",
          },
          emptyState: {
            title: "גלה עסקים",
            text: "חפש מספרות, רופאים, מרכזי כושר ועוד",
          },
          list: {
            error: "משהו השתבש",
            noResults: "לא נמצאו תוצאות",
            noResultsHint: "נסה לשנות את החיפוש או הסינון",
            featuredBusinesses: "עסקים מומלצים",
            seeAll: "הצג הכל",
            nearYou: "קרוב אליך",
            searchResults: "תוצאות חיפוש",
            loadingMore: "טוען תוצאות נוספות...",
            noMoreResults: "אין תוצאות נוספות",
          },
          map: {
            loadFailed: "הטעינה של המפה נכשלה",
            zoomIn: "הגדל",
            zoomOut: "הקטן",
            centerLocation: "מרכז את המיקום שלך",
            results: "תוצאות",
            bookNow: "הזמן עכשיו",
            loading: "טוען תוצאות...",
            noResults: "לא נמצאו תוצאות",
            noResultsHint: "נסה לשנות את החיפוש",
          },
        },

        // ============ STAFF MANAGEMENT ============
        staff: {
          title: "ניהול צוות",
          inviteButton: "הזמן עובד",
          teamMembers: "חברי צוות",
          pendingInvitations: "הזמנות ממתינות",
          joined: "הצטרף {{date}}",
          expires: "פג תוקף {{date}}",
          cancel: "ביטול",
          cancelling: "מבטל…",
          error: {
            loadFailed: "טעינת נתוני הצוות נכשלה.",
            saveFailed: "שמירת ההקצאות נכשלה.",
            inviteFailed: "שליחת ההזמנה נכשלה.",
          },
          empty: {
            title: "אין חברי צוות עדיין",
            text: "הזמן מישהו באמצעות דוא״ל כדי להתחיל.",
          },
          inviteModal: {
            title: "הזמן חבר צוות",
            emailLabel: "כתובת דוא״ל",
            emailPlaceholder: "worker@example.com",
            messageLabel: "הודעה (אופציונלי)",
            messagePlaceholder: "הוסף הערה אישית...",
            submitButton: "שלח הזמנה",
          },
          detail: {
            performance: "ביצועים (החודש)",
            appointments: "פגישות",
            thisPeriod: "תקופה זו",
            revenue: "הכנסה",
            fromCompleted: "מהושלמות",
            completion: "השלמה",
            completionRate: "שיעור השלמה",
            avgRating: "דירוג ממוצע",
            comingSoon: "בקרוב",
            noData: "אין נתונים זמינים.",
            serviceAssignments: "הקצאת שירותים",
            noServices: "אין שירותים זמינים לעסק זה.",
            saveAssignments: "שמור הקצאות",
            removeFromBusiness: "הסר מהעסק",
          },
          remove: {
            title: "הסר חבר צוות",
            message: "להסיר את {{name}} מהעסק שלך? הם יאבדו גישה מיידית.",
            confirmLabel: "הסר",
          },
          inactiveSection: "חברים לשעבר",
          inactive: {
            removed: "הוסר",
            declined: "דחה הזמנה",
            expired: "ההזמנה פגה",
          },
        },

        // ============ INVITATIONS ============
        invitations: {
          title: "הזמנות עסקיות",
          pendingCount_one: "הזמנה אחת ממתינה",
          pendingCount_other: "{{count}} הזמנות ממתינות",
          invitedAt: "הוזמנת {{date}}",
          expiresIn_one: "פג תוקף בעוד יום",
          expiresIn_other: "פג תוקף בעוד {{count}} ימים",
          expiresToday: "פג תוקף היום",
          status: {
            accepted: "התקבל",
            declined: "נדחה",
            expired: "פג תוקף",
          },
          actions: {
            accept: "קבל",
            decline: "דחה",
          },
          sections: {
            pending: "ממתין",
            past: "עבר",
          },
          empty: {
            title: "אין הזמנות עדיין",
            text: "כאשר בעל עסק יזמין אותך להצטרף לצוות, זה יופיע כאן.",
          },
          error: {
            loadFailed: "טעינת ההזמנות נכשלה.",
          },
        },

        // ============ REVIEWS ============
        reviews: {
          title: "ביקורות",
          avgSuffix: "ממוצע",
          modal: {
            title: "השאר ביקורת",
            placeholder: "שתף את החוויה שלך (אופציונלי)",
            submitButton: "שלח ביקורת",
            submitting: "שולח…",
            cancel: "ביטול",
            errorNoRating: "אנא בחר דירוג כוכבים.",
            errorSubmit: "שליחת הביקורת נכשלה. אנא נסה שוב.",
            starAriaLabel_one: "דרג {{count}} כוכב",
            starAriaLabel_other: "דרג {{count}} כוכבים",
          },
          viewModal: {
            title: "ביקורת לקוח",
            noComment: "לא הושאר תגובה כתובה.",
            close: "סגור",
            closeAriaLabel: "סגור",
          },
          filters: {
            title: "מסננים",
            clearAll: "נקה הכל",
            service: "שירות",
            allServices: "כל השירותים",
            rating: "דירוג",
            all: "הכל",
            from: "מ",
            to: "עד",
          },
          empty: {
            noMatch: "אין ביקורות התואמות את המסננים",
            noReviews: "אין ביקורות עדיין",
          },
          clearFilters: "נקה מסננים",
          loadMore: "טען עוד ביקורות",
          loadMoreNote: "ייתכן שיש עוד ביקורות — נקה מסננים לטעינת הכל",
          flag: {
            title: "דווח על ביקורת",
            subtitle: "תאר מדוע הביקורת אינה מתאימה",
            placeholder: "לדוגמה: הביקורת מכילה מידע שקרי או שפה פוגענית…",
            submitButton: "שלח דיווח",
            submitting: "שולח…",
            cancel: "ביטול",
            errorSubmit: "הדיווח על הביקורת נכשל. אנא נסה שוב.",
            alreadyFlagged: "כבר דווח",
            flagAsInappropriate: "דווח כלא מתאים",
            pendingNote: "ממתין לבדיקת מנהל — עדיין גלוי בדף הציבורי עד לבדיקה",
            dismissedNote: "הדיווח נבדק ונדחה על ידי מנהל — לא ניתן לדווח שוב על ביקורת זו",
          },
          badge: {
            flagged: "מדווח",
            flagDismissed: "דיווח נדחה",
          },
        },

        // ============ DASHBOARD (Business Owner) ============
        dashboard: {
          editPage: "ערוך דף",
          followers: "עוקבים",
          performance: "ביצועים",
          noData: "אין נתונים לתקופה זו",
          selectMetrics: "בחר מדדים למעלה להצגת אנליטיקה",
          setupBusiness: "הגדר את העסק שלך",
          error: {
            noBusinessFound: "לא נמצא עסק. אנא השלם את תהליך ההטמעה.",
            voidFailed: "ביטול הפגישה נכשל. אנא נסה שוב.",
            loadFailed: "טעינת העסק נכשלה.",
          },
          cancelAppt: {
            title: "ביטול פגישה שהושלמה?",
            message:
              "פעולה זו תסמן את הפגישה כמבוטלת. השתמש בה רק אם השירות לא התקיים.",
            confirm: "כן, בטל",
            cancel: "השאר",
          },
          metrics: {
            totalBookings: "סך הזמנות",
            revenue: "הכנסה",
            revenueSubtext: "הערכה לפי מחירי שירות",
            topService: "שירות מוביל",
            cancellations: "ביטולים",
            noAppointments: "אין פגישות",
            cancellationRate: "{{rate}}% שיעור ביטול",
            avgValue: "ממוצע הזמנה",
            revenuePerAppt: "הכנסה לפגישה",
            uniqueCustomers: "לקוחות ייחודיים",
            individualClient: "לקוח",
            individualClients: "לקוחות",
            busiestDay: "היום העמוס ביותר",
            mostBookingsDay: "הכי הרבה הזמנות ביום זה",
            appointment: "פגישה",
            appointments: "פגישות",
            noDataYet: "אין נתונים עדיין",
            bookings: "הזמנות",
          },
          manage: "ניהול",
          reviews: "ביקורות",
          upcomingAppointments: "פגישות קרובות",
          completedAppointments: "פגישות שהושלמו",
          viewAll: "הצג הכל",
          viewAllAppointments: "+{{count}} נוספות — הצג הכל",
          manageAll: "נהל את כל הפגישות ←",
          noUpcoming: {
            title: "אין פגישות קרובות",
            text: "הזמנות חדשות יופיעו כאן.",
          },
          noCompleted: "אין פגישות שהושלמו עדיין",
          markedNotCompleted: "סומן כלא הושלם",
          noReview: "אין ביקורת עדיין",
          canceling: "מבטל…",
          didntHappen: "לא התקיים",
          confirmed: "מאושר",
          businessDashboard: "לוח בקרה עסקי",
          avgSuffix: "ממוצע",
          reviewCount_one: "ביקורת אחת",
          reviewCount_other: "{{count}} ביקורות",
          noReviewsYet: "אין ביקורות עדיין",
          notificationSettings: "הגדרות התראות",
          notificationSettingsSubtext: "נהל אילו התראות אתה מקבל",
          servicesHours: "שירותים ושעות",
          servicesHoursDesc: "ערוך שעות עבודה, הפסקות וזמינות",
          viewPublicPage: "הצג דף ציבורי",
          viewPublicPageDesc: "ראה את הדף שלך כמו לקוחות",
          editBusinessPage: "ערוך דף עסקי",
          editBusinessPageDesc: "עדכן מידע, תמונות ותיאור",
          staffManagement: "ניהול צוות",
          staffManagementDesc: "הזמן, הקצה שירותים וצפה בביצועים",
        },

        // ============ CUSTOMER DASHBOARD ============
        customerDashboard: {
          title: "לוח הבקרה שלי",
          myActivity: "הפעילות שלי",
          selectMetrics: "בחר מדדים למעלה להצגת הפעילות שלך",
          noDataPeriod: "אין נתונים לתקופה זו",
          upcomingAppointments: "פגישות קרובות",
          viewAll: "הצג הכל",
          manageAll: "נהל את כל הפגישות ←",
          quickActions: "פעולות מהירות",
          myAppointments: "הפגישות שלי",
          myAppointmentsDesc: "הצג, נהל ובטל הזמנות",
          discoverBusinesses: "גלה עסקים",
          discoverBusinessesDesc: "מצא והזמן שירותים חדשים",
          myProfile: "הפרופיל שלי",
          myProfileDesc: "עדכן את פרטי החשבון שלך",
          businessInvitations: "הזמנות עסקיות",
          pendingInvites_one: "הזמנה ממתינה אחת",
          pendingInvites_other: "{{count}} הזמנות ממתינות",
          followedBusinesses: "עסקים במעקב",
          discoverMore: "גלה עוד",
          noFollowed: {
            title: "אין עסקים במעקב עדיין",
            text: "עקוב אחר עסקים לגישה מהירה והזמנה חוזרת של השירותים האהובים עליך.",
          },
          noUpcoming: {
            title: "אין פגישות קרובות",
            text: "הזמן שירות כדי להתחיל.",
          },
          findBusiness: "מצא עסק",
          exploreBusinesses: "גלה עסקים",
          confirmed: "מאושר",
          metrics: {
            totalBookings: "סך הזמנות",
            completed: "הושלמו",
            cancellations: "ביטולים",
            noAppointments: "אין פגישות",
            totalSpent: "סך הוצאות",
            favBusiness: "עסק מועדף",
            favService: "שירות מועדף",
            noDataYet: "אין נתונים עדיין",
            appointment: "פגישה",
            appointments: "פגישות",
          },
        },

        // ============ CUSTOMER APPOINTMENTS PAGE ============
        customerAppointments: {
          title: "הפגישות שלי",
          tabs: {
            upcoming: "קרובות",
            past: "עבר",
          },
          status: {
            confirmed: "מאושר",
            canceled: "בוטל",
            completed: "הושלם",
          },
          empty: {
            upcoming: "אין פגישות קרובות",
            past: "אין פגישות עבר",
            text: "הזמן שירות כדי להתחיל.",
          },
          findBusiness: "מצא עסק",
          cancel: "ביטול",
          canceling: "מבטל…",
          notCompleted: "העסק סימן כלא הושלם",
          reviewed: "סקרתי",
          leaveReview: "השאר ביקורת",
          error: {
            loadFailed: "טעינת הפגישות נכשלה.",
          },
          cancelDialog: {
            title: "לבטל את הפגישה?",
            message:
              "האם אתה בטוח שברצונך לבטל את הפגישה? לא ניתן לבטל פעולה זו.",
            confirm: "כן, בטל",
            cancel: "השאר",
          },
        },

        // ============ ADD TO CALENDAR ============
        addToCalendar: {
          button: "הוסף ליומן",
          ariaLabel: "הוסף תור ליומן",
          google: "Google Calendar",
          ics: "הורד .ics",
        },

        // ============ STAFF DASHBOARD ============
        staffDashboard: {
          title: "לוח בקרה עובד",
          subtitle: "חבר צוות",
          myServices: "השירותים שלי",
          noServices: {
            title: "אין שירותים מוקצים עדיין",
            text: "בעל העסק יקצה שירותים עבורך.",
          },
          viewSchedule: "הצג לוח זמנים",
          editAvailability: "ערוך זמינות",
          upcoming: "פגישות קרובות",
          noUpcoming: {
            title: "אין פגישות קרובות",
            text: "הזמנות חדשות יופיעו כאן.",
          },
          completed: "פגישות שהושלמו",
          noCompleted: "אין פגישות שהושלמו עדיין",
          didntHappen: "לא התקיים",
          canceling: "מבטל…",
          markedNotCompleted: "סומן כלא הושלם",
          noReview: "אין ביקורת עדיין",
          error: {
            voidFailed: "ביטול הפגישה נכשל. אנא נסה שוב.",
          },
          cancelDialog: {
            title: "ביטול פגישה שהושלמה?",
            message:
              "פעולה זו תסמן את הפגישה כמבוטלת. השתמש בה רק אם השירות לא התקיים.",
            confirm: "כן, בטל",
            cancel: "השאר",
          },
        },

        // ============ BOOKING ============
        booking: {
          errorServiceNotFound: "השירות לא נמצא.",
          errorLoadFailed: "טעינת פרטי ההזמנה נכשלה.",
          errorSomethingWrong: "משהו השתבש.",
          goBack: "חזרה",
          slotTaken: "המשבצת כבר נלקחה. אנא בחר זמן אחר.",
          errorTryAgain: "משהו השתבש. אנא נסה שוב.",
          confirmed: {
            header: "ההזמנה אושרה",
            title: "הזמנתך אושרה!",
            subtitle: "הפגישה שלך אושרה.",
            confirmationCode: "מספר אישור #",
            business: "עסק",
            service: "שירות",
            date: "תאריך",
            time: "שעה",
            total: "סה״כ",
            viewAppointments: "הצג בפגישות שלי",
            backToBusiness: "חזרה לדף העסק",
          },
          pickDate: "בחר תאריך",
          availableTimes: "זמנים זמינים",
          noSlots: "אין משבצות זמינות לתאריך זה.",
          summary: "סיכום הזמנה",
          summaryService: "שירות",
          summaryDate: "תאריך",
          summaryTime: "שעה",
          summaryTotal: "סה״כ",
          confirmButton: "אשר הזמנה",
          confirming: "מאשר…",
        },

        // ============ ONBOARDING ============
        onboarding: {
          pageTitle: "הגדר את העסק שלך",
          steps: {
            businessInfo: "פרטי עסק",
            services: "שירותים",
            done: "סיום",
          },
          error: {
            businessNameRequired: "שם עסק חובה.",
            addressRequired: "כתובת חובה.",
            addressFromSuggestions: "אנא בחר כתובת מהצעות.",
            phoneRequired: "מספר טלפון חובה.",
            serviceNameRequired: "שם שירות חובה.",
            durationInvalid: "משך חייב להיות מספר חיובי (דקות).",
            categoryRequired: "קטגוריה חובה.",
          },
          step1: {
            title: "ספר לנו על העסק שלך",
            subtitle: "מידע זה יופיע בדף העסק הציבורי שלך.",
            businessNameLabel: "שם עסק *",
            addressLabel: "כתובת *",
            phoneLabel: "טלפון *",
            descriptionLabel: "תיאור",
            businessNamePlaceholder: "לדוגמה: מספרת יוסי",
            addressPlaceholder: "לדוגמה: רחוב הרצל 1, תל אביב",
            phonePlaceholder: "לדוגמה: 050-0000000",
            descriptionPlaceholder: "תיאור קצר של העסק שלך (אופציונלי)",
          },
          step2: {
            title: "הוסף את השירותים שלך",
            subtitle: "הוסף לפחות שירות אחד. תוכל להוסיף עוד מאוחר יותר.",
            newService: "שירות חדש",
            addAnother: "הוסף שירות נוסף",
            serviceNameLabel: "שם שירות *",
            descriptionLabel: "תיאור",
            durationLabel: "משך (דקות) *",
            priceLabel: "מחיר (₪)",
            categoryLabel: "קטגוריה *",
            categoryPlaceholder: "בחר קטגוריה...",
            categorySearchPlaceholder: "חפש קטגוריות...",
            categoryNoResults: "לא נמצאו קטגוריות תואמות",
            categoryNotFound: "לא מוצאים את הקטגוריה שלכם? תארו אותה ←",
            categoryNotFoundComingSoon: "הצעות קטגוריה חכמות — בקרוב",
            categorySuggestTitle: "תארו את השירות שלכם",
            categorySuggestPlaceholder: "לדוגמה: אני מספר שיער לגברים ומעצב זקנים",
            categorySuggestButton: "מצא קטגוריות מתאימות",
            categorySuggestLoading: "מחפש התאמות…",
            categorySuggestError: "הבינה המלאכותית אינה זמינה. בחרו קטגוריה ידנית.",
            categorySuggestNoneMatch: "אף אחת לא מתאימה ← בקשו קטגוריה חדשה",
            categorySuggestBack: "← חזרה לרשימה",
            categoryPreviewTitle: "לא נמצאה התאמה — הצעת AI",
            categoryPreviewSubtext: "קטגוריה חדשה מוצעת",
            categoryPreviewFailed: "לא ניתן היה ליצור הצעה. תוכלו לבחור ידנית.",
            categoryPreviewBody: "השם יוגש לאישור מנהל. השירות יופיע כ'לא מסווג' בינתיים.",
            categoryPreviewPickManually: "בחרו ידנית",
            categoryRequestTitle: "בקשת קטגוריה חדשה",
            categoryRequestBody: "נציע שם גנרי על פי התיאור שלכם ונשלח לאישור מנהל. תוכלו לדלג על בחירת הקטגוריה לעת עתה או לבחור את הקרובה ביותר.",
            categoryRequestConfirm: "שלח לאישור",
            categoryRequestLoading: "שולח…",
            categoryRequestSuccess: "הבקשה נשלחה — מנהל יבדוק אותה בקרוב.",
            categoryRequestError: "שליחת הבקשה נכשלה. נסו שוב.",
            categoryUncategorizedNote: "השירות מוגדר כ'לא מסווג' עד לאישור הבקשה.",
            addServiceButton: "הוסף שירות",
            serviceNamePlaceholder: "לדוגמה: תספורת",
            serviceDescPlaceholder: "לדוגמה: תספורת קלאסית עם חפיפה וייבוש",
            durationPlaceholder: "לדוגמה: 30",
            pricePlaceholder: "לדוגמה: 80",
          },
          step3: {
            title: "הכל מוכן!",
            subtitle:
              "{{businessName}} נוצר בהצלחה. השירותים שלך פעילים ולקוחות יכולים להתחיל להזמין.",
            scheduleAlert:
              "רוצה להגדיר שעות עבודה? עבור ללוח הבקרה להגדרת לוח זמנים וזמינות.",
            goToDashboard: "עבור ללוח הבקרה",
          },
        },

        // ============ SERVICE EDIT ============
        serviceEdit: {
          title: "עריכת שירות",
          subtitle: "עדכון פרטי השירות והקטגוריה",
          nameLabel: "שם השירות *",
          namePlaceholder: "לדוגמה: תספורת",
          descriptionLabel: "תיאור",
          descriptionPlaceholder: "תיאור קצר של השירות",
          durationLabel: "משך (דקות) *",
          priceLabel: "מחיר (₪)",
          categoryLabel: "קטגוריה *",
          saveButton: "שמור שינויים",
          savedSuccess: "השירות עודכן בהצלחה.",
          error: {
            loadFailed: "טעינת השירות נכשלה.",
            notFound: "השירות לא נמצא.",
            saveFailed: "שמירת השירות נכשלה. נסו שוב.",
          },
        },

        // ============ SERVICE SELECTION ============
        serviceSelection: {
          title: "שירותים ושעות",
          subtitle: "בחר שירות לניהול הלוח שלו",
          empty: {
            title: "אין שירותים עדיין",
            text: "הוסף שירותים מדף העסק שלך תחילה.",
            goToBusinessPage: "עבור לדף העסק ←",
          },
          error: {
            loadFailed: "טעינת השירותים נכשלה.",
          },
          upcoming: "{{count}} קרובות",
          editService: "עריכת פרטי שירות",
          editAvailability: "עריכת זמינות ושעות עבודה",
          hint: "לחץ על סמל הלוח לניהול שעות עבודה. לחץ על סמל העריכה לעדכון פרטי השירות.",
        },

        // ============ SCHEDULE EDITOR ============
        scheduleEditor: {
          serviceDefault: "שירות",
          loadError: "לא ניתן לטעון נתוני לוח זמנים. אנא נסה שוב.",
          backAriaLabel: "חזרה לדף העסק",
          title: "שעות עבודה",
          noHrs: "אין שעות",
          closedShort: "סגור",
          open: "פתוח",
          closedLabel: "סגור",
          workingHoursLabel: "שעות עבודה",
          removeHoursAriaLabel: "הסר שעות",
          addHours: "הוסף שעות",
          breaksLabel: "הפסקות",
          noBreaks: "לא נוספו הפסקות",
          removeBreakAriaLabel: "הסר הפסקה",
          addBreak: "הוסף הפסקה",
          markedClosed: "מסומן כסגור — לא ייווצרו משבצות ליום זה.",
          fixIssues: "אנא תקן את הבעיות הבאות:",
          savedSuccess: "לוח הזמנים נשמר בהצלחה.",
          saveAll: "שמור את כל השינויים",
          generateTitle: "צור משבצות זמינות",
          generateDesc:
            "לאחר שמירת שעות העבודה, צור משבצות ניתנות להזמנה לטווח תאריכים. עדיפות כללים: חריגות תאריך > כללים חוזרים > שעות שבועיות, ואז מחסרים הפסקות.",
          from: "מתאריך",
          to: "עד תאריך",
          generateButton: "צור משבצות",
          failedSave: "שמירת לוח הזמנים נכשלה. {{msg}}",
          failedGenerate: "יצירת משבצות נכשלה. {{msg}}",
          dayAddedAsWorking:
            "{{day}} נוסף כיום עבודה. משבצות חדשות יופיעו לאחר הפעלת יצירת משבצות.",
          dayHoursExpanded:
            "שעות {{day}} הורחבו. הפעל יצירת משבצות למילוי חלון הזמן החדש.",
          breakRemovedFrom:
            "הפסקה הוסרה מ-{{day}}. הפעל יצירת משבצות למילוי חלון הזמן החדש.",
          dayHoursIncomplete: "{{day}}: שעות העבודה אינן שלמות.",
          dayStartBeforeEnd: "{{day}}: שעת ההתחלה חייבת להיות לפני שעת הסיום.",
          dayBreakIncomplete: "{{day}}: להפסקה יש זמנים חסרים.",
          dayBreakStartBeforeEnd:
            "{{day}}: שעת תחילת ההפסקה חייבת להיות לפני שעת הסיום.",
          dayBreakWithinHours: "{{day}}: ההפסקה חייבת להיות בתוך שעות העבודה.",
          clickToBlock:
            "לחץ על תאריך עתידי לחסימתו. לחץ על תאריך חסום לביטול החסימה.",
          unblockAriaLabel: "בטל חסימת תאריך",
          blockTitle: "חסום {{date}}",
          reasonLabel: "סיבה (אופציונלי)",
          reasonPlaceholder: "לדוגמה: חג",
          blockDateButton: "חסום תאריך",
          scheduleChangeTitle: "זוהה שינוי בלוח הזמנים",
          reviewBeforeSaving: "סקור את ההשפעה לפני השמירה.",
          freeSlots_one: "משבצת זמינה 1",
          freeSlots_other: "{{count}} משבצות זמינות",
          willBeRemovedIfDelete: "תוסרנה אם תבחר למחוק משבצות פנויות.",
          appointmentsBooked_one: "פגישה 1 מוזמנת",
          appointmentsBooked_other: "{{count}} פגישות מוזמנות",
          duringAffectedHours: "בשעות המושפעות. הן",
          notCanceled: "אינן מבוטלות אוטומטית",
          cancelIndividuallyFrom: "— בטל אותן בנפרד מ-",
          schedulePage: "דף לוח הזמנים",
          deleteAndSave_one: "מחק משבצת פנויה 1 ושמור",
          deleteAndSave_other: "מחק {{count}} משבצות פנויות ושמור",
          keepSlotsAndSave: "שמור משבצות קיימות ושמור",
          understoodSave: "הבנתי, שמור בכל זאת",
          gotItSave: "הבנתי, שמור",
          goBack: "חזרה",
          blockDateTitle: "לחסום {{date}}?",
          reasonPrefix: "סיבה: {{reason}}",
          freeSlotsHidden_one: "משבצת זמינה 1",
          freeSlotsHidden_other: "{{count}} משבצות זמינות",
          willBeHiddenAutoRestored:
            "תוסתרנה אוטומטית ותשוחזרנה אם תבטל את חסימת התאריך.",
          appointmentsOnDate_one: "פגישה 1",
          appointmentsOnDate_other: "{{count}} פגישות",
          bookedOnDateNotCanceled:
            "מוזמנות בתאריך זה ואינן מבוטלות אוטומטית. בטל אותן בנפרד מ-",
          blockDateConfirm: "חסום תאריך",
          failedUpdateBlocked: "עדכון התאריכים החסומים נכשל. אנא נסה שוב.",
          fillAllFieldsDay: "אנא מלא את כל השדות ובחר לפחות יום אחד.",
          startBeforeEnd: "תאריך ההתחלה חייב להיות לפני תאריך הסיום.",
          startTimeBeforeEndTime: "שעת ההתחלה חייבת להיות לפני שעת הסיום.",
          failedCreateRule: "יצירת הכלל נכשלה. אנא נסה שוב.",
          failedDeleteRule: "מחיקת הכלל נכשלה.",
          fillDateAndTime: "אנא מלא את התאריך, שעת ההתחלה ושעת הסיום.",
          failedCreateException: "יצירת חריגת התאריך נכשלה. אנא נסה שוב.",
          failedDeleteException: "מחיקת חריגת התאריך נכשלה.",
          addRecurringRuleTitle: "להוסיף כלל חוזר?",
          removeRecurringRuleTitle: "להסיר כלל חוזר?",
          reviewImpact: "סקור את ההשפעה על משבצות קיימות.",
          freeSlotsRule_one: "משבצת פנויה 1",
          freeSlotsRule_other: "{{count}} משבצות פנויות",
          fallOutsideNewRuleHours_one:
            "נמצאת מחוץ לשעות הכלל החדש וניתן להסירה.",
          fallOutsideNewRuleHours_other:
            "נמצאות מחוץ לשעות הכלל החדש וניתן להסירן.",
          existWithinRulePeriod_one: "קיימת בתקופת הכלל וניתן להסירה.",
          existWithinRulePeriod_other: "קיימות בתקופת הכלל וניתן להסירן.",
          appointmentsPeriod_one: "פגישה 1 מוזמנת",
          appointmentsPeriod_other: "{{count}} פגישות מוזמנות",
          inPeriodNotCanceled:
            "בתקופה זו — אינן מבוטלות אוטומטית. בטל בנפרד מ-",
          deleteAndAddRule_one: "מחק משבצת פנויה 1 והוסף כלל",
          deleteAndAddRule_other: "מחק {{count}} משבצות פנויות והוסף כלל",
          deleteAndRemoveRule_one: "מחק משבצת פנויה 1 והסר כלל",
          deleteAndRemoveRule_other: "מחק {{count}} משבצות פנויות והסר כלל",
          keepSlotsAndAddRule: "שמור משבצות והוסף כלל",
          keepSlotsAndRemoveRule: "שמור משבצות והסר כלל",
          understoodAddRule: "הבנתי, הוסף כלל",
          understoodRemoveRule: "הבנתי, הסר כלל",
          appointmentsBookedOn_one: "פגישה 1 מוזמנת בתאריך {{date}}",
          appointmentsBookedOn_other:
            "{{count}} פגישות מוזמנות בתאריך {{date}}",
          slotsHiddenCancelFrom:
            "משבצות זמינות הוסתרו אוטומטית. בטל פגישות מוזמנות בנפרד מ-",
          addExceptionTitle: "להוסיף חריגת תאריך?",
          removeExceptionTitle: "להסיר חריגת תאריך?",
          freeSlotsExc_one: "משבצת פנויה 1",
          freeSlotsExc_other: "{{count}} משבצות פנויות",
          fallOutsideExcHours_one: "נמצאת מחוץ לשעות החריגה.",
          fallOutsideExcHours_other: "נמצאות מחוץ לשעות החריגה.",
          existWithinExcPeriod_one: "קיימת בתקופת החריגה.",
          existWithinExcPeriod_other: "קיימות בתקופת החריגה.",
          appointmentsExc_one: "פגישה 1",
          appointmentsExc_other: "{{count}} פגישות",
          bookedNotCanceledCancelFrom:
            "מוזמנות בתאריך זה — אינן מבוטלות אוטומטית. בטל מ-",
          deleteAndAddException_one: "מחק משבצת פנויה 1 והוסף חריגה",
          deleteAndAddException_other:
            "מחק {{count}} משבצות פנויות והוסף חריגה",
          deleteAndRemoveException_one: "מחק משבצת פנויה 1 והסר חריגה",
          deleteAndRemoveException_other:
            "מחק {{count}} משבצות פנויות והסר חריגה",
          keepSlotsAndAddException: "שמור משבצות והוסף חריגה",
          keepSlotsAndRemoveException: "שמור משבצות והסר חריגה",
          understoodAddException: "הבנתי, הוסף חריגה",
          understoodRemoveException: "הבנתי, הסר חריגה",
          blockedDatesTab: "תאריכים חסומים",
          dateExceptionTab: "חריגת תאריך",
          recurringRulesTab: "כללים חוזרים",
          blockedDatesTitle: "תאריכים חסומים",
          dateExceptionTitle: "חריגת תאריך",
          recurringRulesTitle: "כללים חוזרים",
          blockedDatesListHeader: "תאריכים חסומים",
          blockedCellLabel: "חסום",
          blockedDatesTooltip:
            "חסום תאריכים ספציפיים כאשר אינך זמין — לדוגמה חגים, חופשות, או סגירות חד-פעמיות. תאריכים חסומים מבטלים את כל הכללים האחרים: לא ייווצרו תורים זמינים וסלוטים קיימים יוסתרו. פגישות שנקבעו אינן מבוטלות אוטומטית.",
          dateExceptionTooltip:
            "הגדר שעות עבודה מותאמות לתאריך ספציפי — לדוגמה יום קצר לפני חג או פתיחה מאוחרת חד-פעמית. זה מבטל גם את שעות השבוע הרגילות וגם את הכללים החוזרים לאותו תאריך. עדיין יש ליצור תורים אחרי הוספת החריגה.",
          recurringRulesTooltip:
            "בטל זמנית את שעות השבוע שלך לטווח תאריכים. שימושי לשינויי לוח זמנים עונתיים (לדוגמה שעות קיץ קצרות יותר) או התאמות זמניות בימים ספציפיים. עדיפות: כללים חוזרים מבטלים שעות שבועיות אך מבוטלים על ידי חריגות תאריך.",
          noDateExceptions: "לא נוספו חריגות תאריך.",
          addExceptionHeader: "הוסף חריגה",
          dateLabel: "תאריך",
          startTimeLabel: "שעת התחלה",
          endTimeLabel: "שעת סיום",
          addDateExceptionButton: "הוסף חריגת תאריך",
          noRecurringRules: "לא נוספו כללים חוזרים.",
          addRuleHeader: "הוסף כלל",
          daysOfWeekLabel: "ימי שבוע",
          addRecurringRuleButton: "הוסף כלל חוזר",
        },

        // ============ PUBLIC BUSINESS PAGE ============
        publicBusiness: {
          manageSchedule: "ניהול לוח זמנים",
          editServiceAriaLabel: "עריכת שירות",
          deleteServiceAriaLabel: "מחיקת שירות",
          checkingAvailability: "בודק זמינות…",
          noUpcomingSlots: "אין משבצות זמינות קרובות",
          book: "הזמן",
          selectCategory: "— בחר קטגוריה —",
          durationPositive: "חייב להיות מספר חיובי",
          priceNotNegative: "לא יכול להיות שלילי",
          addService: "הוספת שירות",
          editServiceTitle: "עריכת שירות",
          nameLabel: "שם",
          namePlaceholder: "לדוגמה: תספורת",
          descriptionOptionalLabel: "תיאור (אופציונלי)",
          descriptionShortPlaceholder: "תיאור קצר",
          durationLabel: "משך זמן (דקות)",
          priceLabel: "מחיר (₪)",
          categoryLabel: "קטגוריה",
          cancelEdit: "ביטול עריכה",
          editingTitle: "עריכה: {{name}}",
          bannerAlt: "באנר עסקי",
          uploading: "מעלה…",
          uploadBanner: "העלאת באנר",
          changeBanner: "שנה באנר",
          addBanner: "הוסף באנר",
          logoAlt: "לוגו עסקי",
          changeLogoAriaLabel: "שנה לוגו",
          businessNamePlaceholder: "שם העסק",
          reviewCount_one: "(ביקורת {{count}})",
          reviewCount_other: "({{count}} ביקורות)",
          upload: "העלה",
          searchCardImageLabel: "תמונת כרטיס חיפוש",
          searchCardImageDesc:
            "מוצג בדפי חיפוש וגילוי. אם לא הוגדר, הלוגו שלך ישמש במקום.",
          searchCardPreviewAlt: "תצוגה מקדימה של כרטיס חיפוש",
          changeImage: "שנה תמונה",
          uploadImage: "העלה תמונה",
          remove: "הסר",
          descriptionLabel: "תיאור",
          descriptionEditPlaceholder: "ספר ללקוחות על העסק שלך…",
          addressLabel: "כתובת",
          addressPlaceholder: "חפש כתובת...",
          phoneLabel: "טלפון",
          following: "עוקב",
          follow: "עקוב",
          followerCount_one: "עוקב {{count}}",
          followerCount_other: "{{count}} עוקבים",
          themeColorLabel: "צבע ערכת נושא",
          themeColorHint: "תצוגה מקדימה חיה מעדכנת את צבעי הדף",
          saveChanges: "שמור שינויים",
          servicesTitle: "שירותים",
          addServiceLink: "הוסף שירות",
          noServicesListed: "העסק עדיין לא פרסם שירותים.",
          noServicesYet: "אין שירותים עדיין. הוסף את הראשון שלך למעלה.",
          reviewsTitle: "ביקורות",
          noReviewsYet: "אין ביקורות עדיין. היה הראשון להשאיר אחת!",
          loadMoreReviews: "טען ביקורות נוספות",
          saveFailed: "שמירה נכשלה. אנא נסה שוב.",
          serviceFormSaveFailed: "שמירת השירות נכשלה.",
          notFound: "עסק לא נמצא",
          notFoundDesc: "דף עסק זה אינו קיים או שהוסר.",
          goBack: "חזור",
        },

        // ============ SHARE ============
        share: {
          button: "שתף",
          modalTitle: "שתף את {{name}}",
          tabLink: "העתק קישור",
          tabQR: "קוד QR",
          linkDescription: "העתק את הקישור ושתף אותו בכל מקום.",
          copyButton: "העתק קישור",
          copied: "הקישור הועתק!",
          copyFallback: "העתק קישור זה:",
          qrDescription: "תן ללקוחות לסרוק את הקוד כדי לפתוח את הדף שלך.",
          downloadQR: "הורד קוד QR",
        },

        // ============ BUSINESS SCHEDULE PAGE ============
        businessSchedule: {
          failedLoadSlots: "טעינת נתוני המקומות נכשלה.",
          failedLoadAppointments: "טעינת הפגישות נכשלה.",
          failedVoid: "ביטול הפגישה נכשל. נסה שנית.",
          markDidntHappenTitle: "לסמן כלא התרחש?",
          cancelTitle: "לבטל פגישה?",
          markDidntHappenMsg: "פעולה זו תבטל את הפגישה שהושלמה ותעדכן את הרישום. השתמש רק אם השירות לא התקיים.",
          cancelMsg: "האם אתה בטוח שברצונך לבטל פגישה זו? לא ניתן לבטל פעולה זו.",
          yesVoidIt: "כן, בטל",
          yesCancelIt: "כן, בטל",
          keepIt: "השאר",
          scheduleLabel: "לוח זמנים",
          appointmentsSlots: "פגישות ומקומות",
          listView: "רשימה",
          slotsView: "מקומות",
          viewPage: "צפה בדף",
          filters: "סינון",
          dateRange: "טווח תאריכים",
          from: "מ",
          to: "עד",
          apply: "החל",
          clear: "נקה",
          service: "שירות",
          allServices: "כל השירותים",
          timeFrom: "שעה מ",
          timeTo: "שעה עד",
          includeCanceled: "כלול פגישות מבוטלות",
          appointmentCount_one: "פגישה אחת",
          appointmentCount_other: "{{count}} פגישות",
          noAppointmentsFound: "לא נמצאו פגישות",
          noAppointments: "אין פגישות",
          tryAdjusting: "נסה לשנות את הסינון או להרחיב את טווח התאריכים.",
          viewReview: "צפה בביקורת",
          noReviewLeft: "לא נותרה ביקורת",
          markedNotCompleted: "סומן כלא הושלם",
          canceling: "מבטל…",
          cancel: "ביטול",
          cancelAppointment: "בטל פגישה",
          voiding: "מבטל…",
          didntHappen: "לא התרחש",
          noServices: "אין שירותים",
          thisWeek: "השבוע",
          nextWeek: "שבוע הבא",
          next30Days: "30 ימים הבאים",
          refresh: "רענן",
          bookedCount: "{{count}} מוזמן",
          freeCount: "{{count}} פנוי",
          noServicesConfigured: "אין שירותים מוגדרים עדיין.",
          noSlotsInRange: "אין מקומות בטווח זה",
          generateSlotsHint: "צור מקומות עבור שירות זה מתוך שירותים ושעות.",
          canceled: "בוטל",
          completed: "הושלם",
          scheduled: "מתוכנן",
        },

        // ============ ACCESSIBILITY ============
        accessibility: {
          buttonLabel: "הגדרות נגישות",
          panelTitle: "נגישות",
          fontSize: {
            label: "גודל גופן",
            sm: "קטן",
            default: "רגיל",
            lg: "גדול",
            xl: "גדול מאוד",
          },
          highContrast: {
            label: "ניגודיות גבוהה",
            description: "מגביר ניגודיות לקריאות טובה יותר",
          },
          reduceMotion: {
            label: "הפחתת תנועה",
            description: "מבטל אנימציות ומעברים",
          },
          reset: "איפוס להגדרות ברירת מחדל",
        },

        // ============ TUTORIALS ============
        tutorials: {
          common: {
            back: "חזור",
            next: "הבא",
            skip: "דלג",
            finish: "הבנתי!",
            stepOf: "שלב {{current}} מתוך {{total}}",
          },
          search: {
            step1: {
              title: "חפש עסק",
              body: "הקלד שם עסק או מילת מפתח בשורת החיפוש כדי למצוא את מה שאתה מחפש.",
            },
            step2: {
              title: "סנן לפי קטגוריה",
              body: "השתמש בצ'יפים של הקטגוריות כדי לצמצם את התוצאות לפי סוג שירות.",
            },
            step3: {
              title: "החלף תצוגה",
              body: "עבור בין תצוגת רשימה לתצוגת מפה כדי לגלות עסקים ליד מיקומך.",
            },
          },
          booking: {
            step1: {
              title: "בחר תאריך",
              body: "בחר תאריך מהלוח כדי לראות את המשבצות הפנויות לשירות זה.",
            },
            step2: {
              title: "בחר משבצת זמן",
              body: "הקש על כל זמן פנוי כדי לבחור אותו. הוא ישמר לזמן קצר בזמן שתאשר.",
            },
            step3: {
              title: "אשר את ההזמנה",
              body: "עיין בסיכום והקש על אשר הזמנה. תקבל אישור מיד.",
            },
          },
          onboarding: {
            step1: {
              title: "ברוך הבא! בואו נקים את העסק שלך",
              body: "בואו נגדיר את פרופיל העסק שלך. זה לוקח רק כמה דקות.",
            },
            step2: {
              title: "שם העסק וקטגוריה",
              body: "תן שם לעסק שלך ובחר את הקטגוריה המתאימה ביותר.",
            },
            step3: {
              title: "מיקום",
              body: "הוסף את הכתובת שלך כדי שלקוחות יוכלו למצוא אותך במפה.",
            },
            step4: {
              title: "שירותים",
              body: "הוסף את השירותים שאתה מציע — שם, משך זמן ומחיר.",
            },
            step5: {
              title: "סיימנו!",
              body: "זהו! תמיד תוכל לעדכן את הפרטים האלה מלוח הבקרה שלך.",
            },
          },
          "owner-dashboard": {
            step1: {
              title: "העסק שלך במבט אחד",
              body: "כאן סיכום של העסק שלך — פגישות כוללות, הכנסות ועוד.",
            },
            step2: {
              title: "פגישות קרובות",
              body: "נהל את הפגישות של היום והפגישות הקרובות מכאן.",
            },
            step3: {
              title: "ערוך את דף העסק",
              body: "עבור לדף העסק הציבורי שלך כדי לעדכן שירותים, תמונות ומידע.",
            },
            step4: {
              title: "ניהול לוח זמנים",
              body: "הגדר את שעות העבודה וכללי הזמינות שלך כאן.",
            },
            step5: {
              title: "מדור הצוות",
              body: "הזמן ונהל את חברי הצוות שלך מהכרטיסייה 'צוות'.",
            },
          },
          "business-edit": {
            step1: {
              title: "אתה במצב עריכה",
              body: "אתה עורך כעת את דף העסק הציבורי שלך. השינויים נשמרים תוך כדי.",
            },
            step2: {
              title: "לוגו ובאנר",
              body: "העלה לוגו ותמונת באנר כדי שהדף שלך יבלוט.",
            },
            step3: {
              title: "צבע הנושא",
              body: "בחר צבע כדי להתאים אישית את דף העסק שלך.",
            },
            step4: {
              title: "רשימת שירותים",
              body: "הוסף, ערוך או הסר את השירותים שאתה מציע כאן.",
            },
            step5: {
              title: "תצוגה מקדימה",
              body: "צא ממצב עריכה כדי לראות איך לקוחות יראו את הדף שלך.",
            },
          },
          "schedule-editor": {
            step1: {
              title: "שעות עבודה שבועיות",
              body: "הגדר את שעות העבודה הרגילות שלך לכל יום בשבוע.",
            },
            step2: {
              title: "הפסקות",
              body: "הוסף הפסקות (למשל, צהריים) בתוך שעות העבודה — לא ייווצרו משבצות בזמן הפסקות.",
            },
            step3: {
              title: "חריגות תאריך",
              body: "חסום תאריכים ספציפיים — חגים, חופשות, או ימי חופש.",
            },
            step4: {
              title: "שמור את הלוח",
              body: "אל תשכח לשמור את הלוח כדי שלקוחות יראו זמינות מדויקת.",
            },
          },
          "staff-management": {
            step1: {
              title: "הצוות שלך",
              body: "חברי הצוות הנוכחיים שלך מופיעים כאן.",
            },
            step2: {
              title: "הזמן עובד",
              body: "הזמן עובד חדש בדוא״ל. הם יקבלו קישור להצטרף.",
            },
            step3: {
              title: "הזמנות ממתינות",
              body: "הזמנות שנשלחו מופיעות כאן עד שהתקבלו או פגו.",
            },
            step4: {
              title: "הקצאת שירותים",
              body: "הקצה חברי צוות לשירותים שהם מבצעים.",
            },
            step5: {
              title: "הסרת חבר",
              body: "תוכל להסיר חבר צוות בכל עת מהפרופיל שלו.",
            },
          },
          "staff-home": {
            step1: {
              title: "ברוך הבא לפורטל הצוות שלך!",
              body: "הנה סקירה מהירה של דף הבית שלך כחבר צוות.",
            },
            step2: {
              title: "מקום העבודה שלך",
              body: "זהו העסק שאתה עובד בו. הקש על הסמל כדי לצפות בדף העסק הציבורי.",
            },
            step3: {
              title: "שירותים מוקצים",
              body: "אלה השירותים שהוקצו לך לביצוע. לקוחות יכולים להזמין אצלך שירותים אלה.",
            },
            step4: {
              title: "הפגישה הבאה",
              body: "הפגישה הקרובה הבאה שלך מוצגת כאן במבט מהיר.",
            },
            step5: {
              title: "סטטיסטיקות מהירות",
              body: "סיכום עומס העבודה הקרוב שלך — פגישות היום ובשבוע זה.",
            },
            step6: {
              title: "נהל את הלוח שלך",
              body: "השתמש בעורך הלוח כדי להגדיר את הזמינות שלך, כך שלקוחות יראו רק משבצות כשאתה באמת זמין.",
            },
          },
          "staff-schedule-editor": {
            step1: {
              title: "זמינות שבועית",
              body: "הגדר את הימים והשעות שבהם אתה זמין לקבל פגישות.",
            },
            step2: {
              title: "הפסקות",
              body: "חסום הפסקות כדי שלא יזמינו אותך בצהריים או בזמן מנוחה.",
            },
            step3: {
              title: "חריגות תאריך",
              body: "חסום תאריכים ספציפיים שבהם אינך זמין — חג, יום חופש וכדומה.",
            },
            step4: {
              title: "שמור את הלוח",
              body: "שמור את הלוח כדי שלקוחות יראו רק משבצות כשאתה באמת זמין.",
            },
          },
          "date-exceptions": {
            step1: {
              title: "חסום תאריכים",
              body: "הקש על תאריך כדי לסמן אותו כלא זמין — למשל, חגים או חופשות. לא ייווצרו משבצות בתאריכים חסומים.",
            },
            step2: {
              title: "חריגות תאריך",
              body: "הגדר שעות עבודה מותאמות אישית ליום בודד — שימושי לימים קצרים או ארוכים יותר בתאריכים ספציפיים.",
            },
            step3: {
              title: "כללים חוזרים",
              body: "עקוף את שעות השבועיות הרגילות לטווח תאריכים — נוח לשינויי לוח זמנים עונתיים.",
            },
          },
          "customer-dashboard": {
            step1: {
              title: "הפגישות הקרובות שלך",
              body: "ההזמנות הבאות שלך מוצגות כאן כדי שתמיד תדע מה בפתח.",
            },
            step2: {
              title: "עסקים שעוקב אחריהם",
              body: "עסקים שאתה עוקב אחריהם מופיעים כאן לגישה מהירה — הקש על אחד כדי לראות את הדף שלו או להזמין שוב.",
            },
            step3: {
              title: "קישורים מהירים",
              body: "קפוץ ישירות להיסטוריית הפגישות המלאה, הזמנות, או לדף החיפוש מכאן.",
            },
          },
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
