import React from "react";
import styles from "./Layout.module.css";
import Header from "./Header/index";
import Sidebar from "./Sidebar/index";
import type { EquipmentStatus } from "../../data/types";

interface LayoutProps {
  children: React.ReactNode;
  activeView: "map" | "planning" | "analytics" | "settings";
  onViewChange: (view: LayoutProps["activeView"]) => void;
  equipmentStats: {
    total: number;
    byStatus: Record<EquipmentStatus, number>;
  };
  unreadNotifications: number;
  onNotificationsClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeView,
  onViewChange,
  equipmentStats,
  unreadNotifications,
  onNotificationsClick,
}) => {
  return (
    <div className={styles.layout}>
      <Header
        unreadNotifications={unreadNotifications}
        onNotificationsClick={onNotificationsClick}
      />
      <div className={styles.mainContent}>
        <Sidebar
          activeView={activeView}
          onViewChange={onViewChange}
          equipmentStats={equipmentStats}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
