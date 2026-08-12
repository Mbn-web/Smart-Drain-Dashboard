export const DRAINS = [
  {
    id: "D-031",
    location: "Malad",
    latitude: 19.1863,
    longitude: 72.8484,
    healthScore: 34,
    status: "critical",
    waterLevel: 68,
    flowRate: 1.8,
    lastUpdated: "12s ago",
    dataSource: "DEMO DATA",
    modules: {
      waterLevelSensor: "online",
      flowSensor: "online",
      esp32: "online",
      esp32Cam: "online",
      gateway: "connected"
    },
    history30Days: [
      { day: "Day 1", health: 65, water: 45, flow: 2.4 },
      { day: "Day 5", health: 60, water: 48, flow: 2.3 },
      { day: "Day 10", health: 58, water: 50, flow: 2.2 },
      { day: "Day 15", health: 50, water: 55, flow: 2.0 },
      { day: "Day 20", health: 45, water: 60, flow: 1.9 },
      { day: "Day 25", health: 38, water: 65, flow: 1.8 },
      { day: "Day 30", health: 34, water: 68, flow: 1.8 }
    ],
    cameraImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18f0f3c?auto=format&fit=crop&q=80&w=800",
    cameraStatus: "READY",
    capturedAt: "2 mins ago"
  },
  {
    id: "D-018",
    location: "Andheri",
    latitude: 19.1136,
    longitude: 72.8697,
    healthScore: 41,
    status: "critical",
    waterLevel: 62,
    flowRate: 2.1,
    lastUpdated: "25s ago",
    dataSource: "DEMO DATA",
    modules: {
      waterLevelSensor: "online",
      flowSensor: "degraded",
      esp32: "online",
      esp32Cam: "online",
      gateway: "connected"
    },
    history30Days: [
      { day: "Day 1", health: 70, water: 40, flow: 2.6 },
      { day: "Day 5", health: 68, water: 42, flow: 2.5 },
      { day: "Day 10", health: 62, water: 48, flow: 2.4 },
      { day: "Day 15", health: 55, water: 52, flow: 2.3 },
      { day: "Day 20", health: 48, water: 58, flow: 2.2 },
      { day: "Day 25", health: 44, water: 60, flow: 2.1 },
      { day: "Day 30", health: 41, water: 62, flow: 2.1 }
    ],
    cameraImage: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&q=80&w=800",
    cameraStatus: "READY",
    capturedAt: "5 mins ago"
  },
  {
    id: "D-052",
    location: "Chembur",
    latitude: 19.0626,
    longitude: 72.9032,
    healthScore: 48,
    status: "warning",
    waterLevel: 55,
    flowRate: 2.5,
    lastUpdated: "8s ago",
    dataSource: "DEMO DATA",
    modules: {
      waterLevelSensor: "online",
      flowSensor: "online",
      esp32: "online",
      esp32Cam: "degraded",
      gateway: "connected"
    },
    history30Days: [
      { day: "Day 1", health: 75, water: 35, flow: 2.8 },
      { day: "Day 5", health: 72, water: 38, flow: 2.7 },
      { day: "Day 10", health: 68, water: 40, flow: 2.7 },
      { day: "Day 15", health: 60, water: 46, flow: 2.6 },
      { day: "Day 20", health: 55, water: 50, flow: 2.6 },
      { day: "Day 25", health: 50, water: 53, flow: 2.5 },
      { day: "Day 30", health: 48, water: 55, flow: 2.5 }
    ],
    cameraImage: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800",
    cameraStatus: "DEGRADED",
    capturedAt: "1 min ago"
  },
  {
    id: "D-011",
    location: "Bandra",
    latitude: 19.0596,
    longitude: 72.8295,
    healthScore: 89,
    status: "healthy",
    waterLevel: 22,
    flowRate: 4.2,
    lastUpdated: "15s ago",
    dataSource: "DEMO DATA",
    modules: {
      waterLevelSensor: "online",
      flowSensor: "online",
      esp32: "online",
      esp32Cam: "online",
      gateway: "connected"
    },
    history30Days: [
      { day: "Day 1", health: 85, water: 25, flow: 4.0 },
      { day: "Day 5", health: 86, water: 24, flow: 4.1 },
      { day: "Day 10", health: 88, water: 22, flow: 4.2 },
      { day: "Day 15", health: 87, water: 23, flow: 4.1 },
      { day: "Day 20", health: 89, water: 22, flow: 4.2 },
      { day: "Day 25", health: 88, water: 22, flow: 4.2 },
      { day: "Day 30", health: 89, water: 22, flow: 4.2 }
    ],
    cameraImage: "https://images.unsplash.com/photo-1584467735871-8e853e8e84d6?auto=format&fit=crop&q=80&w=800",
    cameraStatus: "READY",
    capturedAt: "4 mins ago"
  },
  {
    id: "D-004",
    location: "Borivali",
    latitude: 19.2307,
    longitude: 72.8567,
    healthScore: 92,
    status: "healthy",
    waterLevel: 18,
    flowRate: 4.8,
    lastUpdated: "10s ago",
    dataSource: "DEMO DATA",
    modules: {
      waterLevelSensor: "online",
      flowSensor: "online",
      esp32: "online",
      esp32Cam: "online",
      gateway: "connected"
    },
    history30Days: [
      { day: "Day 1", health: 90, water: 20, flow: 4.7 },
      { day: "Day 5", health: 91, water: 19, flow: 4.8 },
      { day: "Day 10", health: 92, water: 18, flow: 4.8 },
      { day: "Day 15", health: 92, water: 18, flow: 4.8 },
      { day: "Day 20", health: 91, water: 19, flow: 4.7 },
      { day: "Day 25", health: 92, water: 18, flow: 4.8 },
      { day: "Day 30", health: 92, water: 18, flow: 4.8 }
    ],
    cameraImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
    cameraStatus: "READY",
    capturedAt: "3 mins ago"
  },
  {
    id: "D-022",
    location: "Goregaon",
    latitude: 19.1654,
    longitude: 72.8494,
    healthScore: 68,
    status: "warning",
    waterLevel: 42,
    flowRate: 3.1,
    lastUpdated: "18s ago",
    dataSource: "DEMO DATA",
    modules: {
      waterLevelSensor: "online",
      flowSensor: "online",
      esp32: "online",
      esp32Cam: "online",
      gateway: "connected"
    },
    history30Days: [
      { day: "Day 1", health: 72, water: 38, flow: 3.3 },
      { day: "Day 5", health: 71, water: 39, flow: 3.2 },
      { day: "Day 10", health: 70, water: 40, flow: 3.2 },
      { day: "Day 15", health: 69, water: 41, flow: 3.1 },
      { day: "Day 20", health: 68, water: 42, flow: 3.1 },
      { day: "Day 25", health: 68, water: 42, flow: 3.1 },
      { day: "Day 30", health: 68, water: 42, flow: 3.1 }
    ],
    cameraImage: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800",
    cameraStatus: "READY",
    capturedAt: "6 mins ago"
  },
  {
    id: "D-045",
    location: "Dadar",
    latitude: 19.0178,
    longitude: 72.8478,
    healthScore: 78,
    status: "healthy",
    waterLevel: 30,
    flowRate: 3.9,
    lastUpdated: "5s ago",
    dataSource: "DEMO DATA",
    modules: {
      waterLevelSensor: "online",
      flowSensor: "online",
      esp32: "online",
      esp32Cam: "online",
      gateway: "connected"
    },
    history30Days: [
      { day: "Day 1", health: 76, water: 32, flow: 3.8 },
      { day: "Day 5", health: 77, water: 31, flow: 3.8 },
      { day: "Day 10", health: 78, water: 30, flow: 3.9 },
      { day: "Day 15", health: 78, water: 30, flow: 3.9 },
      { day: "Day 20", health: 78, water: 30, flow: 3.9 },
      { day: "Day 25", health: 78, water: 30, flow: 3.9 },
      { day: "Day 30", health: 78, water: 30, flow: 3.9 }
    ],
    cameraImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800",
    cameraStatus: "READY",
    capturedAt: "1 min ago"
  },
  {
    id: "D-067",
    location: "Colaba",
    latitude: 18.9067,
    longitude: 72.8147,
    healthScore: 85,
    status: "healthy",
    waterLevel: 25,
    flowRate: 4.1,
    lastUpdated: "14s ago",
    dataSource: "DEMO DATA",
    modules: {
      waterLevelSensor: "online",
      flowSensor: "online",
      esp32: "online",
      esp32Cam: "online",
      gateway: "connected"
    },
    history30Days: [
      { day: "Day 1", health: 84, water: 26, flow: 4.0 },
      { day: "Day 5", health: 84, water: 26, flow: 4.0 },
      { day: "Day 10", health: 85, water: 25, flow: 4.1 },
      { day: "Day 15", health: 85, water: 25, flow: 4.1 },
      { day: "Day 20", health: 85, water: 25, flow: 4.1 },
      { day: "Day 25", health: 85, water: 25, flow: 4.1 },
      { day: "Day 30", health: 85, water: 25, flow: 4.1 }
    ],
    cameraImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800",
    cameraStatus: "READY",
    capturedAt: "4 mins ago"
  },
  {
    id: "D-089",
    location: "Thane",
    latitude: 19.2183,
    longitude: 72.9781,
    healthScore: 59,
    status: "warning",
    waterLevel: 48,
    flowRate: 2.7,
    lastUpdated: "22s ago",
    dataSource: "DEMO DATA",
    modules: {
      waterLevelSensor: "online",
      flowSensor: "online",
      esp32: "online",
      esp32Cam: "offline",
      gateway: "connected"
    },
    history30Days: [
      { day: "Day 1", health: 65, water: 42, flow: 2.9 },
      { day: "Day 5", health: 64, water: 43, flow: 2.8 },
      { day: "Day 10", health: 62, water: 45, flow: 2.8 },
      { day: "Day 15", health: 61, water: 46, flow: 2.7 },
      { day: "Day 20", health: 60, water: 47, flow: 2.7 },
      { day: "Day 25", health: 59, water: 48, flow: 2.7 },
      { day: "Day 30", health: 59, water: 48, flow: 2.7 }
    ],
    cameraImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    cameraStatus: "OFFLINE",
    capturedAt: "45 mins ago"
  }
];

export const ALERTS = [
  {
    id: "AL-101",
    drainId: "D-031",
    location: "Malad",
    severity: "critical",
    title: "Possible blockage detected",
    description: "Water level above threshold (68cm) with reduced flow rate.",
    time: "2 mins ago",
    status: "open"
  },
  {
    id: "AL-102",
    drainId: "D-018",
    location: "Andheri",
    severity: "critical",
    title: "Water level rapidly rising",
    description: "Monitored ultrasonic sensor reports 62cm level during heavy inflow.",
    time: "5 mins ago",
    status: "open"
  },
  {
    id: "AL-103",
    drainId: "D-052",
    location: "Chembur",
    severity: "warning",
    title: "Flow velocity anomaly",
    description: "Flow sensor indicating partial obstruction in conduit B.",
    time: "12 mins ago",
    status: "open"
  },
  {
    id: "AL-104",
    drainId: "D-089",
    location: "Thane",
    severity: "warning",
    title: "ESP32-CAM signal intermittent",
    description: "Visual verification feed experiencing packet loss.",
    time: "30 mins ago",
    status: "open"
  },
  {
    id: "AL-105",
    drainId: "D-011",
    location: "Bandra",
    severity: "resolved",
    title: "Flow returned to normal",
    description: "Water receded to 22cm following manual gate clearance.",
    time: "1 hour ago",
    status: "resolved"
  },
  {
    id: "AL-106",
    drainId: "D-004",
    location: "Borivali",
    severity: "resolved",
    title: "Sensor calibration verified",
    description: "Routine heartbeat telemetry confirmed 100% module synchronization.",
    time: "3 hours ago",
    status: "resolved"
  }
];

export const SYSTEM_STATS = {
  monitoredDrains: 847,
  activeAlerts: 23,
  systemUptime: "98.2%",
  avgHealth: 82,
  healthyCount: 721,
  warningCount: 91,
  criticalCount: 35,
  sensorsOnline: "12/12",
  esp32NodesOnline: "3/3",
  camerasOnline: "2/2",
  gatewayStatus: "CONNECTED",
  lastSync: "12s ago"
};

// WEATHER_DATA removed — the app now consumes REAL Open-Meteo data via
// /app/frontend/src/services/weatherService.js.
