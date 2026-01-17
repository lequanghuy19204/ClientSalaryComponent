<template>
  <div
    class="ms-radio d-inline-flex align-items-center gap-2"
    :class="{
      'ms-radio-checked': isChecked,
      'ms-radio-disabled': disabled
    }"
    @click="select"
  >
    <div class="ms-radio-box d-flex align-items-center justify-content-center">
      <span
        class="icon d-inline-block"
        :class="isChecked ? 'icon-mi-radio-button-check' : 'icon-mi-radio-button-uncheck'"
      ></span>
    </div>
    <label v-if="label" class="ms-radio-label" :for="inputId" @click.stop="select">{{ label }}</label>
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: null
  },
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  inputId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isChecked = computed(() => props.modelValue === props.value)

/** Chọn radio button */
const select = () => {
  if (props.disabled) return
  emit('update:modelValue', props.value)
  emit('change', props.value)
}
</script>

<style scoped>
.ms-radio {
  cursor: pointer;
  user-select: none;
}

.ms-radio-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ms-radio-box {
  width: 20px;
  height: 20px;
}

.ms-radio-label {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #212121;
  cursor: pointer;
  line-height: 1.4;
}

.ms-radio-disabled .ms-radio-label {
  cursor: not-allowed;
}

/* Radio icons from icons.css */
.icon-mi-radio-button-check {
  -webkit-mask: url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=')
    no-repeat -100px -20px;
  mask: url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=')
    no-repeat -100px -20px;
  background-color: #34b057 !important;
  width: 20px;
  height: 20px;
}

.icon-mi-radio-button-uncheck {
  -webkit-mask: url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=')
    no-repeat -80px -20px;
  mask: url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=')
    no-repeat -80px -20px;
  background-color: #666 !important;
  width: 20px;
  height: 20px;
  transition: background-color 0.2s ease;
}

.ms-radio:hover:not(.ms-radio-disabled) .icon-mi-radio-button-uncheck {
  background-color: #34b057 !important;
}
</style>
