import type { TextInputProps } from "@/app/types/tournament.ts"

export default function TextInput({ ref, className = "", ...props }: TextInputProps) {
  return <input ref={ref} type="text" className={`input ${className}`} {...props} />
}
