import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const DEPARTMENTS = [
  "Computer Science and Engineering (CSE)",
  "Electrical and Electronic Engineering (EEE)",
  "Electronics and Communication Engineering (ECE)",
  "Computer Science (CS)",
  "Mathematics and Natural Sciences (MNS)",
  "Economics and Social Sciences (ESS)",
  "English and Humanities (ENH)",
  "Architecture (ARC)",
  "Pharmacy",
  "Biotechnology (BTC)",
  "Microbiology (MIC)",
  "Anthropology",
  "Law",
  "Business Administration (BBA)",
  "MBA",
  "Other",
];
