import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API route for CARCHECK AI Analysis
  app.post('/api/analyze-car', async (req, res) => {
    try {
      const { photos, mileageKm, askingPrice } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        console.log('No GEMINI_API_KEY set, returning error code for client fallback');
        return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Prepare parts for Gemini multimodal with Grounded Automotive Knowledge Core
      const contentsParts: any[] = [
        {
          text: `Eres el motor experto de inspección de vehículos usados para CARCHECK AI / OCHE.
Analiza las fotografías proporcionadas del coche y genera un informe de evaluación detallado en ESPAÑOL.

REGLA ABSOLUTA DE GROUNDING (FUENTE DE VERDAD):
Utiliza como contexto y fuente primaria el catálogo canónico de OCHE / CARCHECK AI:
- Volkswagen Golf VII (Typ 5G, 2012-2019): Motor EA288 (códigos CRBC, CRLB, DEJA). Problemas conocidos: Bomba de agua (fugas/agarrotamiento electroválvula, 380-750 €), DPF por uso urbano excesivo.
- Peugeot 208 I (A9, 2012-2019): Motor 1.2 PureTech (EB2DT, EB2ADT). Problemas conocidos: Correa sumergida en aceite (Wet Belt) propensa a desintegración por dilución de gasolina con riesgo de obstrucción de chupona de aceite (650-1400 €), consumo de aceite.
- Toyota Yaris III (XP130, 2011-2020): Motor 1.0 VVT-i (1KR-FE). Problemas conocidos: Desgaste de embrague en ciclo 100% urbano (320-680 €), rezume leve en bomba de agua (140-320 €).
- BMW Serie 3 F30 (2012-2019): Motor 2.0d TwinPower (N47D20 / B47D20). Problemas conocidos: Cadena de distribución trasera en N47 hasta 2015 (1100-2400 €), refrigerador de EGR bajo campaña técnica (0-650 €).

INSTRUCCIONES CLAVE:
1. IDENTIFICACIÓN: Determina Marca, Modelo, Generación, Año estimado, Motorización, Combustible, Potencia HP y Cambio. Si no estás 100% seguro de un dato, pon needsConfirmation: true.
2. OBSERVACIONES VISUALES: Revisa exterior (golpes, abolladuras, pintura), interior (desgaste), neumáticos y motor.
   ¡REGLA CRÍTICA!: NUNCA afirmes que una pieza mecánica está funcionando perfectamente solo porque la foto parece normal.
3. DATOS DEL MODELO:
   - "LO BUENO": Puntos fuertes reales del modelo (fiabilidad, consumo, repuestos).
   - "LO MALO": Puntos débiles del modelo.
   - "PROBLEMAS CONOCIDOS": Fallos o averías conocidas del modelo. Diferencia siempre si es un problema general del modelo vs un problema observado en ESTE coche concreto.
4. PUNTUACIÓN (0-100): Asigna una puntuación realista y desglosada por categorías (Fiabilidad, Estado visible, Mantenimiento, Riesgo, Relación calidad/precio).
   - 80-100 = "Buena opción" (green)
   - 60-79 = "Precaución / negociar" (yellow)
   - 0-59 = "Alto riesgo" (red)
5. COSTE REAL DE COMPRA:
   - Precio anunciado: ${askingPrice || 'Estimación si no se proporciona'}
   - Transferencia/Trámites: ~180-250 €
   - Mantenimiento inicial recomendado: ~200-400 €
   - Reparaciones probables visibles: Calcula en base a los hallazgos.
   - Proporciona rangos de precio en Euros (€).
6. REPARACIONES DETALLADAS:
   - Nombre de la pieza, qué hace, por qué requiere atención, coste nueva, coste reacondicionada/usada (o null si no aplica), coste de mano de obra y prioridad ("Baja", "Media", "Alta").
7. CHECKLIST INTERACTIVO ("Antes de comprar"):
   - Tareas personalizadas para probar este modelo específico en persona (ej: arranque en frío, prueba de embrague, comprobar humo, ruidos). Incluye explicación sencilla para "¿Cómo lo compruebo?".
8. NOTA DE ADVERTENCIA OBLIGATORIA:
   - Incluye: "⚠️ No podemos comprobar esto mediante una fotografía." explicando la necesidad de prueba dinámica o mecánico.

Kilómetros aproximados o declarados: ${mileageKm ? `${mileageKm} km` : 'No especificado por el usuario'}
Precio pedido por vendedor: ${askingPrice ? `${askingPrice} €` : 'No especificado por el usuario'}`
        }
      ];

      // Add base64 images to Gemini prompt
      if (Array.isArray(photos)) {
        for (const p of photos) {
          if (p.base64 && p.base64.includes('base64,')) {
            const matches = p.base64.match(/^data:(image\/\w+);base64,(.+)$/);
            if (matches) {
              contentsParts.push({
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2]
                }
              });
            }
          }
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: contentsParts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              identity: {
                type: Type.OBJECT,
                properties: {
                  make: { type: Type.STRING },
                  model: { type: Type.STRING },
                  generation: { type: Type.STRING },
                  estimatedYearMin: { type: Type.INTEGER },
                  estimatedYearMax: { type: Type.INTEGER },
                  engine: { type: Type.STRING },
                  fuelType: { type: Type.STRING },
                  powerHp: { type: Type.INTEGER },
                  transmission: { type: Type.STRING },
                  confidenceScore: { type: Type.INTEGER },
                  needsConfirmation: { type: Type.BOOLEAN }
                },
                required: ['make', 'model', 'estimatedYearMin', 'estimatedYearMax', 'confidenceScore', 'needsConfirmation']
              },
              score: { type: Type.INTEGER },
              scoreLabel: { type: Type.STRING },
              scoreBadgeColor: { type: Type.STRING },
              scoreCategories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    weight: { type: Type.INTEGER },
                    description: { type: Type.STRING }
                  },
                  required: ['name', 'score', 'description']
                }
              },
              visualObservations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    part: { type: Type.STRING },
                    status: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    actionRequired: { type: Type.STRING }
                  },
                  required: ['category', 'part', 'status', 'title', 'description']
                }
              },
              modelProsCons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    isModelGeneral: { type: Type.BOOLEAN }
                  },
                  required: ['type', 'title', 'description', 'isModelGeneral']
                }
              },
              realCost: {
                type: Type.OBJECT,
                properties: {
                  askingPrice: { type: Type.NUMBER },
                  transferFees: { type: Type.NUMBER },
                  initialMaintenanceMin: { type: Type.NUMBER },
                  initialMaintenanceMax: { type: Type.NUMBER },
                  visibleRepairsMin: { type: Type.NUMBER },
                  visibleRepairsMax: { type: Type.NUMBER },
                  totalMin: { type: Type.NUMBER },
                  totalMax: { type: Type.NUMBER }
                },
                required: ['askingPrice', 'transferFees', 'totalMin', 'totalMax']
              },
              repairs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    partName: { type: Type.STRING },
                    whatItDoes: { type: Type.STRING },
                    whyAttentionNeeded: { type: Type.STRING },
                    costNewMin: { type: Type.NUMBER },
                    costNewMax: { type: Type.NUMBER },
                    laborCostMin: { type: Type.NUMBER },
                    laborCostMax: { type: Type.NUMBER },
                    totalEstimatedMin: { type: Type.NUMBER },
                    totalEstimatedMax: { type: Type.NUMBER },
                    priority: { type: Type.STRING },
                    category: { type: Type.STRING }
                  },
                  required: ['id', 'partName', 'whatItDoes', 'whyAttentionNeeded', 'totalEstimatedMin', 'totalEstimatedMax', 'priority']
                }
              },
              checklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    task: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    checked: { type: Type.BOOLEAN },
                    category: { type: Type.STRING }
                  },
                  required: ['id', 'task', 'explanation', 'checked', 'category']
                }
              },
              recommendation: { type: Type.STRING },
              cannotDetermineNote: { type: Type.STRING }
            },
            required: ['identity', 'score', 'scoreLabel', 'scoreBadgeColor', 'scoreCategories', 'visualObservations', 'modelProsCons', 'realCost', 'repairs', 'checklist', 'recommendation', 'cannotDetermineNote']
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error('Empty text from Gemini model');
      }

      const reportData = JSON.parse(resultText);
      reportData.id = `report-${Date.now()}`;
      reportData.createdAt = new Date().toISOString();
      reportData.mileageKm = mileageKm || 120000;
      reportData.userPrice = askingPrice || reportData.realCost.askingPrice || 8500;

      return res.json({ report: reportData });
    } catch (err: any) {
      console.error('Error in /api/analyze-car:', err);
      return res.status(500).json({ error: err?.message || 'Failed to analyze car' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
