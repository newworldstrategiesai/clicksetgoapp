"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/utils/cn"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out",
      "bg-gray-300 hover:bg-gray-400",
      "data-[state=checked]:bg-blue-600 data-[state=checked]:hover:bg-blue-700",
      
      // Dark mode styles
      "dark:bg-gray-700 dark:hover:bg-gray-600",
      "dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:hover:bg-blue-600",
      
      // Focus and disabled states
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full shadow-md transition-all duration-300 ease-in-out",
        
        // Light mode thumb styles
        "bg-white",
        "data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-white",
        "data-[state=checked]:translate-x-5 data-[state=checked]:bg-white",
        
        // Dark mode thumb styles
        "dark:bg-gray-200",
        "dark:data-[state=unchecked]:bg-gray-300",
        "dark:data-[state=checked]:bg-gray-100",
        
        // Additional effects
        "group-hover:shadow-lg",
        "transform will-change-transform"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
