import { Counter } from "../app/modules/counter/counter.model";

/**
 * Generates a formatted unique ID for a given model.
 * Format: BR-{prefix}-{paddedValue}
 * example: BR-USR-000001
 * 
 * @param modelName - The name of the model to generate the ID for.
 * @param prefix - The short code for the model (e.g., USR, ODR).
 * @returns The formatted unique ID.
 */
export const generateFormattedId = async (modelName: string, prefix: string): Promise<string> => {
    const counter = await Counter.findOneAndUpdate(
        { modelName: modelName.toLowerCase() },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
    );

    const paddedValue = counter.sequence.toString().padStart(6, '0');
    return `BR-${prefix.toUpperCase()}-${paddedValue}`;
};
