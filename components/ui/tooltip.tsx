"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

// Provider opcional pra agrupar tooltips: uma vez que um abre, os vizinhos
// abrem na hora (sem esperar o delay de novo). O delay padrão aqui é curto
// pra dar sensação de resposta imediata no hover/foco.
function TooltipProvider({ delay = 200, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />
}

function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: TooltipPrimitive.Popup.Props & { sideOffset?: number }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner data-slot="tooltip-positioner" className="z-50" sideOffset={sideOffset}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "max-w-64 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md",
            "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150",
            "data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
