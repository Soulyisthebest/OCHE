# OCHE / CARCHECK AI — PHASE 10: TEST PLAN DE VALIDACIÓN REAL
## Guía de Pruebas Manuales para Usuarios y Evaluadores (Sin Conocimientos Técnicos)

---

### 1. OBJETIVO DEL PLAN DE PRUEBAS
Validar que **OCHE** funciona con precisión en situaciones reales de compra de vehículos de segunda mano:
- **Flujo fluido**: Desde la entrada de fotos y datos hasta el veredicto final.
- **Cero alucinaciones**: Si no sabe qué coche es, dice honestamente `UNKNOWN` o solicita verificación.
- **Distinción estricta**:
  - Un problema conocido del modelo (*Known Problem*) **NUNCA** se presenta como un fallo observado en esa unidad.
  - Una sospecha visual **NUNCA** se presenta como una avería mecánica confirmada.
  - El modo demo (*Demo Mode*) está claramente separado del análisis real (*Real AI Analysis*).
- **Límites físicos transparentes**: Explicar qué cosas **no se pueden comprobar por foto** (compresión, embrague, turbo a plena carga, embargos).

---

### 2. PROTOCOLO DEL FLUJO DE USUARIO (PASO A PASO)

```
[1. INICIO] 
  → Usuario pulsa "Voy a comprar un coche"
  → Selecciona País/Moneda (ej. España - EUR €)
  → (Opcional) Introduce precio anunciado y kilómetros
        ↓
[2. FOTOGRAFÍAS]
  → Elige "Modo Rápido" (4 fotos) o "Modo Completo" (8 fotos)
  → Toma o sube fotos reales desde la cámara o galería
  → Revisa que el botón de análisis se active
        ↓
[3. IDENTIFICACIÓN Y GROUNDING]
  → Gemini / Motor de Conocimiento procesa las imágenes
  → Muestra candidato sugerido (Marca, Modelo, Generación, Motor)
  → Nivel de confianza asignado
        ↓
[4. CONFIRMACIÓN DEL USUARIO]
  → El usuario confirma con 1 toque o ajusta datos si hay alguna discrepancia
        ↓
[5. INFORME COMPLETO DE COMPRA]
  → 🚗 Tu Coche (Datos técnicos consolidados)
  → 🎯 Valoración OCHE (Puntuación Dual y Veredicto)
  → 🤔 ¿Merece la pena? & ¿Por qué? (3 a 5 motivos determinantes)
  → 🟢 Lo Bueno / 🟠 Lo que hay que comprobar / 🔴 Riesgos Críticos
  → ⚪ Cosas no determinables por foto (inspección obligatoria)
  → 💰 Coste Total Real de Entrada (mantenimiento + tasas)
  → 🎯 Precio Objetivo de Negociación y Argumentario
  → 💬 Preguntas clave para el vendedor (con botón Copiar)
  → 🔍 Checklist interactivo para el mecánico
  → 👍 / 👎 Feedback en sesión
```

---

### 3. LOS 8 ESCENARIOS DE TEST OBLIGATORIOS

#### 🧪 TEST 1: Volkswagen Golf VII 2.0 TDI (Diésel Popular)
- **Propósito**: Comprobar identificación de un coche superventas diésel europeo con fiabilidad contrastada.
- **Datos de entrada sugeridos**: 145.000 km | 12.500 € | Año 2015.
- **Fotos a subir**: Frontal, lateral, cuadro con odómetro, vano motor.
- **Puntos críticos a verificar en el informe**:
  - [ ] ¿Identifica correctamente Volkswagen Golf VII 2.0 TDI (150 CV)?
  - [ ] ¿Alerta sobre el cambio de correa de distribución + bomba de agua por kilometraje/edad?
  - [ ] ¿Menciona la vigilancia del filtro de partículas (DPF/FAP) si hace mucha ciudad?
  - [ ] ¿El coste real de entrada incluye kit de distribución y cambio de aceite/filtros?
  - [ ] ¿El veredicto es favorable si el precio y estado son coherentes?

---

#### 🧪 TEST 2: Peugeot 208 1.2 PureTech (Gasolina con Riesgo Endémico)
- **Propósito**: Comprobar que el motor detecta la correa de distribución bañada en aceite (*wet timing belt*).
- **Datos de entrada sugeridos**: 85.000 km | 7.900 € | Año 2017.
- **Fotos a subir**: Frontal, trasera, motor PureTech, cuadro de mandos.
- **Puntos críticos a verificar en el informe**:
  - [ ] ¿Identifica Peugeot 208 1.2 PureTech?
  - [ ] ¿Incluye en **Riesgos Críticos** la degradación de la correa bañada en aceite y consumo de aceite?
  - [ ] ¿En **Preguntas al Vendedor** sugiere preguntar por la última revisión de la correa y chupón de aceite?
  - [ ] ¿En **Checklist de Mecánico** incluye comprobar el tapón de llenado de aceite con linterna para ver el estado de la correa?
  - [ ] ¿Ajusta la puntuación y pide precaución en la compra?

---

#### 🧪 TEST 3: Toyota Yaris 1.0 VVT-i (Urbano Muy Fiable)
- **Propósito**: Comprobar evaluación de un utilitario de gasolina de alta fiabilidad y bajo coste de mantenimiento.
- **Datos de entrada sugeridos**: 110.000 km | 6.200 € | Año 2014.
- **Fotos a subir**: Frontal, interior con desgaste de pedales/pomo, lateral.
- **Puntos críticos a verificar en el informe**:
  - [ ] ¿Identifica Toyota Yaris 1.0 (motor 1KR-FE con cadena de distribución)?
  - [ ] ¿Reconoce que tiene cadena y no requiere sustitución periódica como una correa de goma?
  - [ ] ¿Puntúa alto en fiabilidad mecánica (🟢 Lo Bueno)?
  - [ ] ¿Menciona desgaste habitual de embrague en uso 100% urbano?
  - [ ] ¿El coste de mantenimiento anual estimado es bajo/moderado?

---

#### 🧪 TEST 4: BMW 320d F30 (Berlina Premium Diésel)
- **Propósito**: Comprobar evaluación de coche premium con costes de recambio y mano de obra más elevados.
- **Datos de entrada sugeridos**: 185.000 km | 14.000 € | Año 2013.
- **Fotos a subir**: Frontal, interior de cuero/volante, vano motor.
- **Puntos críticos a verificar en el informe**:
  - [ ] ¿Identifica BMW Serie 3 (F30) 320d?
  - [ ] ¿Advierte sobre el siseo de la cadena de distribución (motor N47/B47) en arranque en frío?
  - [ ] ¿Calcula mano de obra y piezas acorde al segmento premium en el país seleccionado?
  - [ ] ¿Alerta sobre posibles amortiguadores o silentblocks fatigados por kilometraje (>180.000 km)?
  - [ ] ¿Recomienda comprobar el historial de mantenimiento en servicio oficial o especialista?

---

#### 🧪 TEST 5: Vehículo Desconocido (Prototipo, Coche Raro o No Catalogado)
- **Propósito**: Garantizar **Cero Alucinaciones**.
- **Fotos a subir**: Foto de un vehículo artesanal, buggy sin marca visible o maqueta.
- **Puntos críticos a verificar en el informe**:
  - [ ] ¿Evita inventarse que es un "Volkswagen Golf" u otro coche al azar?
  - [ ] ¿Devuelve `Vehículo No Identificado / Desconocido` con honestidad?
  - [ ] ¿Permite al usuario introducir manualmente la marca y modelo para continuar?
  - [ ] ¿Muestra el aviso de "Confianza baja / Requiere verificación manual"?
  - [ ] ¿NO genera costes de mantenimiento falsos ni inventa motores inexistentes?

---

#### 🧪 TEST 6: Vehículo Ambiguo (Ángulo Difuso o Modelos Gemelos)
- **Propósito**: Comprobar la gestión de incertidumbre (ej. SEAT Ibiza vs León visto solo desde un faro parcial).
- **Fotos a subir**: Foto recortada o ángulo donde no se aprecia claramente el modelo exacto.
- **Puntos críticos a verificar en el informe**:
  - [ ] ¿El selector de confirmación ofrece los candidatos más probables?
  - [ ] ¿Permite al usuario corregir el modelo con 1 clic antes de generar el informe?
  - [ ] ¿Actualiza instantáneamente todos los cálculos al seleccionar el modelo correcto?

---

#### 🧪 TEST 7: Fotografías Malas (Borradas, Nocturnas o Sin Coche)
- **Propósito**: Resiliencia y tolerancia a fallos en entradas defectuosas.
- **Fotos a subir**: Foto completamente oscura, borrosa o foto de una taza de café / mascota.
- **Puntos críticos a verificar en el informe**:
  - [ ] ¿La aplicación NO se congela ni genera pantalla en blanco?
  - [ ] ¿Informa que la imagen no permite un análisis concluyente?
  - [ ] ¿Ofrece la opción de volver a tomar la foto o usar un coche de muestra?
  - [ ] ¿Evita lanzar stack traces técnicos o errores HTTP sin capturar?

---

#### 🧪 TEST 8: Fotografías Incompletas (Solo 1 Foto de una Rueda o Faro)
- **Propósito**: Validar comportamiento ante escasez de datos visuales.
- **Fotos a subir**: Únicamente 1 foto del neumático o del retrovisor.
- **Puntos críticos a verificar en el informe**:
  - [ ] ¿Alerta de que faltan vistas clave (frontal, motor, interior)?
  - [ ] ¿Señala explícitamente en el informe los apartados que quedan como `INSUFFICIENT_DATA`?
  - [ ] ¿Mantiene la coherencia en la sección de "Cosas no comprobables por foto"?

---

### 4. MATRIZ DE VERIFICACIÓN DE REGLAS DE ORO

| Regla de Oro | Comportamiento Correcto Esperado | Comportamiento Incorrecto Prohibido |
| :--- | :--- | :--- |
| **Separación Real AI vs Demo** | Si se pulsa un coche demo, pone `[MODO DEMO]`. Si se analizan fotos con Gemini, pone `[ANÁLISIS IA: ALTA CONFIANZA]`. | Mezclar datos demo diciendo que son un análisis en vivo de IA. |
| **Problema Conocido vs Observado** | *"Este motor 1.2 PureTech tiene documentado riesgo de degradación de correa..."* | *"Se observa en tu foto que la correa está rota."* (Falso) |
| **Límites Físicos** | Sección visible: *"⚪ No determinable por foto: compresión, embrague, turbo a carga y cargas en DGT."* | Asegurar que el turbo o embrague están perfectos solo por ver una foto exterior. |
| **Resiliencia de Red** | Mensaje amable: *"No se pudo conectar con el servicio de análisis. Usando motor local de respaldo."* | Pantalla blanca, `Uncaught TypeError` o spinner infinito. |
| **Ergonomía Móvil** | Botones $\ge 44\text{ px}$, cámara directa, textos sin desbordar en pantallas pequeñas. | Botones diminutos, zooms accidentales o pérdida de fotos al rotar. |

---

### 5. CÓMO REGISTRAR LOS RESULTADOS
Utiliza el archivo adjunto **`PHASE_10_RESULTS_TEMPLATE.md`** para anotar los resultados observados durante la ejecución de cada uno de los 8 tests.
