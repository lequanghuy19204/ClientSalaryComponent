<template>
  <div class="salary-form-page d-flex flex-column overflow-hidden">
    <!-- Header Section -->
    <div class="form-header d-flex justify-content-between align-items-center flex-shrink-0">
      <div class="d-flex align-items-center gap-2">
        <MsButton
          icon="icon-arrow-left"
          variant="text"
          size="small"
          class="btn-back"
          @click="checkUnsavedAndGoBack"
          title="Quay lại"
        />
        <h2 class="form-title overflow-hidden" :title="isEdit ? formData.salaryCompositionName : ''">
          {{ isEdit ? formData.salaryCompositionName : 'Thêm thành phần' }}
        </h2>
      </div>
      <div class="d-flex align-items-center gap-2">
        <MsButton label="Hủy bỏ" variant="outline" @click="handleCancel" />
        <MsButton label="Lưu và thêm" variant="outline" @click="handleSaveAndAdd" v-if="!isEdit" />
        <MsButton label="Lưu" variant="primary" @click="handleSave" />
        <div v-if="isEdit" class="more-dropdown-wrapper position-relative">
          <MsButton
            icon="icon-mi-threedot"
            variant="outline"
            class="btn-more"
            title="Chức năng khác"
            @click="toggleMoreMenu"
          />
          <ul v-show="showMoreMenu" class="more-dropdown-menu position-absolute bg-white">
            <li class="more-dropdown-item d-flex align-items-center gap-2" @click="handleDuplicate">
              <span class="icon icon-mi-copy flex-shrink-0"></span>
              <span class="item-text">Nhân bản</span>
            </li>
            <li class="more-dropdown-item d-flex align-items-center gap-2" @click="handleDelete">
              <span class="icon icon-mi-trash-red flex-shrink-0"></span>
              <span class="item-text text-red">Xóa</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <div class="form-content flex-grow-1 overflow-auto bg-white rounded-1">
      <div class="form-body" ref="formBodyRef" @keydown.enter="focusNextInput">
        <!-- Row 1: Tên thành phần -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left required flex-shrink-0"><b>Tên thành phần</b></label>
          <div class="form-input-right">
            <MsInput
              v-model="formData.salaryCompositionName"
              class="w-full"
              :maxlength="255"
              :autofocus="true"
              :has-error="!!formErrors.salaryCompositionName"
              :error-message="formErrors.salaryCompositionName"
            />
          </div>
        </div>

        <!-- Row 2: Mã thành phần -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left required flex-shrink-0"><b>Mã thành phần</b></label>
          <div class="form-input-right">
            <MsInput
              v-model="formData.salaryCompositionCode"
              class="w-full"
              placeholder="Nhập mã viết liền"
              :maxlength="255"
              :disabled="isEdit"
              :has-error="!!formErrors.salaryCompositionCode"
              :error-message="formErrors.salaryCompositionCode"
              @input="onCodeInput"
            />
          </div>
        </div>

        <!-- Row 3: Đơn vị áp dụng -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left flex-shrink-0"><b>Đơn vị áp dụng</b></label>
          <div class="form-input-right">
            <MsTree
              v-model="formData.organizationIds"
              :data-source="unitTreeData"
              key-expr="organizationId"
              display-expr="organizationName"
              placeholder=""
              :max-selected-labels="3"
              class="form-unit-tree"
            />
          </div>
        </div>

        <!-- Row 4: Loại thành phần -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left required flex-shrink-0"><b>Loại thành phần</b></label>
          <div class="form-input-right">
            <MsSelect
              v-model="formData.salaryCompositionType"
              :options="componentTypes"
              placeholder=""
              size="medium"
              :has-error="!!formErrors.salaryCompositionType"
              :error-message="formErrors.salaryCompositionType"
            />
          </div>
        </div>

        <!-- Row 5: Tính chất -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left required flex-shrink-0"><b>Tính chất</b></label>
          <div class="form-input-right d-flex align-items-center gap-3">
            <MsSelect
              v-model="formData.salaryCompositionNature"
              :options="properties"
              placeholder="Chọn tính chất"
              size="medium"
              :has-error="!!formErrors.salaryCompositionNature"
              :error-message="formErrors.salaryCompositionNature"
            />
            <!-- Thu nhập: 3 radio buttons -->
            <div
              class="tax-options d-flex align-items-center flex-shrink-0"
              v-if="formData.salaryCompositionNature === 'income'"
            >
              <MsRadioButton v-model="formData.salaryCompositionTaxOption" value="taxable" label="Chịu thuế" />
              <MsRadioButton
                v-model="formData.salaryCompositionTaxOption"
                value="tax_exempt_full"
                label="Miễn thuế toàn phần"
              />
              <MsRadioButton
                v-model="formData.salaryCompositionTaxOption"
                value="tax_exempt_partial"
                label="Miễn thuế một phần"
              />
            </div>
            <!-- Khấu trừ: 1 checkbox -->
            <div
              class="tax-options d-flex align-items-center flex-shrink-0"
              v-else-if="formData.salaryCompositionNature === 'deduction'"
            >
              <MsCheckbox
                v-model="formData.salaryCompositionTaxDeduction"
                label="Giảm trừ khi tính thuế"
              />
            </div>
            <!-- Khác: không hiển thị gì -->
          </div>
        </div>

        <!-- Row 6: Định mức (ẩn khi chọn Khác) -->
        <div class="form-row d-flex align-items-center" v-if="formData.salaryCompositionNature !== 'other'">
          <label class="form-label-left flex-shrink-0"><b>Định mức</b></label>
          <div class="form-input-right">
            <MsTextarea
              v-model="formData.salaryCompositionQuota"
              placeholder="Tự động gợi ý công thức và tham số khi gõ"
              :rows="2"
              class="w-full formula-editor"
            />
          </div>
        </div>

        <!-- Row 7: Checkbox cho phép vượt định mức (ẩn khi chọn Khác) -->
        <div class="form-row d-flex align-items-center" v-if="formData.salaryCompositionNature !== 'other'">
          <label class="form-label-left flex-shrink-0"></label>
          <div class="form-input-right">
            <div class="d-flex align-items-center gap-2">
              <MsCheckbox
                v-model="formData.salaryCompositionAllowExceedQuota"
                label="Cho phép giá trị tính vượt quá định mức"
              />
              <i class="pi pi-info-circle info-icon" v-tooltip.top="'Thông tin thêm'"></i>
            </div>
          </div>
        </div>

        <!-- Row 8: Kiểu giá trị -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left flex-shrink-0"><b>Kiểu giá trị</b></label>
          <div class="form-input-right">
            <MsSelect
              v-model="formData.salaryCompositionValueType"
              :options="valueTypes"
              :disabled="formData.salaryCompositionNature !== 'other'"
              size="medium"
            />
          </div>
        </div>

        <!-- Row 9: Giá trị -->
        <div class="form-row align-top d-flex">
          <label class="form-label-left flex-shrink-0"><b>Giá trị</b></label>
          <div class="form-input-right">
            <div class="d-flex flex-column gap-3">
              <!-- Option 1: Tự động cộng tổng -->
              <div class="value-option d-flex align-items-center gap-3">
                <MsRadioButton
                  v-model="formData.salaryCompositionValueCalculation"
                  value="auto_sum"
                  label="Tự động cộng tổng giá trị của các nhân viên"
                />
                <MsSelect
                  v-model="formData.salaryCompositionSumScope"
                  :options="sumScopeOptions"
                  :disabled="formData.salaryCompositionValueCalculation !== 'auto_sum'"
                  size="medium"
                  class="ml-4"
                />
                <!-- Cấp cơ cấu tổ chức -->
                <MsSelect
                  v-if="formData.salaryCompositionSumScope === 'org_structure'"
                  v-model="formData.salaryCompositionOrgLevel"
                  :options="orgLevelOptions"
                  :disabled="formData.salaryCompositionValueCalculation !== 'auto_sum'"
                  size="small"
                />
              </div>
              <!-- Select thành phần lương khi chọn auto_sum -->
              <div
                class="value-option d-flex align-items-center gap-3"
                v-if="formData.salaryCompositionValueCalculation === 'auto_sum'"
              >
                <MsSelect
                  v-model="formData.salaryCompositionComponentToSum"
                  :options="salaryComponentOptions"
                  placeholder="Chọn thành phần lương để cộng giá trị"
                  size="large"
                  class="ml-component-select"
                />
              </div>
              <!-- Option 2: Tính theo công thức -->
              <div class="value-option d-flex align-items-center gap-3">
                <MsRadioButton
                  v-model="formData.salaryCompositionValueCalculation"
                  value="formula"
                  label="Tính theo công thức tự đặt"
                />
                <div
                  class="formula-container position-relative w-100"
                  v-if="formData.salaryCompositionValueCalculation === 'formula'"
                >
                  <MsTextarea
                    v-model="formData.salaryCompositionValueFormula"
                    placeholder="Tự động gợi ý công thức và tham số khi gõ"
                    :rows="2"
                    class="w-full formula-editor"
                  />
                </div>
              </div>

              <!-- Phần chịu thuế / miễn thuế (chỉ hiển thị khi chọn miễn thuế một phần) -->
              <div
                class="tax-partial-section"
                v-if="formData.salaryCompositionNature === 'income' && formData.salaryCompositionTaxOption === 'tax_exempt_partial'"
              >
                <div class="tax-partial-label">Trong đó:</div>
                <div class="tax-partial-row d-flex align-items-start">
                  <label class="tax-partial-field-label flex-shrink-0"><b>Phần chịu thuế</b></label>
                  <div class="tax-partial-input flex-grow-1">
                    <MsTextarea
                      v-model="formData.salaryCompositionTaxablePart"
                      placeholder="Chỉ cần nhập giá trị cho 1 trong 2 phần chịu thuế và miễn thuế"
                      :rows="2"
                      class="w-full formula-editor"
                    />
                  </div>
                </div>
                <div class="tax-partial-row d-flex align-items-start">
                  <label class="tax-partial-field-label flex-shrink-0"><b>Phần miễn thuế</b></label>
                  <div class="tax-partial-input flex-grow-1">
                    <MsTextarea
                      v-model="formData.salaryCompositionTaxExemptPart"
                      placeholder="Chỉ cần nhập giá trị cho 1 trong 2 phần chịu thuế và miễn thuế"
                      :rows="2"
                      class="w-full formula-editor"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 10: Mô tả -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left flex-shrink-0"><b>Mô tả</b></label>
          <div class="form-input-right">
            <MsTextarea v-model="formData.salaryCompositionDescription" :rows="2" class="w-full" />
          </div>
        </div>

        <!-- Row 11: Hiển thị trên phiếu lương -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left flex-shrink-0"><b>Hiển thị trên phiếu lương</b></label>
          <div class="form-input-right d-flex align-items-center gap-3">
            <MsRadioButton v-model="formData.salaryCompositionShowOnPayslip" value="yes" label="Có" />
            <MsRadioButton v-model="formData.salaryCompositionShowOnPayslip" value="no" label="Không" />
            <MsRadioButton
              v-model="formData.salaryCompositionShowOnPayslip"
              value="if_not_zero"
              label="Chỉ hiển thị nếu giá trị khác 0"
            />
          </div>
        </div>

        <!-- Row 12: Nguồn tạo -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left flex-shrink-0"><b>Nguồn tạo</b></label>
          <div class="form-input-right border-bottom">
            <span class="source-text">{{ getSourceLabel }}</span>
          </div>
        </div>

        <!-- Row 13: Trạng thái (chỉ hiển thị khi sửa) -->
        <div class="form-row d-flex align-items-center" v-if="isEdit">
          <label class="form-label-left flex-shrink-0"><b>Trạng thái</b></label>
          <div class="form-input-right d-flex align-items-center gap-3">
            <MsRadioButton v-model="formData.salaryCompositionStatus" :value="1" label="Đang theo dõi" />
            <MsRadioButton v-model="formData.salaryCompositionStatus" :value="0" label="Ngừng theo dõi" />
          </div>
        </div>
      </div>
    </div>

    <!-- Unsaved Changes Dialog -->
    <MsConfirmDialog
      v-model="showUnsavedDialog"
      title="Thông báo"
      message="Thông tin đã được thay đổi. Bạn có muốn lưu lại không?"
      confirm-text="Lưu"
      cancel-text="Hủy"
      middle-text="Không lưu"
      :show-middle-button="true"
      confirm-variant="primary"
      :close-on-overlay="false"
      @cancel="handleUnsavedCancel"
      @middle="handleUnsavedNoSave"
      @confirm="handleUnsavedSave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import MsInput from '@/components/bases/form/MsInput.vue'
import MsTextarea from '@/components/bases/form/MsTextarea.vue'
import MsSelect from '@/components/bases/form/MsSelect.vue'
import MsRadioButton from '@/components/bases/form/MsRadioButton.vue'
import MsCheckbox from '@/components/bases/form/MsCheckbox.vue'
import MsTree from '@/components/bases/data/MsTree.vue'
import MsButton from '@/components/bases/ui/MsButton.vue'
import MsConfirmDialog from '@/components/bases/ui/MsConfirmDialog.vue'
import { useSalaryComposition, useOrganization, useToast } from '@/composables'

const props = defineProps({
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit', 'duplicate'].includes(value),
  },
  editId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['back', 'saved', 'deleted'])

const { form: formData, fetchById, save, saveAndNew, remove, resetForm } = useSalaryComposition()

const { tree: unitTreeData, fetchTree } = useOrganization()

const toast = useToast()

const isEdit = computed(() => props.mode === 'edit')
const isDuplicate = computed(() => props.mode === 'duplicate')

const isCodeManuallyEdited = ref(false)
const showMoreMenu = ref(false)
const formBodyRef = ref(null)
const showUnsavedDialog = ref(false)
const originalFormData = ref(null)

const focusNextInput = (e) => {
  if (e.target.tagName === 'TEXTAREA') return

  e.preventDefault()
  const focusableElements = formBodyRef.value?.querySelectorAll(
    'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])',
  )
  if (!focusableElements) return

  const currentIndex = Array.from(focusableElements).indexOf(e.target)
  if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
    focusableElements[currentIndex + 1].focus()
  }
}

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
}

const closeMoreMenu = (e) => {
  if (!e.target.closest('.more-dropdown-wrapper')) {
    showMoreMenu.value = false
  }
}

const goBack = () => {
  emit('back')
}

const hasFormChanged = () => {
  if (!originalFormData.value) return false
  return JSON.stringify(formData) !== JSON.stringify(originalFormData.value)
}

const checkUnsavedAndGoBack = () => {
  if (hasFormChanged()) {
    showUnsavedDialog.value = true
  } else {
    goBack()
  }
}

const handleUnsavedCancel = () => {
  showUnsavedDialog.value = false
}

const handleUnsavedNoSave = () => {
  showUnsavedDialog.value = false
  goBack()
}

const handleUnsavedSave = async () => {
  showUnsavedDialog.value = false
  await handleSave()
}

const handleDuplicate = () => {
  showMoreMenu.value = false
  emit('back', { action: 'duplicate', id: props.editId })
}

const handleDelete = async () => {
  showMoreMenu.value = false
  if (!props.editId) return

  try {
    await remove(props.editId)
    toast.success('Xóa thành công')
    emit('deleted')
    emit('back')
  } catch (error) {
    console.error('Error deleting salary component:', error)
    toast.error('Có lỗi xảy ra')
  }
}

onMounted(() => {
  document.addEventListener('click', closeMoreMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMoreMenu)
})

const removeVietnameseDiacritics = (str) => {
  const diacriticsMap = {
    à: 'a',
    á: 'a',
    ả: 'a',
    ã: 'a',
    ạ: 'a',
    ă: 'a',
    ằ: 'a',
    ắ: 'a',
    ẳ: 'a',
    ẵ: 'a',
    ặ: 'a',
    â: 'a',
    ầ: 'a',
    ấ: 'a',
    ẩ: 'a',
    ẫ: 'a',
    ậ: 'a',
    đ: 'd',
    è: 'e',
    é: 'e',
    ẻ: 'e',
    ẽ: 'e',
    ẹ: 'e',
    ê: 'e',
    ề: 'e',
    ế: 'e',
    ể: 'e',
    ễ: 'e',
    ệ: 'e',
    ì: 'i',
    í: 'i',
    ỉ: 'i',
    ĩ: 'i',
    ị: 'i',
    ò: 'o',
    ó: 'o',
    ỏ: 'o',
    õ: 'o',
    ọ: 'o',
    ô: 'o',
    ồ: 'o',
    ố: 'o',
    ổ: 'o',
    ỗ: 'o',
    ộ: 'o',
    ơ: 'o',
    ờ: 'o',
    ớ: 'o',
    ở: 'o',
    ỡ: 'o',
    ợ: 'o',
    ù: 'u',
    ú: 'u',
    ủ: 'u',
    ũ: 'u',
    ụ: 'u',
    ư: 'u',
    ừ: 'u',
    ứ: 'u',
    ử: 'u',
    ữ: 'u',
    ự: 'u',
    ỳ: 'y',
    ý: 'y',
    ỷ: 'y',
    ỹ: 'y',
    ỵ: 'y',
  }

  return str
    .toLowerCase()
    .split('')
    .map((char) => diacriticsMap[char] || char)
    .join('')
}

const generateCodeFromName = (name) => {
  if (!name) return ''

  return removeVietnameseDiacritics(name)
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
}

watch(
  () => formData.salaryCompositionName,
  (newName) => {
    if (!isEdit.value && !isCodeManuallyEdited.value) {
      formData.salaryCompositionCode = generateCodeFromName(newName)
    }
  },
)

const onCodeInput = () => {
  isCodeManuallyEdited.value = true
  validateCodeRealtime()
}

const hasVietnameseDiacritics = (str) => {
  const diacriticsPattern = /[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i
  return diacriticsPattern.test(str)
}

const hasInvalidCharacters = (str) => {
  const validPattern = /^[A-Za-z0-9_]*$/
  return !validPattern.test(str)
}

const validateCodeRealtime = () => {
  if (!formData.salaryCompositionCode) {
    formErrors.salaryCompositionCode = ''
    return
  }

  if (formData.salaryCompositionCode.includes(' ')) {
    formErrors.salaryCompositionCode = 'Mã thành phần không được chứa khoảng trắng.'
  } else if (hasVietnameseDiacritics(formData.salaryCompositionCode) || hasInvalidCharacters(formData.salaryCompositionCode)) {
    formErrors.salaryCompositionCode =
      'Mã thành phần chỉ có thể chứa các kí tự chữ (A-Z a-z), số (0-9) và gạch dưới (_).'
  } else {
    formErrors.salaryCompositionCode = ''
  }
}

const formErrors = reactive({
  salaryCompositionName: '',
  salaryCompositionCode: '',
  salaryCompositionType: '',
  salaryCompositionNature: '',
})

const clearErrors = () => {
  formErrors.salaryCompositionName = ''
  formErrors.salaryCompositionCode = ''
  formErrors.salaryCompositionType = ''
  formErrors.salaryCompositionNature = ''
}

const validateForm = () => {
  clearErrors()
  let isValid = true

  if (!formData.salaryCompositionName?.trim()) {
    formErrors.salaryCompositionName = 'Không được để trống'
    isValid = false
  }

  if (!formData.salaryCompositionCode?.trim()) {
    formErrors.salaryCompositionCode = 'Không được để trống'
    isValid = false
  } else if (formData.salaryCompositionCode.includes(' ')) {
    formErrors.salaryCompositionCode = 'Mã thành phần không được chứa khoảng trắng.'
    isValid = false
  } else if (hasVietnameseDiacritics(formData.salaryCompositionCode) || hasInvalidCharacters(formData.salaryCompositionCode)) {
    formErrors.salaryCompositionCode =
      'Mã thành phần chỉ có thể chứa các kí tự chữ (A-Z a-z), số (0-9) và gạch dưới (_).'
    isValid = false
  } else {
    formData.salaryCompositionCode = formData.salaryCompositionCode.toUpperCase()
  }

  if (!formData.salaryCompositionType) {
    formErrors.salaryCompositionType = 'Không được để trống'
    isValid = false
  }

  if (!formData.salaryCompositionNature) {
    formErrors.salaryCompositionNature = 'Không được để trống'
    isValid = false
  }

  return isValid
}

onMounted(async () => {
  await fetchTree()
  if (isEdit.value && props.editId) {
    await fetchById(props.editId)
  } else if (isDuplicate.value && props.editId) {
    await fetchById(props.editId)
    formData.salaryCompositionCode = ''
    formData.salaryCompositionName = ''
    isCodeManuallyEdited.value = false
  } else {
    resetForm()
  }
  originalFormData.value = JSON.parse(JSON.stringify(formData))
})

const componentTypes = ref([
  { value: 'employee_info', label: 'Thông tin nhân viên' },
  { value: 'attendance', label: 'Chấm công' },
  { value: 'revenue', label: 'Doanh số' },
  { value: 'kpi', label: 'KPI' },
  { value: 'product', label: 'Sản phẩm' },
  { value: 'salary', label: 'Lương' },
  { value: 'pit', label: 'Thuế TNCN' },
  { value: 'insurance_union', label: 'Bảo hiểm - Công đoàn' },
  { value: 'other', label: 'Khác' },
])

const properties = ref([
  { value: 'income', label: 'Thu nhập' },
  { value: 'deduction', label: 'Khấu trừ' },
  { value: 'other', label: 'Khác' },
])

const valueTypes = ref([
  { value: 'number', label: 'Số' },
  { value: 'currency', label: 'Tiền tệ' },
  { value: 'percent', label: 'Phần trăm' },
  { value: 'text', label: 'Chữ' },
  { value: 'date', label: 'Ngày' },
])

const sumScopeOptions = ref([
  { value: 'same_unit', label: 'Trong cùng đơn vị công tác' },
  { value: 'subordinate', label: 'Dưới quyền' },
  { value: 'org_structure', label: 'Thuộc cơ cấu tổ chức' },
])

const orgLevelOptions = ref([
  { value: 'level_1', label: 'Cấp 1' },
  { value: 'level_2', label: 'Cấp 2' },
  { value: 'level_3', label: 'Cấp 3' },
  { value: 'level_4', label: 'Cấp 4' },
])

const salaryComponentOptions = ref([
  { value: 'base_salary', label: 'Lương cơ bản' },
  { value: 'allowance', label: 'Phụ cấp' },
  { value: 'bonus', label: 'Thưởng' },
  { value: 'overtime', label: 'Làm thêm giờ' },
  { value: 'insurance', label: 'Bảo hiểm' },
])

const sources = ref([
  { value: 'manual', label: 'Tự thêm' },
  { value: 'system', label: 'Hệ thống' },
])

const getSourceLabel = computed(() => {
  const source = sources.value.find((s) => s.value === formData.salaryCompositionSource)
  return source ? source.label : 'Tự thêm'
})

const handleCancel = () => {
  checkUnsavedAndGoBack()
}

const handleSave = async () => {
  if (!validateForm()) {
    return
  }

  try {
    await save(isEdit.value ? props.editId : null)
    toast.success(isEdit.value ? 'Cập nhật thành phần lương thành công' : 'Thêm thành công')
    emit('saved')
    goBack()
  } catch (err) {
    console.error('Save error:', err)
    const errorMessage = err.message || 'Có lỗi xảy ra'
    toast.error(errorMessage)
  }
}

const handleSaveAndAdd = async () => {
  if (!validateForm()) {
    return
  }

  try {
    await saveAndNew()
    toast.success('Thêm thành công')
    clearErrors()
  } catch (err) {
    console.error('Save error:', err)
    const errorMessage = err.message || 'Có lỗi xảy ra'
    toast.error(errorMessage)
  }
}
</script>

<style scoped>
/* Page Container */
.salary-form-page {
  height: calc(100vh - 48px);
}

/* Header Section */
.form-header {
  padding: 0 0 16px 0;
}

/* Back Button */
.btn-back {
  width: 32px;
  height: 32px;
  min-width: 32px;
  padding: 0;
}

.form-title {
  font-size: 20px;
  font-weight: 700;
  color: #212121;
  letter-spacing: 0.384px;
  line-height: 30px;
  margin: 0;
  max-width: 400px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* More Button */
.btn-more {
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
}

/* More Dropdown */
.more-dropdown-menu {
  top: 100%;
  right: 0;
  margin-top: 4px;
  border-radius: 5px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  padding: 8px 6px;
  list-style: none;
  min-width: 140px;
  z-index: 1000;
}

.more-dropdown-item {
  padding: 0px 12px;
  cursor: pointer;
  border-radius: 4px;
  line-height: 35px;
}

.more-dropdown-item:hover {
  background: #f2f2f2;
}

.more-dropdown-item .icon {
  width: 20px;
  height: 20px;
}

.more-dropdown-item .item-text {
  font-size: 14px;
  color: #212121;
}

.more-dropdown-item .item-text.text-red {
  color: #ff6161;
}

/* Form Content */
.form-content {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 14px;
}

.form-body {
  padding: 40px;
  max-width: 100%;
}

/* Form Row */
.form-row {
  margin-bottom: 16px;
  line-height: 36px;
}

.form-row.align-top {
  align-items: flex-start;
}

.form-row:last-child {
  margin-bottom: 0;
}

/* Form Label Left */
.form-label-left {
  width: 186px;
  font-size: 14px;
  font-weight: 400;
  color: #212121;
  padding-right: 8px;
}

.form-label-left.required b::after {
  content: ' *';
  color: #ff6161;
}

/* Form Input Right */
.form-input-right {
  flex: 1;
  max-width: 1104px;
  line-height: normal;
}

/* Input wrapper max-width */
.form-input-right > :deep(.ms-input-wrapper),
.form-input-right > :deep(.ms-textarea-wrapper),
.form-input-right > :deep(.ms-multiselect-wrapper) {
  max-width: 674px;
}

.w-full {
  width: 100%;
}

/* Tax Options */
.tax-options {
  gap: 24px;
  margin-left: 16px;
  white-space: nowrap;
}

/* Formula Editor */
.formula-editor :deep(.ms-textarea) {
  min-height: 70px;
  max-width: 540px;
}

/* Value Option */
.value-option {
  flex-wrap: wrap;
}

/* Formula Container */
.formula-container {
  margin-top: 8px;
}

/* Source Text */
.source-text {
  font-size: 14px;
  color: #212121;
  line-height: 36px;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
  max-width: 674px;
}

/* Info Icon */
.info-icon {
  font-size: 14px;
  color: #1a73e8;
  cursor: pointer;
  margin-left: 4px;
}

/* Utility Classes */
.ml-4 {
  margin-left: 16px;
}

.ml-component-select {
  margin-left: 0;
}

/* Form Unit Tree */
.form-unit-tree {
  width: 100%;
  max-width: 674px;
}

.form-unit-tree :deep(.ms-tree-wrapper) {
  width: 100%;
}

.form-unit-tree :deep(.ms-tree) {
  width: 100%;
}

/* Tax Partial Section */
.tax-partial-section {
  margin-top: 16px;
  width: 100%;
}

.tax-partial-label {
  font-size: 14px;
  color: #212121;
  margin-bottom: 8px;
}

.tax-partial-row {
  margin-bottom: 16px;
  line-height: 36px;
}

.tax-partial-field-label {
  width: 120px;
  font-size: 14px;
  font-weight: 400;
  color: #212121;
  padding-right: 8px;
}

.tax-partial-input {
  margin-left: 12px;
  max-width: 674px;
}
</style>
