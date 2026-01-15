import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { salaryCompositionApi } from '@/api'
import { useApiState } from './useApi'

export function useSalaryComposition() {
  const router = useRouter()
  const { loading, error, withLoading, clearError } = useApiState()

  const list = ref([])
  const selected = ref(null)

  const defaultFormData = {
    code: '',
    name: '',
    unitIds: [],
    type: '',
    property: 'income',
    taxOption: 'taxable',
    deductWhenCalculatingTax: false,
    quota: '',
    allowExceedQuota: false,
    valueType: 'currency',
    valueCalculation: 'formula',
    sumScope: 'same_unit',
    orgLevel: 'level_4',
    salaryComponentToSum: '',
    valueFormula: '',
    description: '',
    showOnPayslip: 'yes',
    source: 'manual',
    status: 1,
    taxablePart: '',
    taxExemptPart: ''
  }

  const form = reactive({ ...defaultFormData })

  const resetForm = () => {
    Object.assign(form, defaultFormData)
  }

  const fetchList = async () => {
    return withLoading(async () => {
      list.value = await salaryCompositionApi.getAll()
      return list.value
    })
  }

  const fetchById = async (id) => {
    return withLoading(async () => {
      const data = await salaryCompositionApi.getById(id)
      Object.assign(form, {
        code: data.code,
        name: data.name,
        unitIds: data.unitIds || [],
        type: data.type,
        property: data.property,
        taxOption: data.taxOption,
        deductWhenCalculatingTax: data.deductWhenCalculatingTax,
        quota: data.quota || '',
        allowExceedQuota: data.allowExceedQuota,
        valueType: data.valueType,
        valueCalculation: data.valueCalculation,
        sumScope: data.sumScope || 'same_unit',
        orgLevel: data.orgLevel || 'level_4',
        salaryComponentToSum: data.salaryComponentToSum || '',
        valueFormula: data.valueFormula || '',
        description: data.description || '',
        showOnPayslip: data.showOnPayslip,
        source: data.source,
        status: data.status ?? 1,
        taxablePart: data.taxablePart || '',
        taxExemptPart: data.taxExemptPart || ''
      })
      selected.value = data
      return data
    })
  }

  const create = async () => {
    return withLoading(async () => {
      const dataToSend = prepareDataForSubmit()
      const result = await salaryCompositionApi.create(dataToSend)
      return result
    })
  }

  const update = async (id) => {
    return withLoading(async () => {
      const dataToSend = prepareDataForSubmit()
      await salaryCompositionApi.update(id, dataToSend)
      return true
    })
  }

  const prepareDataForSubmit = () => {
    const data = {
      code: form.code,
      name: form.name,
      unitIds: form.unitIds,
      type: form.type,
      property: form.property,
      valueType: form.valueType,
      valueCalculation: form.valueCalculation,
      description: form.description,
      showOnPayslip: form.showOnPayslip,
      source: form.source,
      status: form.status
    }

    // 1. sumScope, orgLevel, salaryComponentToSum - chỉ gửi khi valueCalculation = 'auto_sum'
    if (form.valueCalculation === 'auto_sum') {
      data.sumScope = form.sumScope
      data.orgLevel = form.sumScope === 'org_structure' ? form.orgLevel : null
      data.salaryComponentToSum = form.salaryComponentToSum
      data.valueFormula = null
    } else {
      data.sumScope = null
      data.orgLevel = null
      data.salaryComponentToSum = null
      data.valueFormula = form.valueFormula
    }

    // 2. taxOption - chỉ gửi khi property = 'income'
    if (form.property === 'income') {
      data.taxOption = form.taxOption
      // taxablePart, taxExemptPart - chỉ gửi khi taxOption = 'tax_exempt_partial'
      if (form.taxOption === 'tax_exempt_partial') {
        data.taxablePart = form.taxablePart
        data.taxExemptPart = form.taxExemptPart
      } else {
        data.taxablePart = null
        data.taxExemptPart = null
      }
    } else {
      data.taxOption = null
      data.taxablePart = null
      data.taxExemptPart = null
    }

    // 3. deductWhenCalculatingTax - chỉ gửi khi property = 'deduction'
    if (form.property === 'deduction') {
      data.deductWhenCalculatingTax = form.deductWhenCalculatingTax
    } else {
      data.deductWhenCalculatingTax = false
    }

    // 4. quota, allowExceedQuota - chỉ gửi khi property !== 'other'
    if (form.property !== 'other') {
      data.quota = form.quota
      data.allowExceedQuota = form.allowExceedQuota
    } else {
      data.quota = null
      data.allowExceedQuota = false
    }

    return data
  }

  const remove = async (id) => {
    return withLoading(async () => {
      await salaryCompositionApi.delete(id)
      list.value = list.value.filter(item => item.id !== id)
      return true
    })
  }

  const save = async (id = null) => {
    if (id) {
      return update(id)
    }
    return create()
  }

  const saveAndNew = async () => {
    const result = await create()
    resetForm()
    return result
  }

  const goToCreate = () => {
    router.push({ name: 'salary-component-create' })
  }

  const goToEdit = (id) => {
    router.push({ name: 'salary-component-edit', params: { id } })
  }

  const goBack = () => {
    router.back()
  }

  const validate = () => {
    const errors = {}

    if (!form.name?.trim()) {
      errors.name = 'Tên thành phần không được để trống'
    }

    if (!form.code?.trim()) {
      errors.code = 'Mã thành phần không được để trống'
    }

    if (!form.type) {
      errors.type = 'Loại thành phần không được để trống'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  return {
    list,
    form,
    selected,
    loading,
    error,
    fetchList,
    fetchById,
    create,
    update,
    remove,
    save,
    saveAndNew,
    resetForm,
    goToCreate,
    goToEdit,
    goBack,
    validate,
    clearError
  }
}
