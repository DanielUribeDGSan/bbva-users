import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronsUpDown, ExternalLink, Menu, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function DashboardTopbar() {
    const now = new Date();
    const defaultPeriod = `month:${now.getFullYear()}:${now.getMonth()}`;
    const [selectedPeriod, setSelectedPeriod] = useState(() => typeof window === 'undefined'
        ? defaultPeriod
        : new URLSearchParams(window.location.search).get('period') || defaultPeriod);
    const [periodOpen, setPeriodOpen] = useState(false);
    const [periodSearch, setPeriodSearch] = useState('');

    useEffect(() => {
        const urlPeriod = new URLSearchParams(window.location.search).get('period');
        setSelectedPeriod(urlPeriod || defaultPeriod);
    }, [defaultPeriod]);

    const options = useMemo(() => {
        const result: Array<{ value: string; label: string }> = [];
        for (let year = now.getFullYear(); year >= now.getFullYear() - 2; year -= 1) {
            const lastMonth = year === now.getFullYear() ? now.getMonth() : 11;
            for (let month = lastMonth; month >= 0; month -= 1) {
                result.push({
                    value: `month:${year}:${month}`,
                    label: `${MONTHS[month]} ${year}${year === now.getFullYear() && month === now.getMonth() ? ' · actual' : ''}`
                });
            }
        }
        return result;
    }, []);

    const changePeriod = (value: string) => {
        setSelectedPeriod(value);
        setPeriodOpen(false);
        const url = new URL(window.location.href);
        url.searchParams.set('period', value);
        url.searchParams.delete('filter');
        url.searchParams.delete('created_from');
        url.searchParams.delete('created_to');
        url.searchParams.delete('page');
        window.location.assign(url.toString());
    };
    const selectedLabel = options.find(option => option.value === selectedPeriod)?.label ?? 'Seleccionar mes';
    const normalizedSearch = periodSearch.trim().toLocaleLowerCase('es');
    const filteredOptions = normalizedSearch
        ? options.filter(option => option.label.toLocaleLowerCase('es').includes(normalizedSearch))
        : options;

    return (
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-2 bg-[#f7f8f8] px-4 py-3 sm:gap-3 sm:px-6 lg:min-h-20 lg:px-8">
            <button type="button" data-mobile-menu className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white text-[#001391] shadow-sm lg:hidden" aria-label="Abrir menú">
                <Menu size={20} />
            </button>
            <Popover open={periodOpen} onOpenChange={(open) => {
                setPeriodOpen(open);
                if (!open) setPeriodSearch('');
            }}>
                <PopoverTrigger
                    render={<button type="button" role="combobox" aria-label="Seleccionar mes" aria-expanded={periodOpen} className="flex h-10 min-w-0 w-full max-w-sm cursor-pointer items-center justify-between rounded-lg bg-white px-3 text-xs font-semibold text-[#001391] shadow-sm outline-none transition hover:bg-white/80 sm:px-4 sm:text-sm" />}
                >
                    <span className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <CalendarDays className="size-4 shrink-0 text-[#0c6dff]" />
                        <span className="truncate">{selectedLabel}</span>
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 text-slate-400" />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[min(24rem,calc(100vw-2rem))] rounded-xl p-1">
                    <div className="relative m-1 flex h-9 items-center rounded-lg bg-slate-100 px-3">
                        <Search className="mr-2 size-4 shrink-0 text-slate-400" />
                        <input
                            value={periodSearch}
                            onChange={(event) => setPeriodSearch(event.target.value)}
                            placeholder="Buscar mes o año…"
                            aria-label="Buscar mes o año"
                            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                    </div>
                    <div className="max-h-72 overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <p className="py-6 text-center text-sm text-slate-500">No se encontró ese periodo.</p>
                        ) : filteredOptions.map(option => (
                            <button
                                type="button"
                                key={option.value}
                                onClick={() => changePeriod(option.value)}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-900 outline-none transition hover:bg-slate-100 focus-visible:bg-slate-100"
                            >
                                <CalendarDays className="size-4 shrink-0 text-slate-400" />
                                <span>{option.label}</span>
                                {selectedPeriod === option.value && <Check className="ml-auto size-4 shrink-0" />}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
            <a
                href="https://dashboard-analitica-estratega.netlify.app/"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-[#001391] shadow-sm transition hover:bg-blue-50 sm:px-4 sm:text-sm"
            >
                <span className="hidden sm:inline">Dashboard analítico</span>
                <ExternalLink className="size-3.5 text-slate-400" />
            </a>
        </header>
    );
}
