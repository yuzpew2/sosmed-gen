import React from "react";

export default function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input input-bordered w-full ${className}`} {...props} />;
}
