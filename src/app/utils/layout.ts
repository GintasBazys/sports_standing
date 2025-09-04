import { LAYOUT_SETTINGS } from "@/app/constants/tournaments"
import type { Layout } from "@/app/enumerators/layout"

export const getLayoutSettings = (layout: Layout) => LAYOUT_SETTINGS.find(l => l.name === layout)
