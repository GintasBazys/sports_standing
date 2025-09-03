import type { ComponentProps } from "react"

export type NumberInputProps = Omit<ComponentProps<"input">, "type">

export default function NumberInput({
  ref,
  className = "",
  min = 0,
  step = 1,
  inputMode = "numeric",
  ...props
}: NumberInputProps) {
  return (
    <input
      ref={ref}
      type="number"
      min={min}
      step={step}
      inputMode={inputMode}
      className={`input input--number ${className}`}
      {...props}
    />
  )
}
