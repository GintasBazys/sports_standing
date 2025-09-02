import { LAYOUT_SETTINGS } from "@/app/constants/tournaments.ts"
import type { Layout } from "@/app/enumerators/layout.ts"

export const getLayoutSettings = (layout: Layout) => LAYOUT_SETTINGS.find(l => l.name === layout)
