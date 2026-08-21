# PHASE 10 — DIAGNÓSTICO DEL PIPELINE DE IDENTIFICACIÓN VISUAL

## A. PHOTO INPUT (Entrada de Fotografías)
- **Captura:** `PhotoScanner.tsx` captura archivos de imagen (`File`) en ranuras funcionales (`front`, `back`, `left`, `right`, `interior`, `dashboard`, `engine`, `tires`).
- **Compresión y Preprocesamiento:** `imageCompressor.ts` redimensiona proporcionalmente a un ancho/alto máximo de `1200px` con calidad JPEG `0.82` mediante HTML5 Canvas `toDataURL('image/jpeg', 0.82)`.
- **Formato transportado:** `data:image/jpeg;base64,...` con longitud típica de 80.000–350.000 caracteres por toma.
- **Validación de integridad:** Solo se envían al backend las ranuras efectivamente capturadas por el usuario. No se inyectan imágenes de previsualización, placeholders ni coches demo en el flujo real.

---

## B. GEMINI REQUEST (Petición Multimodal)
- **Ruta de Backend:** `/api/analyze-car` en `server.ts` (Express + Vite).
- **Modelo:** `gemini-3.7-flash` con SDK `@google/genai`.
- **Contenido multimodal:** Se extrae el payload base64 y el MIME type (`image/jpeg`) convirtiéndolo a objetos `inlineData: { mimeType, data }`.
- **Prompt:**
  - Solicita identificación objetiva de Marca, Modelo, Generación, Años estimados, Motor, Combustible, Potencia HP y Transmisión.
  - Exige `needsConfirmation: true` y `confidenceScore < 70` ante cualquier ambigüedad visual.
  - **No contiene instrucciones ni sesgos** que restrinjan o fuercen la selección hacia vehículos demo.

---

## C. GEMINI RESPONSE (Respuesta de IA Visual)
- **Formato:** JSON estructurado mediante `responseSchema` (definido con tipos estrictos del SDK `@google/genai`).
- **Bloque `identity` extraído:**
```json
{
  "make": "Toyota",
  "model": "Yaris",
  "generation": "III (XP130)",
  "estimatedYearMin": 2011,
  "estimatedYearMax": 2020,
  "engine": "1.0 VVT-i 69 CV",
  "fuelType": "Gasolina",
  "powerHp": 69,
  "transmission": "Manual",
  "confidenceScore": 92,
  "needsConfirmation": false
}
```

---

## D. PARSER RESULT (Procesamiento en `VehicleIdentificationService`)
- Si no se proporcionan pistas manuales de marca/modelo, el servicio invoca visualmente el endpoint `/api/analyze-car`.
- Mapea:
  - `effectiveBrandHint = identity.make`
  - `effectiveModelHint = identity.model`
  - `effectiveGeneration = identity.generation`
  - `effectiveEngine = identity.engine`
  - `effectiveFuel = identity.fuelType`
  - `geminiConfidence = identity.confidenceScore / 100`
- Aplica registro diagnóstico unificado `[OCHE_DIAGNOSTIC] identificationInput`.

---

## E. RESOLVER RESULT (`VehicleResolverService`)
- Normaliza marcas y modelos mediante alias automotrices canónicos (`GLOBAL_BRANDS`, `GLOBAL_MODELS`, `GLOBAL_GENERATIONS`).
- Aplica prior estricto de filtrado: si la marca o modelo no coinciden, se descartan como candidatos incompatibles.
- Genera candidatos ordenados por puntuación de coincidencia (`candidates`, `candidateScores`, `bestMatch`, `ambiguityReason`).

---

## F. REPOSITORY RESULT (`LocalVehicleRepository`)
- Consulta el repositorio de dominio para emparejar con vehículos que dispongan de modelado técnico detallado:
  - **Vehículo Soportado (ej. Toyota Yaris, BMW Serie 3, Peugeot 208):** Devuelve el objeto de dominio completo (`matchedVehicleId: 'toyota-yaris-hybrid'`).
  - **Vehículo No Soportado (ej. Ford Focus, Renault Clio):** `matchedVehicleId: null`.

---

## G. FINAL RESULT (Resultado Final del Análisis)
- **Vehículo Soportado:** 
  - `status: CONFIRMED` (o `NEEDS_VERIFICATION` si la confianza es inferior a 0.70 o requiere confirmación).
  - La tarjeta de confirmación `VehicleConfirmCard` muestra los datos específicos del vehículo identificado para validación del usuario.
- **Vehículo No Catalogado:** 
  - `status: IDENTIFIED_BUT_UNSUPPORTED`.
  - Mantiene el nombre real reconocido (ej. "Ford Focus") y no salta a ningún vehículo demo preconfigurado.
- **Fotografía Vacía / Desconocida:** 
  - `status: UNKNOWN` (`vehicleName: 'Vehículo No Identificado Modelo Desconocido'`).

---

## CONCLUSIÓN Y CAUSA RAÍZ

```
ROOT_CAUSE = RESOLVER / UI FALLBACK CONTAMINATION
```

### Causas detectadas y subsanadas:
1. **Contaminación de Fallback en `sessionToLegacyReport`:** `AnalysisSessionService.ts` tenía configurado como fallback `'Volkswagen Golf VII'` y motor `'2.0 TDI CR 150 CV'`, lo que provocaba que cualquier sesión con datos de identificación parciales o en fallback se sobrescribiera visualmente con un Golf 7. Reemplazado por marcadores neutrales (`Vehículo No Identificado`).
2. **Prior Estricto en `VehicleResolverService`:** Si se pasaban pistas incompatibles, el resolver anteriormente penalizaba la puntuación pero podía mantener candidatos residuales. Se implementó descarte estricto (`continue`/descarte) ante incompatibilidad de marca o modelo.
3. **Manejo Seguro de API del Portapapeles:** Se protegieron las llamadas a `navigator.clipboard.writeText` con bloques `try/catch` para prevenir excepciones por permisos en entornos iFrame.
