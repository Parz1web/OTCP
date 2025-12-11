import type { Equipment, Robot, Notification, RobotRoute } from "./types";

// Генерация ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Моковые данные оборудования
export const mockEquipment: Equipment[] = [
  {
    id: "equip-1",
    name: "Насосная станция #1",
    type: "pump",
    status: "normal",
    position: { x: 150, y: 100 },
    parameters: {
      vibration: 3.8,
      temperature: 62,
      pressure: 12.5,
      lastUpdated: new Date().toISOString(),
    },
    logs: [],
    nfcTagId: "nfc-001",
  },
  {
    id: "equip-2",
    name: "Гидравлический пресс #1",
    type: "press",
    status: "warning",
    position: { x: 400, y: 100 },
    parameters: {
      vibration: 6.8,
      temperature: 76,
      pressure: 16.8,
      lastUpdated: new Date().toISOString(),
    },
    logs: [],
    nfcTagId: "nfc-002",
  },
  {
    id: "equip-3",
    name: "Насосная станция #2",
    type: "pump",
    status: "normal",
    position: { x: 150, y: 300 },
    parameters: {
      vibration: 4.2,
      temperature: 65,
      pressure: 13.1,
      lastUpdated: new Date().toISOString(),
    },
    logs: [],
    nfcTagId: "nfc-003",
  },
  {
    id: "equip-4",
    name: "Гидравлический пресс #2",
    type: "press",
    status: "critical",
    position: { x: 400, y: 300 },
    parameters: {
      vibration: 8.5,
      temperature: 82,
      pressure: 17.9,
      lastUpdated: new Date().toISOString(),
    },
    logs: [],
    nfcTagId: "nfc-004",
  },
];

// Моковые данные робота
export const mockRobot: Robot = {
  id: "robot-1",
  name: "Робот-сборщик NFC-1",
  status: "idle",
  currentPosition: { x: 50, y: 50 },
  battery: 87,
  speed: 10,
  lastMaintenance: "2024-01-10",
};

// Добавляем моковые маршруты
export const mockRoutes: RobotRoute[] = [
  {
    id: "route-1",
    name: "Утренний обход",
    robotId: "robot-1",
    isActive: true,
    createdAt: new Date().toISOString(),
    points: [
      {
        id: "point-1",
        equipmentId: "equip-1",
        order: 1,
        estimatedTime: 30,
        status: "pending",
      },
      {
        id: "point-2",
        equipmentId: "equip-2",
        order: 2,
        estimatedTime: 45,
        status: "pending",
      },
      {
        id: "point-3",
        equipmentId: "equip-3",
        order: 3,
        estimatedTime: 25,
        status: "pending",
      },
      {
        id: "point-4",
        equipmentId: "equip-4",
        order: 4,
        estimatedTime: 35,
        status: "pending",
      },
    ],
  },
];

// Моковые уведомления
export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "warning",
    title: "Высокая вибрация",
    message: "Пресс #1: вибрация 6.8 мм/с превышает порог 6.0 мм/с",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 час назад
    equipmentId: "equip-2",
    read: false,
    priority: "medium",
  },
  {
    id: "notif-2",
    type: "error",
    title: "Критическая температура",
    message: "Пресс #2: температура 82°C превышает критический порог 85°C",
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 минут назад
    equipmentId: "equip-4",
    read: false,
    priority: "high",
  },
];

// Генерация логов для оборудования
export const generateMockLogs = (equipmentId: string, count: number = 10) => {
  const logs = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now - i * 3600000).toISOString(); // Каждый час

    logs.push({
      id: `log-${equipmentId}-${i}`,
      timestamp,
      vibration: 3 + Math.random() * 5, // 3-8
      temperature: 60 + Math.random() * 25, // 60-85
      pressure: 10 + Math.random() * 10, // 10-20
      status: "normal" as const,
      anomalyScore: Math.random() * 0.3, // низкий шанс аномалии
      notes: i === 2 ? "Плановое ТО выполнено" : undefined,
    });
  }

  return logs;
};

// Инициализация логов для всего оборудования
mockEquipment.forEach((equipment) => {
  equipment.logs = generateMockLogs(equipment.id);
});
