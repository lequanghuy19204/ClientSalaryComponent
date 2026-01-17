import { ref, computed } from 'vue'
import { organizationApi } from '@/api'
import { useApiState } from './useApi'

/**
 * Composable quản lý dữ liệu cơ cấu tổ chức
 * Cung cấp các chức năng tải, tìm kiếm và xử lý cây tổ chức
 * @returns {Object} Trả về tree, flatList, loading, error và các hàm xử lý
 */
export function useOrganization() {
  const { loading, error, withLoading } = useApiState()
  
  const tree = ref([])

  /**
   * Tải dữ liệu cây tổ chức từ API
   * @returns {Promise<Array>} Dữ liệu cây tổ chức
   */
  const fetchTree = async () => {
    return withLoading(async () => {
      tree.value = await organizationApi.getTree()
      return tree.value
    })
  }

  /**
   * Làm phẳng cây tổ chức thành danh sách, kèm theo thông tin ID cha
   * @param {Array} nodes - Các node của cây tổ chức
   * @param {Array} result - Mảng kết quả (sử dụng cho đệ quy)
   * @param {string|null} parentId - ID của node cha
   * @returns {Array} Danh sách phẳng các tổ chức kèm parentId
   */
  const flattenTreeWithParent = (nodes, result = [], parentId = null) => {
    nodes.forEach(node => {
      result.push({ 
        organizationId: node.organizationId, 
        organizationName: node.organizationName, 
        parentId 
      })
      if (node.items?.length) {
        flattenTreeWithParent(node.items, result, node.organizationId)
      }
    })
    return result
  }

  /**
   * Làm phẳng cây tổ chức thành danh sách đơn giản
   * @param {Array} nodes - Các node của cây tổ chức
   * @param {Array} result - Mảng kết quả (sử dụng cho đệ quy)
   * @returns {Array} Danh sách phẳng các tổ chức
   */
  const flattenTree = (nodes, result = []) => {
    nodes.forEach(node => {
      result.push({ 
        organizationId: node.organizationId, 
        organizationName: node.organizationName 
      })
      if (node.items?.length) {
        flattenTree(node.items, result)
      }
    })
    return result
  }

  const flatList = computed(() => flattenTreeWithParent(tree.value))

  /**
   * Tìm một tổ chức theo ID trong cây
   * @param {string} id - ID của tổ chức cần tìm
   * @param {Array} nodes - Các node để tìm kiếm (mặc định là cây hiện tại)
   * @returns {Object|null} Tổ chức tìm thấy hoặc null
   */
  const findById = (id, nodes = tree.value) => {
    for (const node of nodes) {
      if (node.organizationId === id) return node
      if (node.items?.length) {
        const found = findById(id, node.items)
        if (found) return found
      }
    }
    return null
  }

  return {
    tree,
    flatList,
    loading,
    error,
    fetchTree,
    flattenTree,
    findById
  }
}
