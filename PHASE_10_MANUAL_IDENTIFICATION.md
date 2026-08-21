# OCHE — FASE 10: SISTEMA DE IDENTIFICACIÓN MANUAL Y FALLBACK ROBUSTO

## 1. Objetivo Arquitectónico
Garantizar que el sistema OCHE mantenga una experiencia de usuario y diagnóstico técnico 100% operativo tanto si la identificación multimodal por visión artificial (Gemini) es exitosa como si falla, es parcial, ambigua o contradictoria.

---

## 2. Flujo de Estados de Identificación

```
[ Entrada: Fotos / Hints ]
           │
           ▼
[ Inferencia Multimodal / Resolver ]
           │
     ┌─────┴─────────────────────────┐
     ▼                               ▼
[ Vehículo Soportado ]    [ Vehículo Fuera de Catálogo / Desconocido ]
     │                               │
     ▼                               ▼
[ NEEDS_VERIFICATION / CONFIRMED ] [ IDENTIFIED_BUT_UNSUPPORTED / UNKNOWN ]
     │                               │
     └───────────────┬───────────────┘
                     ▼
       [ Pantalla de Confirmación ] ◄─── (Acceso a "Introducir coche manualmente")
                     │
                     ▼
           [ Vehículo Confirmado ]
                     │
                     ▼
     [ Generación del Informe OCHE ]
```

---

## 3. Componentes y Reglas de Negocio

1. **Entrada de Identificación Multimodal:**
   - Preprocesamiento y compresión en cliente (`imageCompressor.ts`).
   - Inferencia multimodal en backend (`/api/analyze-car`).
   - Esquema tipado estricto `VehicleIdentificationResult`.

2. **Resolución contra Repositorio de Modelos (`VehicleResolverService` & `LocalVehicleRepository`):**
   - Coincidencia exacta o difusa normalizada de Marca y Modelo.
   - Aislamiento estricto de catálogo para prevenir contaminación de modelos desconocidos con vehículos de demostración (cero alucinaciones).
   - Soporte nativo para vehículos no catalogados (`IDENTIFIED_BUT_UNSUPPORTED`).

3. **Mecanismo de Anulación y Selección Manual (`ManualIdentificationModal`):**
   - Permite al usuario introducir Marca, Modelo, Año, Motor, Combustible, Potencia y Transmisión.
   - Opción explícita de *"No sé el motor / Motor desconocido"*, fijando `engine = "Motor no especificado"`, `power = 0` y `isEngineKnown = false`, evitando inventar bloques o potencias.

4. **Detección de Contradicciones (Test F):**
   - Si el usuario introduce manualmente un vehículo pero la fotografía evidencia con alta confianza otro distinto, el sistema activa `isContradictory = true` y alerta visualmente ofreciendo:
     - `[ Mantener mi selección ]`
     - `[ Revisar / Cambiar al vehículo detectado ]`

5. **Separación Estricta de Capas (Tests H, I, J):**
   - **Datos de Compra (Capa Económica):** Precio (`askingPrice`), Kilometraje (`mileageKm`), Año y País no alteran las especificaciones técnicas ni las cotas del vehículo.
   - **Conocimiento del Modelo (Capa de Catálogo):** Averías endémicas (`knownProblems` / `modelProsCons`) provienen únicamente del repositorio oficial de modelos y nunca se fabrican para modelos no catalogados.
   - **Observaciones Reales (Capa Fotográfica):** Las evidencias de desgaste o daños se categorizan estrictamente como `OBSERVED` y no se confunden con fallos estadísticos del modelo (`KNOWN`).

---

## 4. Cobertura de Pruebas Automatizadas
La suite `src/__tests__/manualIdentificationValidation.test.ts` valida de extremo a extremo los 10 escenarios (TEST A – TEST J) garantizando que ningún caso límite degrade la fiabilidad del sistema.
