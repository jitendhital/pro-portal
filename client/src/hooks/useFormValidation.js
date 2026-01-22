import { useState } from 'react';

/**
 * Custom hook for form validation
 * Provides validation state and methods for form fields
 */
export function useFormValidation() {
  const [errors, setErrors] = useState({});

  const validateField = (name, value, rules) => {
    const fieldErrors = [];

    if (rules.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${name} is required`);
    }

    if (rules.minLength && value && value.toString().length < rules.minLength) {
      fieldErrors.push(`${name} must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && value && value.toString().length > rules.maxLength) {
      fieldErrors.push(`${name} must be at most ${rules.maxLength} characters`);
    }

    if (rules.min && value !== undefined && Number(value) < rules.min) {
      fieldErrors.push(`${name} must be at least ${rules.min}`);
    }

    if (rules.max && value !== undefined && Number(value) > rules.max) {
      fieldErrors.push(`${name} must be at most ${rules.max}`);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      fieldErrors.push(rules.patternMessage || `${name} format is invalid`);
    }

    if (fieldErrors.length > 0) {
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[0] }));
      return false;
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      return true;
    }
  };

  const validateForm = (formData, validationRules) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const rules = validationRules[field];
      const value = formData[field];
      const fieldValid = validateField(field, value, rules);
      if (!fieldValid) {
        isValid = false;
      }
    });

    return isValid;
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
  };
}

