import { type RefObject, useEffect } from "react"
import { MAX_TABLE_HEIGHT } from "@/app/constants/tournaments.ts"

export function useTableAutoScroll(
  tbodyRef: RefObject<HTMLTableSectionElement | null>,
  wrapperRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const tbody = tbodyRef.current

    if (!tbody) {
      return
    }

    const isRow = (n: Node): n is HTMLTableRowElement => n instanceof HTMLTableRowElement

    const observer = new MutationObserver(records => {
      if (!wrapperRef.current || wrapperRef.current.getBoundingClientRect().height < MAX_TABLE_HEIGHT) {
        return
      }

      const relevant = records.filter(record => record.target === tbody)

      const added = relevant.flatMap(record => Array.from(record.addedNodes).filter(isRow))
      const removed = new Set(relevant.flatMap(record => Array.from(record.removedNodes).filter(isRow)))

      const addedOnly = added.filter(n => !removed.has(n))
      const lastAdded = addedOnly.at(-1)

      if (lastAdded) {
        requestAnimationFrame(() => {
          lastAdded.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
        })
      }
    })

    observer.observe(tbody, { childList: true })

    return () => {
      observer.disconnect()
    }
  }, [tbodyRef, wrapperRef])
}
