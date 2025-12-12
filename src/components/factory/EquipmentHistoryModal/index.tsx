import React, { useState, useMemo } from "react";
import type { Equipment, EquipmentHistoryItem } from "../../../data/types";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { X, Filter, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import styles from "./EquipmentHistoryModal.module.css";

interface EquipmentHistoryModalProps {
  equipment: Equipment;
  onClose: () => void;
  onGenerateReport?: () => void;
}

const EquipmentHistoryModal: React.FC<EquipmentHistoryModalProps> = ({
  equipment,
  onClose,
  onGenerateReport,
}) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  // Генерация моковых данных истории (в реальном приложении были бы с API)
  const historyItems: EquipmentHistoryItem[] = useMemo(() => {
    const items: EquipmentHistoryItem[] = [];
    const types: EquipmentHistoryItem["type"][] = [
      "parameter_update",
      "maintenance",
      "scan",
      "anomaly",
    ];
    const statuses: Array<Equipment["status"]> = [
      "normal",
      "warning",
      "critical",
      "maintenance",
    ];

    // Генерируем данные за последние 30 дней
    for (let i = 0; i < 20; i++) {
      const date = new Date(Date.now() - i * 24 * 3600000);
      const type = types[Math.floor(Math.random() * types.length)];

      items.push({
        id: `history-${equipment.id}-${i}`,
        equipmentId: equipment.id,
        timestamp: date.toISOString(),
        type,
        parameters:
          type === "parameter_update"
            ? {
                vibration:
                  equipment.parameters.vibration + (Math.random() - 0.5) * 2,
                temperature:
                  equipment.parameters.temperature + (Math.random() - 0.5) * 5,
                pressure:
                  equipment.parameters.pressure + (Math.random() - 0.5) * 1,
              }
            : undefined,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        notes:
          type === "maintenance"
            ? "Плановое техническое обслуживание"
            : type === "anomaly"
            ? "Обнаружена аномалия вибрации"
            : undefined,
      });
    }

    return items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [equipment]);

  // Фильтрация истории
  const filteredHistory = useMemo(() => {
    let filtered = historyItems;

    // Фильтр по типу
    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    // Фильтр по времени
    const now = new Date();
    const cutoff = new Date();
    switch (timeRange) {
      case "day":
        cutoff.setDate(now.getDate() - 1);
        break;
      case "week":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }

    return filtered.filter((item) => new Date(item.timestamp) > cutoff);
  }, [historyItems, filterType, timeRange]);

  // Статистика по истории
  const stats = useMemo(() => {
    const total = historyItems.length;
    const byType = {
      parameter_update: 0,
      maintenance: 0,
      scan: 0,
      anomaly: 0,
    };

    historyItems.forEach((item) => {
      byType[item.type]++;
    });

    return { total, byType };
  }, [historyItems]);

  // Перевод типа на русский
  const getTypeLabel = (type: EquipmentHistoryItem["type"]) => {
    switch (type) {
      case "parameter_update":
        return "Обновление параметров";
      case "maintenance":
        return "Техобслуживание";
      case "scan":
        return "Сканирование NFC";
      case "anomaly":
        return "Аномалия";
      default:
        return type;
    }
  };

  // Перевод статуса на русский
  const getStatusLabel = (status: Equipment["status"]) => {
    switch (status) {
      case "normal":
        return "Норма";
      case "warning":
        return "Предупреждение";
      case "critical":
        return "Критично";
      case "maintenance":
        return "Обслуживание";
      default:
        return status;
    }
  };

  // Цвет статуса
  const getStatusColor = (status: Equipment["status"]) => {
    switch (status) {
      case "normal":
        return "#10b981";
      case "warning":
        return "#f59e0b";
      case "critical":
        return "#ef4444";
      case "maintenance":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <Card padding="large" className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              История оборудования: {equipment.name}
            </h2>
            <p className={styles.modalSubtitle}>
              {equipment.type === "pump"
                ? "Насосная станция"
                : "Гидравлический пресс"}{" "}
              • NFC: {equipment.nfcTagId}
            </p>
          </div>
          <Button variant="ghost" size="small" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className={styles.statsOverview}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Всего событий</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {stats.byType.parameter_update}
            </div>
            <div className={styles.statLabel}>Обновлений параметров</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.byType.maintenance}</div>
            <div className={styles.statLabel}>Техобслуживаний</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.byType.anomaly}</div>
            <div className={styles.statLabel}>Аномалий</div>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Filter size={16} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Все типы событий</option>
              <option value="parameter_update">Обновления параметров</option>
              <option value="maintenance">Техобслуживание</option>
              <option value="scan">Сканирования</option>
              <option value="anomaly">Аномалии</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <Calendar size={16} />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="day">За последний день</option>
              <option value="week">За последнюю неделю</option>
              <option value="month">За последний месяц</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="small"
            onClick={onGenerateReport}
            className={styles.reportButton}
          >
            <TrendingUp size={16} />
            Сформировать отчёт
          </Button>
        </div>

        <div className={styles.historyTable}>
          <div className={styles.tableHeader}>
            <div className={styles.colTime}>Дата и время</div>
            <div className={styles.colType}>Тип события</div>
            <div className={styles.colStatus}>Статус</div>
            <div className={styles.colParams}>Параметры</div>
            <div className={styles.colNotes}>Примечания</div>
          </div>

          <div className={styles.tableBody}>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <div key={item.id} className={styles.historyRow}>
                  <div className={styles.colTime}>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  <div className={styles.colType}>
                    <span className={styles.typeBadge}>
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <div className={styles.colStatus}>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className={styles.colParams}>
                    {item.parameters ? (
                      <div className={styles.parameters}>
                        <span>Виб: {item.parameters.vibration.toFixed(1)}</span>
                        <span>
                          Темп: {item.parameters.temperature.toFixed(1)}
                        </span>
                        <span>Дав: {item.parameters.pressure.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className={styles.noData}>—</span>
                    )}
                  </div>
                  <div className={styles.colNotes}>
                    {item.notes || (
                      <span className={styles.noData}>Нет примечаний</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <AlertCircle size={24} />
                <p>Нет событий за выбранный период</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.trends}>
          <h3>
            <TrendingUp size={20} /> Тренды параметров
          </h3>
          <div className={styles.trendsPlaceholder}>
            <p>Здесь будет график изменения параметров оборудования</p>
            <small>
              Для интеграции используйте библиотеку recharts или chart.js
            </small>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
          <Button variant="primary" onClick={onGenerateReport}>
            Экспорт истории в CSV
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EquipmentHistoryModal;
