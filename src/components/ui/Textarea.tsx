import React from "react";

export default function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`textarea textarea-bordered w-full ${className}`}
      {...props}
    />
  );
}
