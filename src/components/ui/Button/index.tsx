import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "warning"; // ← ДОБАВЛЯЕМ 'warning'
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    fullWidth ? styles.fullWidth : "",
    className,
  ].join(" ");

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className={styles.spinner} />}
      {children}
    </button>
  );
};

export default Button;
