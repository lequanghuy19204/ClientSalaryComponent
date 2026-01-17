import { ref } from 'vue'
import gridConfigApi from '@/api/grid-config.api'

/**
 * Composable quản lý cấu hình lưới dữ liệu (grid)
 * Cho phép tải, lưu và đặt lại cấu hình cột của bảng dữ liệu
 * @param {string} gridName - Tên định danh của lưới dữ liệu
 * @returns {Object} Trả về loading, error và các hàm loadConfig, saveConfig, resetConfig
 */
export function useGridConfig(gridName) {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Tải cấu hình cột từ server và gộp với cấu hình mặc định
   * @param {Array} defaultColumns - Danh sách cột mặc định
   * @returns {Promise<Array>} Danh sách cột đã được cấu hình
   */
  const loadConfig = async (defaultColumns) => {
    loading.value = true
    error.value = null
    try {
      const configs = await gridConfigApi.getByName(gridName)
      
      if (configs && configs.length > 0) {
        const configMap = new Map(
          configs.map(c => [c.gridConfigColumnName, c])
        )

        return defaultColumns
          .map(col => {
            const saved = configMap.get(col.dataField)
            if (saved) {
              return {
                ...col,
                visible: saved.gridConfigIsVisible,
                width: saved.gridConfigWidth,
                isPinned: saved.gridConfigIsPinned,
                order: saved.gridConfigColumnOrder
              }
            }
            return { ...col, order: 999 }
          })
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      }
      
      return defaultColumns.map(c => ({ ...c }))
    } catch (err) {
      error.value = err
      console.error('Lỗi khi tải cấu hình lưới:', err)
      return defaultColumns.map(c => ({ ...c }))
    } finally {
      loading.value = false
    }
  }

  /**
   * Lưu cấu hình cột hiện tại lên server
   * @param {Array} columns - Danh sách cột cần lưu
   * @param {string|null} pinnedColumn - Tên cột được ghim (nếu có)
   */
  const saveConfig = async (columns, pinnedColumn = null) => {
    loading.value = true
    error.value = null
    try {
      const data = {
        gridConfigName: gridName,
        columns: columns.map((col, index) => ({
          dataField: col.dataField,
          order: index,
          visible: col.visible !== false,
          width: col.width || 100,
          isPinned: col.dataField === pinnedColumn
        }))
      }
      await gridConfigApi.save(data)
    } catch (err) {
      error.value = err
      console.error('Lỗi khi lưu cấu hình lưới:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Đặt lại cấu hình lưới về mặc định (xóa cấu hình đã lưu trên server)
   */
  const resetConfig = async () => {
    loading.value = true
    error.value = null
    try {
      await gridConfigApi.delete(gridName)
    } catch (err) {
      error.value = err
      console.error('Lỗi khi đặt lại cấu hình lưới:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    loadConfig,
    saveConfig,
    resetConfig
  }
}
