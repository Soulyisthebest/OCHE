# OCHE / CARCHECK AI — PHASE 17
## 3D UX INTEGRATION & USER EXPERIENCE SIMPLIFICATION
============================================================

### 1. OBJETIVO Y RESUMEN EJECUTIVO
La Fase 17 consolida la experiencia 3D dentro de CARCHECK eliminando la fricción técnica y unificando la visualización del vehículo en un flujo directo, intuitivo y comprensible: **"TOCO -> MIRO -> ENTIENDO"**.

Se han eliminado los nombres y términos técnicos de la experiencia del usuario (como `Car3DExplorer`, `Explode Mode`, `GLB`, `Meshopt`), sustituyéndolos por lenguaje claro, directo y humano (`VER EL COCHE`, `🚗 Exterior`, `🪑 Interior`, `🔧 Motor`, `💥 Ver por dentro`, `🧩 Lista de piezas`).

---

### 2. ACCESO DIRECTO DESDE LA FICHA DEL VEHÍCULO
- **Botón Principal en el Hero de la Ficha:** Se añade la acción destacada `[ 👀 VER EL COCHE ]` junto a Guardar y Compartir.
- **Módulo Visual Interactivo:** Tarjeta informativa integrada en el cuerpo del informe que invita a explorar el modelo en 3D (`👀 Ver y explorar este [Marca] [Modelo]`).
- **Integración en el Comparador:** Cada vehículo en el comparador de coches incluye la acción `[ 👀 VER EL COCHE ]` para inspección rápida sin obligar a abrir el visor automáticamente.

---

### 3. DETECCIÓN DINÁMICA DE CAPACIDADES
La interfaz se adapta dinámicamente según las capacidades declaradas en el asset (`Car3DAsset`) o modelo (`Car3DModel`):
- **`hasInterior`**:
  - `true`: Muestra el botón `[ 🪑 Interior ]` y permite enfocar el habitáculo (`CABIN`).
  - `false`: Oculta completamente el botón `[ 🪑 Interior ]`.
- **`hasEngine`**:
  - `true`: Muestra el botón `[ 🔧 Motor ]` y enfoca el grupo propulsor (`ENGINE`).
  - `false`: Oculta completamente el botón `[ 🔧 Motor ]`.
- **`hasDoors` / `hasHood`**:
  - Se habilitan controles de apertura únicamente cuando los nodos mecánicos existen en el asset.

---

### 4. NAVEGACIÓN Y VISTAS SIMPLIFICADAS
1. **🚗 Exterior (Vista Inicial):**
   - Muestra el coche completo con giro 360º y zoom táctil/ratón.
2. **🪑 Interior:**
   - Cámara situada en el habitáculo para inspeccionar volante, salpicadero y asientos (cuando está disponible).
3. **🔧 Motor:**
   - Enfoque directo en el vano motor con selección rápida de turbo, inyección, bomba de agua o distribución.
4. **💥 Ver por dentro:**
   - Separa las capas exteriores para visualizar los componentes mecánicos internos de forma didáctica.
5. **🧩 Lista de piezas (Sin 3D):**
   - Modo accesible de lectura rápida y filtrado para dispositivos de bajo consumo o usuarios que prefieran listas estructuradas.

---

### 5. TARJETA SIMPLIFICADA: "TOCO -> MIRO -> ENTIENDO"
Al tocar cualquier componente mecánico o punto interactivo, la tarjeta muestra de inmediato:
1. **Nombre del componente** (ej. *Turbocompresor*, *Discos de freno*).
2. **💡 ¿Qué hace?** (Explicación corta y comprensible).
3. **⚠️ En este modelo conviene revisar:** (Máximo 2 o 3 puntos concisos).
4. **💰 Coste estimado de reparación** (Rango medio y coste taller en divisa local).
5. **[ Ver más detalles técnicos ]** (Despliega pestañas técnicas avanzadas de comprobación, modos de fallo y desglose OEM/Aftermarket/Mano de obra).
6. **[ 💬 Preguntar a OCHE sobre esta pieza ]** (Conexión contextual con el asistente IA).

---

### 6. SEPARACIÓN CLARA: MODELO 3D VS. ANÁLISIS REAL
- **Modelo 3D:** Representa la arquitectura de ingeniería del vehículo y los puntos preventivos típicos de ese modelo.
- **Análisis Fotográfico:** Representa el estado real y específico de la unidad analizada por el usuario.
- **Lenguaje prudente y no alarmista:** La aplicación utiliza expresiones como *"En este modelo conviene revisar esto"* y nunca *"Esta pieza de tu coche está rota"* salvo que exista evidencia directa detectada en las fotos del escaneo.

---

### 7. VEHÍCULOS SIN MODELO 3D ESPECÍFICO
Cuando un vehículo analizado aún no cuenta con un modelo 3D dedicado:
- Se muestra un aviso constructivo: `🚗 VISTA 3D ESPECÍFICA EN DESARROLLO`.
- Se ofrece el botón `[ 🔧 Ver cómo funciona el coche ]` para explorar la arquitectura general de referencia.
- Se aclara explícitamente: *"Esta vista es general y no representa exactamente tu vehículo."*

---

### 8. OPTIMIZACIÓN MOBILE-FIRST Y ACCESIBILIDAD
- Todos los controles principales tienen áreas táctiles superiores a 44px (`min-h-[44px]`).
- Gestos táctiles fluidos: 1 dedo para rotar 360º, 2 dedos para pellizco y zoom (pinch-to-zoom).
- Contraste visual optimizado sobre paleta oscura `#0A0A0D` con acentos `cyan-400`, `amber-400` y `emerald-400`.
