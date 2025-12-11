import React from "react";
import styles from "./Header.module.css";
import Button from "../../ui/Button/index";
import { Bell } from "lucide-react";

interface HeaderProps {
  unreadNotifications: number;
  onNotificationsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  unreadNotifications,
  onNotificationsClick,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <h1 className={styles.title}>🚀 Мониторинг оборудования</h1>
        <p className={styles.subtitle}>
          NFC + ML система предиктивного обслуживания
        </p>
      </div>

      <div className={styles.actions}>
        <div className={styles.notificationWrapper}>
          <Button
            variant="ghost"
            size="small"
            onClick={onNotificationsClick}
            className={styles.notificationButton}
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className={styles.notificationBadge}>
                {unreadNotifications}
              </span>
            )}
          </Button>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.avatar}>СИ</div>
          <div>
            <div className={styles.userName}>Сервисный инженер</div>
            <div className={styles.userRole}>Оператор системы</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
