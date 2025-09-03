import type { ComponentProps } from "react"

export type ButtonProps = ComponentProps<"button">

export default function PrimaryButton({ ref, type = "button", className = "", ...props }: ButtonProps) {
  return <button ref={ref} type={type} className={`btn btn--primary ${className}`} {...props} />
}
