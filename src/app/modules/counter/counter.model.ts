import { Schema, model } from "mongoose";
import { CounterModel, ICounter } from "./counter.interface";

const CounterSchema = new Schema<ICounter>(
    {
        modelName: {
            type: String,
            required: true,
            unique: true,
        },
        sequence: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const Counter = model<ICounter, CounterModel>("Counter", CounterSchema);
