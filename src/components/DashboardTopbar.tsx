import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronsUpDown, ExternalLink, Menu } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function DashboardTopbar() {
    const now = new Date();
    const defaultPeriod = `month:${now.getFullYear()}:${now.getMonth()}`;
    const [selectedPeriod, setSelectedPeriod] = useState(() => typeof window === 'undefined'
        ? defaultPeriod
        : new URLSearchParams(window.location.search).get('period') || defaultPeriod);
    const [periodOpen, setPeriodOpen] = useState(false);

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

    return (
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-2 bg-[#f7f8f8] px-4 py-3 sm:gap-3 sm:px-6 lg:min-h-20 lg:px-8">
            <button type="button" data-mobile-menu className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white text-[#001391] shadow-sm lg:hidden" aria-label="Abrir menú">
                <Menu size={20} />
            </button>
            <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
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
                    <Command>
                        <CommandInput placeholder="Buscar mes o año…" />
                        <CommandList>
                            <CommandEmpty>No se encontró ese periodo.</CommandEmpty>
                            <CommandGroup>
                                {options.map(option => (
                                    <CommandItem
                                        key={option.value}
                                        value={`${option.label} ${option.value}`}
                                        data-checked={selectedPeriod === option.value}
                                        onSelect={() => changePeriod(option.value)}
                                    >
                                        <CalendarDays className="size-4 text-slate-400" />
                                        <span>{option.label}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
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
