import React from "react";

export default function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`select select-bordered w-full ${className}`} {...props}>
      {children}
    </select>
  );
}
