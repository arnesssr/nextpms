// Product creation specific types
export interface ProductCreationState {
  step: number;
  isValid: boolean;
  data: Partial<any>;
}

export interface ProductCreationProps {
  onSuccess?: (product: any) => void;
  onCancel?: () => void;
  initialData?: Partial<any>;
}
