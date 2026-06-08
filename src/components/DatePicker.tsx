import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    alignRight?: boolean;
}

export default function DatePicker({ value, onChange, placeholder = "Seleccionar fecha", alignRight = false }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
    
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get day of week of 1st day (0 = Sunday, 1 = Monday... but we want 0 = Monday, 6 = Sunday)
        let firstDayOfWeek = new Date(year, month, 1).getDay() - 1;
        if (firstDayOfWeek === -1) firstDayOfWeek = 6; // Sunday
        
        const days = [];
        
        // Previous month days
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            days.push({
                day: prevMonthDays - i,
                isCurrentMonth: false,
                isPrevMonth: true,
                date: new Date(year, month - 1, prevMonthDays - i)
            });
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                isPrevMonth: false,
                date: new Date(year, month, i)
            });
        }
        
        // Next month days to complete 6 rows (42 days)
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                isPrevMonth: false,
                date: new Date(year, month + 1, i)
            });
        }
        
        return days;
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleSelectDate = (date: Date) => {
        // Format to YYYY-MM-DD local
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${day}`);
        setIsOpen(false);
    };

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const isSelected = (date: Date) => {
        if (!value) return false;
        const selectedDate = new Date(value);
        // Correct for timezone offset when comparing strings
        const [year, month, day] = value.split('-');
        return date.getFullYear() === parseInt(year) && 
               date.getMonth() === parseInt(month) - 1 && 
               date.getDate() === parseInt(day);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const displayValue = value ? value : placeholder;

    return (
        <div className="relative" ref={containerRef}>
            {/* Input Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-bbva-light border border-black/5 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-bbva-accent text-text-main"
            >
                <span className={!value ? "text-text-muted" : ""}>{displayValue}</span>
                <CalendarIcon size={14} className="text-text-muted" />
            </button>

            {/* Calendar Popover */}
            {isOpen && (
                <div className={`absolute top-full ${alignRight ? 'right-0' : 'left-0'} mt-1 w-[280px] bg-white rounded-[20px] shadow-lg border border-black/5 p-4 z-[60]`}>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <button 
                            onClick={prevMonth}
                            className="w-8 h-8 rounded-lg border border-black/5 flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <div className="flex items-center gap-1 font-medium text-[15px] cursor-pointer">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            <ChevronDown size={14} className="text-text-muted ml-1" />
                        </div>
                        
                        <button 
                            onClick={nextMonth}
                            className="w-8 h-8 rounded-lg border border-black/5 flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Days of week */}
                    <div className="grid grid-cols-7 mb-2">
                        {daysOfWeek.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-text-muted py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {getDaysInMonth(currentMonth).map((dayObj, i) => {
                            const selected = isSelected(dayObj.date);
                            const today = isToday(dayObj.date);
                            
                            return (
                                <div key={i} className="flex items-center justify-center aspect-square">
                                    <button
                                        onClick={() => handleSelectDate(dayObj.date)}
                                        className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-[13px] relative transition-colors ${
                                            selected 
                                                ? 'bg-[#0c6dff] text-white font-medium' 
                                                : dayObj.isCurrentMonth
                                                    ? today 
                                                        ? 'text-[#0c6dff] font-medium' 
                                                        : 'text-text-main hover:bg-black/5'
                                                    : 'text-black/20 hover:text-black/40'
                                        }`}
                                    >
                                        {dayObj.day}
                                        {today && !selected && (
                                            <span className="absolute bottom-1 w-1 h-1 bg-[#0c6dff] rounded-full"></span>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
