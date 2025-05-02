import React from "react";
import "./Button.css";

export default function Button({
  onClick,
  className = "",
  disabled = false,
  children,
}) {
  const defaultClasses = "button-style";
  const combinedClasses = `${defaultClasses} ${className}`.trim();

  return (
    <button onClick={onClick} disabled={disabled} className={combinedClasses}>
      {children}
    </button>
  );
}
