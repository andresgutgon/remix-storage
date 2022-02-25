/**
 * This is the equivalent on AdonisJS of a provider
 * https://github.com/adonisjs/drive/blob/develop/providers/DriveProvider.ts
 * In remix there's not CoI (control of inversion) or dependency injection. So
 * this will be a simple function that:
 * 1. Create a Storage instance
 * 2. Setup Drivers based on Drivers Config
 * 3. Decide what's the right Driver based in config and .env variables or maybe
 * better to pass this as config.
 * 4. Register LocalFileServer routes for the drivers (local, s3, Azure,...)
 * 5. Returns that singleton storage instance
 *
 */
export function createFileStorage() {
  console.log("")
}
