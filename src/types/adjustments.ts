export type AdjustmentType =
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'exposure'
  | 'temperature';

export interface AdjustmentParams {
  adjustment: AdjustmentType;
  value: number; // -100 to 100
}
