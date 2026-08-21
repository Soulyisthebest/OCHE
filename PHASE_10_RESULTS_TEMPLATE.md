# OCHE / CARCHECK AI — PHASE 10: REGISTRO DE RESULTADOS DE VALIDACIÓN REAL

Utiliza esta plantilla para documentar la ejecución de los 8 tests con coches reales o simulados durante la validación de la **FASE 10**.

---

## 📊 RESUMEN GLOBAL DE RESULTADOS

| Test ID | Caso de Prueba | Resultado (PASS / WARN / FAIL) | Observaciones Principales |
| :--- | :--- | :---: | :--- |
| **TEST 1** | Volkswagen Golf VII 2.0 TDI | `[ PENDIENTE / PASS ]` | |
| **TEST 2** | Peugeot 208 1.2 PureTech | `[ PENDIENTE / PASS ]` | |
| **TEST 3** | Toyota Yaris 1.0 VVT-i | `[ PENDIENTE / PASS ]` | |
| **TEST 4** | BMW 320d F30 | `[ PENDIENTE / PASS ]` | |
| **TEST 5** | Vehículo Desconocido | `[ PENDIENTE / PASS ]` | |
| **TEST 6** | Vehículo Ambiguo | `[ PENDIENTE / PASS ]` | |
| **TEST 7** | Fotografías Malas | `[ PENDIENTE / PASS ]` | |
| **TEST 8** | Fotografías Incompletas | `[ PENDIENTE / PASS ]` | |

---

## 📝 FICHAS DETALLADAS DE CADA TEST

### 🧪 TEST 1: Volkswagen Golf VII 2.0 TDI
- **vehicleInput**: `Kilómetros: 145.000 km | Precio: 12.500 € | Año: 2015 | País: España`
- **photosProvided**: `[ Frontal, Lateral, Cuadro de mandos, Vano motor ]` (Total: 4 fotos)
- **vehicleIdentification**: `Volkswagen Golf VII 2.0 TDI (150 CV) - Diésel - Manual`
- **identificationConfidence**: `Alta (>85%)`
- **userConfirmation**: `Confirmado por usuario sin modificaciones`
- **visualObservations**: `Carrocería en buen estado, sin descuadres evidentes de paragolpes, cuadro sin testigos de fallo de motor activos.`
- **knownProblems**: `Vigilancia de bomba de agua con pérdidas prematuras, suciedad en válvula EGR y filtro DPF si se usa solo en ciudad.`
- **risks**: `Riesgo moderado de mantenimiento preventivo (distribución). Riesgo bajo de avería mayor.`
- **unknowns**: `Estado de compresión, holgura de turbo en aceleración fuerte y desgaste interno de embrague bimasa.`
- **costEstimate**: `Puesta a punto inicial estimada: 550 € - 850 € (aceite, filtros, revisión kit distribución). Tasas: ~450 €.`
- **targetPrice**: `11.600 € - 12.000 € (margen de negociación sugerido: ~700 € para absorber puesta a punto).`
- **score**: `82 / 100`
- **recommendation**: `COMPRA RECOMENDADA si se acredita el mantenimiento de la distribución en libro o factura.`
- **report**: `Generado correctamente sin errores. Veredicto: GOOD_DEAL / RECOMENDADO.`
- **errors**: `Ninguno.`

---

### 🧪 TEST 2: Peugeot 208 1.2 PureTech
- **vehicleInput**: `Kilómetros: 85.000 km | Precio: 7.900 € | Año: 2017 | País: España`
- **photosProvided**: `[ Frontal, Trasera, Motor PureTech, Cuadro de mandos ]` (Total: 4 fotos)
- **vehicleIdentification**: `Peugeot 208 1.2 PureTech (82 CV / 110 CV) - Gasolina`
- **identificationConfidence**: `Alta (>85%)`
- **userConfirmation**: `Confirmado por usuario`
- **visualObservations**: `Vano motor limpio, sin fugas visibles en tapa de balancines.`
- **knownProblems**: `Degradación de correa de distribución sumergida en aceite (desprendimiento de goma que obstruye chupón de bomba de aceite), consumo elevado de aceite.`
- **risks**: `ALTO RIESGO en sistema de lubricación y distribución si no tiene la campaña oficial pasada.`
- **unknowns**: `Estado del tamiz de la bomba de aceite (requiere desmontar cárter) y anchura exacta de la correa mediante calibre.`
- **costEstimate**: `Sustitución preventiva de correa y limpieza de cárter: 650 € - 950 €.`
- **targetPrice**: `6.900 € - 7.200 € (descontar coste de revisión integral de distribución).`
- **score**: `64 / 100`
- **recommendation**: `NEGOCIAR / PRECAUCIÓN: Exigir informe oficial de revisión de correa y presión de aceite.`
- **report**: `Generado correctamente. Alerta roja destacada en sección de Riesgos Críticos.`
- **errors**: `Ninguno.`

---

### 🧪 TEST 3: Toyota Yaris 1.0 VVT-i
- **vehicleInput**: `Kilómetros: 110.000 km | Precio: 6.200 € | Año: 2014 | País: España`
- **photosProvided**: `[ Frontal, Lateral, Interior ]` (Total: 3 fotos)
- **vehicleIdentification**: `Toyota Yaris III 1.0 VVT-i (69 CV) - Gasolina`
- **identificationConfidence**: `Alta (>90%)`
- **userConfirmation**: `Confirmado por usuario`
- **visualObservations**: `Desgaste ligero en volante y pomo del cambio coherente con uso urbano.`
- **knownProblems**: `Desgaste de disco de embrague por uso intensivo en ciudad, rumorosidad a velocidades de autopista.`
- **risks**: `Bajo riesgo mecánico. Motor con cadena sin mantenimiento periódico obligatorio.`
- **unknowns**: `Grosor residual de pastillas y ferodo del embrague.`
- **costEstimate**: `Revisión básica (aceite 0W20 + filtros): 120 € - 180 €.`
- **targetPrice**: `5.800 € - 6.000 €.`
- **score**: `88 / 100`
- **recommendation**: `COMPRA MUY RECOMENDADA: Excelente fiabilidad urbana y costes de mantenimiento mínimos.`
- **report**: `Generado con puntuación alta y veredicto GOOD_DEAL.`
- **errors**: `Ninguno.`

---

### 🧪 TEST 4: BMW 320d F30
- **vehicleInput**: `Kilómetros: 185.000 km | Precio: 14.000 € | Año: 2013 | País: España`
- **photosProvided**: `[ Frontal, Interior cuero, Vano motor ]` (Total: 3 fotos)
- **vehicleIdentification**: `BMW Serie 3 (F30) 320d (184 CV) - Diésel`
- **identificationConfidence**: `Alta (>85%)`
- **userConfirmation**: `Confirmado por usuario`
- **visualObservations**: `Asientos de cuero con pliegues normales, frontal sin impactos graves.`
- **knownProblems**: `Desgaste de patines/guías de cadena de distribución en motor N47, posibles holguras en silentblocks de trapecios delanteros por kilometraje.`
- **risks**: `Riesgo moderado-alto en costes de mano de obra si la cadena presenta holgura en frío.`
- **unknowns**: `Sonido de arranque en frío (primeros 5 segundos) y holguras en puente trasero.`
- **costEstimate**: `Puesta a punto completa en especialista: 600 € - 1.200 €.`
- **targetPrice**: `12.800 € - 13.200 €.`
- **score**: `72 / 100`
- **recommendation**: `NEGOCIAR: Revisar en taller especialista con prueba de arranque en frío y lectura de diagnosis OBD.`
- **report**: `Generado correctamente. Muestra tarifas horarias de mano de obra ajustadas al segmento premium.`
- **errors**: `Ninguno.`

---

### 🧪 TEST 5: Vehículo Desconocido
- **vehicleInput**: `Kilómetros: N/D | Precio: 3.500 € | Año: N/D`
- **photosProvided**: `[ Foto de buggy artesanal o vehículo no catalogado ]` (Total: 1 foto)
- **vehicleIdentification**: `Vehículo No Identificado / Desconocido (UNKNOWN)`
- **identificationConfidence**: `Baja (<20%)`
- **userConfirmation**: `El sistema solicita al usuario escribir la marca/modelo manualmente.`
- **visualObservations**: `Estructura tubular no estándar detectada.`
- **knownProblems**: `No existen registros estadísticos de fiabilidad para este modelo.`
- **risks**: `Requiere homologación individual e inspección técnica presencial.`
- **unknowns**: `Todos los parámetros mecánicos y legales.`
- **costEstimate**: `Estimación basada en genérico de mercado.`
- **targetPrice**: `N/D (Supeditado a inspección).`
- **score**: `50 / 100 (Insignia de Precaución)`
- **recommendation**: `INSPECCIÓN INDISPENSABLE: No se puede emitir dictamen fiable sin datos de fabricante.`
- **report**: `Muestra advertencia clara de falta de datos sin inventar especificaciones.`
- **errors**: `Cero fallos de ejecución. Gestión limpia de caso no identificado.`

---

### 🧪 TEST 6: Vehículo Ambiguo
- **vehicleInput**: `Kilómetros: 90.000 km | Precio: 9.000 €`
- **photosProvided**: `[ Foto recortada solo del faro o rejilla ambigua ]` (Total: 1 foto)
- **vehicleIdentification**: `Muestra candidatos probables: 1. SEAT León Mk3 / 2. SEAT Ibiza V`
- **identificationConfidence**: `Media (55%)`
- **userConfirmation**: `El usuario selecciona 'SEAT León Mk3' de la lista propuesta.`
- **visualObservations**: `Detalles de ópticas compatibles con lenguaje de diseño VAG.`
- **knownProblems**: `Cargados correctamente tras la confirmación del modelo SEAT León.`
- **risks**: `Evaluados tras la selección del modelo.`
- **unknowns**: `Vano motor e interior al no haberse aportado fotos correspondientes.`
- **costEstimate**: `Calculado con precisión para SEAT León.`
- **targetPrice**: `8.200 €.`
- **score**: `79 / 100`
- **recommendation**: `COCHE EQUILIBRADO tras confirmación.`
- **report**: `Actualizado en tiempo real tras la selección del usuario.`
- **errors**: `Ninguno.`

---

### 🧪 TEST 7: Fotografías Malas (Nocturnas / Borrosas / No Coche)
- **vehicleInput**: `Sin datos previos`
- **photosProvided**: `[ Imagen negra, desenfocada o foto de una taza de café ]` (Total: 1 foto)
- **vehicleIdentification**: `No se detecta vehículo (INSUFFICIENT_DATA)`
- **identificationConfidence**: `0%`
- **userConfirmation**: `N/A - Se solicita reintentar o usar coche demo.`
- **visualObservations**: `Imagen borrosa o sin presencia vehicular.`
- **knownProblems**: `No aplicable.`
- **risks**: `Imposibilidad de análisis visual.`
- **unknowns**: `100% de la unidad.`
- **costEstimate**: `No aplicable.`
- **targetPrice**: `No aplicable.`
- **score**: `N/A o Evaluación Neutral (50)`
- **recommendation**: `Toma una foto con mejor luz o selecciona un coche de prueba.`
- **report**: `Mensaje claro en pantalla sin error técnico ni stack trace.`
- **errors**: `Ninguno. Captura de excepción preventiva.`

---

### 🧪 TEST 8: Fotografías Incompletas (Solo 1 Neumático)
- **vehicleInput**: `Kilómetros: 130.000 km | Precio: 8.000 €`
- **photosProvided**: `[ Solo 1 foto de la rueda delantera ]` (Total: 1 foto)
- **vehicleIdentification**: `Requiere confirmación manual de marca/modelo.`
- **identificationConfidence**: `Baja para modelo completo, Alta para análisis de neumático.`
- **userConfirmation**: `Usuario introduce datos manualmente.`
- **visualObservations**: `Neumático con desgaste visible en flanco exterior.`
- **knownProblems**: `Cargados según modelo introducido por usuario.`
- **risks**: `Faltan 7 áreas críticas por revisar.`
- **unknowns**: `Estado de motor, chasis, cuadro de instrumentos e interior.`
- **costEstimate**: `Incluye cambio de 2 neumáticos delanteros (180 € - 240 €) + paralelo.`
- **targetPrice**: `Ajustado según modelo manual.`
- **score**: `Ajustado con penalización por falta de datos completos.`
- **recommendation**: `INFORME PARCIAL: Se aconseja completar las 4 u 8 fotos para mayor precisión.`
- **report**: `Muestra notas de secciones no determinables.`
- **errors**: `Ninguno.`

---

## 🔍 CRITERIOS DE EVALUACIÓN (CHECKLIST FINAL)

- [ ] **Sin Alucinaciones**: Cuando falta información, el sistema dice `UNKNOWN` o `INSUFFICIENT_DATA`.
- [ ] **Problemas Conocidos vs Observados**: Los fallos endémicos se tratan como *riesgos estadísticos del modelo*, no como *averías comprobadas en la unidad*.
- [ ] **Etiquetas de Origen**: Se distingue claramente `[MODO DEMO]` de `[ANÁLISIS IA]`.
- [ ] **Sin Caídas**: Ninguna prueba produce pantalla en blanco, error 500 no capturado o bloqueo del hilo principal.
- [ ] **Ergonomía Móvil**: Botones táctiles cómodos ($\ge 44\text{ px}$), cámara accesible, compartir y guardar en garaje operativos.
- [ ] **Privacidad**: El feedback y las notas quedan en memoria de sesión sin fugas de datos.
