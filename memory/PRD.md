{
  "app_name": "Smart Drain AI",
  "theme": {
    "background": "Dark navy / near-black (#070b14, #0b1329, #020617)",
    "primary_accent": "Electric blue (#3b82f6)",
    "secondary_highlights": "Cyan (#06b6d4)",
    "text": "White / light-gray (#f8fafc, #94a3b8)",
    "status_colors": {
      "healthy": "Green (#10b981)",
      "warning": "Amber/yellow (#f59e0b)",
      "critical": "Red (#ef4444)"
    },
    "surface": "Subtle glassmorphism with 12-24px backdrop blur and thin borders (#1e293b)"
  },
  "core_screens": [
    "Login Screen (Split-screen with system status & demo stats)",
    "Dashboard (Municipal overview, Leaflet OpenStreetMap of Mumbai with color-coded drain markers, critical drains panel, module health card, weather/rainfall)",
    "Drain List Page (Searchable & filterable table of 847 monitored drains)",
    "Drain Detail Page (Detailed telemetry, hardware module status, ESP32-CAM visual verification feed, health score contributing factors breakdown, 30-day health trend chart)",
    "Analytics Page (Health distributions, water level & flow rate historical trends)",
    "Alerts Management Page (Full-page alert feed with severity filters)"
  ],
  "mock_data_contract": "All mock data lives in /app/frontend/src/mock.js adhering strictly to the planned drain and sensor shapes for future Firebase RTDB integration."
}
