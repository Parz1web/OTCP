// Пороги для аномалий
export const PARAMETER_THRESHOLDS = {
  vibration: {
    pump: { warning: 5.0, critical: 7.0 },
    press: { warning: 6.0, critical: 8.0 },
  },
  temperature: {
    pump: { warning: 70, critical: 80 },
    press: { warning: 75, critical: 85 },
  },
  pressure: {
    pump: { warning: 14, critical: 16 },
    press: { warning: 16, critical: 18 },
  },
};

// Цвета статусов
export const STATUS_COLORS = {
  equipment: {
    normal: "#10B981", // зеленый
    warning: "#F59E0B", // желтый
    critical: "#EF4444", // красный
    maintenance: "#6B7280", // серый
  },
  robot: {
    idle: "#6B7280",
    moving: "#3B82F6",
    charging: "#10B981",
    error: "#EF4444",
  },
};

// Размеры карты
export const MAP_CONFIG = {
  width: 800,
  height: 600,
  gridSize: 50,
};

// Константы робота
export const ROBOT_CONFIG = {
  scanRadius: 40, // радиус сканирования NFC
  moveSpeed: 10, // пикселей в секунду
  scanDuration: 2000, // мс на сканирование NFC
};
