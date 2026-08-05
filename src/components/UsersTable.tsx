import React, { useState, useEffect, useRef } from 'react';
import { Filter, MoreHorizontal, Loader, Search, X, Download } from 'lucide-react';
import DatePicker from './DatePicker';
import { fetchUsers } from '../services/api';
import type { User, FetchUsersResponse } from '../services/api';

export default function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<FetchUsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingAll, setIsExportingAll] = useState(false);
    const [exportedCount, setExportedCount] = useState(0);
    const [hasAccess, setHasAccess] = useState(
        typeof window !== 'undefined' ? localStorage.getItem('site_access_granted') === 'true' : false
    );

    useEffect(() => {
        const onAccess = () => setHasAccess(true);
        window.addEventListener('access_granted', onAccess);
        return () => window.removeEventListener('access_granted', onAccess);
    }, []);
    
    // State initialization from URL
    const getInitialFilters = () => {
        if (typeof window === 'undefined') return { code_bbva: '', phone: '', created_from: '', created_to: '' };
        
        const params = new URLSearchParams(window.location.search);
        let created_from = params.get('created_from') || '';
        let created_to = params.get('created_to') || '';
        const filterType = params.get('filter');
        const period = params.get('period');
        const today = new Date();
        
        if (period?.startsWith('month:') && !created_from && !created_to) {
            const [, yearText, monthText] = period.split(':');
            const year = Number(yearText);
            const month = Number(monthText);
            if (Number.isInteger(year) && Number.isInteger(month) && month >= 0 && month <= 11) {
                const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
                created_from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
                created_to = isCurrentMonth
                    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                    : `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;
            }
        } else if (filterType === 'this_week') {
            const firstDayOfWeek = new Date(today);
            firstDayOfWeek.setDate(today.getDate() - today.getDay());
            created_from = firstDayOfWeek.toISOString().split('T')[0];
        } else if (filterType === 'current_month') {
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            created_from = firstDayOfMonth.toISOString().split('T')[0];
        } else if (filterType === 'previous_month') {
            const firstDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            created_from = firstDayOfPrevMonth.toISOString().split('T')[0];
            created_to = lastDayOfPrevMonth.toISOString().split('T')[0];
        } else if (filterType === 'this_year') {
            const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
            created_from = firstDayOfYear.toISOString().split('T')[0];
        }
        
        return {
            code_bbva: params.get('code_bbva') || '',
            phone: params.get('phone') || '',
            created_from,
            created_to
        };
    };

    const getInitialSearch = () => {
        if (typeof window === 'undefined') return '';
        const params = new URLSearchParams(window.location.search);
        return params.get('search') || '';
    };

    const getInitialPage = () => {
        if (typeof window === 'undefined') return 1;
        const params = new URLSearchParams(window.location.search);
        const p = parseInt(params.get('page') || '1');
        return isNaN(p) ? 1 : p;
    };

    // Pagination state
    const [page, setPage] = useState(getInitialPage);
    const [size, setSize] = useState(10);

    // Filter states
    const [globalSearch, setGlobalSearch] = useState(getInitialSearch);
    const [showFilters, setShowFilters] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    
    const [filters, setFilters] = useState(getInitialFilters);

    // Sync URL function
    const updateUrl = (newFilters: any, search: string, p: number) => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        ['search', 'page', 'code_bbva', 'phone', 'created_from', 'created_to', 'filter'].forEach(key => params.delete(key));
        if (search) params.set('search', search);
        if (p > 1) params.set('page', p.toString());
        if (newFilters.code_bbva) params.set('code_bbva', newFilters.code_bbva);
        if (newFilters.phone) params.set('phone', newFilters.phone);
        if (newFilters.created_from) params.set('created_from', newFilters.created_from);
        if (newFilters.created_to) params.set('created_to', newFilters.created_to);
        
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
    };

    const loadUsers = async () => {
        if (!hasAccess) return;
        setLoading(true);
        
        updateUrl(filters, globalSearch, page);

        const res = await fetchUsers({
            page,
            size,
            phone: filters.phone || globalSearch || undefined,
            code_bbva: filters.code_bbva || undefined,
            created_from: filters.created_from || undefined,
            created_to: filters.created_to || undefined
        });
        
        setUsers(res.data || []);
        setPagination(res);
        setLoading(false);
    };

    const mounted = useRef(false);

    useEffect(() => {
        loadUsers();
    }, [page, size, hasAccess]);

    // Handle search with simple debounce
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        const timeout = setTimeout(() => {
            if (page !== 1) {
                setPage(1); // This will trigger the page effect which calls loadUsers
            } else {
                loadUsers(); // Page is already 1, so page effect won't run, call it here
            }
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

    const exportToCSV = async () => {
        if (!hasAccess) return;
        setIsExporting(true);
        try {
            let allData: User[] = [];
            let currentPage = 1;
            let totalPages = 1;
            
            do {
                const res = await fetchUsers({
                    page: currentPage,
                    size: 1000,
                    phone: filters.phone || globalSearch || undefined,
                    code_bbva: filters.code_bbva || undefined,
                    created_from: filters.created_from || undefined,
                    created_to: filters.created_to || undefined
                });
                
                if (res.data) {
                    allData = [...allData, ...res.data];
                }
                totalPages = res.total_pages || 1;
                currentPage++;
            } while (currentPage <= totalPages);
            
            if (allData.length === 0) return alert('No hay datos para exportar');
            
            const headers = ['Código BBVA', 'Teléfono', 'Fecha de creación'];
            const csvRows = [headers.join(',')];
            
            allData.forEach(user => {
                const row = [
                    user.code_bbva || '',
                    user.phone || '',
                    user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
                ];
                csvRows.push(row.map(cell => `"${cell}"`).join(','));
            });
            
            const csvString = '\uFEFF' + csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'usuarios.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting to CSV:", error);
            alert("Ocurrió un error al exportar los datos.");
        } finally {
            setIsExporting(false);
        }
    };

    const csvCell = (value: unknown) => {
        let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
        if (/^[=+\-@]/.test(text)) text = `'${text}`;
        return `"${text.replace(/"/g, '""')}"`;
    };

    const downloadUsersCsv = (data: User[], filename: string) => {
        const discoveredColumns = [...new Set(data.flatMap(user => Object.keys(user)))];
        const preferredColumns = ['id', 'code_bbva', 'phone', 'email', 'username', 'created_at'];
        const headers = [
            ...preferredColumns.filter(column => discoveredColumns.includes(column)),
            ...discoveredColumns.filter(column => !preferredColumns.includes(column))
        ];
        const csv = [
            headers.map(csvCell).join(','),
            ...data.map(user => headers.map(header => csvCell(user[header])).join(','))
        ].join('\r\n');
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const exportAllUsers = async () => {
        if (!hasAccess || isExporting || isExportingAll) return;
        setIsExportingAll(true);
        setExportedCount(0);
        try {
            const today = new Date();
            const createdTo = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const allData: User[] = [];
            let currentPage = 1;
            let totalPages = 1;

            do {
                const response = await fetchUsers({
                    page: currentPage,
                    size: 1000,
                    created_from: '2024-12-18',
                    created_to: createdTo
                });
                const remainingCapacity = 50000 - allData.length;
                const pageRows = (response.data || []).slice(0, remainingCapacity);
                allData.push(...pageRows);
                setExportedCount(allData.length);
                totalPages = Math.min(response.total_pages || 1, 50);
                currentPage += 1;
            } while (currentPage <= totalPages && allData.length < 50000);

            const filteredUsers = allData
                .filter(user => Number(user.id) > 78)
                .sort((a, b) => Number(a.id) - Number(b.id));
            if (filteredUsers.length === 0) {
                alert('No se encontraron usuarios desde el 18 de diciembre de 2024.');
                return;
            }
            downloadUsersCsv(filteredUsers, `usuarios-todos-2024-12-18_${createdTo}.csv`);
        } catch (error) {
            console.error('Error exporting all users:', error);
            alert('No fue posible descargar todos los usuarios.');
        } finally {
            setIsExportingAll(false);
            setExportedCount(0);
        }
    };

    return (
        <div className="card w-full border-none bg-white/90 p-4 shadow-sm backdrop-blur-md sm:p-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-center mb-8 relative gap-4">
                <div className="flex gap-4 items-center w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                        <input 
                            type="text" 
                            className="bg-bbva-light border border-black/5 rounded-full pl-10 pr-4 py-2.5 text-sm w-full sm:w-[280px] focus:outline-none focus:border-bbva-accent focus:ring-2 focus:ring-bbva-accent/20 transition-all" 
                            placeholder="Buscar por teléfono..." 
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center justify-end">
                        <button
                            type="button"
                            className={`h-10 rounded-full border border-[#001391]/10 flex items-center justify-center gap-2 px-4 shadow-sm transition-colors bg-[#001391] text-white hover:bg-[#072f92] shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${isExportingAll ? 'pointer-events-none' : ''}`}
                            onClick={exportAllUsers}
                            title="Descargar todos los usuarios desde el 18 de diciembre de 2024"
                            disabled={isExporting || isExportingAll}
                        >
                            {isExportingAll ? <Loader className="animate-spin" size={18} /> : <Download size={18} />}
                            <span className="text-sm font-medium whitespace-nowrap">
                                {isExportingAll ? `Descargando ${exportedCount.toLocaleString('es-MX')}` : 'Descargar todos'}
                            </span>
                        </button>
                        <button 
                            className={`w-10 h-10 rounded-full border border-black/5 flex items-center justify-center shadow-sm transition-colors bg-bbva-light text-text-main hover:bg-black/5 shrink-0 cursor-pointer disabled:cursor-not-allowed ${isExporting ? 'opacity-70 pointer-events-none' : ''}`}
                            onClick={exportToCSV}
                            title="Exportar los filtros actuales a CSV"
                            disabled={isExporting || isExportingAll}
                        >
                            {isExporting ? <Loader className="animate-spin" size={18} /> : <Download size={18} />}
                        </button>
                        
                        <div className="relative" ref={filterRef}>
                        <button 
                            className={`w-10 h-10 rounded-full border border-black/5 flex items-center justify-center shadow-sm transition-colors cursor-pointer ${activeFilterCount > 0 ? 'bg-[#001391] text-white' : 'bg-bbva-light text-text-main hover:bg-black/5'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} />
                        </button>
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#0c6dff] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white pointer-events-none">
                                {activeFilterCount}
                            </span>
                        )}
                        
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
                                                alignRight={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
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

                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-black/5 gap-4">
                        <div className="text-sm text-text-muted font-medium text-center sm:text-left">
                            Mostrando página {pagination?.page || 1} de {pagination?.total_pages || 1} ({pagination?.total || 0} usuarios)
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-text-muted">Mostrar:</span>
                                <select 
                                    className="bg-bbva-light border border-black/5 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-bbva-accent text-text-main"
                                    value={size}
                                    onChange={(e) => {
                                        setSize(Number(e.target.value));
                                        setPage(1);
                                    }}
                                >
                                    {[10, 20, 30, 50, 100, 500].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
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
                </div>
                </>
            )}
        </div>
    );
}
