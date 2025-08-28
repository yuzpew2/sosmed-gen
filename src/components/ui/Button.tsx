import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", type = "button", className = "", ...props }: ButtonProps) {
  const variantClass =
    variant === "secondary"
      ? "bg-gray-200 text-gray-900"
      : "bg-blue-600 text-white";

  return (
    <button type={type} className={`${variantClass} ${className}`} {...props} />
  );
}

export default Button;
