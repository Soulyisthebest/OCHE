# OCHE / CARCHECK AI — CHECKPOINT BEFORE REAL USERS REPORT
Fecha de Ejecución: 2026-08-16
Estado General: LISTO PARA VALIDACIÓN CON USUARIOS REALES

---

## A. GEMINI
- **Estado de Configuración**: `CONFIGURED`
  - Variable de entorno `GEMINI_API_KEY`: Presente y activa en el servidor (longitud de clave válida verificada sin exponer el secreto).
- **Flujo de Integración Verificado**:
  - `photo (Base64 comprimido)` $\rightarrow$ `POST /api/analyze-car` $\rightarrow$ `GoogleGenAI (gemini-2.5-flash)` $\rightarrow$ `Análisis Visual Estructurado` $\rightarrow$ `Reporte e Informe de Compra`.
- **Modo Fallback / Desconexión**:
  - Si la clave faltara o la llamada fallase por red, el sistema captura el error y activa el motor determinista local (`AIOrchestrator`) devolviendo `[MODO OFFLINE / MOTOR LOCAL]` sin pantalla en blanco ni fallo técnico.
- **Instrucciones si se despliega en entorno nuevo**:
  - Declarar `GEMINI_API_KEY` en variables de entorno o archivo `.env` tomando como base `.env.example`.

---

## B. MOBILE CAMERA & ERGONOMICS
- **Código de Captura Rebotado**:
  - `src/components/PhotoScanner.tsx` utiliza `<input type="file" accept="image/*" capture="environment" />` para acceso nativo directo a la cámara trasera en dispositivos móviles y selección de galería.
  - Compresor de imagen en cliente (`compressImage` a 1200px max, calidad 0.82) para evitar cuellos de botella en redes móviles.
  - Zonas táctiles y botones cumplen la cota mínima de ergonomía ($\ge 44\text{ px}$).
- **Estado de Pruebas**:
  - **Simulación Web / Desktop**: `PASSED` (Subida de fotos, previsualización, rotación de pasos, cancelación y eliminación individual de fotos).
  - **Dispositivos Físicos Reales**: `MANUAL_DEVICE_TEST_REQUIRED`
    - *iOS Safari*: Requiere prueba manual en mano para verificar política de permisos de cámara WebRTC/HTML5 y orientación EXIF en fotos verticales.
    - *Android Chrome*: Requiere prueba manual en mano para confirmar selector nativo de cámara vs galería.

---

## C. COUNTRIES & COST ENGINE
- **Estructura CountryProfile**:
  - Implementada en `src/data/countries.ts` y gobernada por `CountryEngine.ts`.
  - Cada país (`ES`, `FR`, `DE`, `IT`, `PT`, `UK`, `US`, `MX`, `AR`, `CO`) define:
    - `currency` y `currencySymbol` (€, $, £).
    - `taxSystem`: Impuestos de transmisiones / ITP / transfer fees.
    - `laborMarket`: Tarifas horarias mínima, esperada y máxima de taller mecánico.
    - `inspectionSystem`: Perioricidad y comprobaciones obligatorias de inspección periódica (ITV, MOT, TÜV, etc.).
    - `requiredDocuments`: Documentación legal obligatoria para la compraventa.
- **Elementos Marcados para Verificación Externa**:
  - Tasas variables autonómicas de ITP en España (oscilan entre 4% y 8% según CC.AA.) $\rightarrow$ `NEEDS_EXTERNAL_VERIFICATION`.
  - Tablas de valoración fiscal oficial BOE/Hacienda para liquidación de transmisiones $\rightarrow$ `NEEDS_EXTERNAL_VERIFICATION`.

---

## D. ANTI-HALLUCINATION & GUARDRAILS
- **Comportamiento ante Incertidumbre**:
  - Sin datos o foto no vehicular $\rightarrow$ `UNKNOWN` permanece estrictamente como `UNKNOWN` (Vehículo No Identificado).
  - Foto parcial / insuficiente $\rightarrow$ `INSUFFICIENT_DATA` permanece como `INSUFFICIENT_DATA`.
  - Discrepancia visual o modelo gemelo $\rightarrow$ `NEEDS_VERIFICATION` activa el selector de confirmación manual sin inventar especificaciones.
- **Separación Known vs Observed**:
  - Los fallos endémicos estadísticos del motor (p. ej. correa bañada en aceite en 1.2 PureTech o patines de cadena en BMW N47) se rotulan como **Problemas Conocidos del Modelo** (`known_issue`) y **NUNCA** como averías confirmadas en la unidad analizada.
- **Límites Físicos Declarados**:
  - Sección visible y permanente: *"⚪ Cosas no determinables por foto: compresión de cilindros, turbo en aceleración a plena carga, embrague/bimasa y cargas en registro de tráfico."*

---

## E. AUTOMATED TESTS & BUILDS
1. **`npm test`**:
   - Resultado: **102 tests pasados** de 102 en 10 suites (`vitest run`).
   - Cobertura: Identificación de vehículos, motores de coste, puntuación dual, soporte de países, adaptadores 3D y determinismo offline.
2. **`npm run lint`**:
   - Resultado: **0 errores** (`tsc --noEmit` completado limpiamente).
3. **`npm run build`**:
   - Resultado: **Compilación de producción exitosa** (`vite build` + bundle de servidor Express en `dist/server.cjs`).

---

## F. BLOCKERS
- **Bloqueadores Técnicos o de Código**: **NINGUNO**. La aplicación es completamente estable, compila sin errores y pasa la totalidad de los tests automáticos.
- **Recomendaciones Previas a la Salida a Usuarios**:
  - Realizar 1 prueba manual de toma de foto en un teléfono real (iOS y Android) para validar la experiencia de usuario in situ (`MANUAL_DEVICE_TEST_REQUIRED`).
