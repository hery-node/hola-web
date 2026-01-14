/**
 * Component instance type definitions
 * These are used when accessing component methods via template refs
 */

/** ConfirmDialog component instance type */
export interface ConfirmDialogInstance {
  open: (title: string, message: string) => Promise<boolean>
}

/** BasicWindow component instance type */
export interface BasicWindowInstance {
  show: () => void
  close: () => void
}

/** BasicForm component instance type */
export interface BasicFormInstance {
  resetForm: () => Promise<void>
  resetValidation: () => Promise<void>
  validate: () => Promise<boolean>
  submitForm: () => void
}

/** EditForm component instance type */
export interface EditFormInstance {
  resetForm: () => Promise<void>
  validate: () => Promise<boolean>
  initFormData: () => Promise<void>
  cancel: () => void
}
