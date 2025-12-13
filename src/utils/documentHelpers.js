import {
  MapPin,
  Plane,
  FileText,
  Clock,
  Users,
  Shield,
  Navigation,
  Truck,
  Zap,
  Cloud,
  ArrowUpDown,
} from "lucide-react";

export function getDocumentTypeColor(type) {
  // Handle AD 2 subsections
  if (type.startsWith("AD 2.")) {
    switch (type) {
      case "AD 2.1":
      case "AD 2.2":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
      case "AD 2.3":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200";
      case "AD 2.4":
      case "AD 2.5":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "AD 2.6":
      case "AD 2.7":
      case "AD 2.10":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
      case "AD 2.8":
      case "AD 2.9":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
      case "AD 2.11":
        return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200";
      case "AD 2.12":
      case "AD 2.13":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200";
      case "AD 2.14":
      case "AD 2.15":
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  }

  // Handle legacy types
  switch (type) {
    case "chart":
      return "bg-[#1E3A8A]/10 dark:bg-[#1E3A8A]/30 text-[#1E3A8A] dark:text-[#60A5FA]";
    case "approach":
      return "bg-[#c4c284]/20 dark:bg-[#c4c284]/30 text-[#343420] dark:text-[#dcc39c]";
    case "departure":
      return "bg-[#949484]/20 dark:bg-[#949484]/30 text-[#343420] dark:text-[#e4e4c1]";
    case "procedure":
      return "bg-[#dcc39c]/30 dark:bg-[#dcc39c]/20 text-[#343420] dark:text-[#dcc39c]";
    case "AD 2 - Complete":
      return "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
  }
}

export function getDocumentTypeIcon(type) {
  // Handle AD 2 subsections
  if (type.startsWith("AD 2.")) {
    switch (type) {
      case "AD 2.1":
      case "AD 2.2":
        return MapPin; // Basic Information
      case "AD 2.3":
        return Clock; // Operating Hours
      case "AD 2.4":
      case "AD 2.5":
        return Users; // Services
      case "AD 2.6":
      case "AD 2.7":
      case "AD 2.10":
        return Shield; // Safety
      case "AD 2.8":
      case "AD 2.9":
        return Truck; // Ground Movement
      case "AD 2.11":
        return Cloud; // Weather
      case "AD 2.12":
      case "AD 2.13":
        return ArrowUpDown; // Runways
      case "AD 2.14":
      case "AD 2.15":
        return Zap; // Lighting & Navigation
      default:
        return FileText;
    }
  }

  // Handle legacy types
  switch (type) {
    case "chart":
      return MapPin;
    case "approach":
    case "departure":
    case "procedure":
      return Plane;
    default:
      return FileText;
  }
}

// Get category from document type for grouping
export function getDocumentCategory(type) {
  if (type.startsWith("AD 2.")) {
    switch (type) {
      case "AD 2.1":
      case "AD 2.2":
        return "Basic Information";
      case "AD 2.3":
        return "Operations";
      case "AD 2.4":
      case "AD 2.5":
        return "Services";
      case "AD 2.6":
      case "AD 2.7":
      case "AD 2.10":
        return "Safety";
      case "AD 2.8":
      case "AD 2.9":
        return "Ground Movement";
      case "AD 2.11":
        return "Weather";
      case "AD 2.12":
      case "AD 2.13":
        return "Runways";
      case "AD 2.14":
      case "AD 2.15":
        return "Lighting & Navigation";
      default:
        return "Other";
    }
  }

  if (type === "AD 2 - Complete") {
    return "Complete Documents";
  }

  return "Other Documents";
}
