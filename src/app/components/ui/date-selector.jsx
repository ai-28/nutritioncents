import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays, isSameDay, isAfter, startOfDay } from 'date-fns';

export function DateSelector({ selectedDate, onDateChange }) {
  const [open, setOpen] = useState(false);
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(selectedDate);
  
  // Generate 7 days: 3 before, selected, 3 after
  const days = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 3; // -3, -2, -1, 0, 1, 2, 3
    return addDays(selectedDay, offset);
  });

  const scrollRef = useRef(null);
  const containerRef = useRef(null);

  const goToPreviousDay = () => onDateChange(addDays(selectedDate, -1));
  const goToNextDay = () => onDateChange(addDays(selectedDate, 1));

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      setOpen(false);
    }
  };

  const handleDayClick = (day: Date) => {
    onDateChange(day);
  };

  // Keep the center position fixed - no scrolling needed since selected date is always at index 3
  // The dates array is already generated with selected date in the center

  const isFuture = isAfter(selectedDay, today);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm hover:bg-primary/90 transition-colors cursor-pointer">
              <Calendar className="h-4 w-4" />
              <span>{format(selectedDate, 'MMM, yyyy')}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex items-center justify-between gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToPreviousDay} 
          className="shrink-0 text-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden relative min-h-[72px] py-1"
        >
          <div 
            className="grid grid-cols-7 gap-2 px-2 items-center h-full"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none'
            }}
          >
            {days.map((day, index) => {
              const isSelected = isSameDay(day, selectedDay);
              const isToday = isSameDay(day, today);
              const isFutureDate = isAfter(startOfDay(day), today);
              
              return (
                <button
                  key={`${day.toISOString()}-${selectedDay.toISOString()}`}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 relative active:scale-95 min-h-[64px]",
                    isSelected 
                      ? "bg-green-500 text-white border-2 border-green-500 shadow-md font-semibold active:scale-95 dark:bg-green-600 dark:text-white dark:border-green-600" 
                      : isToday 
                        ? "bg-primary/10 text-primary border border-primary/20 hover:scale-105"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105"
                  )}
                  style={{
                    gridColumn: index + 1
                  }}
                >
                  <span className={cn("text-xs", isSelected && "font-medium")}>{format(day, 'EEE')}</span>
                  <span className={cn("text-lg", isSelected ? "font-semibold" : "font-normal")}>{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToNextDay} 
          className="shrink-0 text-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
