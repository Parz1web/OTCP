import React from "react";
import styles from "./StatusBadge.module.css";
import type { EquipmentStatus } from "../../../data/types";

interface StatusBadgeProps {
  status: EquipmentStatus;
  label?: string;
  size?: "small" | "medium";
}

const statusLabels: Record<EquipmentStatus, string> = {
  normal: "Норма",
  warning: "Предупреждение",
  critical: "Критично",
  maintenance: "Обслуживание",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = "medium",
}) => {
  return (
    <span className={`${styles.badge} ${styles[status]} ${styles[size]}`}>
      {label || statusLabels[status]}
    </span>
  );
};

export default StatusBadge;
