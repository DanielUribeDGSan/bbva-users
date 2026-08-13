import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Check, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
    return <CommandPrimitive className={cn('flex size-full flex-col overflow-hidden rounded-xl bg-white p-1', className)} {...props} />;
}

export function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
    return (
        <div className="relative m-1 flex h-9 items-center rounded-lg bg-slate-100 px-3">
            <Search className="mr-2 size-4 shrink-0 text-slate-400" />
            <CommandPrimitive.Input className={cn('h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400', className)} {...props} />
        </div>
    );
}

export function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
    return <CommandPrimitive.List className={cn('max-h-72 overflow-x-hidden overflow-y-auto py-1 outline-none', className)} {...props} />;
}

export function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return <CommandPrimitive.Empty className={cn('py-6 text-center text-sm text-slate-500', className)} {...props} />;
}

export function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
    return <CommandPrimitive.Group className={cn('overflow-hidden p-1', className)} {...props} />;
}

export function CommandItem({ className, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            className={cn('group relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none data-[selected=true]:bg-slate-100', className)}
            {...props}
        >
            {children}
            <Check className="ml-auto size-4 opacity-0 group-data-[checked=true]:opacity-100" />
        </CommandPrimitive.Item>
    );
}
