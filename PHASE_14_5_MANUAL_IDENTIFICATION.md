# OCHE / CARCHECK AI — FASE 14.5
## MANUAL VEHICLE IDENTIFICATION & COMPLETE FALLBACK ARCHITECTURE

### 1. INTRODUCCIÓN Y REGLA DE ORO
En el MVP de CarCheck AI / Oche, **la IA nunca debe bloquear el análisis**.
Cuando los modelos de visión por computador (Gemini) no logren identificar con precisión el vehículo a partir de las fotografías aportadas (o cuando el usuario prefiera ingresar los datos manualmente sin fotos), el sistema proporciona un flujo guiado y progresivo de **identificación manual completa**.

```
[ FLUJO DE DECISIÓN ]
          ↓
  ¿Fotos analizadas?
   ├── SÍ (Identificación exitosa) ────→ Confirmación rápida ──→ Análisis Técnico
   └── NO / DUDOSO / FALLO ────────────→ Fallback Inmediato
                                                ↓
                                   [ INTRODUCIR MANUALMENTE ]
                                                ↓
                                     Paso 1: Vehículo (Marca, Modelo, Gen, Año)
                                     Paso 2: Motor (Combustible, Bloque, Potencia, Caja)
                                     Paso 3: Versión y Carrocería (Acabado, Puertas)
                                     Paso 4: Datos del Coche (Km, Precio, Región)
                                     Paso 5: Identificación Adicional (VIN, Matrícula)
                                     Paso 6: Confirmación Final ("ESTE ES MI COCHE")
                                                ↓
                                        ANÁLISIS COMPLETO
```

---

### 2. DISPARADORES DEL FLUJO MANUAL (TRIGGERS)
1. **Acceso directo en escáner:** Botón persistente `[ Introducir coche manualmente ]` en `PhotoScanner`.
2. **Estado `UNKNOWN` o `NEEDS_VERIFICATION`:** En `VehicleConfirmCard` se despliega automáticamente el cuadro de ayuda:
   > *"¿No reconocemos tu coche? Puedes introducir los datos manualmente."*
3. **Botón de edición general:** Cualquier usuario puede pulsar `[ Introducir coche manualmente ]` en cualquier momento antes de ver el informe final.

---

### 3. WIZARD PROGRESIVO DE 5 PASOS + PASO 6 DE CONFIRMACIÓN

#### Paso 1: Vehículo
- **Marca** (Obligatorio) con selector rápido de marcas comunes (Volkswagen, Toyota, Peugeot, BMW, Ford, Renault, Seat, etc.).
- **Modelo** (Obligatorio).
- **Generación / Carrocería** (Opcional con botón `[ No lo sé ]`).
- **Año de matriculación** (Obligatorio con validación numérica).

#### Paso 2: Motor
- **Tipo de combustible:** Gasolina, Diésel, Híbrido, Híbrido enchufable, Eléctrico, GLP.
- **Sugerencias de motorizaciones disponibles:** Al escribir marca y modelo (ej. *Volkswagen Golf* o *BMW 320d*), se muestran botones con motorizaciones y códigos conocidos (ej: `2.0 TDI (150 CV)`, `1.2 PureTech (100 CV)`, `1.0 VVT-i (72 CV)`, etc.).
- **Motor / Cilindrada / Código:** Opcional con botón `[ No sé el motor ]`.
- **Potencia (CV):** Numérico.
- **Transmisión:** Manual, Automático, Doble embrague, CVT o `[ No lo sé ]`.

#### Paso 3: Versión y Carrocería
- **Acabado / Equipamiento:** Con sugerencias contextuales según marca (ej: *Sport*, *FR*, *M Sport*, *Allure*, *Style*, *Active*, etc.) o `[ No lo sé ]`.
- **Carrocería:** 5 puertas, 3 puertas, Sedán, SUV, Familiar, Coupé, Cabrio, etc.

#### Paso 4: Datos del Coche
- **Kilometraje aproximado:** Base para cálculo de desgaste.
- **Precio anunciado (€):** Base para cálculo de valor de mercado y margen de negociación.
- **País y Región:** Localización de mercado.
- **Fecha 1ª matriculación:** (mes/año opcional).

#### Paso 5: Identificación Adicional (Opcional)
- **VIN (Número de bastidor)** (máx 17 caracteres).
- **Matrícula**.
- **Código de motor (ficha técnica)**.
- **Código de acabado / versión**.

#### Paso 6: Confirmación Final de Datos
Muestra una tarjeta resumen completa con toda la información técnica y económica y destaca la sección:
- **"Información que no conocemos":** Enumera explícitamente cualquier campo desconocido (`isEngineUnknown`, potencia no especificada, etc.) y garantiza que la IA no inventará datos no verificados.
- **Botones de acción:**
  - `[ EDITAR DATOS ]` (Permite volver a cualquier paso del asistente).
  - `[ ESTE ES MI COCHE ]` (Guarda los datos y dispara la canalización de análisis).

---

### 4. RESOLUCIÓN DE CONFLICTOS (FOTOS VS. ENTRADA MANUAL)
Si el usuario sube fotos de un vehículo (ej. *BMW Serie 3*) pero introduce manualmente datos de otro (ej. *Toyota Yaris*):
1. El motor de identificación detecta la discrepancia visual y activa la bandera `isContradictory: true`.
2. Muestra un banner destacado:
   > *"Posible contradicción entre selección manual y análisis fotográfico: Has seleccionado manualmente Toyota Yaris, pero los rasgos visuales corresponden a BMW Serie 3."*
3. Opciones claras de resolución para el usuario:
   - `[ Mantener mi selección (Toyota Yaris) ]`
   - `[ Revisar y cambiar a BMW Serie 3 ]`

---

### 5. GARANTÍAS DE AISLAMIENTO Y CERO ALUCINACIONES
- **Vehículos no soportados:** Si el usuario introduce un vehículo fuera de los modelos profundos del repositorio (ej. *Hyundai i30*, *Renault Clio*, *Ford Focus*), el estado se establece como `IDENTIFIED_BUT_UNSUPPORTED`.
- **Cero invenciones:** `knownProblems` permanece vacío (`0` averías endémicas inventadas), evitando alarmar falsamente al comprador o adjudicarle problemas de otros vehículos.
- **Separación de capas:** Los datos de compra (precio, kilometraje) van estrictamente a la capa económica (`costEstimate`), mientras que las observaciones visuales provienen únicamente de las fotos aportadas.

---

### 6. MATRIZ DE VERIFICACIÓN (14 TESTS OBLIGATORIOS)

| # | Test Suite | Descripción | Resultado |
|---|---|---|---|
| 1 | `MANUAL_FULL_IDENTIFICATION` | Registro completo de todas las especificaciones técnicas | PASS |
| 2 | `MANUAL_PARTIAL_IDENTIFICATION` | Registro parcial con motor no especificado sin fallos | PASS |
| 3 | `MANUAL_UNKNOWN_ENGINE` | Motor marcado como "No lo sé" no inventa fallos ni potencia | PASS |
| 4 | `MANUAL_UNKNOWN_POWER` | Bloque conocido sin potencia exacta asignada | PASS |
| 5 | `MANUAL_UNKNOWN_TRANSMISSION` | Transmisión no especificada ejecuta análisis sin bloqueos | PASS |
| 6 | `MANUAL_UNKNOWN_GENERATION` | Generación no especificada manejada con robustez | PASS |
| 7 | `MANUAL_UNKNOWN_TRIM` | Omisión de acabado no degrada la identificación | PASS |
| 8 | `MANUAL_UNSUPPORTED_VEHICLE` | Vehículo no soportado no inventa averías ni modelos demo | PASS |
| 9 | `MANUAL_SUPPORTED_VEHICLE_MATCH` | Vehículo soportado enlaza correctamente con el repositorio 3D | PASS |
| 10 | `MANUAL_VS_AI_CONFLICT` | Alerta de contradicción entre fotos y selección manual | PASS |
| 11 | `MANUAL_IDENTIFICATION_WITHOUT_PHOTOS` | Análisis completo de principio a fin sin fotos | PASS |
| 12 | `MANUAL_IDENTIFICATION_WITH_PHOTOS` | Combinación de fotos y datos manuales sin colisiones | PASS |
| 13 | `MANUAL_IDENTIFICATION_DATA_SEPARATION` | Separación estricta entre capa técnica y capa económica | PASS |
| 14 | `MANUAL_IDENTIFICATION_KNOWLEDGE_ISOLATION` | Cero fabricación de averías endémicas en vehículos no catalogados | PASS |

---
**Estado Fase 14.5:** Completada e integrada exitosamente en el MVP de Oche / CarCheck AI.
