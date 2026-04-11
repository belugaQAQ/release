import { useState, useCallback } from 'react';
import {
  validateVersion,
  validateUrl,
  validateSize,
  validateChangelog,
  validateSha256,
  FieldValidation,
} from '../utils/validators';

export interface FormFields {
  version: string;
  url: string;
  size: string | number;
  changelog: string;
  sha256: string;
}

export interface FormErrors {
  version?: string;
  url?: string;
  size?: string;
  changelog?: string;
  sha256?: string;
}

interface UseFormValidationReturn {
  values: FormFields;
  errors: FormErrors;
  isFormValid: boolean;
  updateField: (field: keyof FormFields, value: any) => void;
  validateField: (field: keyof FormFields) => FieldValidation;
  resetForm: () => void;
}

const INITIAL_VALUES: FormFields = {
  version: '',
  url: '',
  size: '',
  changelog: '',
  sha256: '',
};

export function useFormValidation(): UseFormValidationReturn {
  const [values, setValues] = useState<FormFields>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback(
    (field: keyof FormFields): FieldValidation => {
      switch (field) {
        case 'version':
          return validateVersion(values.version);
        case 'url':
          return validateUrl(values.url);
        case 'size':
          return validateSize(values.size);
        case 'changelog':
          return validateChangelog(values.changelog);
        case 'sha256':
          return validateSha256(values.sha256);
        default:
          return { valid: true };
      }
    },
    [values]
  );

  const updateField = useCallback(
    (field: keyof FormFields, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      let validation: FieldValidation;

      switch (field) {
        case 'version':
          validation = validateVersion(value);
          break;
        case 'url':
          validation = validateUrl(value);
          break;
        case 'size':
          validation = validateSize(value);
          break;
        case 'changelog':
          validation = validateChangelog(value);
          break;
        case 'sha256':
          validation = validateSha256(value);
          break;
        default:
          validation = { valid: true };
      }

      setErrors((prev) => ({
        ...prev,
        [field]: validation.valid ? undefined : validation.error,
      }));
    },
    []
  );

  const isFormValid =
    Object.values(errors).every((e) => !e) &&
    Object.values(values).every((v) => v !== '' && v !== undefined);

  const resetForm = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
  }, []);

  return {
    values,
    errors,
    isFormValid,
    updateField,
    validateField,
    resetForm,
  };
}
