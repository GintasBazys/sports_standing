import { useCallback, useLayoutEffect, useRef } from "react"

export function useAutoScroll(rows: { id: string }[]) {
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map())
  const prevIdsRef = useRef<Set<string>>(new Set())
  const initializedRef = useRef(false)

  const setRowRef = useCallback(
    (id: string) => (el: HTMLTableRowElement | null) => {
      if (el) {
        rowRefs.current.set(id, el)
      } else {
        rowRefs.current.delete(id)
      }
    },
    []
  )

  useLayoutEffect(() => {
    const currIds = rows.map(r => r.id)

    if (!initializedRef.current) {
      initializedRef.current = true
      prevIdsRef.current = new Set(currIds)

      return
    }

    const prev = prevIdsRef.current
    const added = currIds.filter(id => !prev.has(id))

    if (added.length > 0) {
      const targetId = added[added.length - 1]

      if (!targetId) {
        return
      }

      rowRefs.current.get(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      })
    }

    prevIdsRef.current = new Set(currIds)
  }, [rows])

  return setRowRef
}
