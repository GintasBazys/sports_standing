import { Outlet } from "react-router"
import type { ReactNode } from "react"
import { HeaderComponent } from "@/app/components/header/HeaderComponent.tsx"

function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderComponent />
      <main>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
