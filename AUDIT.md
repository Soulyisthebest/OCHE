# 🚗 CARCHECK AI — INFORME DE AUDITORÍA Y ESTADO DEL PROYECTO

> **Fecha de auditoría:** Agosto 2026
> **Objetivo:** Transformación progresiva del MVP hacia producto final sostenible, manteniendo la filosofía **0 € de coste en desarrollo** y **Demo Mode 100% funcional y ejecutable localmente**.

---

## 📊 1. ESTADO ACTUAL (¿Qué funciona?)

### Frontend (React + TypeScript + Tailwind CSS)
- **Navegación e Interfaz**: Menú superior (`Header.tsx`) y flujo de navegación SPA responsiva para móvil, tablet y escritorio.
- **Pantalla Principal (`HeroHome.tsx`)**: Presentación clara del producto, llamada a la acción principal ("📸 ESCANEAR COCHE"), accesos directos a garaje, guía 3D, chat y ejemplos rápidos precargados (*Golf, Peugeot 208, Toyota Yaris, BMW 320d*).
- **Escáner Guiado en 8 Pasos (`PhotoScanner.tsx`)**: Sistema visual para capturar o subir imágenes en 8 slots (Frontal, Trasera, Lat. Izq, Lat. Der, Interior, Cuadro, Motor, Neumáticos) con opción de saltar pasos y selector rápido de imágenes demo.
- **Informe de Inspección (`AnalysisReport.tsx`)**:
  - Puntuación de compra (0–100) ponderada y con badge de color (Verde/Amarillo/Rojo).
  - Regla de seguridad viso-mecánica destacada: *"No podemos comprobar este componente mediante una fotografía"*.
  - Matriz de Puntos Fuertes ("Lo Bueno") y Débiles ("Lo Malo") diferenciando fallos del modelo vs. fallos observados.
  - Calculadora de Coste Real con deslizadores ajustables.
  - Tarjetas de reparación con estimación de piezas (nuevas/usadas) y mano de obra.
  - Checklist interactivo para probar antes de comprar.
- **Calculadora de Coste Real (`RealCostCalculator.tsx`)**: Desglose automático en rangos de precio ofertado, transferencia, mantenimiento inicial y reparaciones.
- **Modo "Guíame" (`AssistantMode.tsx`)**: Inspección in situ paso a paso con árboles de decisión interactivos (arranque en frío, ruidos, embrague, humo, dirección, electrónica).
- **Explorador Técnico 3D (`Car3DExplorer.tsx`)**: Visualizador interactivo 360º con selector de zonas (Motor, Frenos, Suspensión, Transmisión, Batería, Electrónica) e información de averías y costes.
- **Aprende Mecánica & Gamificación (`LearnCars.tsx`)**: Artículos conceptuales sin tecnicismos + Juego **Quiz +10 XP** con marcador acumulativo de puntos de experiencia.
- **Mi Garaje y Comparador (`GarageHistory.tsx`)**: Persistencia local en `localStorage` y herramienta para comparar 2 vehículos guardados lado a lado.
- **Chat Asistente IA (`CarChatAssistant.tsx`)**: Asistente conversacional con preguntas predefinidas y respuestas personalizadas sobre el vehículo.

---

## ⚠️ 2. PROBLEMAS Y PUNTOS DE MEJORA TÉCNICA

| Componente | Problema Detectado | Gravedad | Solución Propuesta |
| :--- | :--- | :--- | :--- |
| **Testing** | No existe suite de pruebas unitarias (`npm test`). Los cálculos de costes y puntuación no tienen test automático. | Media | Implementar Vitest para validar las funciones puras de puntuación y costes. |
| **Persistencia de Fotos** | Las imágenes capturadas se almacenan temporalmente como DataURLs en memoria de cliente. Para historiales largos en `localStorage` pueden superar los 5MB. | Baja / Media | Optimizar redimensión/compresión de imágenes en cliente antes de guardar el reporte en `localStorage`. |
| **Separación de Datos** | La base de datos demo (`sampleCars.ts`) está bien estructurada, pero requiere una interfaz estandarizada para conectar futuras APIs o bases de datos SQL/Supabase en Real Mode. | Media | Crear una capa de repositorio abstracto `VehicleRepository` que alterne limpiamente entre `DemoVehicleAdapter` y `RemoteVehicleAdapter`. |
| **Modelo 3D** | La representación 3D actual es una ilustración vectorial interactiva en SVG/Canvas. Cumple muy bien como MVP, pero no utiliza aún archivos `.gltf` / `.glb` específicos por modelo. | Baja | Mantener el modelo vectorial genérico optimizado para móviles y estructurar la carga diferida de modelos 3D específicos para fases avanzadas. |

---

## 🧪 3. FUNCIONALIDADES DEMO (Datos Simulados)

- **Modo Demo por Defecto**: Activado automáticamente cuando no se detecta la clave `GEMINI_API_KEY`.
- **Análisis de Fotos**: En Demo Mode, el sistema selecciona o empareja un vehículo de demostración completo (`Toyota Yaris 1.0`, `Peugeot 208 PureTech`, `VW Golf TDI`, `BMW 320d`) simulando el tiempo de procesamiento con progresos animados.
- **Precios de Piezas y Mano de Obra**: Basados en el archivo local `sampleCars.ts` etiquetado explícitamente con la marca **DATOS DE DEMOSTRACIÓN**.
- **Preguntas del Quiz y Artículos**: Almacenados localmente en `LearnCars.tsx`.

---

## 🤖 4. FUNCIONALIDADES REALES (APIs y Lógica Real)

- **Análisis Multimodal con Gemini API**: Endpoint backend `/api/analyze-car` en Express usando `@google/genai` con el modelo `gemini-3.6-flash`.
- **Esquema de Respuesta Estructurado (JSON Schema)**: Gemini devuelve una estructura JSON estricta garantizando tipos correctos para la identificación, observación, puntuación y estimación de costes.
- **Servidor Express Integrado (`server.ts`)**: Funciona unificado con Vite middleware en desarrollo y sirve archivos estáticos compilados en producción.
- **Procesamiento de Fotos en Servidor**: Decodificación de partes base64 en `inlineData` para la entrada multimodal.
- **Persistencia en Navegador**: Guardado y recuperación real en `localStorage` de informes generados y estados del garaje.

---

## 🔐 5. RIESGOS (Seguridad, Costes y Arquitectura)

1. **Riesgo de Costes (0 € Garantizados)**:
   - *Estado actual:* **SEGURO**. La llamada a `/api/analyze-car` retorna HTTP 503 si `GEMINI_API_KEY` no está definida en `.env`. El frontend conmuta automáticamente a Demo Mode. No hay servicios de pago ni bases de datos activas en la nube que puedan generar cargos.
2. **Riesgo de Seguridad y Secretos**:
   - *Estado actual:* **SEGURO**. La clave de la API de Gemini nunca se expone al cliente ni se incluye en el bundle de Vite. Transcurre únicamente en `process.env.GEMINI_API_KEY` en el backend Express.
   - `.gitignore` y `.env.example` están configurados adecuadamente.
3. **Riesgo de Privacidad (RGPD)**:
   - Las imágenes procesadas no se guardan en discos ni servicios de terceros permanentes en el MVP.

---

## 🚀 6. PRÓXIMOS PASOS (Plan de Trabajo Priorizado)

1. **Paso 3 — Corrección de Errores y Calidad de Código**:
   - Añadir suite de test unitarios para el cálculo reproducible de la puntuación (0-100) y de costes reales en rangos.
2. **Paso 4 — Garantía Total de Demo Mode e Integración Local**:
   - Comprimir imágenes localmente antes de guardar informes en `localStorage`.
3. **Paso 5 — Arquitectura de Capa de Datos (Demo vs Real)**:
   - Definir la interfaz unificada de repositorio de vehículos (`VehicleRepository`) preparada para futuras conexiones a Supabase/PostgreSQL sin alterar la interfaz de usuario.
4. **Paso 6 — Refinamiento del Prompt Multimodal e Identificación de Confianza**:
   - Ajustar los niveles de certeza en la identificación (`confirmado`, `probable`, `desconocido`) cuando se usa Gemini.
5. **Paso 7 — Pulido UX Móvil & PWA**:
   - Asegurar que la experiencia táctil y de cámara se sienta 100% fluida como una app nativa en teléfonos móviles.

---

*Informe generado automáticamente por el sistema de auditoría interna de CARCHECK AI.*
