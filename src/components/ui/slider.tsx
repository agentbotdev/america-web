import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          // Riel de 4px → 10px. Con 4px el usuario tenía que apuntar a una línea
          // finita para arrastrar; a 10px el riel entero es zona agarrable.
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-2.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-2.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            // Perilla de 12px → 24px, con borde de marca y sombra para que se
            // lea como un control agarrable y no como un puntito.
            // `after:-inset-3` le da un área táctil INVISIBLE de 24+24 = 48px:
            // por encima del mínimo de 44px que recomienda Apple/WCAG para el
            // dedo. Antes eran 12+16 = 28px y en mobile se erraba casi siempre.
            // `active:scale-110` da feedback de que agarraste la perilla.
            className="relative block size-6 shrink-0 rounded-full border-2 border-brand bg-white shadow-[0_2px_8px_-1px_rgba(60,50,25,0.45)] ring-ring/50 transition-[transform,box-shadow] select-none after:absolute after:-inset-3 hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden active:scale-110 active:ring-4 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
