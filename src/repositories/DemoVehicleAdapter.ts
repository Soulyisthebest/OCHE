import { LocalVehicleRepository } from './LocalVehicleRepository';

/**
 * Local static data adapter for Demo Mode (0 € cost)
 */
export class DemoVehicleAdapter extends LocalVehicleRepository {}

/** Singleton instance for application usage */
export const defaultVehicleRepository = new DemoVehicleAdapter();
