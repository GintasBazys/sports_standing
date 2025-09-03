import type { ComponentProps } from "react"

export type TextInputProps = Omit<ComponentProps<"input">, "type">

export default function TextInput({ ref, className = "", ...props }: TextInputProps) {
  return <input ref={ref} type="text" className={`input ${className}`} {...props} />
}
