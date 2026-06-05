import React, { useState, useEffect, useRef } from 'react';
import { Filter, MoreHorizontal, Loader, Search, X } from 'lucide-react';
import DatePicker from './DatePicker';
import { fetchUsers } from '../services/api';
import type { User, FetchUsersResponse } from '../services/api';

export default function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<FetchUsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Pagination state
    const [page, setPage] = useState(1);
    const size = 10;

    // Filter states
    const [globalSearch, setGlobalSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    
    const [filters, setFilters] = useState({
        code_bbva: '',
        phone: '',
        created_from: '',
        created_to: ''
    });

    const loadUsers = async () => {
        setLoading(true);
        
        // Initial check for URL filters (like from dashboard)
        let initialCreatedFrom = filters.created_from;
        if (typeof window !== 'undefined' && !initialCreatedFrom) {
            const params = new URLSearchParams(window.location.search);
            if (params.get('filter') === 'this_week') {
                const today = new Date();
                const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                firstDayOfWeek.setHours(0, 0, 0, 0);
                initialCreatedFrom = firstDayOfWeek.toISOString().split('T')[0]; // YYYY-MM-DD
            }
        }

        const res = await fetchUsers({
            page,
            size,
            phone: filters.phone || globalSearch || undefined,
            code_bbva: filters.code_bbva || undefined,
            created_from: initialCreatedFrom || undefined,
            created_to: filters.created_to || undefined
        });
        
        setUsers(res.data || []);
        setPagination(res);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, [page]);

    // Handle search with simple debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            setPage(1); // Reset to first page on new search
            loadUsers();
        }, 500);
        return () => clearTimeout(timeout);
    }, [globalSearch, filters]);

    // Close filters on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilters(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNext = () => {
        if (pagination?.has_next_page) {
            setPage(page + 1);
        }
    };

    const handlePrev = () => {
        if (pagination?.has_previous_page) {
            setPage(page - 1);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const clearFilters = () => {
        setFilters({
            code_bbva: '',
            phone: '',
            created_from: '',
            created_to: ''
        });
        setGlobalSearch('');
    };

    const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

    return (
        <div className="card w-full p-8 border-none shadow-2xl bg-white/90 backdrop-blur-md rounded-[32px]">
            <div className="flex justify-end items-center mb-8 relative">
                <div className="flex gap-4 items-center">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                        <input 
                            type="text" 
                            className="bg-bbva-light border border-black/5 rounded-full pl-10 pr-4 py-2.5 text-sm w-[280px] focus:outline-none focus:border-bbva-accent focus:ring-2 focus:ring-bbva-accent/20 transition-all" 
                            placeholder="Buscar por teléfono..." 
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative" ref={filterRef}>
                        <button 
                            className={`w-10 h-10 rounded-full border border-black/5 flex items-center justify-center shadow-sm transition-colors ${activeFilterCount > 0 ? 'bg-[#001391] text-white' : 'bg-bbva-light text-text-main hover:bg-black/5'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-yellow text-[#001391] text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        
                        {/* Filters Dropdown Menu */}
                        {showFilters && (
                            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-black/5 p-5 z-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium text-[15px]">Filtros</h3>
                                    <button onClick={clearFilters} className="text-xs text-text-muted hover:text-[#0c6dff]">Limpiar todo</button>
                                </div>
                                
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-text-muted">Código BBVA</label>
                                        <input 
                                            type="text" 
                                            name="code_bbva"
                                            value={filters.code_bbva}
                                            onChange={handleFilterChange}
                                            placeholder="Ej. BAPA"
                                            className="bg-bbva-light border border-black/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bbva-accent focus:ring-1 focus:ring-bbva-accent"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-text-muted">Teléfono</label>
                                        <input 
                                            type="text" 
                                            name="phone"
                                            value={filters.phone}
                                            onChange={handleFilterChange}
                                            placeholder="Prefijo telefónico"
                                            className="bg-bbva-light border border-black/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bbva-accent focus:ring-1 focus:ring-bbva-accent"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-text-muted">Desde</label>
                                            <DatePicker 
                                                value={filters.created_from}
                                                onChange={(val) => setFilters({...filters, created_from: val})}
                                                placeholder="YYYY-MM-DD"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-text-muted">Hasta</label>
                                            <DatePicker 
                                                value={filters.created_to}
                                                onChange={(val) => setFilters({...filters, created_to: val})}
                                                placeholder="YYYY-MM-DD"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-text-muted">
                    <Loader className="w-8 h-8 animate-spin mb-4 text-[#001391]" />
                    <p className="text-sm font-medium">Cargando usuarios...</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr>
                                    <th className="font-medium text-xs text-text-muted pb-3 px-4 border-b border-black/5">Código BBVA</th>
                                    <th className="font-medium text-xs text-text-muted pb-3 px-4 border-b border-black/5">Phone / Contact</th>
                                    <th className="font-medium text-xs text-text-muted pb-3 px-4 border-b border-black/5">Created At</th>
                                    <th className="font-medium text-xs text-text-muted pb-3 px-4 border-b border-black/5 w-16">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((user, i) => (
                                    <tr key={user.id || i} className="group hover:bg-bbva-light/50 transition-colors">
                                        <td className="px-4 py-3 bg-white group-hover:bg-bbva-light/50 rounded-l-2xl border-y border-l border-black/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-bbva-light text-[#001391] border border-black/5 flex items-center justify-center font-medium shadow-sm shrink-0">
                                                    {(user.code_bbva || 'B').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-medium text-[15px]">{user.code_bbva || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 bg-white group-hover:bg-bbva-light/50 text-[14px] border-y border-black/5">{user.phone || 'N/A'}</td>
                                        <td className="px-4 py-3 bg-white group-hover:bg-bbva-light/50 text-text-muted text-[14px] border-y border-black/5">{user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</td>
                                        <td className="px-4 py-3 bg-white group-hover:bg-bbva-light/50 rounded-r-2xl border-y border-r border-black/5 text-right">
                                            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-text-muted transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-text-muted bg-white rounded-2xl border border-black/5">
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-black/5">
                        <div className="text-sm text-text-muted font-medium">
                            Mostrando página {pagination?.page || 1} de {pagination?.total_pages || 1} ({pagination?.total || 0} usuarios)
                        </div>
                        <div className="flex gap-2">
                            <button 
                                className="px-5 py-2 rounded-full border border-black/10 bg-white font-medium text-sm hover:bg-bbva-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                onClick={handlePrev} 
                                disabled={!pagination?.has_previous_page}
                            >
                                Anterior
                            </button>
                            <button 
                                className="px-5 py-2 rounded-full border border-black/10 bg-white font-medium text-sm hover:bg-bbva-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                onClick={handleNext} 
                                disabled={!pagination?.has_next_page}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
