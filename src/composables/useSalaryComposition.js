import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { salaryCompositionApi } from '@/api'
import { useApiState } from './useApi'

/**
 * Composable quản lý thành phần lương
 * Cung cấp các chức năng CRUD, điều hướng và xác thực cho thành phần lương
 * @returns {Object} Trả về list, form, selected, loading, error và các hàm xử lý
 */
export function useSalaryComposition() {
  const router = useRouter()
  const { loading, error, withLoading, clearError } = useApiState()

  const list = ref([])
  const selected = ref(null)

  /** Dữ liệu mặc định của form thành phần lương */
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

  /**
   * Đặt lại form về giá trị mặc định
   */
  const resetForm = () => {
    Object.assign(form, defaultFormData)
  }

  /**
   * Lấy danh sách tất cả thành phần lương từ API
   * @returns {Promise<Array>} Danh sách thành phần lương
   */
  const fetchList = async () => {
    return withLoading(async () => {
      list.value = await salaryCompositionApi.getAll()
      return list.value
    })
  }

  /**
   * Lấy thông tin chi tiết thành phần lương theo ID và gán vào form
   * @param {string} id - ID của thành phần lương
   * @returns {Promise<Object>} Dữ liệu thành phần lương
   */
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

  /**
   * Tạo mới thành phần lương
   * @returns {Promise<Object>} Kết quả từ API
   */
  const create = async () => {
    return withLoading(async () => {
      const dataToSend = prepareDataForSubmit()
      const result = await salaryCompositionApi.create(dataToSend)
      return result
    })
  }

  /**
   * Cập nhật thành phần lương theo ID
   * @param {string} id - ID của thành phần lương cần cập nhật
   * @returns {Promise<boolean>} Trả về true nếu thành công
   */
  const update = async (id) => {
    return withLoading(async () => {
      const dataToSend = prepareDataForSubmit()
      await salaryCompositionApi.update(id, dataToSend)
      return true
    })
  }

  /**
   * Chuẩn bị dữ liệu form trước khi gửi lên server
   * Xử lý các trường hợp điều kiện dựa trên loại tính toán và tính chất
   * @returns {Object} Dữ liệu đã được xử lý sẵn sàng gửi đi
   */
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

  /**
   * Xóa thành phần lương theo ID
   * @param {string} id - ID của thành phần lương cần xóa
   * @returns {Promise<boolean>} Trả về true nếu thành công
   */
  const remove = async (id) => {
    return withLoading(async () => {
      await salaryCompositionApi.delete(id)
      list.value = list.value.filter(item => item.salaryCompositionId !== id)
      return true
    })
  }

  /**
   * Lưu thành phần lương (tạo mới hoặc cập nhật)
   * @param {string|null} id - ID của thành phần lương, null nếu tạo mới
   * @returns {Promise} Kết quả từ API
   */
  const save = async (id = null) => {
    if (id) {
      return update(id)
    }
    return create()
  }

  /**
   * Lưu và tạo mới (sau khi lưu thành công sẽ reset form)
   * @returns {Promise<Object>} Kết quả từ API
   */
  const saveAndNew = async () => {
    const result = await create()
    resetForm()
    return result
  }

  /**
   * Điều hướng đến trang tạo mới thành phần lương
   */
  const goToCreate = () => {
    router.push({ name: 'salary-component-create' })
  }

  /**
   * Điều hướng đến trang chỉnh sửa thành phần lương
   * @param {string} id - ID của thành phần lương cần chỉnh sửa
   */
  const goToEdit = (id) => {
    router.push({ name: 'salary-component-edit', params: { id } })
  }

  /**
   * Quay lại trang trước đó
   */
  const goBack = () => {
    router.back()
  }

  /**
   * Xác thực dữ liệu form
   * @returns {Object} Đối tượng chứa isValid và danh sách lỗi
   */
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
