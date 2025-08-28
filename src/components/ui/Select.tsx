import * as React from "react"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => (
    <select ref={ref} {...props} />
  )
)
Select.displayName = "Select"

export default Select
