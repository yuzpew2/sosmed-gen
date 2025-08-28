import * as React from "react"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", ...props }, ref) => (
    <input type={type} ref={ref} {...props} />
  )
)
Input.displayName = "Input"

export default Input
