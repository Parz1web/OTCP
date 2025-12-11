import React from "react";
import Card from "../../ui/Card/index";
import Button from "../../ui/Button/index";
import { Calendar, Clock, Repeat } from "lucide-react";
import styles from "./SchedulePanel.module.css";

const SchedulePanel: React.FC = () => {
  const schedules = [
    { id: 1, time: "08:00", frequency: "Ежедневно", equipment: "Все станции" },
    {
      id: 2,
      time: "12:00",
      frequency: "Каждые 2 часа",
      equipment: "Критические",
    },
    { id: 3, time: "18:00", frequency: "Ежедневно", equipment: "Все прессы" },
  ];

  return (
    <Card padding="large" className={styles.schedulePanel}>
      <div className={styles.header}>
        <Calendar size={20} />
        <h3>Расписание обходов</h3>
      </div>

      <div className={styles.scheduleList}>
        {schedules.map((schedule) => (
          <div key={schedule.id} className={styles.scheduleItem}>
            <div className={styles.scheduleTime}>
              <Clock size={16} />
              <span>{schedule.time}</span>
            </div>
            <div className={styles.scheduleDetails}>
              <div className={styles.frequency}>
                <Repeat size={14} />
                <span>{schedule.frequency}</span>
              </div>
              <div className={styles.equipment}>{schedule.equipment}</div>
            </div>
            <Button variant="ghost" size="small">
              Редактировать
            </Button>
          </div>
        ))}
      </div>

      <div className={styles.addButton}>
        <Button variant="primary" fullWidth>
          Добавить расписание
        </Button>
      </div>
    </Card>
  );
};

export default SchedulePanel;
