// Типы статусов
export type EquipmentStatus = "normal" | "warning" | "critical" | "maintenance";
export type RobotStatus = "idle" | "moving" | "charging" | "error";
export type NotificationType = "info" | "warning" | "error" | "success";
export type RoutePointStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped";

// Основные интерфейсы (5 штук)

// 1. Оборудование
export interface Equipment {
  id: string;
  name: string;
  type: "pump" | "press";
  status: EquipmentStatus;
  position: { x: number; y: number }; // координаты на карте
  parameters: {
    vibration: number; // мм/с
    temperature: number; // °C
    pressure: number; // МПа
    lastUpdated: string; // ISO строка
  };
  logs: EquipmentLog[]; // история показаний
  nfcTagId: string; // ID NFC-метки
}

// 2. Лог оборудования (отдельная сущность)
export interface EquipmentLog {
  id: string;
  timestamp: string;
  vibration: number;
  temperature: number;
  pressure: number;
  status: EquipmentStatus;
  anomalyScore?: number; // от 0 до 1, если ML была бы
  notes?: string;
}

// 3. Робот
export interface Robot {
  id: string;
  name: string;
  status: RobotStatus;
  currentPosition: { x: number; y: number };
  battery: number; // 0-100%
  speed: number; // единиц/сек
  lastMaintenance: string;
}

// Добавляем отдельный интерфейс для маршрута
export interface RobotRoute {
  id: string;
  name: string;
  robotId: string;
  points: RoutePoint[];
  isActive: boolean;
  createdAt: string;
}

// 4. Точка маршрута
export interface RoutePoint {
  id: string;
  equipmentId: string;
  order: number; // порядковый номер в маршруте
  estimatedTime: number; // секунды
  status: RoutePointStatus;
  actualTime?: number; // фактическое время выполнения
  scannedAt?: string; // когда отсканирована NFC
}

// 5. Уведомление
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  equipmentId?: string;
  robotId?: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

// Контекст и состояния
export interface AppState {
  equipment: Equipment[];
  robots: Robot[];
  notifications: Notification[];
  selectedEquipmentId: string | null;
  activeView: "map" | "planning" | "analytics";
}
