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
      const { photos, mileageKm, askingPrice, vehicleContext, countryCode, currencySymbol } = req.body;

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

      const curr = currencySymbol || '€';
      const groundingBlock = vehicleContext
        ? `\nCONTEXTO DINÁMICO DEL VEHÍCULO SUMINISTRADO POR VEHICLE REPOSITORY:\n${vehicleContext}\n`
        : `\nINSTRUCCIÓN: Identifica objetivamente marca, modelo, generación y motor a partir de las evidencias visuales. Si no hay suficiente certeza, indica needsConfirmation: true y confidenceScore < 70.\n`;

      // Prepare parts for Gemini multimodal with Grounded Automotive Knowledge Core
      const contentsParts: any[] = [
        {
          text: `Eres el motor de análisis e inspección visual de vehículos usados para CARCHECK AI / OCHE.
Analiza las fotografías proporcionadas del coche y genera un informe de evaluación estructurado en ESPAÑOL.

${groundingBlock}

INSTRUCCIONES CLAVE Y PRINCIPIOS DE VERIFICABILIDAD:
1. IDENTIFICACIÓN OBJETIVA: Determina Marca, Modelo, Generación, Rango de años estimado, Motorización, Combustible, Potencia HP y Transmisión. Si no tienes certeza visual inequívoca, marca "needsConfirmation: true" con "confidenceScore" ponderado.
2. OBSERVACIONES VISUALES ("OBSERVED"): Revisa exterior (golpes, abolladuras, holguras de paneles, pintura), interior (desgaste de volante/pedales/asientos acorde a kilometraje), neumáticos (desgaste irregular/dibujo) y vano motor (fugas, estado de manguitos).
   ¡REGLA CRÍTICA!: NUNCA afirmes que un componente interno funciona perfectamente solo porque no se ve dañado en la foto.
3. DISTINCIÓN ENTRE AVERÍA CONOCIDA ("KNOWN") Y OBSERVACIÓN CONCRETA ("OBSERVED"):
   - "LO BUENO" (pro): Puntos fuertes reales del modelo.
   - "LO MALO" (con): Puntos débiles reconocidos.
   - "PROBLEMAS CONOCIDOS" (known_issue): Fallos endémicos generales del motor/modelo (marca isModelGeneral: true). NUNCA los des por presentes en esta unidad concreta salvo evidencia visual directa.
4. ESTIMACIONES PRELIMINARES DE REPARACIÓN Y PUESTA A PUNTO:
   - Proporciona posibles reparaciones sugeridas detectadas en las fotos.
   - La validación final de precios y costes exactos será contrastada por el motor de costes (CostEngine).
5. CHECKLIST PERSONALIZADO IN SITU:
   - Tareas concretas de inspección física antes de comprar este modelo específico (arranque en frío, comprobación de embrague, humo de escape, ruidos).
6. ADVERTENCIA OBLIGATORIA:
   - Indica claramente: "⚠️ No podemos comprobar componentes internos (compresión, desgaste de embrague o cadena) mediante una fotografía."

Kilómetros declarados: ${mileageKm ? `${mileageKm} km` : 'No especificado'}
Precio solicitado: ${askingPrice ? `${askingPrice} ${curr}` : 'No especificado'}`
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
