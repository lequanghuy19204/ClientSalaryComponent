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
        <h2 class="form-title overflow-hidden" :title="isEdit || isView ? formData.salaryCompositionName : ''">
          {{ isEdit || isView ? formData.salaryCompositionName : 'Thêm thành phần' }}
        </h2>
      </div>
      <div class="d-flex align-items-center gap-2">
        <template v-if="isView">
          <MsButton label="Sửa" variant="primary" @click="switchToEditMode" />
        </template>
        <template v-else>
          <MsButton label="Hủy bỏ" variant="outline" @click="handleCancel" />
          <MsButton label="Lưu và thêm" variant="outline" @click="handleSaveAndAdd" v-if="!isEdit" />
          <MsButton label="Lưu" variant="primary" @click="handleSave" />
        </template>
        <div v-if="isEdit || isView" class="more-dropdown-wrapper position-relative">
          <MsButton
            icon="icon-mi-threedot"
            variant="outline"
            class="btn-more"
            title="Chức năng khác"
            :icon-hover="true"
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
            <MsFormControl
              ref="nameInputRef"
              v-model="formData.salaryCompositionName"
              :field-keys="['salaryCompositionName']"
              :form-data="formData"
              :mode="formMode"
              v-model:is-field-editing="isFieldEditing"
              @update="handleFieldUpdate"
              @restore="handleFieldRestore"
            >
              <template #default>
                <MsInput
                  v-model="formData.salaryCompositionName"
                  class="w-full"
                  :maxlength="255"
                  :has-error="!!formErrors.salaryCompositionName"
                  :error-message="formErrors.salaryCompositionName"
                />
              </template>
              <template #display>
                {{ formData.salaryCompositionName }}
              </template>
            </MsFormControl>
          </div>
        </div>

        <!-- Row 2: Mã thành phần -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left required flex-shrink-0"><b>Mã thành phần</b></label>
          <div class="form-input-right">
            <MsFormControl
              v-model="formData.salaryCompositionCode"
              :field-keys="['salaryCompositionCode']"
              :form-data="formData"
              :mode="formMode"
              :readonly="isEdit || isView"
              v-model:is-field-editing="isFieldEditing"
              @update="handleFieldUpdate"
              @restore="handleFieldRestore"
            >
              <template #default>
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
              </template>
              <template #display>
                {{ formData.salaryCompositionCode }}
              </template>
            </MsFormControl>
          </div>
        </div>

        <!-- Row 3: Đơn vị áp dụng -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left flex-shrink-0"><b>Đơn vị áp dụng</b></label>
          <div class="form-input-right">
            <MsFormControl
              :field-keys="['organizationIds']"
              :form-data="formData"
              :mode="formMode"
              v-model:is-field-editing="isFieldEditing"
              @update="handleFieldUpdate"
              @restore="handleFieldRestore"
            >
              <template #default>
                <MsTree
                  v-model="formData.organizationIds"
                  :data-source="unitTreeData"
                  key-expr="organizationId"
                  display-expr="organizationName"
                  placeholder=""
                  :max-selected-labels="3"
                  class="form-unit-tree"
                />
              </template>
              <template #display>
                {{ getOrganizationNames() }}
              </template>
            </MsFormControl>
          </div>
        </div>

        <!-- Row 4: Loại thành phần -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left required flex-shrink-0"><b>Loại thành phần</b></label>
          <div class="form-input-right">
            <MsFormControl
              v-model="formData.salaryCompositionType"
              :field-keys="['salaryCompositionType']"
              :form-data="formData"
              :mode="formMode"
              v-model:is-field-editing="isFieldEditing"
              @update="handleFieldUpdate"
              @restore="handleFieldRestore"
              class="form-control-type"
            >
              <template #default>
                <MsSelect
                  v-model="formData.salaryCompositionType"
                  :options="componentTypes"
                  placeholder=""
                  size="medium"
                  :has-error="!!formErrors.salaryCompositionType"
                  :error-message="formErrors.salaryCompositionType"
                />
              </template>
              <template #display>
                {{ getComponentTypeLabel(formData.salaryCompositionType) }}
              </template>
            </MsFormControl>
          </div>
        </div>

        <!-- Row 5: Tính chất -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left required flex-shrink-0"><b>Tính chất</b></label>
          <div class="form-input-right d-flex align-items-center gap-3">
            <MsFormControl
              v-model="formData.salaryCompositionNature"
              :field-keys="['salaryCompositionNature']"
              :form-data="formData"
              :mode="formMode"
              v-model:is-field-editing="isFieldEditing"
              @update="handleFieldUpdate"
              @restore="handleFieldRestore"
              class="form-control-nature"
            >
              <template #default>
                <MsSelect
                  v-model="formData.salaryCompositionNature"
                  :options="properties"
                  placeholder="Chọn tính chất"
                  size="medium"
                  :has-error="!!formErrors.salaryCompositionNature"
                  :error-message="formErrors.salaryCompositionNature"
                />
              </template>
              <template #display>
                {{ getPropertyLabel(formData.salaryCompositionNature) }}
              </template>
            </MsFormControl>
            <!-- Thu nhập: 3 radio buttons -->
            <div
              class="tax-options d-flex align-items-center flex-shrink-0"
              v-if="formData.salaryCompositionNature === 'income'"
            >
              <MsRadioButton v-model="formData.salaryCompositionTaxOption" value="taxable" label="Chịu thuế" @update:model-value="handleViewFieldChange" />
              <MsRadioButton
                v-model="formData.salaryCompositionTaxOption"
                value="tax_exempt_full"
                label="Miễn thuế toàn phần"
                @update:model-value="handleViewFieldChange"
              />
              <MsRadioButton
                v-model="formData.salaryCompositionTaxOption"
                value="tax_exempt_partial"
                label="Miễn thuế một phần"
                @update:model-value="handleViewFieldChange"
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
                @update:model-value="handleViewFieldChange"
              />
            </div>
            <!-- Khác: không hiển thị gì -->
          </div>
        </div>

        <!-- Row 6: Định mức (ẩn khi chọn Khác) -->
        <div class="form-row d-flex align-items-center" v-if="formData.salaryCompositionNature !== 'other'">
          <label class="form-label-left flex-shrink-0"><b>Định mức</b></label>
          <div class="form-input-right">
            <MsFormControl
              v-model="formData.salaryCompositionQuota"
              :field-keys="['salaryCompositionQuota']"
              :form-data="formData"
              :mode="formMode"
              v-model:is-field-editing="isFieldEditing"
              @update="handleFieldUpdate"
              @restore="handleFieldRestore"
              class="formula-control-wide"
            >
              <template #default>
                <MsFormulaEditor
                  v-model="formData.salaryCompositionQuota"
                  placeholder="Tự động gợi ý công thức và tham số khi gõ"
                  class="w-full formula-editor-wide"
                />
              </template>
              <template #display>
                {{ formData.salaryCompositionQuota || '' }}
              </template>
            </MsFormControl>
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
                @update:model-value="handleViewFieldChange"
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
              @update:model-value="handleViewFieldChange"
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
                  @update:model-value="handleViewFieldChange"
                />
                <MsSelect
                  v-model="formData.salaryCompositionSumScope"
                  :options="sumScopeOptions"
                  :disabled="formData.salaryCompositionValueCalculation !== 'auto_sum'"
                  size="medium"
                  class="ml-4"
                  @update:model-value="handleViewFieldChange"
                />
                <!-- Cấp cơ cấu tổ chức -->
                <MsSelect
                  v-if="formData.salaryCompositionSumScope === 'org_structure'"
                  v-model="formData.salaryCompositionOrgLevel"
                  :options="orgLevelOptions"
                  :disabled="formData.salaryCompositionValueCalculation !== 'auto_sum'"
                  size="small"
                  @update:model-value="handleViewFieldChange"
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
                  @update:model-value="handleViewFieldChange"
                />
              </div>
              <!-- Option 2: Tính theo công thức -->
              <div class="value-option d-flex align-items-center gap-3">
                <MsRadioButton
                  v-model="formData.salaryCompositionValueCalculation"
                  value="formula"
                  label="Tính theo công thức tự đặt"
                  @update:model-value="handleViewFieldChange"
                />
                <div
                  class="formula-container position-relative w-100"
                  v-if="formData.salaryCompositionValueCalculation === 'formula'"
                >
                  <MsFormControl
                    v-model="formData.salaryCompositionValueFormula"
                    :field-keys="['salaryCompositionValueFormula']"
                    :form-data="formData"
                    :mode="formMode"
                    v-model:is-field-editing="isFieldEditing"
                    @update="handleFieldUpdate"
              @restore="handleFieldRestore"
                    class="formula-control-wide"
                  >
                    <template #default>
                      <MsFormulaEditor
                        v-model="formData.salaryCompositionValueFormula"
                        placeholder="Tự động gợi ý công thức và tham số khi gõ"
                        class="w-full formula-editor-wide"
                      />
                    </template>
                    <template #display>
                      {{ formData.salaryCompositionValueFormula || '' }}
                    </template>
                  </MsFormControl>
                </div>
              </div>

              <!-- Phần chịu thuế / miễn thuế (chỉ hiển thị khi chọn miễn thuế một phần) -->
              <div
                class="tax-partial-section"
                v-if="formData.salaryCompositionNature === 'income' && formData.salaryCompositionTaxOption === 'tax_exempt_partial'"
              >
                <div class="tax-partial-label">Trong đó:</div>
                <!-- Phần chịu thuế -->
                <div class="tax-partial-row d-flex align-items-start">
                  <label class="tax-partial-field-label flex-shrink-0"><b>Phần chịu thuế</b></label>
                  <div class="tax-partial-input flex-grow-1">
                    <!-- Hiển thị công thức khi phần miễn thuế đã có giá trị -->
                    <div
                      v-if="formData.salaryCompositionTaxExemptPart && !formData.salaryCompositionTaxablePart"
                      class="formula-display d-flex align-items-center"
                    >
                      <span class="formula-text">= Tổng giá trị - Phần miễn thuế</span>
                      <span class="icon icon-mi-circle-close formula-close" @click="clearTaxPartialFields"></span>
                    </div>
                    <!-- Hiển thị input khi chưa có giá trị phần miễn thuế hoặc đang có giá trị -->
                    <MsFormControl
                      v-else
                      v-model="formData.salaryCompositionTaxablePart"
                      :field-keys="['salaryCompositionTaxablePart']"
                      :form-data="formData"
                      :mode="formMode"
                      v-model:is-field-editing="isFieldEditing"
                      @update="handleFieldUpdate"
              @restore="handleFieldRestore"
                    >
                      <template #default>
                        <MsFormulaEditor
                          v-model="formData.salaryCompositionTaxablePart"
                          placeholder="Chỉ cần nhập giá trị cho 1 trong 2 phần chịu thuế và miễn thuế"
                          class="w-full"
                        />
                      </template>
                      <template #display>
                        {{ formData.salaryCompositionTaxablePart || '' }}
                      </template>
                    </MsFormControl>
                  </div>
                </div>
                <!-- Phần miễn thuế -->
                <div class="tax-partial-row d-flex align-items-start">
                  <label class="tax-partial-field-label flex-shrink-0"><b>Phần miễn thuế</b></label>
                  <div class="tax-partial-input flex-grow-1">
                    <!-- Hiển thị công thức khi phần chịu thuế đã có giá trị -->
                    <div
                      v-if="formData.salaryCompositionTaxablePart && !formData.salaryCompositionTaxExemptPart"
                      class="formula-display d-flex align-items-center"
                    >
                      <span class="formula-text">= Tổng giá trị - Phần chịu thuế</span>
                      <span class="icon icon-mi-circle-close formula-close" @click="clearTaxPartialFields"></span>
                    </div>
                    <!-- Hiển thị input khi chưa có giá trị phần chịu thuế hoặc đang có giá trị -->
                    <MsFormControl
                      v-else
                      v-model="formData.salaryCompositionTaxExemptPart"
                      :field-keys="['salaryCompositionTaxExemptPart']"
                      :form-data="formData"
                      :mode="formMode"
                      v-model:is-field-editing="isFieldEditing"
                      @update="handleFieldUpdate"
              @restore="handleFieldRestore"
                    >
                      <template #default>
                        <MsFormulaEditor
                          v-model="formData.salaryCompositionTaxExemptPart"
                          placeholder="Chỉ cần nhập giá trị cho 1 trong 2 phần chịu thuế và miễn thuế"
                          class="w-full"
                        />
                      </template>
                      <template #display>
                        {{ formData.salaryCompositionTaxExemptPart || '' }}
                      </template>
                    </MsFormControl>
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
            <MsFormControl
              v-model="formData.salaryCompositionDescription"
              :field-keys="['salaryCompositionDescription']"
              :form-data="formData"
              :mode="formMode"
              v-model:is-field-editing="isFieldEditing"
              @update="handleFieldUpdate"
              @restore="handleFieldRestore"
            >
              <template #default>
                <MsTextarea v-model="formData.salaryCompositionDescription" :rows="2" class="w-full" />
              </template>
              <template #display>
                {{ formData.salaryCompositionDescription || '' }}
              </template>
            </MsFormControl>
          </div>
        </div>

        <!-- Row 11: Hiển thị trên phiếu lương -->
        <div class="form-row d-flex align-items-center">
          <label class="form-label-left flex-shrink-0"><b>Hiển thị trên phiếu lương</b></label>
          <div class="form-input-right d-flex align-items-center gap-3">
            <MsRadioButton v-model="formData.salaryCompositionShowOnPayslip" value="yes" label="Có" @update:model-value="handleViewFieldChange" />
            <MsRadioButton v-model="formData.salaryCompositionShowOnPayslip" value="no" label="Không" @update:model-value="handleViewFieldChange" />
            <MsRadioButton
              v-model="formData.salaryCompositionShowOnPayslip"
              value="if_not_zero"
              label="Chỉ hiển thị nếu giá trị khác 0"
              @update:model-value="handleViewFieldChange"
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

        <!-- Row 13: Trạng thái (chỉ hiển thị khi sửa hoặc xem) -->
        <div class="form-row d-flex align-items-center" v-if="isEdit || isView">
          <label class="form-label-left flex-shrink-0"><b>Trạng thái</b></label>
          <div class="form-input-right d-flex align-items-center gap-3">
            <MsFormControl
              v-model="formData.salaryCompositionStatus"
              :field-keys="['salaryCompositionStatus']"
              :form-data="formData"
              :mode="formMode"
              no-edit-buttons
              @update="handleFieldUpdate"
              @restore="handleFieldRestore"
            >
              <template #default>
                <MsRadioButton v-model="formData.salaryCompositionStatus" :value="1" label="Đang theo dõi" />
                <MsRadioButton v-model="formData.salaryCompositionStatus" :value="0" label="Ngừng theo dõi" />
              </template>
              <template #display>
                {{ formData.salaryCompositionStatus === 1 ? 'Đang theo dõi' : 'Ngừng theo dõi' }}
              </template>
            </MsFormControl>
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
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import MsInput from '@/components/bases/form/MsInput.vue'
import MsTextarea from '@/components/bases/form/MsTextarea.vue'
import MsSelect from '@/components/bases/form/MsSelect.vue'
import MsRadioButton from '@/components/bases/form/MsRadioButton.vue'
import MsCheckbox from '@/components/bases/form/MsCheckbox.vue'
import MsFormulaEditor from '@/components/bases/form/MsFormulaEditor.vue'
import MsFormControl from '@/components/bases/form/MsFormControl.vue'
import MsTree from '@/components/bases/data/MsTree.vue'
import MsButton from '@/components/bases/ui/MsButton.vue'
import MsConfirmDialog from '@/components/bases/ui/MsConfirmDialog.vue'
import { useSalaryComposition, useOrganization, useToast } from '@/composables'

const props = defineProps({
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit', 'view', 'duplicate'].includes(value),
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
const isView = computed(() => props.mode === 'view')
const isDuplicate = computed(() => props.mode === 'duplicate')
const formMode = computed(() => props.mode === 'duplicate' ? 'add' : props.mode)
const isFieldEditing = ref(false)

const isCodeManuallyEdited = ref(false)
const showMoreMenu = ref(false)
const formBodyRef = ref(null)
const showUnsavedDialog = ref(false)
const nameInputRef = ref(null)
const originalFormData = ref(null)

/** Di chuyển focus đến input tiếp theo khi nhấn Enter */
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

/** Bật/tắt menu chức năng khác */
const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
}

/** Đóng menu chức năng khác khi click bên ngoài */
const closeMoreMenu = (e) => {
  if (!e.target.closest('.more-dropdown-wrapper')) {
    showMoreMenu.value = false
  }
}

/** Quay lại trang danh sách */
const goBack = () => {
  emit('back')
}

/** Chuyển sang chế độ sửa */
const switchToEditMode = () => {
  emit('back', { action: 'switch-to-edit', id: props.editId })
}

/** Xử lý cập nhật field trong view mode */
const handleFieldUpdate = async () => {
  if (!isView.value) return
  // Kiểm tra xem dữ liệu có thực sự thay đổi không
  if (!hasFormChanged()) return
  try {
    await save(props.editId)
    toast.success('Cập nhật thành công')
    originalFormData.value = JSON.parse(JSON.stringify(formData))
  } catch (error) {
    console.error('Error updating field:', error)
    toast.error('Có lỗi xảy ra khi cập nhật')
  }
}

/** Xử lý khi checkbox/radio thay đổi ở chế độ view */
const handleViewFieldChange = async () => {
  if (!isView.value) return
  await handleFieldUpdate()
}

/** Xử lý khôi phục giá trị khi hủy chỉnh sửa */
const handleFieldRestore = (originalValues) => {
  for (const key in originalValues) {
    if (Object.prototype.hasOwnProperty.call(originalValues, key)) {
      formData[key] = originalValues[key]
    }
  }
}

/** Lấy tên đơn vị áp dụng */
const getOrganizationNames = () => {
  if (!formData.organizationIds || formData.organizationIds.length === 0) {
    return ''
  }
  const names = formData.organizationIds
    .map((id) => {
      const org = unitTreeData.value?.find((o) => o.organizationId === id)
      return org?.organizationName
    })
    .filter(Boolean)
  return names.join(', ')
}

/** Lấy label loại thành phần */
const getComponentTypeLabel = (value) => {
  const option = componentTypes.value.find((o) => o.value === value)
  return option?.label || value
}

/** Lấy label tính chất */
const getPropertyLabel = (value) => {
  const option = properties.value.find((o) => o.value === value)
  return option?.label || value
}

/** Kiểm tra form đã thay đổi hay chưa */
const hasFormChanged = () => {
  if (!originalFormData.value) return false
  return JSON.stringify(formData) !== JSON.stringify(originalFormData.value)
}

/** Kiểm tra dữ liệu chưa lưu trước khi quay lại */
const checkUnsavedAndGoBack = () => {
  if (hasFormChanged()) {
    showUnsavedDialog.value = true
  } else {
    goBack()
  }
}

/** Xử lý hủy dialog dữ liệu chưa lưu */
const handleUnsavedCancel = () => {
  showUnsavedDialog.value = false
}

/** Xử lý không lưu và quay lại */
const handleUnsavedNoSave = () => {
  showUnsavedDialog.value = false
  goBack()
}

/** Xử lý lưu dữ liệu từ dialog chưa lưu */
const handleUnsavedSave = async () => {
  showUnsavedDialog.value = false
  await handleSave()
}

/** Xóa các trường thuế một phần */
const clearTaxPartialFields = () => {
  formData.salaryCompositionTaxablePart = ''
  formData.salaryCompositionTaxExemptPart = ''
}

/** Xử lý nhân bản thành phần lương */
const handleDuplicate = () => {
  showMoreMenu.value = false
  emit('back', { action: 'duplicate', id: props.editId })
}

/** Xử lý xóa thành phần lương */
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
  // Focus vào input "Tên thành phần" khi vào form
  nextTick(() => {
    nameInputRef.value?.$el?.querySelector('input')?.focus()
  })
})

onUnmounted(() => {
  document.removeEventListener('click', closeMoreMenu)
})

/** Loại bỏ dấu tiếng Việt khỏi chuỗi */
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

/** Tự động sinh mã thành phần từ tên */
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

// Reset tax option và tax deduction khi thay đổi tính chất
watch(
  () => formData.salaryCompositionNature,
  (newNature) => {
    if (newNature === 'other') {
      // Khi chọn "Khác", reset các giá trị radio về null
      formData.salaryCompositionTaxOption = null
      formData.salaryCompositionTaxDeduction = false
    } else if (newNature === 'income') {
      // Khi chọn "Thu nhập", set default cho tax option
      if (!formData.salaryCompositionTaxOption) {
        formData.salaryCompositionTaxOption = 'taxable'
      }
    } else if (newNature === 'deduction') {
      // Khi chọn "Khấu trừ", reset tax option
      formData.salaryCompositionTaxOption = null
    }
  },
)

/** Xử lý khi nhập mã thành phần */
const onCodeInput = () => {
  isCodeManuallyEdited.value = true
  validateCodeRealtime()
}

/** Kiểm tra chuỗi có chứa dấu tiếng Việt */
const hasVietnameseDiacritics = (str) => {
  const diacriticsPattern = /[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i
  return diacriticsPattern.test(str)
}

/** Kiểm tra chuỗi có chứa ký tự không hợp lệ */
const hasInvalidCharacters = (str) => {
  const validPattern = /^[A-Za-z0-9_]*$/
  return !validPattern.test(str)
}

/** Validate mã thành phần theo thời gian thực */
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

/** Xóa tất cả lỗi validate */
const clearErrors = () => {
  formErrors.salaryCompositionName = ''
  formErrors.salaryCompositionCode = ''
  formErrors.salaryCompositionType = ''
  formErrors.salaryCompositionNature = ''
}

/** Validate toàn bộ form trước khi lưu */
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
  if ((isEdit.value || isView.value) && props.editId) {
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

/** Xử lý hủy form */
const handleCancel = () => {
  checkUnsavedAndGoBack()
}

/** Xử lý lưu thành phần lương */
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

/** Xử lý lưu và thêm mới thành phần lương */
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
.form-input-right > :deep(.ms-multiselect-wrapper),
.form-input-right > :deep(.ms-form-control) {
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

/* Formula Editor Wide - 647px width */
:deep(.formula-editor-wide.ms-formula-editor) {
  max-width: 647px;
}

/* Type and Nature fields in view mode - 237px width */
.form-control-type :deep(.ms-form-control__value),
.form-control-nature :deep(.ms-form-control__value) {
  width: 237px;
}

/* Formula control wide - 647px width in view mode */
.formula-control-wide :deep(.ms-form-control__value) {
  max-width: 647px;
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

.tax-partial-input :deep(.ms-form-control__value) {
  max-width: 550px;
}

/* Formula Display (for calculated tax parts) */
.formula-display {
  height: 36px;
  max-width: 540px;
  padding: 0 12px;
  border-bottom: 1px solid #e0e0e0;
  justify-content: space-between;
}

.formula-text {
  font-size: 14px;
  color: #212121;
}

.formula-close {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 8px;
}
</style>
