export class APIRotator {
    private keys: string[] = [];
    private currentIndex: number = 0;
    private serviceName: string;

    constructor(envVarName: string, serviceName: string) {
        this.serviceName = serviceName;
        const envValue = process.env[envVarName];
        if (envValue) {
            this.keys = envValue.split(',').map(k => k.trim()).filter(k => k);
        } else {
            console.warn(`⚠️ [APIRotator] No keys found for ${serviceName} in ${envVarName}`);
        }
    }

    getNextKey(): string | null {
        if (this.keys.length === 0) return null;

        const key = this.keys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;

        // Log rotation only if we actually shifted (avoid spam if 1 key)
        if (this.keys.length > 1) {
            // console.log(`🔄 [${this.serviceName}] Rotated to key index ${this.currentIndex}`);
        }

        return key;
    }

    getKeyCount(): number {
        return this.keys.length;
    }
}
