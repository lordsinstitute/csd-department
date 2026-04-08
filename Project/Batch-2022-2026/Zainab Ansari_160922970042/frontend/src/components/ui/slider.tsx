import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, onValueChange, ...props }, ref) => {
    return (
      <input
        type="range"
        className={cn(
          'w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500',
          'slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 slider-thumb:rounded-full slider-thumb:bg-cyan-500',
          className
        )}
        ref={ref}
        onChange={(e) => onValueChange?.(parseFloat(e.target.value))}
        {...props}
      />
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }