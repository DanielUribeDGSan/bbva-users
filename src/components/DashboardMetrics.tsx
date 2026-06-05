import React from 'react';
import { Play, Pause, ArrowUpRight, CheckCircle, Circle, ChevronDown, Monitor, Clock, MoreVertical, Link2, MonitorPlay } from 'lucide-react';

export default function DashboardMetrics() {
    return (
        <div className="flex gap-6 w-full">
            
            {/* COLUMN 1 */}
            <div className="flex flex-col gap-6 w-[25%]">
                {/* Lora Piterson Profile Card */}
                <div className="card p-0 rounded-[32px] overflow-hidden relative h-[380px] shrink-0">
                    <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Lora Piterson" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#001391]/90 to-transparent text-white flex justify-between items-end">
                        <div>
                            <h3 className="text-2xl font-light mb-1">Lora Piterson</h3>
                            <p className="text-sm text-white/70">UX/UI Designer</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium">
                            $1,200
                        </div>
                    </div>
                </div>

                {/* Left Accordion Menu */}
                <div className="flex flex-col gap-4 py-2 px-2">
                    <div className="flex justify-between items-center text-[15px] font-medium cursor-pointer">
                        Pension contributions
                        <ChevronDown size={18} className="text-text-muted" />
                    </div>
                    
                    <div className="flex flex-col gap-4 py-4 border-y border-black/5">
                        <div className="flex justify-between items-center text-[15px] font-medium cursor-pointer">
                            Devices
                            <ChevronDown size={18} className="text-text-muted rotate-180" />
                        </div>
                        
                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-black/5">
                            <div className="w-12 h-12 bg-bbva-light rounded-xl overflow-hidden p-1 shrink-0">
                                <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&q=80" alt="MacBook" className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-medium truncate">MacBook Air</div>
                                <div className="text-[11px] text-text-muted">Version M1</div>
                            </div>
                            <MoreVertical size={16} className="text-text-muted shrink-0 cursor-pointer" />
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[15px] font-medium cursor-pointer">
                        Compensation Summary
                        <ChevronDown size={18} className="text-text-muted" />
                    </div>
                    
                    <div className="flex justify-between items-center text-[15px] font-medium cursor-pointer">
                        Employee Benefits
                        <ChevronDown size={18} className="text-text-muted" />
                    </div>
                </div>
            </div>

            {/* COLUMN 2 & 3 */}
            <div className="flex flex-col gap-6 w-[50%]">
                <div className="flex gap-6">
                    {/* Progress */}
                    <div className="card rounded-[32px] flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-[17px] font-medium">Progress</h3>
                            <button className="w-8 h-8 rounded-full bg-bbva-light flex items-center justify-center text-text-main hover:-translate-y-0.5 transition-transform">
                                <ArrowUpRight size={16} />
                            </button>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                            <div className="text-[40px] font-light leading-none">
                                6.1 <span className="text-2xl">h</span>
                            </div>
                            <div className="text-xs text-text-muted leading-tight">
                                Work Time<br/>this week
                            </div>
                        </div>
                        
                        {/* Bar Chart */}
                        <div className="flex items-end justify-between h-20 mt-8 px-2 relative">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#0c6dff]/10 px-3 py-1 rounded-full text-[10px] font-medium text-[#0c6dff] whitespace-nowrap">
                                5h 25m
                            </div>
                            {['S','M','T','W','T','F','S'].map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 z-10">
                                    <div 
                                        className={`w-1.5 rounded-full ${i === 5 ? 'bg-[#0c6dff]' : 'bg-text-main'}`}
                                        style={{ height: `${i === 5 ? 100 : Math.random() * 50 + 20}%` }}
                                    ></div>
                                    <span className="text-[10px] text-text-muted font-medium">{day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Time Tracker */}
                    <div className="card rounded-[32px] flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-[17px] font-medium">Time tracker</h3>
                            <button className="w-8 h-8 rounded-full bg-bbva-light flex items-center justify-center text-text-main hover:-translate-y-0.5 transition-transform">
                                <ArrowUpRight size={16} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center flex-1">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg width="128" height="128" className="absolute -rotate-90">
                                    <circle cx="64" cy="64" r="58" fill="none" stroke="#f0f0f0" strokeWidth="6" strokeDasharray="4 4" />
                                    <circle cx="64" cy="64" r="58" fill="none" stroke="#0c6dff" strokeWidth="6" strokeDasharray="364" strokeDashoffset="120" strokeLinecap="round" />
                                </svg>
                                <div className="text-center">
                                    <div className="text-[28px] font-light leading-tight">02:35</div>
                                    <div className="text-[11px] text-text-muted">Work Time</div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 mt-6">
                                <button className="w-10 h-10 rounded-full bg-bbva-light flex items-center justify-center hover:-translate-y-0.5 transition-transform"><Play size={18} fill="currentColor" /></button>
                                <button className="w-10 h-10 rounded-full bg-bbva-light flex items-center justify-center hover:-translate-y-0.5 transition-transform"><Pause size={18} fill="currentColor" /></button>
                                <button className="w-10 h-10 rounded-full bg-[#001391] text-white flex items-center justify-center hover:-translate-y-0.5 transition-transform ml-auto absolute right-6 bottom-6"><Clock size={18} /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Right Calendar & Events Area */}
                <div className="card rounded-[32px] p-0 flex flex-col justify-between flex-1 min-h-[300px]">
                    <div className="p-6 flex justify-between items-center border-b border-black/5">
                        <span className="text-sm text-text-muted">August</span>
                        <h3 className="text-[17px] font-medium">September 2024</h3>
                        <span className="text-sm text-text-muted">October</span>
                    </div>
                    
                    <div className="flex-1 p-6 relative">
                        {/* Days Header */}
                        <div className="flex justify-between pl-16 pr-8 mb-6 text-xs text-text-muted">
                            <div className="text-center"><div className="font-medium text-text-main">Mon</div><div>22</div></div>
                            <div className="text-center"><div className="font-medium text-text-main">Tue</div><div>23</div></div>
                            <div className="text-center"><div className="font-medium text-text-main">Wed</div><div>24</div></div>
                            <div className="text-center"><div className="font-medium text-text-main">Thu</div><div>25</div></div>
                            <div className="text-center"><div className="font-medium text-text-main">Fri</div><div>26</div></div>
                            <div className="text-center opacity-50"><div className="font-medium text-text-main">Sat</div><div>27</div></div>
                        </div>
                        
                        {/* Time Grid */}
                        <div className="flex flex-col gap-6 text-xs text-text-muted w-12 text-right">
                            <div>8:00 am</div>
                            <div>9:00 am</div>
                            <div>10:00 am</div>
                            <div>11:00 am</div>
                        </div>
                        
                        {/* Events Blocks */}
                        <div className="absolute top-[68px] left-[80px] bg-[#001391] text-white p-3 rounded-2xl w-[220px] shadow-lg z-10">
                            <div className="text-sm font-medium mb-1">Weekly Team Sync</div>
                            <div className="text-[11px] text-white/60 mb-2">Discuss progress on projects</div>
                            <div className="flex -space-x-2">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop" className="w-6 h-6 rounded-full border-2 border-[#001391]" />
                                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop" className="w-6 h-6 rounded-full border-2 border-[#001391]" />
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop" className="w-6 h-6 rounded-full border-2 border-[#001391]" />
                            </div>
                        </div>
                        
                        <div className="absolute top-[160px] left-[200px] bg-white border border-black/5 p-3 rounded-2xl w-[200px] shadow-lg flex justify-between items-center z-20">
                            <div>
                                <div className="text-sm font-medium text-[#0c6dff] mb-1">Onboarding Session</div>
                                <div className="text-[11px] text-text-muted">Introduction for new hires</div>
                            </div>
                            <div className="flex -space-x-2">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop" className="w-6 h-6 rounded-full border-2 border-white" />
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-[#001391] text-white flex items-center justify-center text-[10px]">
                                    +2
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMN 4 */}
            <div className="flex flex-col gap-6 w-[25%]">
                {/* Onboarding Overview */}
                <div className="card rounded-[32px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[17px] font-medium">Onboarding</h3>
                        <span className="text-2xl font-light">18%</span>
                    </div>
                    
                    <div className="flex flex-col gap-6 mt-4">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <div className="text-xs text-text-muted mb-2">30%</div>
                                <div className="h-8 bg-[#0c6dff] rounded flex items-center justify-center text-[11px] font-medium px-2 text-white">Task</div>
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-text-muted mb-2 border-l border-black/10 pl-2">25%</div>
                                <div className="h-8 bg-[#001391] rounded"></div>
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-text-muted mb-2 border-l border-black/10 pl-2">0%</div>
                                <div className="h-8 bg-bbva-light rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Onboarding Task Dark Card */}
                <div className="card bg-[#001391] text-white border-none rounded-[32px] p-6 flex-1 min-h-[380px]">
                    <div className="flex justify-between items-start mb-8">
                        <h3 className="text-[17px] font-medium text-white">Onboarding Task</h3>
                        <div className="text-2xl font-light">2/8</div>
                    </div>
                    
                    <div className="flex flex-col gap-5 relative">
                        {/* Progress Line */}
                        <div className="absolute left-[19px] top-6 bottom-[20px] w-[2px] bg-white/10 z-0 rounded-full"></div>
                        
                        {[
                            { title: 'Interview', time: 'Sep 13, 08:30', done: true, icon: <Monitor size={16} /> },
                            { title: 'Team Meeting', time: 'Sep 13, 10:30', done: true, icon: <MonitorPlay size={16} /> },
                            { title: 'Project Update', time: 'Sep 13, 13:00', done: false, icon: <Clock size={16} /> },
                            { title: 'Discuss Q3 Goals', time: 'Sep 13, 14:45', done: false, icon: <Monitor size={16} /> },
                            { title: 'HR Policy Review', time: 'Sep 13, 16:30', done: false, icon: <Link2 size={16} /> },
                        ].map((task, i) => (
                            <div key={i} className="flex items-center gap-4 relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-[2px] ${task.done ? 'bg-[#001391] border-[#0c6dff] text-[#0c6dff]' : 'bg-[#001391] border-white/20 text-white/40'}`}>
                                    {task.icon}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className={`text-[14px] font-medium truncate ${task.done ? 'text-white/60' : 'text-white'}`}>{task.title}</div>
                                    <div className="text-[11px] text-white/40">{task.time}</div>
                                </div>
                                
                                <div className="shrink-0">
                                    {task.done ? <CheckCircle size={20} className="text-[#0c6dff] fill-[#0c6dff]" stroke="currentColor" /> : <Circle size={20} className="text-white/20" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
