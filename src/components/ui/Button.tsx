import * as React from "react"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type = "button", ...props }, ref) => (
    <button type={type} ref={ref} {...props} />
  )
)
Button.displayName = "Button"

export default Button
