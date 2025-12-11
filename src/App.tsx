import React, { useState, useMemo } from "react";
import Layout from "./components/layout/Layout";
import FactoryMap from "./components/factory/FactoryMap";
import EquipmentCard from "./components/factory/EquipmentCard";
import RoutePlanner from "./components/planning/RoutePlanner";
import SchedulePanel from "./components/planning/SchedulePanel";
import MetricsDashboard from "./components/analytics/MetricsDashboard";
import LogViewer from "./components/analytics/LogViewer";
import {
  mockEquipment,
  mockRobot,
  mockNotifications,
  mockRoutes,
} from "./data/mockData";
import type {
  Equipment,
  EquipmentStatus,
  Notification,
  RobotRoute,
} from "./data/types";

function App() {
  // Состояния
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [robot] = useState(mockRobot);
  const [routes, setRoutes] = useState<RobotRoute[]>(mockRoutes);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null
  );
  const [activeView, setActiveView] = useState<
    "map" | "planning" | "analytics" | "settings"
  >("map");
  const [selectedRoute, setSelectedRoute] = useState<RobotRoute | null>(
    mockRoutes[0] || null
  );

  // Выбранное оборудование
  const selectedEquipment = useMemo(
    () => equipment.find((eq) => eq.id === selectedEquipmentId) || null,
    [equipment, selectedEquipmentId]
  );

  // Статистика оборудования
  const equipmentStats = useMemo(() => {
    const stats = {
      total: equipment.length,
      byStatus: {
        normal: 0,
        warning: 0,
        critical: 0,
        maintenance: 0,
      } as Record<EquipmentStatus, number>,
    };

    equipment.forEach((eq) => {
      stats.byStatus[eq.status]++;
    });

    return stats;
  }, [equipment]);

  // Количество непрочитанных уведомлений
  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Обработчики оборудования
  const handleEquipmentClick = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
  };

  const handleCloseEquipmentCard = () => {
    setSelectedEquipmentId(null);
  };

  const handleSimulateAnomaly = (equipmentId: string) => {
    setEquipment((prev) =>
      prev.map((eq) =>
        eq.id === equipmentId ? { ...eq, status: "critical" as const } : eq
      )
    );

    // Добавляем уведомление
    const eq = equipment.find((e) => e.id === equipmentId);
    if (eq) {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: "error",
        title: "Симуляция аномалии",
        message: `${eq.name}: искусственно вызвана аномалия`,
        timestamp: new Date().toISOString(),
        equipmentId: eq.id,
        read: false,
        priority: "high",
      };
      setNotifications((prev) => [newNotification, ...prev]);
    }
  };

  // Обработчики маршрутов
  const handleRouteCreate = (
    newRoute: Omit<RobotRoute, "id" | "createdAt">
  ) => {
    const routeWithId: RobotRoute = {
      ...newRoute,
      id: `route-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRoutes((prev) => [...prev, routeWithId]);
    setSelectedRoute(routeWithId);
  };

  const handleRouteDelete = (routeId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот маршрут?")) {
      setRoutes((prev) => prev.filter((route) => route.id !== routeId));
      if (selectedRoute?.id === routeId) {
        setSelectedRoute(routes.find((r) => r.id !== routeId) || null);
      }
    }
  };

  const handleStartRobot = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (route) {
      setSelectedRoute(route);
      alert(
        `🤖 Робот запущен по маршруту: ${route.name}\n\nРобот начнет движение по указанным точкам на карте.`
      );
      // В реальном приложении здесь бы запускалась симуляция на карте
    }
  };

  // Обработчики уведомлений
  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleOpenNotifications = () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length > 0) {
      const confirmRead = confirm(
        `У вас ${unread.length} непрочитанных уведомлений. Отметить все как прочитанные?`
      );
      if (confirmRead) {
        unread.forEach((n) => handleMarkNotificationAsRead(n.id));
      }
    } else {
      alert("📭 Нет новых уведомлений");
    }
  };

  // Рендеринг активной вьюшки
  const renderActiveView = () => {
    switch (activeView) {
      case "map":
        return selectedEquipment ? (
          <EquipmentCard
            equipment={selectedEquipment}
            onClose={handleCloseEquipmentCard}
            onSimulateAnomaly={() =>
              handleSimulateAnomaly(selectedEquipment.id)
            }
          />
        ) : (
          <FactoryMap
            equipment={equipment}
            robot={robot}
            routes={routes}
            onEquipmentClick={handleEquipmentClick}
          />
        );

      case "planning":
        return (
          <div className="planning-view">
            <RoutePlanner
              equipment={equipment}
              robot={robot}
              routes={routes}
              onRouteCreate={handleRouteCreate}
              onRouteDelete={handleRouteDelete}
              onStartRobot={handleStartRobot}
            />
            <SchedulePanel />
          </div>
        );

      case "analytics":
        return (
          <div className="analytics-view">
            <MetricsDashboard equipment={equipment} />
            <LogViewer equipment={equipment} />
          </div>
        );

      case "settings":
        return (
          <div className="settings-view">
            <h2>⚙️ Настройки системы</h2>

            <div className="settings-section">
              <h3>Параметры мониторинга</h3>
              <div className="setting-item">
                <label>Частота обхода робота:</label>
                <select defaultValue="60">
                  <option value="30">Каждые 30 минут</option>
                  <option value="60">Каждый час</option>
                  <option value="120">Каждые 2 часа</option>
                  <option value="240">Каждые 4 часа</option>
                </select>
              </div>

              <div className="setting-item">
                <label>Порог предупреждения по вибрации:</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  defaultValue="6"
                />
                <span>6.0 мм/с</span>
              </div>

              <div className="setting-item">
                <label>Порог критичности по температуре:</label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  defaultValue="85"
                />
                <span>85°C</span>
              </div>
            </div>

            <div className="settings-section">
              <h3>Уведомления</h3>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Email уведомления
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Push-уведомления в браузере
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Telegram уведомления
                </label>
              </div>
            </div>

            <div className="settings-actions">
              <button className="save-button">💾 Сохранить настройки</button>
              <button className="reset-button">
                🔄 Сбросить к значениям по умолчанию
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout
      activeView={activeView}
      onViewChange={setActiveView}
      equipmentStats={equipmentStats}
      unreadNotifications={unreadNotificationsCount}
      onNotificationsClick={handleOpenNotifications}
    >
      <div className="app-content">{renderActiveView()}</div>
    </Layout>
  );
}

export default App;
