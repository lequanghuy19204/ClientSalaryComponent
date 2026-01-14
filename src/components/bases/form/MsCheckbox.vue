<template>
  <div
    class="ms-checkbox d-inline-flex align-items-center gap-2"
    :class="{
      'ms-checkbox-checked': modelValue,
      'ms-checkbox-disabled': disabled
    }"
    @click="toggle"
  >
    <div class="ms-checkbox-box d-flex align-items-center justify-content-center">
      <span
        class="icon d-inline-block"
        :class="modelValue ? 'icon-mi-square-check-primary' : 'icon-mi-square-default'"
      ></span>
    </div>
    <label v-if="label" class="ms-checkbox-label" @click.stop="toggle">{{ label }}</label>
    <slot></slot>
  </div>
</template>

<script setup>

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
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

const toggle = () => {
  if (props.disabled) return
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.ms-checkbox {
  cursor: pointer;
  user-select: none;
}

.ms-checkbox-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ms-checkbox-box {
  width: 20px;
  height: 20px;
}

.ms-checkbox-label {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #212121;
  cursor: pointer;
  line-height: 1.4;
}

.ms-checkbox-disabled .ms-checkbox-label {
  cursor: not-allowed;
}

/* Custom checkbox icon - unchecked state */
.icon-mi-checkbox-uncheck {
  width: 20px;
  height: 20px;
  border: 1px solid #c4c4c4;
  border-radius: 3px;
  background: #fff;
  transition: all 0.2s ease;
}

.ms-checkbox:hover:not(.ms-checkbox-disabled) .icon-mi-checkbox-uncheck {
  border-color: #34b057;
}

/* Checked state uses icon from icons.css */
.icon-mi-square-check-primary {
  background: url(https://testcdnamisapp.misacdn.net/apps/payroll/static/img/Icon.0b197b4.svg?v=)
    no-repeat -260px 0px;
  width: 20px;
  height: 20px;
}
</style>
