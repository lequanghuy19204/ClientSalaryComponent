<template>
  <Teleport to="body">
    <Transition name="ms-popup-fade">
      <div v-if="modelValue" class="ms-popup-overlay" @click.self="onClose">
        <div class="ms-popup">
          <!-- Header -->
          <header class="ms-popup-header">
            <h2 class="ms-popup-title">Thêm từ danh mục của hệ thống</h2>
            <button class="ms-popup-close" @click="onClose" title="Đóng">
              <span class="icon icon-mi-close"></span>
            </button>
          </header>

          <!-- Content -->
          <div class="ms-popup-content">
            <!-- Filter Section -->
            <div class="popup-filter">
              <!-- Search Input -->
              <div class="filter-search">
                <div class="search-icon-wrapper">
                  <span class="icon icon-search"></span>
                </div>
                <MsInput
                  v-model="searchText"
                  placeholder="Tìm kiếm"
                  class="search-input-wrapper"
                  @keyup.enter="onSearch"
                />
              </div>

              <!-- Type Filter -->
              <MsSelect
                v-model="selectedType"
                :options="typeOptions"
                placeholder="Tất cả loại thành phần"
                size="small"
                :no-scroll="true"
                class="filter-type-select"
              />
            </div>

            <!-- Table Section -->
            <div class="popup-table">
              <BaseDataGrid
                ref="dataGridRef"
                :key="gridKey"
                :data-source="systemCategories"
                :columns="tableColumns"
                key-expr="salaryCompositionSystemId"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total-records="totalRecords"
                :page-size-options="pageSizeSelectOptions"
                :selectable="true"
                :show-actions="false"
                :show-pin-icon="false"
                :default-pinned-column-index="-1"
                @selection-changed="onSelectionChanged"
              >
                <!-- Value (formula) column template -->
                <template #valueTemplate="{ data }">
                  <MsFormulaCell :value="data.data.displayValue" />
                </template>
              </BaseDataGrid>
            </div>
          </div>

          <!-- Footer -->
          <footer class="ms-popup-footer">
            <MsButton
              label="Hủy bỏ"
              variant="outline"
              @click="onClose"
            />
            <MsButton
              label="Đồng ý"
              variant="primary"
              :disabled="selectedItems.length === 0"
              :loading="isProcessing"
              @click="onConfirm"
            />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Dialog xác nhận -->
  <MsConfirmDialog
    v-model="showConfirmDialog"
    title="Xác nhận"
    :message="confirmDialogMessage"
    confirm-text="Đồng ý"
    cancel-text="Hủy bỏ"
    confirm-variant="primary"
    :loading="isProcessing"
    @confirm="confirmMove"
  />

  <!-- Dialog cảnh báo trùng mã -->
  <MsConfirmDialog
    v-model="showOverwriteDialog"
    title="Xác nhận"
    :message="overwriteDialogMessage"
    confirm-text="Đồng ý"
    cancel-text="Hủy bỏ"
    confirm-variant="primary"
    :loading="isProcessing"
    @confirm="confirmOverwrite"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseDataGrid from '@/components/bases/data/BaseDataGrid.vue'
import MsFormulaCell from '@/components/bases/data/MsFormulaCell.vue'
import MsButton from '@/components/bases/ui/MsButton.vue'
import MsInput from '@/components/bases/form/MsInput.vue'
import MsSelect from '@/components/bases/form/MsSelect.vue'
import MsConfirmDialog from '@/components/bases/ui/MsConfirmDialog.vue'
import { salaryCompositionSystemApi } from '@/api'
import { useToast } from '@/composables'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'added'])

const toast = useToast()

const searchText = ref('')
const selectedType = ref(null)
const loading = ref(false)
const systemCategories = ref([])
const selectedItems = ref([])
const dataGridRef = ref(null)

// Dialog states
const showConfirmDialog = ref(false)
const showOverwriteDialog = ref(false)
const isProcessing = ref(false)

// Filter options
const typeOptions = [
  { value: null, label: 'Tất cả loại thành phần' },
  { value: 'employee_info', label: 'Thông tin nhân viên' },
  { value: 'attendance', label: 'Chấm công' },
  { value: 'revenue', label: 'Doanh số' },
  { value: 'kpi', label: 'KPI' },
  { value: 'product', label: 'Sản phẩm' },
  { value: 'salary', label: 'Lương' },
  { value: 'pit', label: 'Thuế TNCN' },
  { value: 'insurance_union', label: 'Bảo hiểm - Công đoàn' },
  { value: 'other', label: 'Khác' }
]

// Mapping for display
const typeLabels = {
  employee_info: 'Thông tin nhân viên',
  attendance: 'Chấm công',
  revenue: 'Doanh số',
  kpi: 'KPI',
  product: 'Sản phẩm',
  salary: 'Lương',
  pit: 'Thuế TNCN',
  insurance_union: 'Bảo hiểm - Công đoàn',
  other: 'Khác'
}

const natureLabels = {
  income: 'Thu nhập',
  deduction: 'Khấu trừ',
  other: 'Khác'
}

const taxOptionLabels = {
  taxable: 'Có',
  tax_exempt_full: 'Miễn thuế toàn phần',
  tax_exempt_partial: 'Miễn thuế một phần'
}

const valueTypeLabels = {
  currency: 'Tiền tệ',
  number: 'Số',
  percent: 'Phần trăm',
  text: 'Chữ',
  date: 'Ngày'
}

const showOnPayslipLabels = {
  yes: 'Có',
  no: 'Không',
  if_not_zero: 'Nếu khác 0'
}

/** Chuyển đổi dữ liệu API để hiển thị */
const transformData = (items) => {
  return items.map(item => ({
    ...item,
    displayType: typeLabels[item.salaryCompositionSystemType] || item.salaryCompositionSystemType,
    displayNature: natureLabels[item.salaryCompositionSystemNature] || item.salaryCompositionSystemNature,
    displayTaxable: item.salaryCompositionSystemTaxOption
      ? taxOptionLabels[item.salaryCompositionSystemTaxOption] || '-'
      : '-',
    displayTaxDeduction: item.salaryCompositionSystemTaxDeduction ? 'Có' : '-',
    displayValueType: valueTypeLabels[item.salaryCompositionSystemValueType] || item.salaryCompositionSystemValueType,
    displayShowOnPayslip: showOnPayslipLabels[item.salaryCompositionSystemShowOnPayslip] || '',
    displayQuota: item.salaryCompositionSystemQuota || '',
    displayValue: item.salaryCompositionSystemValueFormula || '-'
  }))
}

// Table columns
const tableColumns = [
  { dataField: 'salaryCompositionSystemCode', caption: 'Mã thành phần', width: 150, minWidth: 120 },
  { dataField: 'salaryCompositionSystemName', caption: 'Tên thành phần', width: 200, minWidth: 150 },
  { dataField: 'displayType', caption: 'Loại thành phần', width: 150, minWidth: 120 },
  { dataField: 'displayNature', caption: 'Tính chất', width: 120, minWidth: 100 },
  { dataField: 'displayTaxable', caption: 'Chịu thuế', width: 150, minWidth: 100 },
  { dataField: 'displayTaxDeduction', caption: 'Giảm trừ khi tính thuế', width: 180, minWidth: 150 },
  { dataField: 'displayQuota', caption: 'Định mức', width: 120, minWidth: 100 },
  { dataField: 'displayValueType', caption: 'Kiểu giá trị', width: 120, minWidth: 100 },
  { dataField: 'displayValue', caption: 'Giá trị', width: 150, minWidth: 100, cellTemplate: 'valueTemplate' },
  { dataField: 'salaryCompositionSystemDescription', caption: 'Mô tả', width: 200, minWidth: 150 },
  { dataField: 'displayShowOnPayslip', caption: 'Hiển thị trên phiếu lương', width: 180, minWidth: 150 }
]

const gridKey = computed(() => tableColumns.map(c => c.dataField).join('-'))

// Pagination
const currentPage = ref(1)
const pageSize = ref(25)
const totalRecords = ref(0)

const pageSizeSelectOptions = [
  { value: 15, label: '15' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
]

// Dialog messages
const confirmDialogMessage = computed(() => {
  if (selectedItems.value.length === 0) return ''
  if (selectedItems.value.length === 1) {
    return `Bạn có chắc chắn muốn đưa thành phần lương mặc định "<strong>${selectedItems.value[0].salaryCompositionSystemName}</strong>" vào danh sách sử dụng không?`
  }
  return `Bạn có chắc chắn muốn đưa <strong>${selectedItems.value.length}</strong> thành phần lương mặc định vào danh sách sử dụng không?`
})

const overwriteDialogMessage = computed(() => {
  return 'Đã tồn tại một hoặc nhiều thành phần lương trùng mã trên danh sách. Chương trình sẽ cập nhật thông tin của thành phần lương mặc định vào bản ghi hiện có. Bạn có muốn tiếp tục không?'
})

/** Lấy danh sách danh mục hệ thống từ API */
const fetchSystemCategories = async () => {
  loading.value = true
  try {
    const result = await salaryCompositionSystemApi.getPaged({
      pageNumber: currentPage.value,
      pageSize: pageSize.value,
      searchText: searchText.value || '',
      type: selectedType.value
    })
    systemCategories.value = transformData(result.data)
    totalRecords.value = result.totalRecords
  } catch (error) {
    console.error('Error fetching system categories:', error)
    toast.error('Có lỗi khi tải dữ liệu')
  } finally {
    loading.value = false
  }
}

/** Xử lý tìm kiếm */
const onSearch = () => {
  currentPage.value = 1
  fetchSystemCategories()
}

// Watch for pagination and filter changes
watch([currentPage, pageSize], () => {
  fetchSystemCategories()
})

watch([selectedType], () => {
  currentPage.value = 1
  fetchSystemCategories()
})

// Watch for popup open
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetState()
    fetchSystemCategories()
  }
})

/** Đặt lại trạng thái popup về mặc định */
const resetState = () => {
  searchText.value = ''
  selectedType.value = null
  selectedItems.value = []
  currentPage.value = 1
  pageSize.value = 25
}

/** Xử lý khi thay đổi lựa chọn */
const onSelectionChanged = (items) => {
  selectedItems.value = items
}

/** Xử lý đóng popup */
const onClose = () => {
  if (!isProcessing.value) {
    emit('update:modelValue', false)
  }
}

/** Xử lý xác nhận chọn các mục */
const onConfirm = () => {
  if (selectedItems.value.length === 0) return
  showConfirmDialog.value = true
}

/** Xác nhận đưa vào danh sách sử dụng */
const confirmMove = async () => {
  if (selectedItems.value.length === 0) return

  isProcessing.value = true
  try {
    const ids = selectedItems.value.map(item => item.salaryCompositionSystemId)

    // Check if any exists
    const checkResults = await Promise.all(
      ids.map(id => salaryCompositionSystemApi.checkExists(id))
    )
    const hasExisting = checkResults.some(r => r.exists)

    if (hasExisting) {
      showConfirmDialog.value = false
      showOverwriteDialog.value = true
    } else {
      await salaryCompositionSystemApi.moveMultiple(ids)
      toast.success(`Đã thêm ${selectedItems.value.length} thành phần lương vào danh sách sử dụng`)
      showConfirmDialog.value = false
      emit('added')
      emit('update:modelValue', false)
    }
  } catch (error) {
    console.error('Error moving to composition:', error)
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    isProcessing.value = false
  }
}

/** Xác nhận ghi đè khi trùng mã */
const confirmOverwrite = async () => {
  if (selectedItems.value.length === 0) return

  isProcessing.value = true
  try {
    const ids = selectedItems.value.map(item => item.salaryCompositionSystemId)
    await salaryCompositionSystemApi.moveMultiple(ids)
    toast.success(`Đã thêm ${selectedItems.value.length} thành phần lương vào danh sách sử dụng`)
    showOverwriteDialog.value = false
    emit('added')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error overwriting composition:', error)
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
/* Overlay */
.ms-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Popup Container */
.ms-popup {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 5px 20px 0 rgba(0, 0, 0, 0.1);
  width: 75%;
  min-width: 700px;
  max-width: calc(100% - 30px);
  height: 85%;
  max-height: calc(100% - 30px);
  margin: 10px;
  overflow: visible;
  font-family: Inter, Helvetica, Arial, sans-serif;
}

/* Header */
.ms-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0px;
  height: 53px;
  flex-shrink: 0;
}

.ms-popup-title {
  font-size: 20px;
  font-weight: 700;
  color: #212121;
  letter-spacing: 0.576px;
  line-height: 1.2;
  margin: 0;
}

/* Close Button */
.ms-popup-close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #9197af;
  transition: all 0.2s ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ms-popup-close:hover {
  background: #f5f5f5;
  color: #666;
}

/* Content */
.ms-popup-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

/* Filter Section */
.popup-filter {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.filter-search {
  display: flex;
  align-items: center;
  width: 300px;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.filter-search .search-icon-wrapper {
  padding-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-search :deep(.search-input-wrapper) {
  flex: 1;
}

.filter-search :deep(.search-input-wrapper .ms-input-wrapper) {
  height: 100%;
}

.filter-search :deep(.search-input-wrapper .ms-input) {
  height: 100%;
  border: none;
  border-radius: 0;
  box-shadow: none !important;
}

.filter-type-select :deep(.ms-select) {
  width: 200px;
  border: none;
  background: transparent;
}

.filter-type-select :deep(.ms-select:hover) {
  background: #f5f5f5;
}

/* Table Section */
.popup-table {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.popup-table :deep(.base-grid-container) {
  height: 100%;
}

/* Footer */
.ms-popup-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  height: 68px;
  flex-shrink: 0;
  background: #f2f2f2;
  border-radius: 0 0 6px 6px;
}

.ms-popup-footer :deep(.ms-btn) {
  min-width: 80px;
  height: 36px;
  border-radius: 4px;
  padding: 0 16px;
}

/* Transition Animations */
.ms-popup-fade-enter-active,
.ms-popup-fade-leave-active {
  transition: opacity 0.2s ease;
}

.ms-popup-fade-enter-active .ms-popup,
.ms-popup-fade-leave-active .ms-popup {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.ms-popup-fade-enter-from,
.ms-popup-fade-leave-to {
  opacity: 0;
}

.ms-popup-fade-enter-from .ms-popup,
.ms-popup-fade-leave-to .ms-popup {
  transform: scale(0.95);
  opacity: 0;
}
</style>
