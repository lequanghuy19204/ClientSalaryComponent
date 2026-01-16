import { ref } from 'vue'
import gridConfigApi from '@/api/grid-config.api'

export function useGridConfig(gridName) {
  const loading = ref(false)
  const error = ref(null)

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
      console.error('Failed to load grid config:', err)
      return defaultColumns.map(c => ({ ...c }))
    } finally {
      loading.value = false
    }
  }

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
      console.error('Failed to save grid config:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetConfig = async () => {
    loading.value = true
    error.value = null
    try {
      await gridConfigApi.delete(gridName)
    } catch (err) {
      error.value = err
      console.error('Failed to reset grid config:', err)
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
