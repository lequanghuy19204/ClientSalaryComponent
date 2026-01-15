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
    salaryCompositionCode: '',
    salaryCompositionName: '',
    organizationIds: [],
    salaryCompositionType: '',
    salaryCompositionNature: 'income',
    salaryCompositionTaxOption: 'taxable',
    salaryCompositionTaxDeduction: false,
    salaryCompositionQuota: '',
    salaryCompositionAllowExceedQuota: false,
    salaryCompositionValueType: 'currency',
    salaryCompositionValueCalculation: 'formula',
    salaryCompositionSumScope: 'same_unit',
    salaryCompositionOrgLevel: 'level_4',
    salaryCompositionComponentToSum: '',
    salaryCompositionValueFormula: '',
    salaryCompositionDescription: '',
    salaryCompositionShowOnPayslip: 'yes',
    salaryCompositionSource: 'manual',
    salaryCompositionStatus: 1,
    salaryCompositionTaxablePart: '',
    salaryCompositionTaxExemptPart: ''
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
        salaryCompositionCode: data.salaryCompositionCode,
        salaryCompositionName: data.salaryCompositionName,
        organizationIds: data.organizationIds || [],
        salaryCompositionType: data.salaryCompositionType,
        salaryCompositionNature: data.salaryCompositionNature,
        salaryCompositionTaxOption: data.salaryCompositionTaxOption,
        salaryCompositionTaxDeduction: data.salaryCompositionTaxDeduction,
        salaryCompositionQuota: data.salaryCompositionQuota || '',
        salaryCompositionAllowExceedQuota: data.salaryCompositionAllowExceedQuota,
        salaryCompositionValueType: data.salaryCompositionValueType,
        salaryCompositionValueCalculation: data.salaryCompositionValueCalculation,
        salaryCompositionSumScope: data.salaryCompositionSumScope || 'same_unit',
        salaryCompositionOrgLevel: data.salaryCompositionOrgLevel || 'level_4',
        salaryCompositionComponentToSum: data.salaryCompositionComponentToSum || '',
        salaryCompositionValueFormula: data.salaryCompositionValueFormula || '',
        salaryCompositionDescription: data.salaryCompositionDescription || '',
        salaryCompositionShowOnPayslip: data.salaryCompositionShowOnPayslip,
        salaryCompositionSource: data.salaryCompositionSource,
        salaryCompositionStatus: data.salaryCompositionStatus ?? 1,
        salaryCompositionTaxablePart: data.salaryCompositionTaxablePart || '',
        salaryCompositionTaxExemptPart: data.salaryCompositionTaxExemptPart || ''
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
      salaryCompositionCode: form.salaryCompositionCode,
      salaryCompositionName: form.salaryCompositionName,
      organizationIds: form.organizationIds,
      salaryCompositionType: form.salaryCompositionType,
      salaryCompositionNature: form.salaryCompositionNature,
      salaryCompositionValueType: form.salaryCompositionValueType,
      salaryCompositionValueCalculation: form.salaryCompositionValueCalculation,
      salaryCompositionDescription: form.salaryCompositionDescription,
      salaryCompositionShowOnPayslip: form.salaryCompositionShowOnPayslip,
      salaryCompositionSource: form.salaryCompositionSource,
      salaryCompositionStatus: form.salaryCompositionStatus
    }

    // 1. sumScope, orgLevel, componentToSum - chỉ gửi khi valueCalculation = 'auto_sum'
    if (form.salaryCompositionValueCalculation === 'auto_sum') {
      data.salaryCompositionSumScope = form.salaryCompositionSumScope
      data.salaryCompositionOrgLevel = form.salaryCompositionSumScope === 'org_structure' ? form.salaryCompositionOrgLevel : null
      data.salaryCompositionComponentToSum = form.salaryCompositionComponentToSum
      data.salaryCompositionValueFormula = null
    } else {
      data.salaryCompositionSumScope = null
      data.salaryCompositionOrgLevel = null
      data.salaryCompositionComponentToSum = null
      data.salaryCompositionValueFormula = form.salaryCompositionValueFormula
    }

    // 2. taxOption - chỉ gửi khi nature = 'income'
    if (form.salaryCompositionNature === 'income') {
      data.salaryCompositionTaxOption = form.salaryCompositionTaxOption
      // taxablePart, taxExemptPart - chỉ gửi khi taxOption = 'tax_exempt_partial'
      if (form.salaryCompositionTaxOption === 'tax_exempt_partial') {
        data.salaryCompositionTaxablePart = form.salaryCompositionTaxablePart
        data.salaryCompositionTaxExemptPart = form.salaryCompositionTaxExemptPart
      } else {
        data.salaryCompositionTaxablePart = null
        data.salaryCompositionTaxExemptPart = null
      }
    } else {
      data.salaryCompositionTaxOption = null
      data.salaryCompositionTaxablePart = null
      data.salaryCompositionTaxExemptPart = null
    }

    // 3. taxDeduction - chỉ gửi khi nature = 'deduction'
    if (form.salaryCompositionNature === 'deduction') {
      data.salaryCompositionTaxDeduction = form.salaryCompositionTaxDeduction
    } else {
      data.salaryCompositionTaxDeduction = false
    }

    // 4. quota, allowExceedQuota - chỉ gửi khi nature !== 'other'
    if (form.salaryCompositionNature !== 'other') {
      data.salaryCompositionQuota = form.salaryCompositionQuota
      data.salaryCompositionAllowExceedQuota = form.salaryCompositionAllowExceedQuota
    } else {
      data.salaryCompositionQuota = null
      data.salaryCompositionAllowExceedQuota = false
    }

    return data
  }

  const remove = async (id) => {
    return withLoading(async () => {
      await salaryCompositionApi.delete(id)
      list.value = list.value.filter(item => item.salaryCompositionId !== id)
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

    if (!form.salaryCompositionName?.trim()) {
      errors.salaryCompositionName = 'Tên thành phần không được để trống'
    }

    if (!form.salaryCompositionCode?.trim()) {
      errors.salaryCompositionCode = 'Mã thành phần không được để trống'
    }

    if (!form.salaryCompositionType) {
      errors.salaryCompositionType = 'Loại thành phần không được để trống'
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
