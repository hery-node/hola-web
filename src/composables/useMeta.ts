/**
 * Meta composable for entity metadata management
 * Provides field, header, and form configuration from server metadata
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { getRefLabels, getEntityMeta } from '@/core/axios'
import { getType } from '@/core/type'
import type {
  EntityMeta,
  EntityField,
  TypeDefinition,
  SelectItem,
  ValidationRule,
} from '@/types'

export interface UseMetaOptions {
  entity: Ref<string> | string
  entityLabel?: Ref<string> | string
  fields?: Ref<EntityField[]> | EntityField[]
  mergeWithServer?: boolean
  headers?: Ref<EntityField[]> | EntityField[]
}

export interface FormField extends Omit<EntityField, 'inputType'> {
  label: string
  hint: string
  inputType: string
  rules: ValidationRule[]
  items?: SelectItem[]
}

export interface HeaderField extends EntityField {
  text: string
  value: string
  format?: (value: unknown, t?: (key: string) => string) => string
}

export interface UseMetaReturn {
  meta: Ref<EntityMeta | null>
  entityLabel: ComputedRef<string>
  entityLabelText: ComputedRef<string>
  loadMeta: () => Promise<void>
  getSearchFields: () => Promise<FormField[]>
  getEditFields: (updateMode: boolean, view: string) => Promise<FormField[]>
  getCloneFields: () => Promise<FormField[]>
  getFormFields: (serverFields: EntityField[]) => Promise<FormField[]>
  getPropertyFields: () => Promise<FormField[]>
  getTableHeaders: (expandFields?: string[]) => Promise<HeaderField[]>
  getFieldType: (field: EntityField) => TypeDefinition
  formatFieldValue: (field: FormField | HeaderField, value: unknown) => string
  getFieldLabel: (field: EntityField) => string
  getFieldLabelByName: (name: string) => string
}

/**
 * Composable for entity metadata management
 */
export function useMeta(options: UseMetaOptions): UseMetaReturn {
  const {
    entity,
    entityLabel,
    fields = [],
    mergeWithServer = false,
    headers = [],
  } = options

  const { t, te } = useI18n()
  const meta = ref<EntityMeta | null>(null)

  // Resolve refs to values
  const getEntity = (): string => (typeof entity === 'string' ? entity : entity.value)
  const getFields = (): EntityField[] => (Array.isArray(fields) ? fields : fields.value)
  const getHeaders = (): EntityField[] => (Array.isArray(headers) ? headers : headers.value)
  const getEntityLabel = (): string | undefined =>
    entityLabel ? (typeof entityLabel === 'string' ? entityLabel : entityLabel.value) : undefined

  /**
   * Get entity label from prop or i18n
   */
  const entityLabelText = computed(() => {
    const label = getEntityLabel()
    if (label) return label
    const entityName = getEntity()
    return entityName?.trim().length > 0 ? t(`${entityName}._label`) : ''
  })

  /**
   * Load entity metadata from server
   */
  const loadMeta = async (): Promise<void> => {
    const entityName = getEntity()
    if (entityName?.trim().length > 0) {
      meta.value = await getEntityMeta(entityName)
    }
  }

  /**
   * Set field type properties (multiple, items, ref labels)
   */
  const setFieldType = async (field: FormField, type: TypeDefinition): Promise<void> => {
    if (type.multiple) {
      field.multiple = type.multiple
    }
    if (type.items) {
      field.items = type.items({ t })
    }
    if (field.ref) {
      field.items = await getRefLabels(field.ref, getEntity(), field.query ?? '')
    }
    setFieldPrefixSuffix(field, type)
  }

  /**
   * Set field prefix, suffix, and icon
   */
  const setFieldPrefixSuffix = (field: FormField, type: TypeDefinition): void => {
    const prefix = field.prefix ?? type.prefix ?? null
    const suffix = field.suffix ?? type.suffix ?? null
    field.prefix = typeof prefix === 'function' ? prefix({ t }) : prefix ?? ''
    field.suffix = typeof suffix === 'function' ? suffix({ t }) : suffix ?? ''
    field.icon = field.icon ?? type.icon ?? undefined
  }

  /**
   * Merge custom fields with server fields
   */
  const getMetaFields = (customFields: EntityField[], serverFields: EntityField[]): EntityField[] => {
    if (customFields?.length > 0) {
      if (mergeWithServer) {
        return serverFields.map((field) => {
          const found = customFields.find((f) => f.name === field.name)
          return found ? { ...found, ...field } : { ...field }
        })
      } else {
        const mergeFields: EntityField[] = []
        for (const field of customFields) {
          const found = serverFields.find((f) => f.name === field.name)
          if (found) {
            mergeFields.push({ ...field, ...found })
          } else {
            console.log(`Field not found in server metadata: ${JSON.stringify(field)}`)
          }
        }
        return mergeFields
      }
    }
    return serverFields.map((field) => ({ ...field }))
  }

  /**
   * Check if field should be shown in view
   */
  const fieldInView = (field: EntityField, view: string): boolean => {
    if (view === '*') return true
    if (field.view) {
      return Array.isArray(field.view) ? field.view.includes(view) : field.view === view
    }
    // Fields without view restriction should show in all views
    return true
  }

  /**
   * Get field label
   */
  const getFieldLabel = (field: EntityField): string => {
    return getFieldLabelByName(field.name)
  }

  /**
   * Get field label by name
   */
  const getFieldLabelByName = (name: string): string => {
    return t(`${getEntity()}.${name}`)
  }

  /**
   * Get field type definition
   */
  const getFieldType = (field: EntityField): TypeDefinition => {
    const type = getType(field.type ?? 'string')
    if (!type) {
      throw new Error(
        `No type found for [${field.type}] in field: ${field.name} of entity: ${getEntity()}`
      )
    }
    if (!type.inputType) {
      throw new Error(
        `No inputType defined for [${field.type}] in field: ${field.name} of entity: ${getEntity()}`
      )
    }
    return type
  }

  /**
   * Get fields for search form
   */
  const getSearchFields = async (): Promise<FormField[]> => {
    if (!meta.value) return []

    const formFields: FormField[] = []
    const serverFields = meta.value.fields.filter(
      (field) =>
        field.search !== false && field.sys !== true && field.name !== meta.value?.userField
    )
    const metaFields = getMetaFields(getFields(), serverFields)

    for (const field of metaFields) {
      const formField = field as FormField
      formField.label = t(`${getEntity()}.${field.name}`)

      const type = getFieldType(field)
      formField.inputType = type.searchInputType ?? type.inputType
      await setFieldType(formField, type)
      formField.rules = []

      formFields.push(formField)
    }
    return formFields
  }

  /**
   * Get fields for edit form
   */
  const getEditFields = async (updateMode: boolean, view: string): Promise<FormField[]> => {
    if (!meta.value) return []

    const editFields = updateMode
      ? meta.value.fields.filter(
          (field) =>
            field.create !== false &&
            field.update !== false &&
            field.sys !== true &&
            field.name !== meta.value?.userField &&
            fieldInView(field, view)
        )
      : meta.value.fields.filter(
          (field) =>
            field.create !== false &&
            field.sys !== true &&
            field.name !== meta.value?.userField &&
            fieldInView(field, view)
        )

    return getFormFields(editFields)
  }

  /**
   * Get fields for clone form
   */
  const getCloneFields = async (): Promise<FormField[]> => {
    if (!meta.value) return []

    return getFormFields(
      meta.value.fields.filter(
        (field) => field.sys !== true && field.name !== meta.value?.userField
      )
    )
  }

  /**
   * Get form fields with validation rules
   */
  const getFormFields = async (serverFields: EntityField[]): Promise<FormField[]> => {
    const formFields: FormField[] = []
    const metaFields = getMetaFields(getFields(), serverFields)
    const entityName = getEntity()

    for (const field of metaFields) {
      const formField = field as FormField
      const hintI18nKey = `${entityName}.${field.name}_hint`
      formField.label = getFieldLabel(field)
      formField.hint = te(hintI18nKey) ? t(hintI18nKey) : ''

      const type = getFieldType(field)
      formField.inputType = type.inputType
      await setFieldType(formField, type)

      const rules: ValidationRule[] = []
      formField.rules = rules

      if (field.required === true) {
        rules.push((value) => !!value || value === false || t('form.required', { field: formField.label }))
      }

      if (type.rule) {
        rules.push(type.rule(t, field.name))
      }

      formFields.push(formField)
    }
    return formFields
  }

  /**
   * Get property fields for display
   */
  const getPropertyFields = async (): Promise<FormField[]> => {
    if (!meta.value) return []

    const propertyFields: FormField[] = []
    const serverFields = meta.value.fields.filter(
      (field) => field.sys !== true && field.name !== meta.value?.userField
    )
    const metaFields = getMetaFields(getFields(), serverFields)

    for (const field of metaFields) {
      const formField = field as FormField
      formField.label = getFieldLabel(field)
      const type = getFieldType(field)
      setFieldPrefixSuffix(formField, type)
      propertyFields.push(formField)
    }
    return propertyFields
  }

  /**
   * Get table headers
   */
  const getTableHeaders = async (expandFields: string[] = []): Promise<HeaderField[]> => {
    if (!meta.value) return []

    const tableHeaders: HeaderField[] = []
    const serverFields = meta.value.fields.filter(
      (field) =>
        field.list !== false &&
        field.hidden !== true &&
        field.sys !== true &&
        field.name !== meta.value?.userField &&
        !expandFields.includes(field.name)
    )
    const metaFields = getMetaFields(getHeaders(), serverFields)

    for (const header of metaFields) {
      const headerField = header as HeaderField
      headerField.text = getFieldLabel(header)
      headerField.value = header.name

      const type = getFieldType(header)
      if (type.format) {
        headerField.format = type.format
      }
      tableHeaders.push(headerField)
    }
    return tableHeaders
  }

  /**
   * Format field value with prefix/suffix
   */
  const formatFieldValue = (field: FormField | HeaderField, value: unknown): string => {
    const format = (field as HeaderField).format
    const formatValue = format ? format(value, t) : value

    if (formatValue) {
      const strValue = String(formatValue)
      const prefix = field.prefix && !strValue.includes(field.prefix as string) ? field.prefix : ''
      const suffix = field.suffix && !strValue.includes(field.suffix as string) ? field.suffix : ''
      return `${prefix} ${formatValue} ${suffix}`.trim()
    }
    return ''
  }

  return {
    meta,
    entityLabel: entityLabelText,
    entityLabelText,
    loadMeta,
    getSearchFields,
    getEditFields,
    getCloneFields,
    getFormFields,
    getPropertyFields,
    getTableHeaders,
    getFieldType,
    formatFieldValue,
    getFieldLabel,
    getFieldLabelByName,
  }
}
