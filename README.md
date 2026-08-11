# 🚗 CARCHECK AI — Tu Mecánico Personal Antes de Comprar un Coche Usado

> **MVP Portable & Gratuito (0 € en desarrollo)**
> Aplicación web responsive / PWA diseñada para ayudar a cualquier comprador de vehículos usados a responder:
> **"¿Merece la pena comprar este coche y cuánto me va a costar realmente?"** sin necesidad de conocimientos de mecánica.

---

## ⚡ CARACTERÍSTICAS PRINCIPALES

- 📸 **Escáner Guiado en 8 Pasos**: Captura o sube fotos clave del vehículo (Frontal, Trasera, Laterales, Interior, Cuadro, Motor, Neumáticos).
- 🧪 **DEMO MODE Activo por Defecto (0 € Costes)**: Funciona 100% en local sin requerir tarjetas de crédito, hosting de pago ni claves API obligatorias.
- 🤖 **Identificación y Análisis Viso-Mecánico**: Detecta marca, modelo, motorización, combustible e imperfecciones visibles respetando las reglas de seguridad viso-mecánicas (nunca afirma que el motor o el embrague están perfectos solo por una foto).
- 📊 **Puntuación de Compra (0–100)**: Evaluación ponderada (Fiabilidad 25%, Estado visible 20%, Mantenimiento 20%, Riesgo 15%, Precio 20%).
- 💰 **Calculadora de Coste Real**: Desglose transparente del precio del vendedor, gastos de transferencia, mantenimiento inicial recomendado y reparaciones probables en rangos (€).
- 🧑‍🔧 **Modo "Guíame" (No sé qué mirar)**: Asistente interactivo paso a paso para comprobar ruidos, arranque en frío, embrague y puntos clave delante del vehículo.
- 🚗 **Explorador Técnico 3D**: Modelo interactivo 360º con zonas de inspección (Motor, Frenos, Suspensión, Transmisión, Batería, Electrónica) e información de reparaciones.
- 📚 **Aprende Mecánica & Trivia**: Guía conceptual y juego de preguntas sobre mecánica básica.
- 🗄️ **Base de Datos Local de Demostración**: Incluye ejemplos precargados (*Toyota Yaris 1.0 Gasolina*, *Volkswagen Golf 2.0 TDI*, *Peugeot 208 1.2 PureTech*) etiquetados como `DATOS DE DEMOSTRACIÓN`.

---

## 🚀 GUÍA DE INSTALACIÓN Y EJECUCIÓN LOCAL

### Requisitos previos
- Node.js version 18.0 o superior.
- Git instalado en tu ordenador.

### 1. Clonar o descargar el repositorio
```bash
git clone https://github.com/TU_USUARIO/carcheck-ai.git
cd carcheck-ai
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en modo desarrollo local (Demo Mode)
```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000`. La aplicación se iniciará automáticamente en **Demo Mode** con datos simulados y no consumirá ningún crédito ni API externa.

---

## 🤖 CONFIGURACIÓN OPCIONAL DE GEMINI API (IA REAL)

Si deseas conectar la IA multimodal real de Gemini para analizar imágenes en tiempo real:

1. Crea un archivo `.env` en la raíz del proyecto copiando la plantilla:
   ```bash
   cp .env.example .env
   ```
2. Obtén tu clave gratuita de la API de Gemini desde [Google AI Studio](https://aistudio.google.com/).
3. Añade tu clave en `.env`:
   ```env
   GEMINI_API_KEY="AIzaSyYourActualGeminiKeyHere"
   ```
4. Reinicia el servidor local (`npm run dev`). Si la clave está presente, el endpoint `/api/analyze-car` usará el modelo `gemini-3.6-flash`. Si la clave no se configura o falla, la aplicación volverá automáticamente al modo **Demo Mode** sin interrumpir la experiencia.

---

## 🛠️ CÓMO MODIFICAR Y AMPLIAR LOS DATOS DEMO

Los vehículos de demostración y las fichas técnicas se encuentran centralizados en archivos JSON/TypeScript simples dentro de `src/data/`:

- `src/data/sampleCars.ts`: Catálogo de coches demo (*Golf, BMW, Peugeot 208, Toyota Yaris*) con sus presupuestos y listas de chequeo.
- `src/data/car3DData.ts`: Configuración de partes 3D, costes aproximados de recambios e instrucciones de averías.
- `src/components/LearnCars.tsx`: Artículos de la sección "Aprende Mecánica".

Puedes editar estos archivos directamente con cualquier editor de código (Cursor, VS Code) para añadir nuevos modelos o ajustar rangos de precios.

---

## 📦 CÓMO CONSTRUIR EL PROYECTO PARA PRODUCCIÓN

Para verificar que la aplicación compila correctamente sin errores de TypeScript ni de bundler:

```bash
npm run build
```

Para probar la build de producción localmente:
```bash
npm run start
```

---

## 🐙 GUÍA COMPLETA PARA SUBIR Y DESCARGAR DE GITHUB

### Cómo subir tu proyecto por primera vez a GitHub:

1. Crea un repositorio vacío en [GitHub](https://github.com/new) llamado `carcheck-ai`.
2. En la terminal dentro de la carpeta del proyecto, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "feat: CARCHECK AI MVP portable e interactivo"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/carcheck-ai.git
   git push -u origin main
   ```

### Importante sobre Seguridad (.gitignore)
El archivo `.gitignore` ya está preconfigurado para **excluir automáticamente** archivos sensibles como `.env`, carpetas de compilación `dist/` y `node_modules/`. Nunca subas tus claves API privadas a repositorios públicos.

### Cómo descargarlo y ejecutarlo posteriormente en otro ordenador:
```bash
git clone https://github.com/TU_USUARIO/carcheck-ai.git
cd carcheck-ai
npm install
npm run dev
```

---

## 💳 RESUMEN DE COSTES Y SERVICIOS FUTUROS

| Servicio / Capa | Estado en Desarrollo | Servicio en Producción Futura | Coste Aproximado |
| :--- | :--- | :--- | :--- |
| **Frontend & UI** | Local (`npm run dev`) | Vercel / Netlify (Tier Gratuito) | 0 € / mes |
| **Análisis de Fotos** | Local / Fallback Demo | Gemini 3.6 Flash API | Gratuito con cuota estándar |
| **Base de Datos** | Local Storage / Demo JSON | Supabase / PostgreSQL (Tier Gratuito) | 0 € / mes inicialmente |
| **Hosting Servidor API** | Local Express (`server.ts`) | Cloud Run / Render | Tier gratuito disponible |

---

## 📄 LICENCIA & PRIVACIDAD

Este proyecto está preparado para el cumplimiento con RGPD. Las imágenes procesadas en Demo Mode se gestionan temporalmente en memoria local y no se almacenan en ningún servidor externo.
