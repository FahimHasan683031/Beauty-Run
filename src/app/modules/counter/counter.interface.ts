import { Model } from "mongoose";

export type ICounter = {
    modelName: string;
    sequence: number;
};

export type CounterModel = Model<ICounter>;
