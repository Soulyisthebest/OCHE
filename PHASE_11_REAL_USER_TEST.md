# OCHE / CARCHECK AI — PHASE 11: REAL USER MVP TEST REPORT
**Fecha:** Febrero 2025  
**Estado General:** ✅ **APROBADO PARA USUARIOS REALES (MVP)**

---

### 1. ESTADO TÉCNICO
- **Suite de Pruebas Automatizadas:** 14 archivos de test, **131 tests ejecutados y pasados al 100% (0 fallos)**.
- **Linteo y Tipado TypeScript:** `npm run lint` (`tsc --noEmit`) $\rightarrow$ **0 errores**.
- **Compilación de Producción:** `npm run build` (`vite build && esbuild server.ts`) $\rightarrow$ **Compilación limpia y exitosa**.
- **Servidor Backend y API:** `server.ts` con Express + Vite middleware en puerto `3000`, arquitectura de reintentos exponenciales y cascada de contingencia ante picos de demanda upstream (503 / 429).

---

### 2. RESUMEN DE TESTS DE FASE 11 (`phase11RealUserTest.test.ts`)

| Nº | Caso de Prueba / Escenario | Resultado | Detalle de Comprobación |
|---|---|---|---|
| **1** | **User Journey Completo** | ✅ **PASS** | Flujo completo de parámetros (Seat Ibiza 1.0 TSI, 8.400 €, 112.000 km, 2017, ES) genera informe con identidad, puntuación, desglose de costes reales, precio objetivo y veredicto. |
| **2.A** | **Coche reconocido por foto** | ✅ **PASS** | Resuelve el candidato de catálogo correctamente (VW Golf) asociando ficha técnica. |
| **2.B** | **Coche no reconocido por foto** | ✅ **PASS** | Asigna `UNKNOWN` con confianza `0` y activa el botón *"Introducir coche manualmente"*. |
| **2.C** | **Coche ambiguo o fuera de catálogo** | ✅ **PASS** | Solicita verificación o asigna `IDENTIFIED_BUT_UNSUPPORTED` sin inventar especificaciones. |
| **2.D** | **Coche introducido manualmente** | ✅ **PASS** | Opera directamente con los parámetros manuales del usuario (Peugeot 208 PureTech) enlazando catálogo. |
| **2.E** | **Coche no soportado** | ✅ **PASS** | Preserva la identidad (Mazda 3) con `status: IDENTIFIED_BUT_UNSUPPORTED` sin seleccionar coches demo. |
| **2.F** | **Motor desconocido** | ✅ **PASS** | Acepta *"No lo sé"* fijando `engine: 'Motor no especificado'`, `power: 0` y `needsConfirmation: true`. |
| **3** | **Decisión de Compra Comprensible** | ✅ **PASS** | Responde en lenguaje llano a las 6 preguntas clave para una persona sin conocimientos mecánicos. |
| **4** | **Separación Real vs Demo** | ✅ **PASS** | Modo Demo y Modo Análisis Real no contaminan datos entre sí. |
| **5** | **Gestión de Cero Datos / Errores** | ✅ **PASS** | Entrada vacía o fotos inválidas no provocan pantalla blanca ni cuelgues, retornando notas de incertidumbre. |

---

### 3. USER JOURNEY DEFINITIVO AUDITADO

```
[ INICIO ]
   │
   ▼
[ "VOY A COMPRAR UN COCHE" ]
   │
   ▼
[ IDENTIFICAR ] ──► (📷 FOTOS  o  ✍️ INTRODUCIR COCHE)
   │
   ▼
[ CONFIRMAR VEHÍCULO ]
   │
   ▼
[ PRECIO ] ──► [ KILÓMETROS ] ──► [ AÑO ] ──► [ PAÍS (Fiscalidad e ITV) ]
   │
   ▼
[ FOTOGRAFÍAS DEL COCHE ] (Opcional si se identificó manualmente)
   │
   ▼
[ ANÁLISIS DETERMINISTA + IA ]
   │
   ▼
[ LO BUENO ] ──► [ ATENCIÓN ] ──► [ RIESGOS ] ──► [ COSTES REALES ] ──► [ PRECIO OBJETIVO ] ──► [ ¿MERECE LA PENA? ]
   │
   ▼
[ INFORME COMPLETO: NEGOCIACIÓN + CHECKLIST EN VIVO + PREGUNTAS AL VENDEDOR + FEEDBACK ]
```

---

### 4. RESPUESTAS CLAVE DEL INFORME PARA EL COMPRADOR

1. **¿QUÉ ESTÁ BIEN?**
   - Resumen de virtudes mecánicas contrastadas del modelo (p. ej. consumos, disponibilidad de recambios, fiabilidad de bloque).
2. **¿QUÉ ME PREOCUPA?**
   - Averías endémicas documentadas (`known_issue`) y desgastes observados (`OBSERVED`) clasificados por severidad.
3. **¿QUÉ TENGO QUE COMPROBAR?**
   - Checklist interactivo para la prueba física in situ con botones de *"¿Cómo comprobarlo?"*.
4. **¿CUÁNTO PODRÍA COSTAR?**
   - Desglose exhaustivo: Precio de compra + ITP/tasas según país seleccionado + Mantenimiento inicial + Reparaciones visibles.
5. **¿QUÉ PRECIO INTENTARÍA PAGAR?**
   - Rango de negociación fundamentado y mensaje de texto redactado para copiar y enviar al vendedor.
6. **¿MERECE LA PENA?**
   - Veredicto objetivo (`EXCELENTE`, `BUENA OPCIÓN`, `CON PRECAUCIÓN`, `ALTO RIESGO`) con 3–5 argumentos lógicos y sin promesas absolutas.

---

### 5. ERGONOMÍA MÓVIL Y ACCESIBILIDAD

- **Uso a una mano:** Botones principales y llamadas a la acción con altura mínima de 44px (`min-h-[44px]`).
- **Cámara móvil:** Soporte nativo de selección de archivo o disparo directo con cámara trasera (`capture="environment"`).
- **Compresión en cliente:** Canvas HTML5 comprime imágenes pesadas antes del envío para evitar consumo excesivo de datos móviles.
- **Distinción visual de modos:**
  - `[MODO DEMO]`: Indicador ámbar cuando se exploran datos de muestra.
  - `[ANÁLISIS IA]`: Indicador azul/verde cuando opera el motor multimodal.
  - `[MODO OFFLINE / MOTOR LOCAL]`: Indicador gris cuando opera exclusivamente el motor local sin conexión.

---

### 6. MECANISMO DE FEEDBACK

- Incluido al pie del informe de análisis:
  - Botones directos: `👍 Sí, me ha ayudado` / `👎 No mucho`.
  - Campo opcional: `¿Qué mejorarías?`.
  - Almacenamiento local en el estado de la sesión activa, sin envíos a terceros ni telemetría invasiva.

---

### 7. LIMITACIONES Y LÍMITES TÉCNICOS DECLARADOS

- **Límites de la inspección remota:** Se advierte explícitamente al comprador que no es posible certificar la compresión interna de cilindros, el estado del volante bimasa o fugas ocultas bajo cubrecárter sin una prueba dinámica presencial.
- **Comprobación administrativa:** Se instruye solicitar informe oficial de tráfico (DGT en España, HPI en UK, Carfax) para descartar embargos o cargas financieras.

---

### 8. CHECKLIST FINAL PARA USUARIOS REALES

- [x] **Identificación por foto**
- [x] **Identificación manual**
- [x] **Confirmación de vehículo**
- [x] **Precio anunciado**
- [x] **Kilómetros**
- [x] **Año**
- [x] **País** (10 perfiles internacionales de fiscalidad e inspección)
- [x] **Fotos de la unidad**
- [x] **Análisis determinista**
- [x] **Riesgos y puntos débiles**
- [x] **Costes reales de entrada**
- [x] **Precio objetivo y argumentos**
- [x] **Recomendación / ¿Merece la pena?**
- [x] **Informe completo**
- [x] **Compartir / Copiar preguntas para vendedor**
- [x] **Feedback (👍 / 👎)**
- [x] **Error handling (sin pantallas blancas ni excepciones)**
- [x] **Mobile ergonomía ($\ge 44\text{ px}$)**
- [x] **Demo / Real claramente separado**
