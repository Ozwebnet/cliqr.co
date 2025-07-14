import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LEAD_STAGES_CONFIG } from '@/lib/leadStages';
import { format, isPast, differenceInDays, parseISO, startOfDay, isSameDay, isToday, isTomorrow, isYesterday } from 'date-fns';
 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const getStageColor = (stage) => {
  return LEAD_STAGES_CONFIG[stage?.toLowerCase()]?.color || 'bg-gray-500';
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const today = startOfDay(now);
  const targetDay = startOfDay(targetDate);
  const hasTime = targetDate.getUTCHours() !== 0 || targetDate.getUTCMinutes() !== 0;

  // Check if the date is in the past
  if (isPast(targetDate)) {
    if (isSameDay(targetDate, now)) {
      // Overdue but same day - show "Missed Today" with time if available
      if (hasTime) {
        return `Missed Today ${format(targetDate, "h:mm a")}`;
      }
      return "Missed Today";
    }
    if (isYesterday(targetDate)) {
      return "Yesterday";
    }
    const daysAgo = differenceInDays(today, targetDay);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  }

  // Check for today - include time if available
  if (isToday(targetDate)) {
    if (hasTime) {
      return `Today ${format(targetDate, "h:mm a")}`;
    }
    return "Today";
  }

  // Check for tomorrow
  if (isTomorrow(targetDate)) {
    return "Tomorrow";
  }

  // Calculate days until the target date
  const daysUntil = differenceInDays(targetDay, today);
  
  if (daysUntil < 7) {
    return `${daysUntil} days`;
  }
  
  if (daysUntil < 30) {
    const weeks = Math.floor(daysUntil / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  
  const months = Math.floor(daysUntil / 30);
  return `${months} month${months > 1 ? 's' : ''}`;
};

const getTagColor = (date) => {
  if (!date) return 'bg-slate-600 text-slate-300 border-slate-500/30';
  const now = new Date();
  const targetDate = new Date(date);
  const today = startOfDay(now);
  const targetDay = startOfDay(targetDate);

  // Red for overdue dates (including yesterday and earlier)
  if (isPast(targetDate) && !isSameDay(targetDate, now)) {
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  }

  // Red for missed appointments today
  if (isPast(targetDate) && isSameDay(targetDate, now)) {
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  }

  // Yellow for dates within 3 days (including today and tomorrow)
  const daysUntil = differenceInDays(targetDay, today);
  if (daysUntil <= 2) {
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  }
  
  // Blue for dates within a month
  if (daysUntil <= 30) {
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
  
  // Grey for dates more than a month away
  return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
};

const formatFullDate = (date, hasTime) => {
  if (!date) return '';
  const targetDate = new Date(date);
  if (hasTime) return format(targetDate, "h:mm a, do MMMM yyyy");
  return format(targetDate, "do MMMM yyyy");
};

export const formatNextContactInfo = (dateString) => {
  if (!dateString) {
    return {
      relative: 'No date set',
      full: '',
      color: 'bg-slate-700 text-slate-400 border-slate-600',
    };
  }

  const date = parseISO(dateString);
  const hasTime = date.getUTCHours() !== 0 || date.getUTCMinutes() !== 0;

  return {
    relative: formatRelativeTime(date),
    full: formatFullDate(date, hasTime),
    color: getTagColor(date),
  };
};

export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};