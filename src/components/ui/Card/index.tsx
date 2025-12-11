import React from "react";
import styles from "./Card.module.css";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "small" | "medium" | "large";
  shadow?: "none" | "sm" | "md" | "lg";
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "medium",
  shadow = "md",
}) => {
  const cardClasses = [
    styles.card,
    styles[`padding-${padding}`],
    styles[`shadow-${shadow}`],
    className,
  ].join(" ");

  return <div className={cardClasses}>{children}</div>;
};

export default Card;
