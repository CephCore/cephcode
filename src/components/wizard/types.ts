import type * as React from 'react';

export interface WizardContextValue<T> {
  currentStepIndex: number;
  totalSteps: number;
  wizardData: T;
  setWizardData: React.Dispatch<React.SetStateAction<T>>;
  updateWizardData: (updates: Partial<T>) => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (index: number) => void;
  cancel: () => void;
  title?: string;
  showStepCounter?: boolean;
}

export interface WizardProviderProps<T> {
  steps: Array<React.ComponentType<any>>;
  initialData?: T;
  onComplete: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  children?: React.ReactNode;
  title?: string;
  showStepCounter?: boolean;
}

export type WizardStepComponent<T = any> = React.ComponentType<{
  wizard: WizardContextValue<T>;
}>;
