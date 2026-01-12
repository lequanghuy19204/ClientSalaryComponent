<template>
  <div class="salary-form-page">
    <!-- Header Section -->
    <div class="form-header">
      <div class="header-left">
        <MsButton
          icon="icon-arrow-left"
          variant="text"
          size="small"
          class="btn-back"
          @click="goBack"
          title="Quay lại"
        />
        <h2 class="form-title">{{ isEdit ? 'Sửa thành phần' : 'Thêm thành phần' }}</h2>
      </div>
      <div class="header-right">
        <MsButton label="Hủy bỏ" variant="outline" @click="handleCancel" />
        <MsButton label="Lưu và thêm" variant="outline" @click="handleSaveAndAdd" v-if="!isEdit" />
        <MsButton label="Lưu" variant="primary" @click="handleSave" />
      </div>
    </div>

    <!-- Form Content -->
    <div class="form-content">
      <div class="form-body">
        <!-- Row 1: Tên thành phần -->
        <div class="form-row">
          <label class="form-label-left required"><b>Tên thành phần</b></label>
          <div class="form-input-right">
            <MsInput
              v-model="formData.name"
              class="w-full"
              :maxlength="255"
              :autofocus="true"
            />
          </div>
        </div>

        <!-- Row 2: Mã thành phần -->
        <div class="form-row">
          <label class="form-label-left required"><b>Mã thành phần</b></label>
          <div class="form-input-right">
            <MsInput
              v-model="formData.code"
              class="w-full"
              placeholder="Nhập mã viết liền"
              :maxlength="255"
            />
          </div>
        </div>

        <!-- Row 3: Đơn vị áp dụng -->
        <div class="form-row">
          <label class="form-label-left"><b>Đơn vị áp dụng</b></label>
          <div class="form-input-right">
            <MsTree
              v-model="formData.unitIds"
              :data-source="unitTreeData"
              key-expr="id"
              display-expr="name"
              placeholder=""
              :max-selected-labels="3"
              class="form-unit-tree"
            />
          </div>
        </div>

        <!-- Row 4: Loại thành phần -->
        <div class="form-row">
          <label class="form-label-left required"><b>Loại thành phần</b></label>
          <div class="form-input-right">
            <MsSelect
              v-model="formData.type"
              :options="componentTypes"
              placeholder="Chọn loại thành phần"
              size="medium"
            />
          </div>
        </div>

        <!-- Row 5: Tính chất -->
        <div class="form-row">
          <label class="form-label-left required"><b>Tính chất</b></label>
          <div class="form-input-right flex-row">
            <MsSelect
              v-model="formData.property"
              :options="properties"
              placeholder="Chọn tính chất"
              size="medium"
            />
            <!-- Thu nhập: 3 radio buttons -->
            <div class="tax-options" v-if="formData.property === 'income'">
              <MsRadioButton v-model="formData.taxOption" value="taxable" label="Chịu thuế" />
              <MsRadioButton v-model="formData.taxOption" value="tax_exempt_full" label="Miễn thuế toàn phần" />
              <MsRadioButton v-model="formData.taxOption" value="tax_exempt_partial" label="Miễn thuế một phần" />
            </div>
            <!-- Khấu trừ: 1 checkbox -->
            <div class="tax-options" v-else-if="formData.property === 'deduction'">
              <MsCheckbox v-model="formData.deductWhenCalculatingTax" label="Giảm trừ khi tính thuế" />
            </div>
            <!-- Khác: không hiển thị gì -->
          </div>
        </div>

        <!-- Row 6: Định mức (ẩn khi chọn Khác) -->
        <div class="form-row" v-if="formData.property !== 'other'">
          <label class="form-label-left"><b>Định mức</b></label>
          <div class="form-input-right">
            <MsTextarea
              v-model="formData.quota"
              placeholder="Tự động gợi ý công thức và tham số khi gõ"
              :rows="2"
              class="w-full formula-editor"
            />
          </div>
        </div>

        <!-- Row 7: Checkbox cho phép vượt định mức (ẩn khi chọn Khác) -->
        <div class="form-row" v-if="formData.property !== 'other'">
          <label class="form-label-left"></label>
          <div class="form-input-right">
            <div class="checkbox-group">
              <MsCheckbox v-model="formData.allowExceedQuota" label="Cho phép giá trị tính vượt quá định mức" />
              <i class="pi pi-info-circle info-icon" v-tooltip.top="'Thông tin thêm'"></i>
            </div>
          </div>
        </div>

        <!-- Row 8: Kiểu giá trị -->
        <div class="form-row">
          <label class="form-label-left"><b>Kiểu giá trị</b></label>
          <div class="form-input-right">
            <MsSelect
              v-model="formData.valueType"
              :options="valueTypes"
              :disabled="formData.property !== 'other'"
              size="medium"
            />
          </div>
        </div>

        <!-- Row 9: Giá trị -->
        <div class="form-row align-top">
          <label class="form-label-left"><b>Giá trị</b></label>
          <div class="form-input-right">
            <div class="value-options">
              <!-- Option 1: Tự động cộng tổng -->
              <div class="value-option">
                <MsRadioButton
                  v-model="formData.valueCalculation"
                  value="auto_sum"
                  label="Tự động cộng tổng giá trị của các nhân viên"
                />
                <MsSelect
                  v-model="formData.sumScope"
                  :options="sumScopeOptions"
                  :disabled="formData.valueCalculation !== 'auto_sum'"
                  size="medium"
                  class="ml-4"
                />
                <!-- Cấp cơ cấu tổ chức -->
                <MsSelect
                  v-if="formData.sumScope === 'org_structure'"
                  v-model="formData.orgLevel"
                  :options="orgLevelOptions"
                  :disabled="formData.valueCalculation !== 'auto_sum'"
                  size="small"
                />
              </div>
              <!-- Select thành phần lương khi chọn auto_sum -->
              <div class="value-option" v-if="formData.valueCalculation === 'auto_sum'">
                <MsSelect
                  v-model="formData.salaryComponentToSum"
                  :options="salaryComponentOptions"
                  placeholder="Chọn thành phần lương để cộng giá trị"
                  size="large"
                  class="ml-component-select"
                />
              </div>
              <!-- Option 2: Tính theo công thức -->
              <div class="value-option">
                <MsRadioButton
                  v-model="formData.valueCalculation"
                  value="formula"
                  label="Tính theo công thức tự đặt"
                />
                <div class="formula-container" v-if="formData.valueCalculation === 'formula'">
                  <MsTextarea
                    v-model="formData.valueFormula"
                    placeholder="Tự động gợi ý công thức và tham số khi gõ"
                    :rows="2"
                    class="w-full formula-editor"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 10: Mô tả -->
        <div class="form-row">
          <label class="form-label-left"><b>Mô tả</b></label>
          <div class="form-input-right">
            <MsTextarea
              v-model="formData.description"
              :rows="2"
              class="w-full"
            />
          </div>
        </div>

        <!-- Row 11: Hiển thị trên phiếu lương -->
        <div class="form-row">
          <label class="form-label-left"><b>Hiển thị trên phiếu lương</b></label>
          <div class="form-input-right flex-row">
            <MsRadioButton v-model="formData.showOnPayslip" value="yes" label="Có" />
            <MsRadioButton v-model="formData.showOnPayslip" value="no" label="Không" />
            <MsRadioButton v-model="formData.showOnPayslip" value="if_not_zero" label="Chỉ hiển thị nếu giá trị khác 0" />
          </div>
        </div>

        <!-- Row 12: Nguồn tạo -->
        <div class="form-row">
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
import MsInput from '@/components/bases/MsInput.vue'
import MsTextarea from '@/components/bases/MsTextarea.vue'
import MsSelect from '@/components/bases/MsSelect.vue'
import MsTree from '@/components/bases/MsTree.vue'
import MsRadioButton from '@/components/bases/MsRadioButton.vue'
import MsCheckbox from '@/components/bases/MsCheckbox.vue'
import MsButton from '@/components/bases/MsButton.vue'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)

const formData = reactive({
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
  source: 'manual'
})

const unitTreeData = [
  {
    id: 1,
    name: 'Misa Test pdthien 2024',
    items: [
      {
        id: 11,
        name: 'Chi nhánh miền Bắc',
        items: [
          {
            id: 111,
            name: 'Khối sản xuất',
            items: [
              { id: 1111, name: 'Dự án Core' },
              { id: 1112, name: 'Dự án C&B' }
            ]
          },
          { id: 112, name: 'Trung tâm kinh doanh' },
          { id: 113, name: 'Trung tâm hỗ trợ khách hàng' }
        ]
      },
      {
        id: 12,
        name: 'Chi nhánh miền Nam',
        items: [
          { id: 121, name: 'Trung tâm kinh doanh' }
        ]
      }
    ]
  }
]

const componentTypes = ref([
  { value: 'employee_info', label: 'Thông tin nhân viên' },
  { value: 'attendance', label: 'Chấm công' },
  { value: 'revenue', label: 'Doanh số' },
  { value: 'kpi', label: 'KPI' },
  { value: 'product', label: 'Sản phẩm' },
  { value: 'salary', label: 'Lương' },
  { value: 'pit', label: 'Thuế TNCN' },
  { value: 'insurance_union', label: 'Bảo hiểm - Công đoàn' },
  { value: 'other', label: 'Khác' }
])

const properties = ref([
  { value: 'income', label: 'Thu nhập' },
  { value: 'deduction', label: 'Khấu trừ' },
  { value: 'other', label: 'Khác' }
])

const valueTypes = ref([
  { value: 'number', label: 'Số' },
  { value: 'currency', label: 'Tiền tệ' },
  { value: 'percent', label: 'Phần trăm' },
  { value: 'text', label: 'Chữ' },
  { value: 'date', label: 'Ngày' }
])

const sumScopeOptions = ref([
  { value: 'same_unit', label: 'Trong cùng đơn vị công tác' },
  { value: 'subordinate', label: 'Dưới quyền' },
  { value: 'org_structure', label: 'Thuộc cơ cấu tổ chức' }
])

const orgLevelOptions = ref([
  { value: 'level_1', label: 'Cấp 1' },
  { value: 'level_2', label: 'Cấp 2' },
  { value: 'level_3', label: 'Cấp 3' },
  { value: 'level_4', label: 'Cấp 4' }
])

const salaryComponentOptions = ref([
  { value: 'base_salary', label: 'Lương cơ bản' },
  { value: 'allowance', label: 'Phụ cấp' },
  { value: 'bonus', label: 'Thưởng' },
  { value: 'overtime', label: 'Làm thêm giờ' },
  { value: 'insurance', label: 'Bảo hiểm' }
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
    source: 'manual'
  })
}
</script>

<style scoped>
/* Page Container */
.salary-form-page {
  padding: 16px 24px;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header Section */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 16px 0;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
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
}

/* Form Content */
.form-content {
  flex-grow: 1;
  overflow: auto;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 14px;
}

.form-body {
  padding: 40px;
  max-width: 100%;
}

/* Form Row */
.form-row {
  display: flex;
  margin-bottom: 16px;
  line-height: 36px;
  align-items: center;
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
  flex: 1;
  max-width: 1104px;
}

/* Input wrapper max-width */
.form-input-right > :deep(.ms-input-wrapper),
.form-input-right > :deep(.ms-textarea-wrapper),
.form-input-right > :deep(.ms-multiselect-wrapper) {
  max-width: 674px;
}

.form-input-right.flex-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.w-full {
  width: 100%;
}

/* Checkbox Group */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Tax Options */
.tax-options {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: 16px;
  flex-shrink: 0;
  white-space: nowrap;
}

/* Formula Editor */
.formula-editor :deep(.ms-textarea) {
  min-height: 70px;
}

/* Value Options */
.value-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.value-option {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* Formula Container */
.formula-container {
  position: relative;
  width: 100%;
  margin-top: 8px;
}

/* Source Text */
.source-text {
  font-size: 14px;
  color: #212121;
  line-height: 36px;
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
  display: flex;
  height: 34px;
}

.form-unit-tree :deep(.ms-tree) {
  width: 100%;
  height: 34px;
  min-height: 34px;
}

.form-unit-tree :deep(.ms-tree-display) {
  line-height: 1;
}
</style>
