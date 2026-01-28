/**
 * Mock Data
 * Temporary hardcoded data to be replaced with real API data in the future
 * This file contains ONLY visual/placeholder data (images, icons, categories, etc.)
 * ALL TEXT content should come from i18n translations
 */

// Customer Landing Page - Service Category Icons & Images
export const MOCK_SERVICE_CATEGORIES = [
  {
    title: "Barbershops",
    subtitle: "120+ Nearby",
    category: "barbershop",
  },
  {
    title: "Medical Clinics",
    subtitle: "45+ Nearby",
    category: "medicalClinic",
  },
  {
    title: "Gyms & Studios",
    subtitle: "80+ Nearby",
    category: "gym",
  },
  {
    title: "Beauty Salons",
    subtitle: "200+ Nearby",
    category: "beautySalon",
  },
];

// Business Owner Landing Page - Feature Icons & Colors (Text comes from i18n)
export const MOCK_BUSINESS_FEATURES = [
  {
    iconName: "calendar_month",
    iconBgColor: "bg-blue-50 text-[#1980e6]",
  },
  {
    iconName: "group",
    iconBgColor: "bg-purple-50 text-purple-600",
  },
  {
    iconName: "insights",
    iconBgColor: "bg-orange-50 text-orange-600",
  },
];

// Business Owner Landing Page - Statistics Icon & Colors (Text comes from i18n)
export const MOCK_BUSINESS_STATS = {
  iconName: "trending_up",
  iconColor: "text-green-600",
  iconBgColor: "bg-green-100",
};

// Business Owner Landing Page - How It Works Icons & Colors (Text comes from i18n)
export const MOCK_HOW_IT_WORKS_STEPS = [
  {
    iconName: "storefront",
  },
  {
    iconName: "event_available",
  },
  {
    iconName: "rocket_launch",
  },
];

// Selection Page - Account Type Icons & Colors (Text comes from i18n)
export const MOCK_ACCOUNT_TYPES = {
  businessOwner: {
    iconName: "storefront",
    iconBgColor: "bg-blue-50",
    iconColor: "text-[#1980e6]",
  },
  customer: {
    iconName: "person_search",
    iconBgColor: "bg-orange-50",
    iconColor: "text-orange-500",
  },
};

// Business Owner Landing Page - Example Testimonial (Actual mock content, NOT text UI)
export const MOCK_TESTIMONIAL = {
  quote:
    "The transition was seamless. I finally feel back in control of my studio's growth.",
  author: "Sarah J., Studio Owner",
};

// UI Showcase - Business Card Example
export const MOCK_BUSINESS_CARD = {
  name: "Royal Cuts Barber Shop",
  location: "Downtown",
  distance: "1.2 miles away",
  rating: 4.9,
};

// UI Showcase - Appointment Example
export const MOCK_APPOINTMENT = {
  time: "Tomorrow, 10:30 AM",
  serviceName: "Men's Classic Haircut",
  status: "Confirmed",
};
