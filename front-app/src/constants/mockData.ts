/**
 * Mock Data
 * Temporary hardcoded data to be replaced with real API data in the future
 * This file centralizes all mock/placeholder data used across the application
 */

// Customer Landing Page - Service Categories
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

// Business Owner Landing Page - Features
export const MOCK_BUSINESS_FEATURES = [
  {
    title: "Smart Availability",
    description:
      "Intelligent sync with your personal calendar and buffer times between sessions.",
    iconName: "calendar_month",
    iconBgColor: "bg-blue-50 text-[#1980e6]",
  },
  {
    title: "Team Coordination",
    description:
      "Manage staff schedules, permissions, and performance metrics in one dashboard.",
    iconName: "group",
    iconBgColor: "bg-purple-50 text-purple-600",
  },
  {
    title: "Client Growth",
    description:
      "Built-in marketing tools and loyalty programs to keep your clients coming back.",
    iconName: "insights",
    iconBgColor: "bg-orange-50 text-orange-600",
  },
];

// Business Owner Landing Page - Statistics
export const MOCK_BUSINESS_STATS = {
  label: "Business Impact",
  value: "Save 10 hours/week",
  description: "Average time saved on admin tasks",
  iconName: "trending_up",
  iconColor: "text-green-600",
  iconBgColor: "bg-green-100",
};

// Business Owner Landing Page - Testimonial
export const MOCK_TESTIMONIAL = {
  quote:
    "The transition was seamless. I finally feel back in control of my studio's growth.",
  author: "Sarah J., Studio Owner",
};

// Selection Page - Account Types
export const MOCK_ACCOUNT_TYPES = {
  businessOwner: {
    title: "Business Owner",
    description:
      "Manage services, team, and growth. Everything you need to scale your local business.",
    buttonLabel: "Get Started as Owner",
    iconName: "storefront",
    iconBgColor: "bg-blue-50",
    iconColor: "text-[#1980e6]",
  },
  customer: {
    title: "Customer",
    description:
      "Discover local services and book instantly. Manage all your appointments in one place.",
    buttonLabel: "Book a Service",
    iconName: "person_search",
    iconBgColor: "bg-orange-50",
    iconColor: "text-orange-500",
  },
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
