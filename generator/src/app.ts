import fs from "fs"; // Filesystem
import path from "path"; // Path routing
import Generator from "./snapshot"; // Generator
import { logger } from "./utils/logger"; // Logging

// Config file path
const configPath: string = path.join(__dirname, "../config.json");

/**
 * Throws error and exists process
 * @param {string} erorr to log
 */
function throwErrorAndExit(error: string): void {
    logger.error(error);
    process.exit(1);
}

(async () => {
    // Check if config exists
    if (!fs.existsSync(configPath)) {
        throwErrorAndExit("Missing config.json. Please add.");
    }

    // Read config
    const configFile: Buffer = await fs.readFileSync(configPath);
    const configData = JSON.parse(configFile.toString());

    // Check if config contains airdrop key
    if (configData["snapshot"] === undefined) {
        throwErrorAndExit("Missing snapshot param in config. Please add.");
    }

    // Collect config
    const snapshot: string[] = configData.snapshot;

    // Initialize and call generator
    const generator = new Generator(snapshot);
    await generator.process();
})();
