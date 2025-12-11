import React from "react";
import styles from "./Sidebar.module.css";
import {
  Map,
  Calendar,
  BarChart3,
  Settings,
  Bot,
  Factory,
  AlertTriangle,
} from "lucide-react";
import type { EquipmentStatus } from "../../../data/types";

interface SidebarProps {
  activeView: "map" | "planning" | "analytics" | "settings";
  onViewChange: (view: SidebarProps["activeView"]) => void;
  equipmentStats: {
    total: number;
    byStatus: Record<EquipmentStatus, number>;
  };
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  equipmentStats,
}) => {
  const menuItems = [
    { id: "map", label: "Карта цеха", icon: Map },
    { id: "planning", label: "Планирование", icon: Calendar },
    { id: "analytics", label: "Аналитика", icon: BarChart3 },
    { id: "settings", label: "Настройки", icon: Settings },
  ];

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <div className={styles.navHeader}>
          <Factory size={24} />
          <h3 className={styles.navTitle}>Навигация</h3>
        </div>

        <ul className={styles.menu}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <li key={item.id}>
                <button
                  className={`${styles.menuButton} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={() => onViewChange(item.id as any)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.stats}>
        <div className={styles.statsHeader}>
          <AlertTriangle size={20} />
          <h4 className={styles.statsTitle}>Статистика оборудования</h4>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Всего единиц:</span>
          <span className={styles.statValue}>{equipmentStats.total}</span>
        </div>

        <div className={styles.statItem}>
          <span className={`${styles.statLabel} ${styles.statusNormal}`}>
            Норма:
          </span>
          <span className={styles.statValue}>
            {equipmentStats.byStatus.normal}
          </span>
        </div>

        <div className={styles.statItem}>
          <span className={`${styles.statLabel} ${styles.statusWarning}`}>
            Предупреждение:
          </span>
          <span className={styles.statValue}>
            {equipmentStats.byStatus.warning}
          </span>
        </div>

        <div className={styles.statItem}>
          <span className={`${styles.statLabel} ${styles.statusCritical}`}>
            Критично:
          </span>
          <span className={styles.statValue}>
            {equipmentStats.byStatus.critical}
          </span>
        </div>
      </div>

      <div className={styles.robotStatus}>
        <div className={styles.robotStatusHeader}>
          <Bot size={20} />
          <h4 className={styles.robotStatusTitle}>Робот NFC-1</h4>
        </div>
        <div className={styles.robotInfo}>
          <div className={styles.battery}>
            <div className={styles.batteryLabel}>Заряд:</div>
            <div className={styles.batteryBar}>
              <div className={styles.batteryFill} style={{ width: "87%" }} />
            </div>
            <div className={styles.batteryPercent}>87%</div>
          </div>
          <div className={styles.robotState}>Ожидает задания</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
