import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface';

const settingsSchema = new Schema<ISettings>(
  {
    commissionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = model<ISettings>('Settings', settingsSchema);
