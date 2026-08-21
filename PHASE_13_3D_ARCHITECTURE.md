# 🚗 OCHE / CARCHECK AI — FASE 13: ARQUITECTURA DEL SISTEMA 3D INTERACTIVO

> **Estado:** Implementado y Verificado  
> **Compatibilidad:** 100% Determinista, 0 € de coste, 0 dependencias externas pesadas, sin descargas externas.  
> **Separación Ontológica Estricta:** Conocimiento del Modelo ≠ Diagnóstico del Coche Fotografiado.

---

## 1. Cadena de Relaciones Canónica

El sistema 3D se integra directamente en la arquitectura automotriz existente de OCHE sin capas intermedias artificiales ni duplicación de datos:

```
Vehicle (GlobalVehicleComposite / CarAnalysisReport)
   │
   ▼
Car3DModel (model-3d-golf-ea288, model-3d-peugeot-puretech, model-3d-toyota-yaris, model-3d-bmw-f30, model-3d-generic-car)
   │
   ▼
Car3DPart[] (p3d-*)
   │
   ├─► VehicleSystem (ENGINE, TRANSMISSION, BRAKES, COOLING, SUSPENSION, EXHAUST, ELECTRICAL, EMISSIONS...)
   ├─► Part (Canonical Part Domain: nombre, función técnica, ubicación, modos de fallo, síntomas)
   ├─► KnownProblem[] (Problemas endémicos del modelo: degradación correa PureTech, bomba EA288, cadena N47...)
   ├─► Repair[] (Procedimientos de taller asociados)
   └─► CostEstimate (Desglose dinámico OEM / Aftermarket / Desguace / Mano de Obra por país activo)
```

---

## 2. Modelos 3D Soportados y Fallback Universal

| Vehículo | ID Modelo 3D | Motor / Chasis | Piezas 3D Mapeadas | Fallback Disponible |
| :--- | :--- | :--- | :--- | :---: |
| **Volkswagen Golf VII 2.0 TDI** | `model-3d-golf-ea288` | EA288 / MQB | Turbo, Correa distribución, Bomba agua, DPF, Volante bimasa, Frenos, Amortiguadores | ✅ |
| **Peugeot 208 1.2 PureTech** | `model-3d-peugeot-puretech` | EB2DT / CMP | Correa húmeda, Bomba vacío, Catalizador, Bujías, Frenos, Amortiguadores | ✅ |
| **Toyota Yaris 1.0 VVT-i** | `model-3d-toyota-yaris` | 1KR-FE / XP130 | Embrague monodisco, Bomba de agua, Frenos delanteros, Amortiguadores | ✅ |
| **BMW 320d F30** | `model-3d-bmw-f30` | N47/B47 / F30 | Cadena distribución trasera, Enfriador EGR, Turbo TwinPower, Transmisión RWD | ✅ |
| **Vehículo No Soportado / Genérico** | `model-3d-generic-car` | Universal Chasis | Arquitectura multisistema completa (Motor, Transmisión, Frenos, Escape, etc.) | ✅ (Aviso no intrusivo) |

### Regla de Fallback
Si el usuario analiza un vehículo que no cuenta con un modelo 3D específico (p. ej., un modelo fuera de catálogo):
1. **La aplicación NO se rompe ni lanza errores.**
2. Se muestra un banner informativo: *"Vista 3D específica no disponible para este vehículo. Mostrando plantilla arquitectónica técnica universal."*
3. El análisis del vehículo, puntuación y costes continúan funcionando normalmente con total inmutabilidad.

---

## 3. Estados de Interacción y Animación

El visor (`Car3DCanvas.tsx` / `Car3DExplorer.tsx`) soporta cuatro estados funcionales de interacción:

1. **`idle`**: Estado de reposo con sombra ambiental, cuadrícula arquitectónica y perspectiva 3D interactiva.
2. **`highlight`**: Iluminación y pulso visual sobre piezas y sistemas seleccionados o con advertencias.
3. **`explode` (Despiece)**: Separación vertical y dimensional de componentes mecánicos (Carrocería, Tren Motriz, Chasis/Ruedas) con ajuste de offsets en hotspots.
4. **`inspect`**: Enfoque de cámara angular (presets: `FULL_CAR`, `ENGINE`, `FRONT`, `REAR`, `UNDERBODY`, `INTERIOR`, `SIDE`) con zoom y apertura automática de la ficha técnica.

---

## 4. Ficha de Información de la Pieza (Knowledge Card)

Al seleccionar cualquier componente en el visor 3D o en la lista accesible 2D, se despliega la tarjeta de conocimiento con cinco secciones clave:

- 🔧 **PIEZA:** Nombre canónico y ubicación en el vehículo.
- ⚙️ **SISTEMA:** Clasificación dentro de los 16 sistemas estándar (Motor, Frenos, Refrigeración...).
- 💡 **¿QUÉ HACE? (Descripción):** Doble nivel explicativo conmutable:
  - *Fácil (ELI5):* Lenguaje accesible para compradores no mecánicos.
  - *Detallado:* Principio físico-mecánico formal para aficionados o profesionales.
- ⚠️ **PROBLEMAS CONOCIDOS:** Averías endémicas y síntomas frecuentes del modelo.
- 💰 **REPARACIÓN Y COSTE:** Desglose del baremo de taller según el país activo (España EUR, México MXN, etc.) distinguiendo pieza nueva OEM, aftermarket, desguace y horas de mano de obra.

---

## 5. Separación de Conocimiento vs. Diagnóstico Real

> **Principio de Veracidad OCHE:**
> El modelo 3D representa **CONOCIMIENTO TÉCNICO DEL MODELO**, nunca un diagnóstico inventado sobre el ejemplar fotografiado.

- Si el informe de escaneo no detectó daños en el turbo: la pieza se marca como `KNOWN` (conocimiento general) y **NUNCA** afirma *"Tu turbo está roto"*.
- Si el escaneo detectó una anomalía real con evidencia fotográfica: se vincula con la etiqueta `OBSERVED` mostrando la evidencia visual y un enlace directo a la sección correspondiente del informe.

---

## 6. Accesibilidad (Modo No-3D)

Para dispositivos de bajo rendimiento o usuarios que prefieran lectura textual, el explorador incluye el botón **"Sin 3D"** (`AccessibilityPartsList.tsx`):
- Lista 2D estructurada por sistemas con filtros rápidos.
- Navegación por teclado completa y compatibilidad con lectores de pantalla.
- Acceso idéntico a todas las fichas técnicas, problemas conocidos y desglose de costes.

---

## 7. Verificación de Pruebas (Vitest)

La suite formal (`src/__tests__/vehicle3DKnowledge.test.ts`) verifica los 10 escenarios críticos:
1. `Vehicle` tiene `Car3DModel` cuando existe en el catálogo.
2. `Car3DModel` pertenece al `Vehicle` correcto (marca, modelo, motorización coherentes).
3. `Car3DPart` se relaciona bidireccionalmente con `Part`.
4. `Car3DPart` se relaciona con `VehicleSystem`.
5. Seleccionar una pieza devuelve la información técnica correcta.
6. Una pieza muestra sus problemas conocidos cuando existen.
7. Una pieza muestra su reparación y costes baremados.
8. Vehículo sin modelo 3D no rompe la aplicación.
9. El visor 3D no muta ni altera el resultado del análisis original.
10. El 3D separa estrictamente el conocimiento genérico del modelo de los diagnósticos reales.
