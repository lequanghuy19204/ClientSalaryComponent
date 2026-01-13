import { ref, computed } from 'vue'
import { organizationApi } from '@/api'
import { useApiState } from './useApi'

export function useOrganization() {
  const { loading, error, withLoading } = useApiState()
  
  const tree = ref([])

  const fetchTree = async () => {
    return withLoading(async () => {
      tree.value = await organizationApi.getTree()
      return tree.value
    })
  }

  const flattenTreeWithParent = (nodes, result = [], parentId = null) => {
    nodes.forEach(node => {
      result.push({ id: node.id, name: node.name, parentId })
      if (node.items?.length) {
        flattenTreeWithParent(node.items, result, node.id)
      }
    })
    return result
  }

  const flattenTree = (nodes, result = []) => {
    nodes.forEach(node => {
      result.push({ id: node.id, name: node.name })
      if (node.items?.length) {
        flattenTree(node.items, result)
      }
    })
    return result
  }

  const flatList = computed(() => flattenTreeWithParent(tree.value))

  const findById = (id, nodes = tree.value) => {
    for (const node of nodes) {
      if (node.id === id) return node
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
