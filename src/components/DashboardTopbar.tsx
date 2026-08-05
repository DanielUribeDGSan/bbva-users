import React, { useMemo } from 'react';
import { CalendarDays, ChevronsUpDown, ExternalLink, Menu } from 'lucide-react';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function DashboardTopbar() {
    const now = new Date();
    const selectedPeriod = typeof window === 'undefined'
        ? `month:${now.getFullYear()}:${now.getMonth()}`
        : new URLSearchParams(window.location.search).get('period') || `month:${now.getFullYear()}:${now.getMonth()}`;

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

    const changePeriod = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const url = new URL(window.location.href);
        url.searchParams.set('period', event.target.value);
        url.searchParams.delete('filter');
        url.searchParams.delete('created_from');
        url.searchParams.delete('created_to');
        url.searchParams.delete('page');
        window.location.assign(url.toString());
    };

    return (
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-2 bg-[#f7f8f8] px-4 py-3 sm:gap-3 sm:px-6 lg:min-h-20 lg:px-8">
            <button type="button" data-mobile-menu className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white text-[#001391] shadow-sm lg:hidden" aria-label="Abrir menú">
                <Menu size={20} />
            </button>
            <label className="relative flex h-10 min-w-0 w-full max-w-sm items-center rounded-lg bg-white px-3 shadow-sm sm:px-4">
                <CalendarDays className="size-4 shrink-0 text-[#0c6dff]" />
                <select
                    value={selectedPeriod}
                    onChange={changePeriod}
                    aria-label="Seleccionar mes"
                    className="h-full min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent px-3 text-xs font-semibold text-[#001391] outline-none sm:text-sm"
                >
                    {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <ChevronsUpDown className="pointer-events-none size-4 shrink-0 text-slate-400" />
            </label>
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
