import { dbContext } from './preload.mjs';

declare global {
    interface Window {
        db: typeof dbContext;
    }
}
