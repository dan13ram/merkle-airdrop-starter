import fs from "fs"; // Filesystem
import path from "path"; // Path
import keccak256 from "keccak256"; // Keccak256 hashing
import MerkleTree from "merkletreejs"; // MerkleTree.js
import { logger } from "./utils/logger"; // Logging
import { getAddress, solidityKeccak256 } from "ethers/lib/utils"; // Ethers utils

// Output file path
const outputPath: string = path.join(__dirname, "../merkle.json");

function uniq(a: string[]): string[] {
    var seen: Record<string, boolean> = {};
    return a.filter(function (item: string) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

export default class Generator {
    // Airdrop recipients
    snapshot: string[] = [];

    /**
     * Setup generator
     * @param {number} decimals of token
     * @param {Record<string, number>} snapshot address to token claim mapping
     */
    constructor(snapshot: string[]) {
        this.snapshot = snapshot;
        // Checksum address
        this.snapshot = this.snapshot.map((address) => getAddress(address));
        this.snapshot = uniq(this.snapshot);
    }

    /**
     * Generate Merkle Tree leaf from address and value
     * @param {string} address of snapshot claimee
     * @param {string} value of snapshot tokens to claimee
     * @returns {Buffer} Merkle Tree node
     */
    generateLeaf(address: string): Buffer {
        return Buffer.from(
            // Hash in appropriate Merkle format
            solidityKeccak256(["address"], [address]).slice(2),
            "hex"
        );
    }

    async process(): Promise<void> {
        logger.info("Generating Merkle tree.");

        // Generate merkle tree
        const merkleTree = new MerkleTree(
            // Generate leafs
            this.snapshot.map((address) => this.generateLeaf(address)),
            // Hashing function
            keccak256,
            { sortPairs: true }
        );

        // Collect and log merkle root
        const merkleRoot: string = merkleTree.getHexRoot();
        logger.info(`Generated Merkle root: ${merkleRoot}`);

        // Collect and save merkle tree + root
        await fs.writeFileSync(
            // Output to merkle.json
            outputPath,
            // Root + full tree
            JSON.stringify({
                root: merkleRoot,
                tree: merkleTree
            })
        );
        logger.info("Generated merkle tree and root saved to Merkle.json.");
    }
}
