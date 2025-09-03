import type { ButtonProps } from "@/app/types/tournament.ts"

export default function SecondaryButton({ ref, type = "button", className = "", ...props }: ButtonProps) {
  return <button ref={ref} type={type} className={`btn btn--secondary ${className}`} {...props} />
}
