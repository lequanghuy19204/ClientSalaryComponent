<template>
  <Transition name="filter-bar-slide">
    <div v-if="hasActiveFilters" class="filter-bar">
      <div class="filter-header">
        <div class="filter-items">
          <div
            v-for="filter in activeFilters"
            :key="filter.key"
            class="filter-item"
          >
            <div
              class="filter-item-text"
              :title="getFilterTitle(filter)"
            >
              <b>{{ filter.label }}</b> {{ getConditionText(filter.condition) }} <b>{{ getDisplayValue(filter) }}</b>
            </div>
                        <div class="filter-close-btn" @click="removeFilter(filter.key)">
              <span class="icon icon-mi-close-small"></span>
            </div>
          </div>
        </div>
        <div class="clear-all" @click="clearAll">Xóa tất cả</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  filterLabels: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['remove', 'clear-all'])

const conditionLabels = {
  contains: 'Chứa',
  notContains: 'Không chứa',
  equals: 'Bằng',
  notEquals: 'Khác',
  startsWith: 'Bắt đầu bằng',
  endsWith: 'Kết thúc bằng',
  empty: 'Trống',
  notEmpty: 'Không trống'
}

const activeFilters = computed(() => {
  const result = []
  for (const key in props.filters) {
    const filter = props.filters[key]
    if (filter.checked) {
      result.push({
        key,
        label: props.filterLabels[key] || key,
        condition: filter.condition,
        value: filter.value
      })
    }
  }
  return result
})

const hasActiveFilters = computed(() => activeFilters.value.length > 0)

/** Lấy nhãn điều kiện lọc theo ngôn ngữ */
const getConditionText = (condition) => {
  return conditionLabels[condition] || condition
}

/** Lấy giá trị hiển thị cho bộ lọc - xử lý trường hợp điều kiện rỗng/không rỗng */
const getDisplayValue = (filter) => {
  if (filter.condition === 'empty' || filter.condition === 'notEmpty') {
    return ''
  }
  return `"${filter.value || 'Rỗng'}"`
}

/** Lấy tiêu đề tooltip đầy đủ cho bộ lọc */
const getFilterTitle = (filter) => {
  const conditionText = getConditionText(filter.condition)
  const valueText = filter.condition === 'empty' || filter.condition === 'notEmpty'
    ? ''
    : ` ${filter.value || 'Rỗng'}`
  return `${filter.label} ${conditionText}${valueText}`
}

/** Xóa một bộ lọc theo key */
const removeFilter = (key) => {
  emit('remove', key)
}

/** Xóa tất cả bộ lọc đang hoạt động */
const clearAll = () => {
  emit('clear-all')
}
</script>

<style scoped>
.filter-bar {
  background-color: white;
  flex-shrink: 0;
  margin-bottom: 8px;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  gap: 16px;
}

.filter-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ebebeb;
  border-radius: 4px;
  padding: 4px;
  font-size: 14px;
  color: #212121;
  max-width: 200px;
}

.filter-item-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.filter-item-text b {
  font-weight: 600;
}

.filter-close-btn {
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}

.filter-close-btn:hover {
  background-color: #e0e0e0;
}

.clear-all {
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.clear-all:hover {
  text-decoration: underline;
}

/* Transition */
.filter-bar-slide-enter-active,
.filter-bar-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.filter-bar-slide-enter-from,
.filter-bar-slide-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

.filter-bar-slide-enter-to,
.filter-bar-slide-leave-from {
  max-height: 100px;
  opacity: 1;
}
</style>
