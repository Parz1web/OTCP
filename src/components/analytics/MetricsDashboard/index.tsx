import React from "react";
import type { Equipment } from "../../../data/types";
import Card from "../../ui/Card";
import styles from "./MetricsDashboard.module.css";

interface MetricsDashboardProps {
  equipment: Equipment[];
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ equipment }) => {
  const criticalCount = equipment.filter((e) => e.status === "critical").length;
  const warningCount = equipment.filter((e) => e.status === "warning").length;
  const normalCount = equipment.filter((e) => e.status === "normal").length;

  // Расчет процентов
  const total = equipment.length;
  const criticalPercent = total > 0 ? (criticalCount / total) * 100 : 0;
  const warningPercent = total > 0 ? (warningCount / total) * 100 : 0;
  const normalPercent = total > 0 ? (normalCount / total) * 100 : 0;

  return (
    <div className={styles.metricsDashboard}>
      <h2>Метрики системы</h2>

      <div className={styles.metrics}>
        <div className={`${styles.metric} ${styles.efficiency}`}>
          <div className={styles.metricLabel}>Эффективность</div>
          <div className={styles.metricValue}>
            {Math.round((normalCount / total) * 100)}%
          </div>
        </div>

        <div className={`${styles.metric} ${styles.uptime}`}>
          <div className={styles.metricLabel}>Работает нормально</div>
          <div className={styles.metricValue}>{normalCount}</div>
        </div>

        <div className={`${styles.metric} ${styles.downtime}`}>
          <div className={styles.metricLabel}>Критичных</div>
          <div className={`${styles.metricValue} ${styles.critical}`}>
            {criticalCount}
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{total}</div>
          <div className={styles.statLabel}>Всего</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{normalCount}</div>
          <div className={styles.statLabel}>Норма</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{warningCount}</div>
          <div className={styles.statLabel}>Предупрежд.</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{criticalCount}</div>
          <div className={styles.statLabel}>Критично</div>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chartContainer}>
          <div className={styles.chartTitle}>Статус оборудования</div>
          <div className={styles.chartPlaceholder}>
            График будет здесь (используйте recharts)
          </div>
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.chartTitle}>Тренды параметров</div>
          <div className={styles.chartPlaceholder}>
            График будет здесь (используйте recharts)
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
