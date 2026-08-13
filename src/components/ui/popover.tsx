import * as React from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from '../../lib/utils';

export function Popover(props: PopoverPrimitive.Root.Props) {
    return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

export function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export function PopoverContent({
    className,
    align = 'center',
    side = 'bottom',
    sideOffset = 4,
    ...props
}: PopoverPrimitive.Popup.Props & Pick<PopoverPrimitive.Positioner.Props, 'align' | 'side' | 'sideOffset'>) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner align={align} side={side} sideOffset={sideOffset} className="isolate z-50">
                <PopoverPrimitive.Popup
                    data-slot="popover-content"
                    className={cn('z-50 flex w-72 flex-col rounded-lg bg-white p-2.5 text-sm text-slate-900 shadow-xl ring-1 ring-black/10 outline-none', className)}
                    {...props}
                />
            </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
    );
}
