import { useCallback, useEffect, useRef, useState } from 'react'
import * as Yup from 'yup'

export type ValidationSchema = Yup.ObjectSchema<Record<string, unknown>>

export interface UseValidationProps<T extends Record<string, unknown>> {
  values: T
  validationSchema: ValidationSchema
  validateOnChange: boolean
}

export const useValidation = <T extends Record<string, unknown>>({
  values,
  validationSchema,
  validateOnChange,
}: UseValidationProps<T>) => {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const prevValuesRef = useRef(values)

  /**
   * Validate a single field in the form
   */
  const validateField = useCallback(
    async (name: keyof T) => {
      try {
        await validationSchema.validateAt(name as string, values)
        setErrors((prev) => ({ ...prev, [name]: undefined }))
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          setErrors((prev) => ({ ...prev, [name]: error.message }))
        }
      }
    },
    [validationSchema, values]
  )

  /**
   * Validate the entire form and mark all invalid fields
   */
  const validateForm = useCallback(async () => {
    const validationErrors: Partial<Record<keyof T, string>> = {}
    for (const key of Object.keys(values) as Array<keyof T>) {
      try {
        await validationSchema.validateAt(key as string, values)
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          validationErrors[key] = error.message
        }
      }
    }
    setErrors(validationErrors)
    return validationErrors
  }, [validationSchema, values])

  /**
   * Optionally validate a field on blur
   */
  const handleBlur = useCallback(
    (name: keyof T) => {
      validateField(name)
    },
    [validateField]
  )

  useEffect(() => {
    if (validateOnChange) {
      Object.keys(values).forEach((key) => {
        if (values[key as keyof T] !== prevValuesRef.current[key as keyof T]) {
          validateField(key as keyof T)
        }
      })
    }
    prevValuesRef.current = values
  }, [values, validateOnChange, validateField])

  return {
    errors,
    validateField,
    validateForm,
    handleBlur,
  }
}