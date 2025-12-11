import React, { useState, useEffect, useMemo } from "react";
import type { Equipment, Robot, RobotRoute } from "../../../data/types";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import {
  Play,
  Pause,
  MapPin,
  Navigation,
  Battery,
  Zap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import styles from "./FactoryMap.module.css";

interface FactoryMapProps {
  equipment: Equipment[];
  robot: Robot;
  routes: RobotRoute[];
  onEquipmentClick: (equipmentId: string) => void;
}

interface ScanResult {
  equipmentId: string;
  success: boolean;
  timestamp: number;
  data?: {
    vibration: number;
    temperature: number;
    pressure: number;
  };
}

const FactoryMap: React.FC<FactoryMapProps> = ({
  equipment,
  robot,
  routes,
  onEquipmentClick,
}) => {
  const [isRobotMoving, setIsRobotMoving] = useState(false);
  const [robotPosition, setRobotPosition] = useState(robot.currentPosition);
  const [scanProgress, setScanProgress] = useState<Record<string, number>>({});
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    routes[0]?.id || ""
  );
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [robotLog, setRobotLog] = useState<string[]>(["Робот готов к работе"]);

  // Текущий выбранный маршрут
  const currentRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) || null,
    [routes, selectedRouteId]
  );

  // Симуляция движения робота
  useEffect(() => {
    if (!isRobotMoving || !currentRoute) return;

    let animationFrame: number;
    let currentTargetIndex = 0;
    const speed = 2;

    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setRobotLog((prev) => [
        `[${timestamp}] ${message}`,
        ...prev.slice(0, 10),
      ]);
    };

    const simulateNFCScan = (equipmentId: string): Promise<ScanResult> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const eq = equipment.find((e) => e.id === equipmentId);
          const success = Math.random() > 0.1; // 90% успешных сканирований

          const result: ScanResult = {
            equipmentId,
            success,
            timestamp: Date.now(),
            data: eq
              ? {
                  vibration:
                    eq.parameters.vibration + (Math.random() - 0.5) * 0.5,
                  temperature:
                    eq.parameters.temperature + (Math.random() - 0.5) * 2,
                  pressure:
                    eq.parameters.pressure + (Math.random() - 0.5) * 0.3,
                }
              : undefined,
          };

          resolve(result);
        }, 1500);
      });
    };

    const moveRobot = async () => {
      if (currentTargetIndex >= currentRoute.points.length) {
        setIsRobotMoving(false);
        addLog("✅ Маршрут успешно завершен");
        return;
      }

      const currentPoint = currentRoute.points[currentTargetIndex];
      const targetEquipment = equipment.find(
        (eq) => eq.id === currentPoint.equipmentId
      );

      if (!targetEquipment) {
        addLog(
          `⚠️ Оборудование не найдено для точки ${currentTargetIndex + 1}`
        );
        currentTargetIndex++;
        animationFrame = requestAnimationFrame(moveRobot);
        return;
      }

      const targetPos = targetEquipment.position;
      const dx = targetPos.x - robotPosition.x;
      const dy = targetPos.y - robotPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 10) {
        // Робот достиг цели - начинаем сканирование
        if (!scanProgress[targetEquipment.id]) {
          addLog(`📡 Начато сканирование: ${targetEquipment.name}`);
        }

        const newProgress = (scanProgress[targetEquipment.id] || 0) + 5;
        setScanProgress((prev) => ({
          ...prev,
          [targetEquipment.id]: Math.min(newProgress, 100),
        }));

        if (newProgress >= 100) {
          // Сканирование завершено
          try {
            const result = await simulateNFCScan(targetEquipment.id);
            setScanResults((prev) => [...prev, result]);

            if (result.success) {
              addLog(`✅ Успешно отсканировано: ${targetEquipment.name}`);
            } else {
              addLog(`❌ Ошибка сканирования: ${targetEquipment.name}`);
            }
          } catch (error) {
            addLog(`⚠️ Ошибка при сканировании: ${targetEquipment.name}`);
          }

          setScanProgress((prev) => ({ ...prev, [targetEquipment.id]: 0 }));
          currentTargetIndex++;
        }
      } else {
        // Двигаем робота к цели
        setRobotPosition((prev) => ({
          x: prev.x + (dx / distance) * speed,
          y: prev.y + (dy / distance) * speed,
        }));
      }

      animationFrame = requestAnimationFrame(moveRobot);
    };

    addLog("🤖 Робот начал выполнение маршрута");
    animationFrame = requestAnimationFrame(moveRobot);
    return () => cancelAnimationFrame(animationFrame);
  }, [isRobotMoving, robotPosition, equipment, currentRoute, scanProgress]);

  // Функции управления
  const handleStartRobot = () => {
    if (!currentRoute || currentRoute.points.length === 0) {
      addLog("⚠️ Ошибка: не выбран маршрут или маршрут пуст");
      return;
    }

    // Сброс предыдущих результатов
    setScanResults([]);
    setScanProgress({});
    addLog(`🚀 Запуск робота по маршруту: ${currentRoute.name}`);

    // Установка начальной позиции робота
    const firstPoint = currentRoute.points[0];
    const firstEquipment = equipment.find(
      (e) => e.id === firstPoint.equipmentId
    );
    if (firstEquipment) {
      setRobotPosition({
        x: firstEquipment.position.x - 100,
        y: firstEquipment.position.y - 100,
      });
    }

    setIsRobotMoving(true);
  };

  const handleStopRobot = () => {
    setIsRobotMoving(false);
    addLog("⏸️ Робот остановлен пользователем");
  };

  const handlePauseRobot = () => {
    setIsRobotMoving(false);
    addLog("⏸️ Робот приостановлен");
  };

  const handleResumeRobot = () => {
    if (currentRoute && currentRoute.points.length > 0) {
      setIsRobotMoving(true);
      addLog("▶️ Робот возобновил движение");
    }
  };

  // Вспомогательные функции
  const getEquipmentById = (id: string) => {
    return equipment.find((eq) => eq.id === id);
  };

  const getScanStatus = (equipmentId: string) => {
    const result = scanResults.find((r) => r.equipmentId === equipmentId);
    if (result) {
      return result.success ? "success" : "failed";
    }
    return scanProgress[equipmentId] > 0 ? "scanning" : "idle";
  };

  const calculateTotalTime = (points: any[]) => {
    return points.reduce(
      (total, point) => total + (point.estimatedTime || 30),
      0
    );
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRobotLog((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 10)]);
  };

  // Статистика
  const successfulScans = scanResults.filter((r) => r.success).length;
  const failedScans = scanResults.filter((r) => !r.success).length;
  const progressPercent =
    currentRoute && currentRoute.points.length > 0
      ? Math.round((scanResults.length / currentRoute.points.length) * 100)
      : 0;

  return (
    <Card padding="large" className={styles.factoryMap}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>
            <MapPin size={24} /> Карта производственного цеха
          </h2>
          <div className={styles.routeSelector}>
            <select
              value={selectedRouteId}
              onChange={(e) => {
                const routeId = e.target.value;
                setSelectedRouteId(routeId);
                const route = routes.find((r) => r.id === routeId);
                if (route) {
                  addLog(`Выбран маршрут: ${route.name}`);
                }
              }}
              className={styles.routeSelect}
              disabled={isRobotMoving}
            >
              <option value="">Выберите маршрут</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name} ({route.points.length} точек)
                </option>
              ))}
            </select>
            {currentRoute && (
              <span className={styles.routeInfo}>
                {currentRoute.points.length} точек, ~
                {Math.round(calculateTotalTime(currentRoute.points) / 60)} мин
              </span>
            )}
          </div>
        </div>

        <div className={styles.robotControl}>
          <div className={styles.robotStats}>
            <div className={styles.stat}>
              <Battery size={16} />
              <span>{robot.battery}%</span>
            </div>
            <div className={styles.stat}>
              <Navigation size={16} />
              <span>{currentRoute?.points.length || 0}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.scanCounter}>
                📡 {successfulScans}/{currentRoute?.points.length || 0}
              </span>
            </div>
          </div>

          <div className={styles.controls}>
            {!isRobotMoving ? (
              <>
                <Button
                  variant="primary"
                  onClick={handleStartRobot}
                  className={styles.controlButton}
                  disabled={!currentRoute}
                >
                  <Play size={16} />
                  Запустить
                </Button>
                {scanResults.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={handleResumeRobot}
                    className={styles.controlButton}
                  >
                    Продолжить
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="danger"
                  onClick={handleStopRobot}
                  className={styles.controlButton}
                >
                  <Pause size={16} />
                  Стоп
                </Button>
                <Button
                  variant="warning"
                  onClick={handlePauseRobot}
                  className={styles.controlButton}
                >
                  Пауза
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Карта */}
        <div className={styles.mapContainer}>
          <div className={styles.mapGrid}>
            {/* Зоны цеха */}
            <div className={`${styles.zone} ${styles.assemblyZone}`}>
              <span className={styles.zoneLabel}>Зона сборки</span>
            </div>
            <div className={`${styles.zone} ${styles.hydraulicZone}`}>
              <span className={styles.zoneLabel}>Гидравлический участок</span>
            </div>
            <div className={`${styles.zone} ${styles.pumpZone}`}>
              <span className={styles.zoneLabel}>Насосная станция</span>
            </div>
            <div className={`${styles.zone} ${styles.controlZone}`}>
              <span className={styles.zoneLabel}>Пульт управления</span>
            </div>

            {/* Оборудование */}
            {equipment.map((eq) => {
              const scanStatus = getScanStatus(eq.id);
              const scanProgressValue = scanProgress[eq.id] || 0;
              const isBeingScanned = scanStatus === "scanning";
              const isScanned =
                scanStatus === "success" || scanStatus === "failed";

              return (
                <div
                  key={eq.id}
                  className={`${styles.equipment} ${styles[eq.type]} ${
                    styles[eq.status]
                  } ${styles[scanStatus]}`}
                  style={{
                    left: `${eq.position.x}px`,
                    top: `${eq.position.y}px`,
                  }}
                  onClick={() => onEquipmentClick(eq.id)}
                >
                  <div className={styles.equipmentIcon}>
                    {eq.type === "pump" ? "⛽" : "🛠️"}
                  </div>
                  <div className={styles.equipmentInfo}>
                    <div className={styles.equipmentName}>{eq.name}</div>
                    <StatusBadge status={eq.status} size="small" />
                  </div>

                  {isBeingScanned && (
                    <div className={styles.scanOverlay}>
                      <div className={styles.scanProgress}>
                        <div
                          className={styles.scanProgressBar}
                          style={{ width: `${scanProgressValue}%` }}
                        />
                      </div>
                      <span className={styles.scanText}>
                        NFC сканирование...
                      </span>
                    </div>
                  )}

                  {isScanned && (
                    <div className={styles.scanResultIcon}>
                      {scanStatus === "success" ? (
                        <CheckCircle size={24} color="#10b981" />
                      ) : (
                        <AlertCircle size={24} color="#ef4444" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Робот */}
            <div
              className={`${styles.robot} ${
                isRobotMoving ? styles.moving : ""
              }`}
              style={{
                left: `${robotPosition.x}px`,
                top: `${robotPosition.y}px`,
              }}
            >
              <div className={styles.robotIcon}>🤖</div>
              <div className={styles.robotBeam} />
            </div>
          </div>
        </div>

        {/* Панель логов и статистики */}
        <div className={styles.sidePanel}>
          <div className={styles.statsPanel}>
            <h3>
              <Zap size={20} /> Статистика сканирования
            </h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{successfulScans}</div>
                <div className={styles.statLabel}>Успешных сканирований</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{failedScans}</div>
                <div className={styles.statLabel}>Ошибок сканирования</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{progressPercent}%</div>
                <div className={styles.statLabel}>Прогресс маршрута</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {isRobotMoving ? "В работе" : "Остановлен"}
                </div>
                <div className={styles.statLabel}>Статус робота</div>
              </div>
            </div>
          </div>

          <div className={styles.logPanel}>
            <h3>📋 Журнал работы робота</h3>
            <div className={styles.logList}>
              {robotLog.map((log, index) => (
                <div key={index} className={styles.logEntry}>
                  <span className={styles.logTime}>{log.split("] ")[0]}]</span>
                  <span className={styles.logMessage}>
                    {log.split("] ")[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Легенда */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Легенда:</div>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={`${styles.colorBox} ${styles.pumpColor}`} />
            <span>Насосная станция</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.colorBox} ${styles.pressColor}`} />
            <span>Гидравлический пресс</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendIcon}>
              <CheckCircle size={16} color="#10b981" />
            </div>
            <span>Успешное сканирование</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendIcon}>
              <AlertCircle size={16} color="#ef4444" />
            </div>
            <span>Ошибка сканирования</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FactoryMap;
