'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';

// Helper to parse date string to local date (avoiding timezone issues)
function parseLocalDate(dateString) {
  if (!dateString) return null;
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch (error) {
    return null;
  }
}

export function DatePickerStrip({ selectedDate, onDateChange, className = '' }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    if (selectedDate) {
      const parsed = parseLocalDate(selectedDate);
      if (parsed && !isNaN(parsed.getTime())) {
        return startOfWeek(parsed, { weekStartsOn: 1 });
      }
    }
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });
  
  const isNavigatingRef = useRef(false);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(currentWeekStart, i);
    if (!isNaN(day.getTime())) {
      weekDays.push(day);
    }
  }

  const selectedDateObj = selectedDate ? (() => {
    const parsed = parseLocalDate(selectedDate);
    return (parsed && !isNaN(parsed.getTime())) ? parsed : new Date();
  })() : new Date();

  const handlePreviousDay = () => {
    isNavigatingRef.current = true;
    const currentSelected = selectedDate ? parseLocalDate(selectedDate) : new Date();
    const previousDay = addDays(currentSelected, -1);
    const previousDayString = format(previousDay, 'yyyy-MM-dd');
    
    // Update the selected date
    onDateChange(previousDayString);
    
    // Update week start if needed
    setCurrentWeekStart(prev => {
      const weekStart = startOfWeek(previousDay, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      const currentWeekEnd = addDays(prev, 6);
      const isOutsideCurrentWeek = previousDay < prev || previousDay > currentWeekEnd;
      return isOutsideCurrentWeek ? weekStart : prev;
    });
    
    // Reset flag after state update
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 0);
  };

  const handleNextDay = () => {
    isNavigatingRef.current = true;
    const currentSelected = selectedDate ? parseLocalDate(selectedDate) : new Date();
    const nextDay = addDays(currentSelected, 1);
    const nextDayString = format(nextDay, 'yyyy-MM-dd');
    
    // Update the selected date
    onDateChange(nextDayString);
    
    // Update week start if needed
    setCurrentWeekStart(prev => {
      const weekStart = startOfWeek(nextDay, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      const currentWeekEnd = addDays(prev, 6);
      const isOutsideCurrentWeek = nextDay < prev || nextDay > currentWeekEnd;
      return isOutsideCurrentWeek ? weekStart : prev;
    });
    
    // Reset flag after state update
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 0);
  };

  const handleDateClick = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    onDateChange(dateString);
  };

  // Update week start when selected date changes (if it's outside current week)
  // Only update if selected date is truly outside the current week view
  // Skip update if user is actively navigating
  useEffect(() => {
    if (isNavigatingRef.current) return;
    
    if (selectedDate) {
      const selected = parseLocalDate(selectedDate);
      if (!selected) return;
      
      setCurrentWeekStart(prev => {
        const weekStart = startOfWeek(selected, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        
        // Check if selected date is outside current week view
        const currentWeekEnd = addDays(prev, 6);
        const isOutsideCurrentWeek = selected < prev || selected > currentWeekEnd;
        
        return isOutsideCurrentWeek ? weekStart : prev;
      });
    }
  }, [selectedDate]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePreviousDay}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 flex items-center justify-between gap-1">
        {weekDays.map((date, index) => {
          if (isNaN(date.getTime())) return null;
          const isSelected = selectedDate && isSameDay(date, selectedDateObj);
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayAbbr = format(date, 'EEE').slice(0, 3);
          const dayNum = format(date, 'd');
          
          // Determine if date is today, past, or future
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dateToCompare = new Date(date);
          dateToCompare.setHours(0, 0, 0, 0);
          const isToday = isSameDay(date, today);
          const isPast = dateToCompare < today;
          const isFuture = dateToCompare > today;

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className={`
                flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg
                transition-all duration-200
                ${isSelected 
                  ? 'bg-orange-500 text-white' 
                  : isPast || isToday
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-gray-400 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-xs font-medium mb-1">{dayAbbr}</span>
              <span className="text-sm font-semibold">{dayNum}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNextDay}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
