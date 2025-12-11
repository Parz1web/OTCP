import React from "react";
import type { Equipment } from "../../../data/types";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import styles from "./EquipmentCard.module.css";

interface EquipmentCardProps {
  equipment: Equipment;
  onClose: () => void;
  onSimulateAnomaly: () => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onClose,
  onSimulateAnomaly,
}) => {
  return (
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
        <h3 className={styles.sectionTitle}>Параметры</h3>
        <div className={styles.parametersGrid}>
          <div className={styles.parameter}>
            <div className={styles.parameterLabel}>Вибрация</div>
            <div className={styles.parameterValue}>
              {equipment.parameters.vibration} мм/с
            </div>
          </div>
          <div className={styles.parameter}>
            <div className={styles.parameterLabel}>Температура</div>
            <div className={styles.parameterValue}>
              {equipment.parameters.temperature} °C
            </div>
          </div>
          <div className={styles.parameter}>
            <div className={styles.parameterLabel}>Давление</div>
            <div className={styles.parameterValue}>
              {equipment.parameters.pressure} МПа
            </div>
          </div>
          <div className={styles.parameter}>
            <div className={styles.parameterLabel}>NFC ID</div>
            <div className={styles.parameterValue}>{equipment.nfcTagId}</div>
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
        <Button variant="primary">Просмотреть историю</Button>
        <Button variant="ghost">Создать задание на ТО</Button>
      </div>

      <div className={styles.lastUpdated}>
        Последнее обновление:{" "}
        {new Date(equipment.parameters.lastUpdated).toLocaleString()}
      </div>
    </Card>
  );
};

export default EquipmentCard;
