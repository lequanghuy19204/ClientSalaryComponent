<template>
  <div class="salary-component">
    <h1>Thành phần lương</h1>
    <p>Nội dung trang Thành phần lương sẽ được hiển thị ở đây.</p>
  </div>
</template>

<script>
export default {
  name: 'SalaryComponent',
}
</script>

<style scoped>
.salary-component {
  padding: 24px;
  background-color: #fff;
  margin: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.salary-component h1 {
  font-size: 20px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 16px;
}

.salary-component p {
  font-size: 14px;
  color: #666;
}
</style>
