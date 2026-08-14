export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface CameraPreset {
  id: string;
  name: string;
  position: Vector3D;
  target: Vector3D;
  zoom: number;
}

export interface Hotspot3D {
  id: string;
  name: string;
  zone: 'engine' | 'brakes' | 'suspension' | 'transmission' | 'battery_electronics' | 'tires';
  position: Vector3D;
  status: 'normal' | 'warning' | 'danger';
  title: string;
  description: string;
  estimatedCost?: { min: number; max: number };
}

export interface Vehicle3DRenderModel {
  format: 'SVG' | 'CANVAS' | 'GLTF' | 'THREE';
  zones: string[];
  hotspots: Hotspot3D[];
  cameraPresets: CameraPreset[];
}

export class Vehicle3DAdapter {
  /**
   * Get camera angles for car exploration
   */
  static getCameraPresets(): CameraPreset[] {
    return [
      {
        id: 'front',
        name: 'Frontal',
        position: { x: 0, y: 1.2, z: 4.5 },
        target: { x: 0, y: 0.8, z: 0 },
        zoom: 1.0
      },
      {
        id: 'engine',
        name: 'Vano Motor',
        position: { x: 0, y: 2.0, z: 2.2 },
        target: { x: 0, y: 0.9, z: 1.5 },
        zoom: 1.4
      },
      {
        id: 'side',
        name: 'Lateral / Frenos',
        position: { x: 4.2, y: 1.0, z: 0 },
        target: { x: 0, y: 0.7, z: 0 },
        zoom: 1.1
      },
      {
        id: 'rear',
        name: 'Zaga / Escape',
        position: { x: 0, y: 1.2, z: -4.5 },
        target: { x: 0, y: 0.8, z: 0 },
        zoom: 1.0
      },
      {
        id: 'undercarriage',
        name: 'Bajos y Suspensión',
        position: { x: 2.5, y: -0.5, z: 0.5 },
        target: { x: 0, y: 0.3, z: 0 },
        zoom: 1.2
      }
    ];
  }

  /**
   * Get default interactive hotspots for mechanical exploration
   */
  static getHotspotsForVehicle(vehicleId?: string): Hotspot3D[] {
    return [
      {
        id: 'hs-turbo',
        name: 'Turbocompresor',
        zone: 'engine',
        position: { x: 0.3, y: 0.8, z: 1.4 },
        status: 'normal',
        title: 'Turbina de sobrealimentación',
        description: 'Verificar ausencia de silbido tipo ambulancia y holgura en el eje.',
        estimatedCost: { min: 600, max: 1200 }
      },
      {
        id: 'hs-timing',
        name: 'Correa de Distribución y Bomba',
        zone: 'engine',
        position: { x: -0.4, y: 0.7, z: 1.6 },
        status: 'warning',
        title: 'Kit de distribución',
        description: 'Sustitución recomendada cada 5-6 años o 120.000–180.000 km.',
        estimatedCost: { min: 380, max: 650 }
      },
      {
        id: 'hs-brakes-front',
        name: 'Discos y Pastillas Delanteras',
        zone: 'brakes',
        position: { x: 1.4, y: 0.4, z: 1.3 },
        status: 'warning',
        title: 'Equipo de frenado eje delantero',
        description: 'Comprobar rebaba del disco y espesor mínimo del forro de pastilla (>3 mm).',
        estimatedCost: { min: 140, max: 280 }
      },
      {
        id: 'hs-clutch',
        name: 'Embrague y Volante Bimasa',
        zone: 'transmission',
        position: { x: -0.1, y: 0.5, z: 0.8 },
        status: 'normal',
        title: 'Acoplamiento de transmisión',
        description: 'Comprobar que no patine en marchas largas a bajas vueltas.',
        estimatedCost: { min: 650, max: 1300 }
      },
      {
        id: 'hs-suspension-front',
        name: 'Amortiguadores y Silentblocks',
        zone: 'suspension',
        position: { x: 1.3, y: 0.6, z: 1.1 },
        status: 'normal',
        title: 'Copelas y brazos oscilantes',
        description: 'Comprobar ausencia de holguras o fugas de aceite en el vástago del amortiguador.',
        estimatedCost: { min: 250, max: 480 }
      },
      {
        id: 'hs-battery',
        name: 'Batería 12V y Alternador',
        zone: 'battery_electronics',
        position: { x: -0.5, y: 0.9, z: 1.8 },
        status: 'normal',
        title: 'Acumulador de arranque AGM / EFB',
        description: 'Tensión en reposo >12.4V y carga del alternador entre 13.8V y 14.4V.',
        estimatedCost: { min: 90, max: 220 }
      },
      {
        id: 'hs-dpf',
        name: 'Filtro de Partículas (DPF / FAP)',
        zone: 'engine',
        position: { x: 0.2, y: 0.3, z: -0.2 },
        status: 'normal',
        title: 'Trampa de hollín de escape',
        description: 'Comprobar que no haya aviso de regeneración pendiente ni saturación de cenizas.',
        estimatedCost: { min: 500, max: 1200 }
      }
    ];
  }
}
