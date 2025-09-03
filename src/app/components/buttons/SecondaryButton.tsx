import type { ComponentProps } from "react"

export type ButtonProps = ComponentProps<"button">

export default function SecondaryButton({ ref, type = "button", className = "", ...props }: ButtonProps) {
  return <button ref={ref} type={type} className={`btn btn--secondary ${className}`} {...props} />
}
