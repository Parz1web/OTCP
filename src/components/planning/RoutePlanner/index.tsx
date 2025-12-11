import React, { useState } from "react";
import type { Equipment, Robot, RobotRoute } from "../../../data/types";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Play,
  Trash2,
  Plus,
  MapPin,
  Clock,
  Save,
  Download,
  GripVertical,
  List,
  Grid,
  Settings,
} from "lucide-react";
import styles from "./RoutePlanner.module.css";

// Sortable Item Component
const SortableRoutePoint = ({
  point,
  equipment,
  onRemove,
  onTimeChange,
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: point.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const eq = equipment.find((e: Equipment) => e.id === point.equipmentId);

  return (
    <div ref={setNodeRef} style={style} className={styles.sortableItem}>
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <div className={styles.pointContent}>
        <div className={styles.equipmentInfo}>
          <div className={styles.equipmentName}>{eq?.name || "Неизвестно"}</div>
          <div className={styles.equipmentDetails}>
            <span className={styles.equipmentType}>
              {eq?.type === "pump" ? "⛽ Насос" : "🛠️ Пресс"}
            </span>
            <span className={styles.nfcId}>NFC: {eq?.nfcTagId}</span>
          </div>
        </div>
        <div className={styles.timeControl}>
          <label>Время сканирования:</label>
          <div className={styles.timeSlider}>
            <input
              type="range"
              min="15"
              max="120"
              step="5"
              value={point.estimatedTime}
              onChange={(e) => onTimeChange(point.id, parseInt(e.target.value))}
            />
            <span>{point.estimatedTime} сек</span>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="small"
        onClick={() => onRemove(point.id)}
        className={styles.removeButton}
      >
        <Trash2 size={14} />
      </Button>
      <div
        className={`${styles.statusIndicator} ${
          styles[eq?.status || "normal"]
        }`}
      />
    </div>
  );
};

interface RoutePlannerProps {
  equipment: Equipment[];
  robot: Robot;
  routes: RobotRoute[];
  onRouteCreate: (route: Omit<RobotRoute, "id" | "createdAt">) => void;
  onRouteDelete: (routeId: string) => void;
  onStartRobot: (routeId: string) => void;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({
  equipment,
  robot,
  routes,
  onRouteCreate,
  onRouteDelete,
  onStartRobot,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<RobotRoute | null>(
    routes[0] || null
  );
  const [newRouteName, setNewRouteName] = useState("Новый маршрут");
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(
    []
  );
  const [routeTime, setRouteTime] = useState("08:00");
  const [viewMode, setViewMode] = useState<"simple" | "advanced">("simple");
  const [dragPoints, setDragPoints] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Инициализация dragPoints при выборе оборудования
  React.useEffect(() => {
    const points = selectedEquipmentIds.map((equipmentId, index) => ({
      id: `drag-point-${equipmentId}-${index}`,
      equipmentId,
      order: index + 1,
      estimatedTime: 30,
      status: "pending" as const,
    }));
    setDragPoints(points);
  }, [selectedEquipmentIds]);

  const handleEquipmentToggle = (equipmentId: string) => {
    if (viewMode === "simple") {
      setSelectedEquipmentIds((prev) =>
        prev.includes(equipmentId)
          ? prev.filter((id) => id !== equipmentId)
          : [...prev, equipmentId]
      );
    } else {
      // В расширенном режиме сразу добавляем как точку маршрута
      const newPoint = {
        id: `point-${equipmentId}-${Date.now()}`,
        equipmentId,
        order: dragPoints.length + 1,
        estimatedTime: 30,
        status: "pending" as const,
      };
      setDragPoints((prev) => [...prev, newPoint]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDragPoints((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Обновляем порядковые номера
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
    }
  };

  const handleRemoveDragPoint = (pointId: string) => {
    const point = dragPoints.find((p) => p.id === pointId);
    if (point) {
      // Убираем из selectedEquipmentIds если в простом режиме
      if (viewMode === "simple") {
        setSelectedEquipmentIds((prev) =>
          prev.filter((id) => id !== point.equipmentId)
        );
      }
    }

    setDragPoints((prev) => {
      const newPoints = prev.filter((p) => p.id !== pointId);
      return newPoints.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    });
  };

  const handleTimeChange = (pointId: string, time: number) => {
    setDragPoints((prev) =>
      prev.map((point) =>
        point.id === pointId ? { ...point, estimatedTime: time } : point
      )
    );
  };

  const handleCreateRoute = () => {
    const pointsToUse =
      viewMode === "simple"
        ? selectedEquipmentIds.map((equipmentId, index) => ({
            id: `point-${equipmentId}-${index}`,
            equipmentId,
            order: index + 1,
            estimatedTime: 30,
            status: "pending" as const,
          }))
        : dragPoints;

    if (pointsToUse.length === 0) {
      alert("Выберите хотя бы одно оборудование для маршрута");
      return;
    }

    const newRoute: Omit<RobotRoute, "id" | "createdAt"> = {
      name: newRouteName,
      robotId: robot.id,
      isActive: true,
      points: pointsToUse,
    };

    onRouteCreate(newRoute);

    // Сброс
    if (viewMode === "simple") {
      setSelectedEquipmentIds([]);
    } else {
      setDragPoints([]);
    }
    setNewRouteName("Новый маршрут");
  };

  const calculateTotalTime = (points: any[]) => {
    return points.reduce((total, point) => total + point.estimatedTime, 0);
  };

  const getEquipmentById = (id: string) => {
    return equipment.find((eq) => eq.id === id);
  };

  const handleExportRoute = () => {
    if (!selectedRoute) return;

    const routeData = {
      ...selectedRoute,
      equipmentDetails: selectedRoute.points.map((point) => ({
        ...point,
        equipment: getEquipmentById(point.equipmentId),
      })),
    };

    const dataStr = JSON.stringify(routeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `маршрут-${selectedRoute.name
      .toLowerCase()
      .replace(/\s+/g, "-")}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const currentPoints =
    viewMode === "simple"
      ? selectedEquipmentIds.map((id, index) => ({
          id: `temp-${id}`,
          equipmentId: id,
          order: index + 1,
          estimatedTime: 30,
        }))
      : dragPoints;

  const totalTime = calculateTotalTime(currentPoints);

  return (
    <Card padding="large" className={styles.routePlanner}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>
            <MapPin size={24} /> Планировщик маршрутов
          </h2>
          <p className={styles.subtitle}>
            Создание и управление маршрутами обхода робота
          </p>
        </div>

        <div className={styles.viewControls}>
          <div className={styles.viewToggle}>
            <Button
              variant={viewMode === "simple" ? "primary" : "ghost"}
              size="small"
              onClick={() => setViewMode("simple")}
              className={styles.viewButton}
            >
              <List size={16} />
              Простой режим
            </Button>
            <Button
              variant={viewMode === "advanced" ? "primary" : "ghost"}
              size="small"
              onClick={() => setViewMode("advanced")}
              className={styles.viewButton}
            >
              <Grid size={16} />
              Расширенный режим
            </Button>
          </div>

          <div className={styles.timeInfo}>
            <Clock size={16} />
            <span>Общее время: {totalTime} сек</span>
            <span className={styles.pointCount}>
              {currentPoints.length} точек
            </span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Выбор оборудования */}
        <div className={styles.equipmentSelection}>
          <h3>Оборудование в цеху</h3>
          <div className={styles.equipmentList}>
            {equipment.map((eq) => {
              const isSelected =
                viewMode === "simple"
                  ? selectedEquipmentIds.includes(eq.id)
                  : dragPoints.some((p) => p.equipmentId === eq.id);

              return (
                <div
                  key={eq.id}
                  className={`${styles.equipmentItem} ${
                    isSelected ? styles.selected : ""
                  }`}
                  onClick={() => handleEquipmentToggle(eq.id)}
                >
                  <div className={styles.equipmentCheckbox}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      readOnly
                    />
                  </div>
                  <div className={styles.equipmentDetails}>
                    <div className={styles.equipmentName}>{eq.name}</div>
                    <div className={styles.equipmentType}>
                      {eq.type === "pump" ? "Насос" : "Пресс"} • NFC:{" "}
                      {eq.nfcTagId}
                    </div>
                    <div
                      className={`${styles.statusIndicator} ${
                        styles[eq.status]
                      }`}
                    />
                  </div>
                  <div className={styles.equipmentIcon}>
                    {eq.type === "pump" ? "⛽" : "🛠️"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.createRouteSection}>
            <div className={styles.routeNameInput}>
              <label>Название маршрута:</label>
              <input
                type="text"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                placeholder="Введите название маршрута"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleCreateRoute}
              className={styles.createButton}
              disabled={currentPoints.length === 0}
            >
              <Plus size={16} />
              Создать маршрут
            </Button>
          </div>
        </div>

        {/* Планирование маршрута */}
        <div className={styles.routePlanning}>
          <div className={styles.planningHeader}>
            <h3>Планирование маршрута</h3>
            {viewMode === "advanced" && (
              <div className={styles.advancedHint}>
                <Settings size={14} />
                <span>Перетаскивайте точки для изменения порядка</span>
              </div>
            )}
          </div>

          {viewMode === "simple" ? (
            /* Простой режим - список */
            <div className={styles.simpleRouteList}>
              {selectedEquipmentIds.map((equipmentId, index) => {
                const eq = getEquipmentById(equipmentId);
                return eq ? (
                  <div key={equipmentId} className={styles.simpleRoutePoint}>
                    <div className={styles.pointNumber}>{index + 1}</div>
                    <div className={styles.pointEquipment}>
                      <div className={styles.pointName}>{eq.name}</div>
                      <div className={styles.pointDetails}>
                        <span className={styles.pointType}>
                          {eq.type === "pump" ? "⛽" : "🛠️"}
                        </span>
                        <span className={styles.pointTime}>30 сек</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleEquipmentToggle(equipmentId)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ) : null;
              })}

              {selectedEquipmentIds.length === 0 && (
                <div className={styles.emptyState}>
                  <p>Выберите оборудование из списка слева</p>
                </div>
              )}
            </div>
          ) : (
            /* Расширенный режим - drag-and-drop */
            <div className={styles.advancedRoutePlanning}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={dragPoints.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.dragRouteList}>
                    {dragPoints.map((point) => (
                      <SortableRoutePoint
                        key={point.id}
                        point={point}
                        equipment={equipment}
                        onRemove={handleRemoveDragPoint}
                        onTimeChange={handleTimeChange}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {dragPoints.length === 0 && (
                <div className={styles.emptyState}>
                  <p>Выберите оборудование из списка слева</p>
                  <p className={styles.emptyHint}>
                    Или перетаскивайте карточки оборудования сюда
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Существующие маршруты */}
          <div className={styles.existingRoutes}>
            <h3>Сохранённые маршруты</h3>

            {routes.length === 0 ? (
              <div className={styles.noRoutes}>
                <p>Нет созданных маршрутов</p>
              </div>
            ) : (
              <div className={styles.routesList}>
                {routes.map((route) => (
                  <div
                    key={route.id}
                    className={`${styles.routeCard} ${
                      selectedRoute?.id === route.id ? styles.active : ""
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className={styles.routeCardHeader}>
                      <div className={styles.routeCardTitle}>
                        <h4>{route.name}</h4>
                        <span className={styles.routePoints}>
                          {route.points.length} точек
                        </span>
                      </div>
                      <div className={styles.routeCardActions}>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartRobot(route.id);
                          }}
                          title="Запустить робота"
                        >
                          <Play size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRouteDelete(route.id);
                          }}
                          title="Удалить маршрут"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className={styles.routeStats}>
                      <span>Время: {calculateTotalTime(route.points)} сек</span>
                      <span>
                        Создан: {new Date(route.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedRoute && (
              <div className={styles.routeActions}>
                <Button
                  variant="primary"
                  onClick={() => onStartRobot(selectedRoute.id)}
                  className={styles.startButton}
                >
                  <Play size={16} />
                  Запустить робота по выбранному маршруту
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleExportRoute}
                  className={styles.exportButton}
                >
                  <Download size={16} />
                  Экспортировать маршрут
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RoutePlanner;
