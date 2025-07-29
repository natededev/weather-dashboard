# Sky Canvas Dashboard

A modern, high-performance weather dashboard built with React, TypeScript, Vite, and Tailwind CSS. Features real-time weather data, beautiful UI, and production-grade optimizations.

## Features
- 🌤️ Real-time weather data from OpenWeather API
- 🔍 Intelligent, forgiving location search ("lagos nigeria" → "Lagos, Nigeria")
- 🌡️ 24-hour and 6-day forecasts with interactive charts
- 📊 Lazy-loaded, optimized Chart.js visualizations
- ♿ Accessible, responsive, and mobile-friendly UI
- 🚀 Lighthouse-optimized: minimal layout shifts, fast JS, and small bundles
- 🧩 Modular, maintainable codebase with shadcn/ui components

## Tech Stack
- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Chart.js](https://www.chartjs.org/) (lazy loaded)
- [OpenWeather API](https://openweathermap.org/api)

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Configuration
- API keys and environment variables can be set in a `.env` file (see `.env.example` if present).
- Tailwind and Vite configs are in the project root.

## Project Structure
```
├── public/                # Static assets
├── src/
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   └── weather/       # Weather dashboard components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API logic
│   ├── pages/             # App routes
│   └── ...
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── ...
```

## Performance & Best Practices
- All heavy features (charts) are lazy loaded
- Minimized layout shifts (CLS) and optimized skeletons
- Unused dependencies and CSS are purged
- Bundle analysis with Vite Visualizer
- Gzip/Brotli compression recommended for deployment

## License
MIT
