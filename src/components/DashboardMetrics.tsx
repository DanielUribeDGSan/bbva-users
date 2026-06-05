import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowUpRight, CheckCircle, Circle, ChevronDown, Monitor, Clock, MoreVertical, Link2, MonitorPlay } from 'lucide-react';
import { fetchUsers } from '../services/api';

export default function DashboardMetrics() {
    const [weeklyUsers, setWeeklyUsers] = useState(0);
    const [currentMonthUsers, setCurrentMonthUsers] = useState(0);
    const [prevMonthUsers, setPrevMonthUsers] = useState(0);
    const [currentYearUsers, setCurrentYearUsers] = useState(0);
    const [monthWeeks, setMonthWeeks] = useState<{start: number, end: number, total: number}[]>([]);
    const [prevMonthWeeks, setPrevMonthWeeks] = useState<{start: number, end: number, total: number}[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            setIsLoading(true);
            
            let baseDate = new Date();
            if (baseDate.getMonth() !== selectedDate.getMonth() || baseDate.getFullYear() !== selectedDate.getFullYear()) {
                baseDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0); 
            }
            const today = baseDate;
            
            // This week
            const firstDayOfWeek = new Date(today);
            firstDayOfWeek.setDate(today.getDate() - today.getDay());
            firstDayOfWeek.setHours(0, 0, 0, 0);
            
            // Current month
            const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            // Previous month
            const firstDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

            // Calculate weeks
            const weeks: {start: number, end: number}[] = [];
            const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= lastDayOfCurrentMonth; i += 7) {
                const endDay = Math.min(i + 6, lastDayOfCurrentMonth);
                weeks.push({ start: i, end: endDay });
            }

            const weekPromises = weeks.map(w => {
                const from = new Date(today.getFullYear(), today.getMonth(), w.start).toISOString().split('T')[0];
                const to = new Date(today.getFullYear(), today.getMonth(), w.end).toISOString().split('T')[0];
                return fetchUsers({ size: 1, created_from: from, created_to: to });
            });

            // Calculate weeks for prev month
            const prevMonthWeeksData: {start: number, end: number}[] = [];
            const lastDayOfPrevMonthDateObj = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            for (let i = 1; i <= lastDayOfPrevMonthDateObj; i += 7) {
                const endDay = Math.min(i + 6, lastDayOfPrevMonthDateObj);
                prevMonthWeeksData.push({ start: i, end: endDay });
            }

            const prevWeekPromises = prevMonthWeeksData.map(w => {
                const from = new Date(today.getFullYear(), today.getMonth() - 1, w.start).toISOString().split('T')[0];
                const to = new Date(today.getFullYear(), today.getMonth() - 1, w.end).toISOString().split('T')[0];
                return fetchUsers({ size: 1, created_from: from, created_to: to });
            });

            const firstDayOfYear = new Date(baseDate.getFullYear(), 0, 1);

            // Fire requests in parallel
            const allResults = await Promise.all([
                fetchUsers({ size: 1, created_from: firstDayOfWeek.toISOString().split('T')[0], created_to: baseDate.toISOString().split('T')[0] }),
                fetchUsers({ size: 1, created_from: firstDayOfCurrentMonth.toISOString().split('T')[0], created_to: baseDate.toISOString().split('T')[0] }),
                fetchUsers({ size: 1, created_from: firstDayOfPrevMonth.toISOString().split('T')[0], created_to: lastDayOfPrevMonth.toISOString().split('T')[0] }),
                fetchUsers({ size: 1, created_from: firstDayOfYear.toISOString().split('T')[0], created_to: baseDate.toISOString().split('T')[0] }),
                ...weekPromises,
                ...prevWeekPromises
            ]);
            
            const weeklyRes = allResults[0];
            const currentRes = allResults[1];
            const prevRes = allResults[2];
            const yearRes = allResults[3];
            const weeksRes = allResults.slice(4, 4 + weeks.length);
            const prevWeeksRes = allResults.slice(4 + weeks.length);

            setWeeklyUsers(weeklyRes.total || 0);
            setCurrentMonthUsers(currentRes.total || 0);
            setPrevMonthUsers(prevRes.total || 0);
            setCurrentYearUsers(yearRes.total || 0);
            
            const loadedWeeks = weeks.map((w, idx) => ({
                ...w,
                total: weeksRes[idx].total || 0
            }));
            setMonthWeeks(loadedWeeks);

            const loadedPrevWeeks = prevMonthWeeksData.map((w, idx) => ({
                ...w,
                total: prevWeeksRes[idx].total || 0
            }));
            setPrevMonthWeeks(loadedPrevWeeks);
            setIsLoading(false);
        };
        loadMetrics();
    }, [selectedDate]);

    let pctChange = 0;
    if (prevMonthUsers === 0) {
        pctChange = currentMonthUsers > 0 ? 100 : 0;
    } else {
        pctChange = ((currentMonthUsers - prevMonthUsers) / prevMonthUsers) * 100;
    }

    let pctColor = "text-[#0c6dff]";
    if (pctChange < 0) {
        pctColor = "text-red-500";
    } else if (new Date().getDate() > 20) {
        pctColor = "text-[#001391]";
    }

    const target = prevMonthUsers;
    const currentPct = target === 0 ? 100 : Math.min(100, (currentMonthUsers / target) * 100);
    const circleCircumference = 364;
    const currentOffset = circleCircumference - (currentPct / 100) * circleCircumference;
    
    const targetToSurpass = prevMonthUsers + 1;
    const missingToSurpass = Math.max(0, targetToSurpass - currentMonthUsers);

    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const today = selectedDate;
    const currentMonthName = meses[today.getMonth()] + " " + today.getFullYear();
    const prevMonthName = meses[today.getMonth() === 0 ? 11 : today.getMonth() - 1];
    const nextMonthName = meses[today.getMonth() === 11 ? 0 : today.getMonth() + 1];

    const currentMonthNameDropdown = meses[selectedDate.getMonth()];

    return (
        <div className="w-full">
            {/* Header / Title */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-[42px] font-light tracking-tight leading-tight mb-2">
                        Comparación de usuarios del mes de 
                        <div className="relative inline-block ml-2">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="font-bold text-[#001391] hover:opacity-80 transition-opacity capitalize cursor-pointer">
                                {currentMonthNameDropdown}
                            </button>
                            {isMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/5 z-50 w-48 overflow-hidden">
                                    <div className="max-h-64 overflow-y-auto p-2">
                                        {meses.map((m, i) => {
                                            const currentMonthIndex = new Date().getMonth();
                                            const isFuture = i > currentMonthIndex;
                                            
                                            return (
                                                <button 
                                                    key={i}
                                                    disabled={isFuture}
                                                    onClick={() => {
                                                        if (isFuture) return;
                                                        const newDate = new Date();
                                                        newDate.setMonth(i);
                                                        setSelectedDate(newDate);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 rounded-xl text-sm capitalize transition-colors ${
                                                        isFuture 
                                                            ? 'opacity-30 cursor-not-allowed' 
                                                            : selectedDate.getMonth() === i 
                                                                ? 'bg-[#001391] text-white cursor-pointer' 
                                                                : 'hover:bg-black/5 cursor-pointer'
                                                    }`}
                                                >
                                                    {m}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </h1>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="relative w-16 h-16">
                        <svg className="animate-spin w-full h-full text-[#001391]" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="opacity-20" strokeLinecap="round" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="280" strokeDashoffset="240" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            ) : (
            <div className="flex gap-6 w-full">
            
            {/* COLUMN 1 */}
            <div className="flex flex-col gap-6 w-[25%]">
                {/* Lora Piterson Profile Card */}
                <div className="card p-0 rounded-[32px] overflow-hidden relative h-[380px] shrink-0 group">
                    <img 
                        src="/src/assets/bbva-estratega-life.avif" 
                        alt="BBVA Estratega Life" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#001391]/90 via-[#001391]/60 to-transparent text-white flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-light leading-tight">Usuarios Nuevos<br/>de esta semana</h3>
                            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-lg font-medium">
                                {weeklyUsers}
                            </div>
                        </div>
                        <a 
                            href="/users?filter=this_week" 
                            className="inline-flex items-center justify-center w-full bg-white text-[#001391] py-2.5 rounded-full text-sm font-medium hover:bg-bbva-light transition-colors shadow-sm"
                        >
                            Ver nuevos usuarios
                        </a>
                    </div>
                </div>

                {/* Usuarios Nuevos Año Actual Card */}
                <div className="card p-0 rounded-[32px] overflow-hidden relative h-[380px] shrink-0 group">
                    <img 
                        src="/src/assets/bbva-estratega-life-2.avif" 
                        alt="Usuarios Nuevos del año" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 bg-gradient-to-t from-white via-white/90 to-transparent text-text-main flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-light leading-tight">Usuarios Nuevos<br/>del año actual</h3>
                            <div className="bg-[#001391]/10 backdrop-blur-md px-4 py-1.5 rounded-full text-lg font-medium text-[#001391]">
                                {currentYearUsers}
                            </div>
                        </div>
                        <a 
                            href="/users" 
                            className="inline-flex items-center justify-center w-full bg-[#001391] text-white py-2.5 rounded-full text-sm font-medium hover:bg-[#001391]/90 transition-colors shadow-sm"
                        >
                            Ver usuarios del año
                        </a>
                    </div>
                </div>
            </div>

            {/* COLUMN 2 & 3 */}
            <div className="flex flex-col gap-6 w-[50%]">
                <div className="flex gap-6">
                    {/* Progress */}
                    <a href="/users?filter=current_month" className="card rounded-[32px] flex-1 block hover:shadow-xl transition-shadow cursor-pointer relative group">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-[17px] font-medium">Registro Mes Actual</h3>
                            <div className="w-8 h-8 rounded-full bg-bbva-light flex items-center justify-center text-text-main group-hover:-translate-y-0.5 transition-transform">
                                <ArrowUpRight size={16} />
                            </div>
                        </div>
                        
                        <div className="flex gap-4 items-center mb-6">
                            <div className="text-[40px] font-light leading-none">
                                {currentMonthUsers} <span className="text-2xl"></span>
                            </div>
                            <div className="text-xs text-text-muted leading-tight">
                                Usuarios totales<br/>registrados
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center flex-1">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg width="128" height="128" className="absolute -rotate-90">
                                    <circle cx="64" cy="64" r="58" fill="none" stroke="#f0f0f0" strokeWidth="6" strokeDasharray="4 4" />
                                    <circle cx="64" cy="64" r="58" fill="none" stroke="#0c6dff" strokeWidth="6" strokeDasharray="364" strokeDashoffset={currentOffset} strokeLinecap="round" />
                                </svg>
                                <div className="text-center">
                                    <div className="text-[28px] font-light leading-tight">{currentPct.toFixed(0)}%</div>
                                    <div className="text-[11px] text-text-muted">del mes<br/>anterior</div>
                                </div>
                            </div>
                        </div>
                    </a>

                    {/* Time Tracker */}
                    <a href="/users?filter=previous_month" className="card rounded-[32px] flex-1 block hover:shadow-xl transition-shadow cursor-pointer relative group">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-[17px] font-medium">Registro Mes Anterior</h3>
                            <div className="w-8 h-8 rounded-full bg-bbva-light flex items-center justify-center text-text-main group-hover:-translate-y-0.5 transition-transform">
                                <ArrowUpRight size={16} />
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center flex-1">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg width="128" height="128" className="absolute -rotate-90">
                                    <circle cx="64" cy="64" r="58" fill="none" stroke="#f0f0f0" strokeWidth="6" />
                                    <circle cx="64" cy="64" r="58" fill="none" stroke="#0c6dff" strokeWidth="6" strokeDasharray="364" strokeDashoffset="0" strokeLinecap="round" />
                                </svg>
                                <div className="text-center">
                                    <div className="text-[28px] font-light leading-tight">{prevMonthUsers}</div>
                                    <div className="text-[11px] text-text-muted">Usuarios</div>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>

                {/* Bottom Right Calendar & Events Area */}
                <div className="card rounded-[32px] p-0 flex flex-col justify-between flex-1 min-h-[300px] overflow-hidden">
                    <div className="p-6 flex justify-between items-center border-b border-black/5">
                        <span className="text-sm text-text-muted capitalize">{prevMonthName}</span>
                        <h3 className="text-[17px] font-medium capitalize">{currentMonthName}</h3>
                        <span className="text-sm text-text-muted capitalize">{nextMonthName}</span>
                    </div>
                    
                    <div className="flex-1 p-6 relative flex flex-col overflow-hidden">
                        {/* Days Header */}
                        <div className="flex justify-between pl-4 pr-4 mb-2 text-xs text-text-muted">
                            <div className="text-center"><div className="font-medium text-text-main">Lun</div></div>
                            <div className="text-center"><div className="font-medium text-text-main">Mar</div></div>
                            <div className="text-center"><div className="font-medium text-text-main">Mié</div></div>
                            <div className="text-center"><div className="font-medium text-text-main">Jue</div></div>
                            <div className="text-center"><div className="font-medium text-text-main">Vie</div></div>
                            <div className="text-center opacity-50"><div className="font-medium text-text-main">Sáb</div></div>
                        </div>
                        
                        {/* Events Blocks horizontally scrollable */}
                        <div className="flex gap-4 overflow-x-auto flex-1 items-center px-2 py-8 custom-scrollbar">
                            {monthWeeks.map((w, idx) => {
                                const isBlue = idx % 2 === 0;
                                const alignClass = isBlue ? "mb-12" : "mt-12";

                                if (isBlue) {
                                    return (
                                        <div key={idx} className={`shrink-0 bg-[#001391] text-white p-4 rounded-2xl w-[220px] h-[80px] shadow-lg flex justify-between items-center transition-all hover:-translate-y-1 ${alignClass}`}>
                                            <div>
                                                <div className="text-sm font-medium mb-1">Total de usuarios</div>
                                                <div className="text-[11px] text-white/60">del {w.start} al {w.end}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop" className="w-6 h-6 rounded-full border-2 border-[#001391]" />
                                                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop" className="w-6 h-6 rounded-full border-2 border-[#001391]" />
                                                </div>
                                                <span className="text-2xl font-light pr-1">{w.total}</span>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div key={idx} className={`shrink-0 bg-white border border-black/5 p-4 rounded-2xl w-[220px] h-[80px] shadow-lg flex justify-between items-center transition-all hover:-translate-y-1 ${alignClass}`}>
                                            <div>
                                                <div className="text-sm font-medium text-[#0c6dff] mb-1">Nuevos usuarios</div>
                                                <div className="text-[11px] text-text-muted">del {w.start} al {w.end}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop" className="w-6 h-6 rounded-full border-2 border-white" />
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-[#001391] text-white flex items-center justify-center text-sm font-medium shadow-sm">
                                                    {w.total}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMN 4 */}
            <div className="flex flex-col gap-6 w-[25%]">
                {/* Onboarding Overview */}
                <div className="card rounded-[32px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[17px] font-medium">Comparativa Mensual</h3>
                        <span className={`text-2xl font-medium ${pctColor}`}>{pctChange > 0 ? '+' : ''}{pctChange.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex flex-col gap-6 mt-4">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <div className="h-8 bg-[#0c6dff] rounded flex items-center justify-center text-[11px] font-medium px-2 text-white text-center leading-tight mb-2">Llevamos</div>
                                <div className="text-xs text-text-muted text-center">{currentMonthUsers} usuarios</div>
                            </div>
                            <div className="flex-1">
                                <div className="h-8 bg-[#001391] rounded flex items-center justify-center text-[11px] font-medium px-2 text-white text-center leading-tight mb-2">Meta</div>
                                <div className="text-xs text-text-muted text-center border-l border-black/10">{targetToSurpass} usuarios</div>
                            </div>
                            <div className="flex-1">
                                <div className="h-8 bg-bbva-light rounded flex items-center justify-center text-[11px] font-medium px-2 text-text-muted text-center leading-tight mb-2">Faltan</div>
                                <div className="text-xs text-text-muted text-center border-l border-black/10">{missingToSurpass} usuarios</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metas del mes Dark Card */}
                <div className="card bg-[#001391] text-white border-none rounded-[32px] p-6 flex-1 min-h-[380px]">
                    <div className="flex justify-between items-start mb-8">
                        <h3 className="text-[17px] font-medium text-white">Metas del mes</h3>
                        <div className="text-2xl font-light">
                            {monthWeeks.filter((w, i) => w.total > (prevMonthWeeks[i]?.total || 0) || (!prevMonthWeeks[i] && w.total > 0)).length}/{monthWeeks.length}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-5 relative">
                        {/* Progress Line */}
                        <div className="absolute left-[19px] top-6 bottom-[20px] w-[2px] bg-white/10 z-0 rounded-full"></div>
                        
                        {monthWeeks.map((w, i) => {
                            const prevTotal = prevMonthWeeks[i]?.total || 0;
                            const isDone = w.total > prevTotal || (!prevMonthWeeks[i] && w.total > 0);
                            return (
                                <div key={i} className="flex items-center gap-4 relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-[2px] ${isDone ? 'bg-[#001391] border-[#0c6dff] text-[#0c6dff]' : 'bg-[#001391] border-white/20 text-white/40'}`}>
                                        <Monitor size={16} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-[14px] font-medium truncate ${isDone ? 'text-white/60' : 'text-white'}`}>Semana {i + 1}</div>
                                        <div className="text-[11px] text-white/40">del {w.start} al {w.end}</div>
                                    </div>
                                    
                                    <div className="shrink-0">
                                        {isDone ? <CheckCircle size={20} className="text-[#0c6dff] fill-[#0c6dff]" stroke="currentColor" /> : <Circle size={20} className="text-white/20" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            </div>
            )}
        </div>
    );
}
