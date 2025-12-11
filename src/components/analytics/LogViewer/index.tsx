import React, { useState } from "react";
import type { Equipment } from "../../../data/types";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { Search, Filter, Download } from "lucide-react";
import styles from "./LogViewer.module.css";

interface LogViewerProps {
  equipment: Equipment[];
}

const LogViewer: React.FC<LogViewerProps> = ({ equipment }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");

  // Генерация моковых логов на основе оборудования
  const generateLogs = () => {
    const logs = [];
    const actions = ["scan", "anomaly_detected", "maintenance", "calibration"];
    const statuses = ["success", "warning", "error"];

    for (let i = 0; i < 15; i++) {
      const eq = equipment[Math.floor(Math.random() * equipment.length)];
      const date = new Date(Date.now() - i * 3600000);

      logs.push({
        id: `log-${i}`,
        timestamp: date.toLocaleString(),
        equipment: eq.name,
        action: actions[Math.floor(Math.random() * actions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        message: `Событие в оборудовании ${eq.name}`,
      });
    }

    return logs;
  };

  const logs = generateLogs();

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEquipment =
      selectedEquipment === "all" || log.equipment === selectedEquipment;
    return matchesSearch && matchesEquipment;
  });

  return (
    <Card padding="large" className={styles.logViewer}>
      <div className={styles.header}>
        <h3>Журнал событий</h3>
        <div className={styles.actions}>
          <Button variant="ghost" size="small">
            <Download size={16} />
            Экспорт
          </Button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.search}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Поиск по логам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filter}>
          <Filter size={16} />
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Всё оборудование</option>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.name}>
                {eq.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.logsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.colTime}>Время</div>
          <div className={styles.colEquipment}>Оборудование</div>
          <div className={styles.colAction}>Действие</div>
          <div className={styles.colStatus}>Статус</div>
          <div className={styles.colMessage}>Сообщение</div>
        </div>

        <div className={styles.tableBody}>
          {filteredLogs.map((log) => (
            <div key={log.id} className={styles.logRow}>
              <div className={styles.colTime}>{log.timestamp}</div>
              <div className={styles.colEquipment}>{log.equipment}</div>
              <div className={styles.colAction}>
                <span className={styles[`action-${log.action}`]}>
                  {log.action === "scan"
                    ? "Сканирование"
                    : log.action === "anomaly_detected"
                    ? "Аномалия"
                    : log.action === "maintenance"
                    ? "ТО"
                    : "Калибровка"}
                </span>
              </div>
              <div className={styles.colStatus}>
                <span className={styles[`status-${log.status}`]}>
                  {log.status === "success"
                    ? "Успех"
                    : log.status === "warning"
                    ? "Предупреждение"
                    : "Ошибка"}
                </span>
              </div>
              <div className={styles.colMessage}>{log.message}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.pagination}>
        <Button variant="ghost" size="small">
          ← Предыдущие
        </Button>
        <span className={styles.pageInfo}>Страница 1 из 3</span>
        <Button variant="ghost" size="small">
          Следующие →
        </Button>
      </div>
    </Card>
  );
};

export default LogViewer;
