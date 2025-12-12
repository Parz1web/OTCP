import React, { useState } from "react";
import type { Equipment, MaintenanceTask } from "../../../data/types";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import EquipmentHistoryModal from "../EquipmentHistoryModal";
import MaintenanceTaskForm from "../MaintenanceTaskForm";
import styles from "./EquipmentCard.module.css";

interface EquipmentCardProps {
  equipment: Equipment;
  onClose: () => void;
  onSimulateAnomaly: () => void;
  onCreateMaintenanceTask?: (
    task: Omit<MaintenanceTask, "id" | "createdAt">
  ) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onClose,
  onSimulateAnomaly,
  onCreateMaintenanceTask,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const handleCreateMaintenanceTask = () => {
    setShowMaintenanceForm(true);
  };

  const handleGenerateReport = () => {
    // В реальном приложении здесь был бы API вызов
    alert(`Отчёт по ${equipment.name} будет сгенерирован и отправлен на email`);
  };

  const handleSubmitMaintenanceTask = (
    task: Omit<MaintenanceTask, "id" | "createdAt">
  ) => {
    if (onCreateMaintenanceTask) {
      onCreateMaintenanceTask(task);
      alert(`Задание на ТО для ${equipment.name} создано!`);
    } else {
      alert(`Задание на ТО создано (в реальном приложении было бы сохранено)`);
    }
  };

  return (
    <>
      <Card padding="large" shadow="lg" className={styles.equipmentCard}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{equipment.name}</h2>
            <div className={styles.subtitle}>
              Тип:{" "}
              {equipment.type === "pump"
                ? "Насосная станция"
                : "Гидравлический пресс"}
            </div>
          </div>
          <div className={styles.actions}>
            <StatusBadge status={equipment.status} />
            <Button variant="ghost" size="small" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>

        <div className={styles.parameters}>
          <h3 className={styles.sectionTitle}>Текущие параметры</h3>
          <div className={styles.parametersGrid}>
            <div className={styles.parameter}>
              <div className={styles.parameterLabel}>Вибрация</div>
              <div className={styles.parameterValue}>
                {equipment.parameters.vibration} мм/с
              </div>
              <div className={styles.parameterStatus}>
                {equipment.parameters.vibration > 7 ? "⚠️ Высокая" : "✅ Норма"}
              </div>
            </div>
            <div className={styles.parameter}>
              <div className={styles.parameterLabel}>Температура</div>
              <div className={styles.parameterValue}>
                {equipment.parameters.temperature} °C
              </div>
              <div className={styles.parameterStatus}>
                {equipment.parameters.temperature > 80
                  ? "⚠️ Высокая"
                  : "✅ Норма"}
              </div>
            </div>
            <div className={styles.parameter}>
              <div className={styles.parameterLabel}>Давление</div>
              <div className={styles.parameterValue}>
                {equipment.parameters.pressure} МПа
              </div>
              <div className={styles.parameterStatus}>
                {equipment.parameters.pressure > 17 ? "⚠️ Высокое" : "✅ Норма"}
              </div>
            </div>
            <div className={styles.parameter}>
              <div className={styles.parameterLabel}>NFC ID</div>
              <div className={styles.parameterValue}>{equipment.nfcTagId}</div>
              <div className={styles.parameterStatus}>📱 Для сканирования</div>
            </div>
          </div>
        </div>

        <div className={styles.actionsRow}>
          <Button
            variant="danger"
            onClick={onSimulateAnomaly}
            className={styles.simulateButton}
          >
            Сымитировать аномалию
          </Button>
          <Button variant="primary" onClick={handleViewHistory}>
            📊 Просмотреть историю
          </Button>
          <Button variant="ghost" onClick={handleCreateMaintenanceTask}>
            🔧 Создать задание на ТО
          </Button>
        </div>

        <div className={styles.lastUpdated}>
          Последнее обновление:{" "}
          {new Date(equipment.parameters.lastUpdated).toLocaleString()}
        </div>
      </Card>

      {showHistory && (
        <EquipmentHistoryModal
          equipment={equipment}
          onClose={() => setShowHistory(false)}
          onGenerateReport={handleGenerateReport}
        />
      )}

      {showMaintenanceForm && (
        <MaintenanceTaskForm
          equipment={equipment}
          onClose={() => setShowMaintenanceForm(false)}
          onSubmit={handleSubmitMaintenanceTask}
        />
      )}
    </>
  );
};

export default EquipmentCard;
