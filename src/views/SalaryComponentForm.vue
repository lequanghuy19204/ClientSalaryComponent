<template>
  <div class="salary-form-page d-flex flex-column overflow-hidden">
    <!-- Header Section -->
    <div class="form-header d-flex justify-content-between align-items-center flex-shrink-0">
      <div class="header-left d-flex align-items-center gap-2">
        <button
          class="btn-back d-flex align-items-center justify-content-center bg-transparent border-0 rounded-1"
          @click="goBack"
          title="Quay lại"
        >
          <span class="icon d-inline-block flex-shrink-0 icon-arrow-left"></span>
        </button>
        <h2 class="form-title">{{ isEdit ? 'Sửa thành phần' : 'Thêm thành phần' }}</h2>
      </div>
      <div class="header-right d-flex align-items-center gap-2">
        <button class="btn btn-outline" @click="handleCancel">
          <span class="btn-text">Hủy bỏ</span>
        </button>
        <button class="btn btn-outline" @click="handleSaveAndAdd" v-if="!isEdit">
          <span class="btn-text">Lưu và thêm</span>
        </button>
        <button class="btn btn-primary" @click="handleSave">
          <span class="btn-text">Lưu</span>
        </button>
      </div>
    </div>

    <!-- Form Content -->
    <div class="form-content d-flex flex-column flex-grow-1 overflow-auto bg-white rounded-1">
      <div class="form-body">
        <!-- Row 1: Tên thành phần -->
        <div class="form-row d-flex">
          <label class="form-label-left required"><b>Tên thành phần</b></label>
          <div class="form-input-right">
            <input
              type="text"
              class="form-input w-full"
              v-model="formData.name"
              maxlength="255"
              autofocus
            />
          </div>
        </div>

        <!-- Row 2: Mã thành phần -->
        <div class="form-row d-flex">
          <label class="form-label-left required"><b>Mã thành phần</b></label>
          <div class="form-input-right">
            <input
              type="text"
              class="form-input w-full"
              v-model="formData.code"
              placeholder="Nhập mã viết liền"
              maxlength="255"
            />
          </div>
        </div>

        <!-- Row 3: Đơn vị áp dụng -->
        <div class="form-row d-flex">
          <label class="form-label-left"><b>Đơn vị áp dụng</b></label>
          <div class="form-input-right">
            <div class="selected-units d-flex align-items-center flex-wrap gap-2">
              <div
                v-for="unitId in formData.unitIds"
                :key="unitId"
                class="selected-unit-tag d-flex align-items-center"
              >
                <span class="unit-text">{{ getUnitName(unitId) }}</span>
                <span class="unit-remove mi-close-small" @click="removeUnit(unitId)"></span>
              </div>
              <div class="select-wrapper flex-1">
                <select class="form-select" @change="addUnit($event)">
                  <option value="">Chọn đơn vị</option>
                  <option
                    v-for="unit in availableUnits"
                    :key="unit.id"
                    :value="unit.id"
                  >
                    {{ unit.name }}
                  </option>
                </select>
                <span class="select-icon icon-down"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 4: Loại thành phần -->
        <div class="form-row d-flex">
          <label class="form-label-left required"><b>Loại thành phần</b></label>
          <div class="form-input-right">
            <div class="select-wrapper" style="width: 237px;">
              <select class="form-select" v-model="formData.type">
                <option value="">Chọn loại thành phần</option>
                <option v-for="type in componentTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
              <span class="select-icon icon-down"></span>
            </div>
          </div>
        </div>

        <!-- Row 5: Tính chất -->
        <div class="form-row d-flex">
          <label class="form-label-left required"><b>Tính chất</b></label>
          <div class="form-input-right d-flex align-items-center gap-4">
            <div class="select-wrapper" style="width: 237px;">
              <select class="form-select" v-model="formData.property">
                <option value="">Chọn tính chất</option>
                <option v-for="prop in properties" :key="prop.value" :value="prop.value">
                  {{ prop.label }}
                </option>
              </select>
              <span class="select-icon icon-down"></span>
            </div>
            <div class="tax-options d-flex align-items-center gap-4">
              <label class="radio-item d-flex align-items-center gap-2">
                <input type="radio" name="taxOption" value="taxable" v-model="formData.taxOption" />
                <span class="radio-label">Chịu thuế</span>
              </label>
              <label class="radio-item d-flex align-items-center gap-2">
                <input type="radio" name="taxOption" value="tax_exempt_full" v-model="formData.taxOption" />
                <span class="radio-label">Miễn thuế toàn phần</span>
              </label>
              <label class="radio-item d-flex align-items-center gap-2">
                <input type="radio" name="taxOption" value="tax_exempt_partial" v-model="formData.taxOption" />
                <span class="radio-label">Miễn thuế một phần</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Row 6: Định mức -->
        <div class="form-row d-flex">
          <label class="form-label-left"><b>Định mức</b></label>
          <div class="form-input-right">
            <textarea
              class="form-textarea formula-editor"
              v-model="formData.quota"
              placeholder="Tự động gợi ý công thức và tham số khi gõ"
              rows="2"
            ></textarea>
          </div>
        </div>

        <!-- Row 7: Checkbox cho phép vượt định mức -->
        <div class="form-row d-flex">
          <label class="form-label-left"></label>
          <div class="form-input-right">
            <label class="checkbox-item d-flex align-items-center gap-2">
              <input type="checkbox" v-model="formData.allowExceedQuota" />
              <span class="checkbox-label">Cho phép giá trị tính vượt quá định mức</span>
              <span class="info-icon mi-circle-info"></span>
            </label>
          </div>
        </div>

        <!-- Row 8: Kiểu giá trị -->
        <div class="form-row d-flex">
          <label class="form-label-left"><b>Kiểu giá trị</b></label>
          <div class="form-input-right">
            <div class="select-wrapper" style="width: 237px;">
              <select class="form-select" v-model="formData.valueType" disabled>
                <option v-for="vType in valueTypes" :key="vType.value" :value="vType.value">
                  {{ vType.label }}
                </option>
              </select>
              <span class="select-icon icon-down"></span>
            </div>
          </div>
        </div>

        <!-- Row 9: Giá trị -->
        <div class="form-row d-flex">
          <label class="form-label-left"><b>Giá trị</b></label>
          <div class="form-input-right">
            <div class="value-options">
              <!-- Option 1: Tự động cộng tổng -->
              <div class="value-option d-flex align-items-center gap-4 mb-3">
                <label class="radio-item d-flex align-items-center gap-2">
                  <input type="radio" name="valueCalculation" value="auto_sum" v-model="formData.valueCalculation" />
                  <span class="radio-label">Tự động cộng tổng giá trị của các nhân viên</span>
                </label>
                <div class="select-wrapper" style="width: 240px;">
                  <select class="form-select" v-model="formData.sumScope" :disabled="formData.valueCalculation !== 'auto_sum'">
                    <option value="same_unit">Trong cùng đơn vị công tác</option>
                    <option value="all_units">Tất cả đơn vị</option>
                  </select>
                  <span class="select-icon icon-down"></span>
                </div>
              </div>
              <!-- Option 2: Tính theo công thức -->
              <div class="value-option">
                <label class="radio-item d-flex align-items-center gap-2 mb-2">
                  <input type="radio" name="valueCalculation" value="formula" v-model="formData.valueCalculation" />
                  <span class="radio-label">Tính theo công thức tự đặt</span>
                </label>
                <div class="formula-container" v-if="formData.valueCalculation === 'formula'">
                  <textarea
                    class="form-textarea formula-editor"
                    v-model="formData.valueFormula"
                    placeholder="Tự động gợi ý công thức và tham số khi gõ"
                    rows="2"
                  ></textarea>
                  <button class="btn-ava d-flex align-items-center gap-2">
                    <span class="btn-ava-icon"></span>
                    <b class="btn-ava-text">Tạo công thức với MISA AVA</b>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 10: Mô tả -->
        <div class="form-row d-flex">
          <label class="form-label-left"><b>Mô tả</b></label>
          <div class="form-input-right">
            <textarea
              class="form-textarea"
              v-model="formData.description"
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- Row 11: Hiển thị trên phiếu lương -->
        <div class="form-row d-flex">
          <label class="form-label-left"><b>Hiển thị trên phiếu lương</b></label>
          <div class="form-input-right d-flex align-items-center gap-4">
            <label class="radio-item d-flex align-items-center gap-2">
              <input type="radio" name="showOnPayslip" value="yes" v-model="formData.showOnPayslip" />
              <span class="radio-label">Có</span>
            </label>
            <label class="radio-item d-flex align-items-center gap-2">
              <input type="radio" name="showOnPayslip" value="no" v-model="formData.showOnPayslip" />
              <span class="radio-label">Không</span>
            </label>
            <label class="radio-item d-flex align-items-center gap-2">
              <input type="radio" name="showOnPayslip" value="if_not_zero" v-model="formData.showOnPayslip" />
              <span class="radio-label">Chỉ hiển thị nếu giá trị khác 0</span>
            </label>
          </div>
        </div>

        <!-- Row 12: Nguồn tạo -->
        <div class="form-row d-flex">
          <label class="form-label-left"><b>Nguồn tạo</b></label>
          <div class="form-input-right">
            <span class="source-text">{{ getSourceLabel }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)

const formData = reactive({
  code: '',
  name: '',
  unitIds: [2],
  type: '',
  property: '',
  taxOption: 'taxable',
  quota: '',
  allowExceedQuota: false,
  valueType: 'currency',
  valueCalculation: 'formula',
  sumScope: 'same_unit',
  valueFormula: '',
  description: '',
  showOnPayslip: 'yes',
  source: 'manual'
})

const units = ref([
  { id: 1, name: 'Tất cả' },
  { id: 2, name: 'Misa Test pdthien 2024' },
  { id: 3, name: 'Chi nhánh miền Bắc' },
  { id: 4, name: 'Chi nhánh miền Nam' }
])

const availableUnits = computed(() => {
  return units.value.filter(unit => !formData.unitIds.includes(unit.id))
})

const getUnitName = (unitId) => {
  const unit = units.value.find(u => u.id === unitId)
  return unit ? unit.name : ''
}

const removeUnit = (unitId) => {
  const index = formData.unitIds.indexOf(unitId)
  if (index > -1) {
    formData.unitIds.splice(index, 1)
  }
}

const addUnit = (event) => {
  const unitId = parseInt(event.target.value)
  if (unitId && !formData.unitIds.includes(unitId)) {
    formData.unitIds.push(unitId)
  }
  event.target.value = ''
}

const componentTypes = ref([
  { value: 'salary', label: 'Lương' },
  { value: 'employee_info', label: 'Thông tin nhân viên' },
  { value: 'allowance', label: 'Phụ cấp' },
  { value: 'deduction', label: 'Giảm trừ' }
])

const properties = ref([
  { value: 'income', label: 'Thu nhập' },
  { value: 'taxable', label: 'Chịu thuế' },
  { value: 'non_taxable', label: 'Không chịu thuế' },
  { value: 'deduction', label: 'Giảm trừ' }
])

const valueTypes = ref([
  { value: 'currency', label: 'Tiền tệ' },
  { value: 'number', label: 'Số' },
  { value: 'percent', label: 'Phần trăm' },
  { value: 'formula', label: 'Công thức' }
])

const sources = ref([
  { value: 'manual', label: 'Tự thêm' },
  { value: 'system', label: 'Hệ thống' }
])

const getSourceLabel = computed(() => {
  const source = sources.value.find(s => s.value === formData.source)
  return source ? source.label : 'Tự thêm'
})

const goBack = () => {
  router.back()
}

const handleCancel = () => {
  router.back()
}

const handleSave = () => {
  console.log('Save:', formData)
}

const handleSaveAndAdd = () => {
  console.log('Save and add:', formData)
  Object.assign(formData, {
    code: '',
    name: '',
    unitIds: [],
    type: '',
    property: '',
    taxOption: 'taxable',
    quota: '',
    allowExceedQuota: false,
    valueType: 'currency',
    valueCalculation: 'formula',
    sumScope: 'same_unit',
    valueFormula: '',
    description: '',
    showOnPayslip: 'yes',
    source: 'manual'
  })
}
</script>

<style scoped>
/* Page Container */
.salary-form-page {
  padding: 16px 24px;
  height: calc(100vh - 48px);
}

/* Header Section */
.form-header {
  padding: 0 0 16px 0;
}

.btn-back {
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-back:hover {
  background: #f5f5f5;
}

.form-title {
  font-size: 20px;
  font-weight: 700;
  color: #212121;
  letter-spacing: 0.384px;
  line-height: 30px;
  margin: 0;
}

/* Buttons */
.btn {
  height: 36px;
  padding: 0 16px;
  border: 1px solid #ebebeb;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #212121;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.btn:hover {
  background: #f5f5f5;
}

.btn-primary {
  background: #34b057;
  border-color: #34b057;
  color: #fff;
}

.btn-primary:hover {
  background: #2a9047;
  border-color: #2a9047;
}

.btn-outline {
  background: #fff;
  border-color: #ebebeb;
}

/* Form Content */
.form-content {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-body {
  padding: 40px;
  max-width: 100%;
}

/* Form Row */
.form-row {
  margin-bottom: 16px;
  line-height: 35px;
}

.form-row:last-child {
  margin-bottom: 0;
}

/* Form Label Left */
.form-label-left {
  width: 186px;
  flex-shrink: 0;
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
  width: 676px;
}

.w-full {
  width: 100%;
}

/* Form Group */
.form-group {
  display: flex;
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

/* Form Label */
.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #212121;
  margin-bottom: 8px;
}

.form-label.required::after {
  content: ' *';
  color: #ff6161;
}

/* Selected Units */
.selected-units {
  min-height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 4px 8px;
}

.selected-unit-tag {
  background: #f0f0f0;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 14px;
}

.unit-text {
  margin-right: 8px;
}

.unit-remove {
  cursor: pointer;
  font-size: 12px;
}

/* Radio and Checkbox Items */
.radio-item,
.checkbox-item {
  cursor: pointer;
}

.radio-item input[type="radio"],
.checkbox-item input[type="checkbox"] {
  cursor: pointer;
}

.radio-label,
.checkbox-label {
  font-size: 14px;
  color: #212121;
}

/* Tax Options */
.tax-options {
  margin-left: 16px;
}

/* Formula Editor */
.formula-editor {
  min-height: 70px;
}

/* Value Options */
.value-options .value-option {
  margin-bottom: 16px;
}

.value-options .value-option:last-child {
  margin-bottom: 0;
}

/* Formula Container */
.formula-container {
  position: relative;
  margin-top: 8px;
}

/* AVA Button */
.btn-ava {
  position: absolute;
  right: 4px;
  bottom: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 13px;
  color: #1a73e8;
}

.btn-ava:hover {
  background: #f0f0f0;
  border-radius: 4px;
}

.btn-ava-icon {
  width: 16px;
  height: 16px;
}

/* Source Text */
.source-text {
  font-size: 14px;
  color: #212121;
  line-height: 35px;
}

/* Info Icon */
.info-icon {
  font-size: 14px;
  color: #1a73e8;
  cursor: pointer;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

/* Form Input */
.form-input {
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #212121;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #34b057;
}

.form-input::placeholder {
  color: #999;
}

/* Select Wrapper */
.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #212121;
  background: #fff;
  outline: none;
  cursor: pointer;
  appearance: none;
  transition: border-color 0.2s ease;
}

.form-select:focus {
  border-color: #34b057;
}

.form-select:disabled {
  background: #f6f6f6;
  color: #999;
  cursor: not-allowed;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Form Textarea */
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #212121;
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  border-color: #34b057;
}

.form-textarea::placeholder {
  color: #999;
}

/* Utility Classes */
.d-flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-grow-1 {
  flex-grow: 1;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-auto {
  overflow: auto;
}

.bg-white {
  background: #fff;
}

.bg-transparent {
  background: transparent;
}

.border-0 {
  border: none;
}

.rounded-1 {
  border-radius: 4px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}
</style>
