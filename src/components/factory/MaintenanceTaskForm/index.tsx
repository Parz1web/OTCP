import React, { useState } from "react";
import type { Equipment, MaintenanceTask } from "../../../data/types";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { X, Calendar, AlertCircle, User } from "lucide-react";
import styles from "./MaintenanceTaskForm.module.css";

interface MaintenanceTaskFormProps {
  equipment: Equipment;
  onClose: () => void;
  onSubmit: (task: Omit<MaintenanceTask, "id" | "createdAt">) => void;
  engineers?: Array<{ id: string; name: string; role: string }>;
}

const MaintenanceTaskForm: React.FC<MaintenanceTaskFormProps> = ({
  equipment,
  onClose,
  onSubmit,
  engineers = [
    { id: "eng-1", name: "Иван Петров", role: "Старший инженер" },
    { id: "eng-2", name: "Алексей Смирнов", role: "Инженер" },
    { id: "eng-3", name: "Мария Иванова", role: "Техник" },
  ],
}) => {
  const [taskType, setTaskType] =
    useState<MaintenanceTask["type"]>("preventive");
  const [priority, setPriority] =
    useState<MaintenanceTask["priority"]>("medium");
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert("Пожалуйста, заполните описание задания");
      return;
    }

    const newTask: Omit<MaintenanceTask, "id" | "createdAt"> = {
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      type: taskType,
      priority,
      scheduledDate: new Date(scheduledDate).toISOString(),
      assignedTo: assignedTo || undefined,
      status: "pending",
      description: description.trim(),
    };

    onSubmit(newTask);
    onClose();
  };

  const getTaskTypeLabel = (type: MaintenanceTask["type"]) => {
    switch (type) {
      case "preventive":
        return "Превентивное ТО";
      case "corrective":
        return "Корректирующее ТО";
      case "emergency":
        return "Экстренное ТО";
      default:
        return type;
    }
  };

  const getPriorityLabel = (priority: MaintenanceTask["priority"]) => {
    switch (priority) {
      case "low":
        return "Низкий";
      case "medium":
        return "Средний";
      case "high":
        return "Высокий";
      default:
        return priority;
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <Card padding="large" className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Создание задания на ТО</h2>
            <p className={styles.modalSubtitle}>
              Оборудование: <strong>{equipment.name}</strong>
            </p>
          </div>
          <Button variant="ghost" size="small" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.equipmentInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Тип оборудования:</span>
              <span className={styles.infoValue}>
                {equipment.type === "pump"
                  ? "Насосная станция"
                  : "Гидравлический пресс"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Текущий статус:</span>
              <span
                className={`${styles.infoValue} ${styles[equipment.status]}`}
              >
                {equipment.status === "normal"
                  ? "Норма"
                  : equipment.status === "warning"
                  ? "Предупреждение"
                  : equipment.status === "critical"
                  ? "Критично"
                  : "Обслуживание"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>NFC ID:</span>
              <span className={styles.infoValue}>{equipment.nfcTagId}</span>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <AlertCircle size={16} />
                Тип обслуживания
              </label>
              <div className={styles.radioGroup}>
                {(["preventive", "corrective", "emergency"] as const).map(
                  (type) => (
                    <label key={type} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="taskType"
                        value={type}
                        checked={taskType === type}
                        onChange={(e) =>
                          setTaskType(e.target.value as MaintenanceTask["type"])
                        }
                        className={styles.radioInput}
                      />
                      <span className={styles.radioCustom} />
                      {getTaskTypeLabel(type)}
                    </label>
                  )
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Приоритет</label>
              <div className={styles.priorityButtons}>
                {(["low", "medium", "high"] as const).map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={priority === level ? "primary" : "ghost"}
                    size="small"
                    onClick={() => setPriority(level)}
                    className={`${styles.priorityButton} ${
                      styles[`priority-${level}`]
                    }`}
                  >
                    {getPriorityLabel(level)}
                  </Button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Calendar size={16} />
                Планируемая дата
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={styles.dateInput}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <User size={16} />
                Ответственный инженер
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">Не назначено</option>
                {engineers.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.name} ({eng.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Описание задания</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              placeholder="Опишите задание на техническое обслуживание..."
              rows={4}
              required
            />
            <div className={styles.textareaHint}>
              Укажите необходимые работы, запчасти, особые инструкции
            </div>
          </div>

          <div className={styles.preview}>
            <h3 className={styles.previewTitle}>Предпросмотр задания:</h3>
            <div className={styles.previewContent}>
              <div className={styles.previewRow}>
                <span>Оборудование:</span>
                <strong>{equipment.name}</strong>
              </div>
              <div className={styles.previewRow}>
                <span>Тип ТО:</span>
                <strong>{getTaskTypeLabel(taskType)}</strong>
              </div>
              <div className={styles.previewRow}>
                <span>Приоритет:</span>
                <strong className={styles[`priority-${priority}`]}>
                  {getPriorityLabel(priority)}
                </strong>
              </div>
              <div className={styles.previewRow}>
                <span>Дата выполнения:</span>
                <strong>{new Date(scheduledDate).toLocaleDateString()}</strong>
              </div>
              {assignedTo && (
                <div className={styles.previewRow}>
                  <span>Ответственный:</span>
                  <strong>
                    {engineers.find((e) => e.id === assignedTo)?.name ||
                      "Не назначено"}
                  </strong>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formFooter}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" variant="primary">
              Создать задание
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MaintenanceTaskForm;
