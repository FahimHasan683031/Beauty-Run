import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Settings } from './settings.model';
import { ISettings } from './settings.interface';

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ commissionRate: 0 });
  }
  return settings;
};

const updateSettings = async (payload: Partial<ISettings>) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ commissionRate: 0 });
  }
  
  const updatedSettings = await Settings.findByIdAndUpdate(
    settings._id,
    payload,
    { new: true, runValidators: true }
  );

  return updatedSettings;
};

export const SettingsService = {
  getSettings,
  updateSettings,
};
