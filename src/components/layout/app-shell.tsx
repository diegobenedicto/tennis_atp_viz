"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Swords, TableProperties, Menu, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Player Explorer",
    href: "/player",
    icon: Users,
  },
  {
    title: "Head-to-Head",
    href: "/h2h",
    icon: Swords,
  },
  {
    title: "Explore Data",
    href: "/explore",
    icon: TableProperties,
  },
]

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: typeof NAV_ITEMS
  setOpen?: (open: boolean) => void
}

function Nav({ items, className, setOpen, ...props }: NavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("grid gap-1 px-2", className)} {...props}>
      {items.map((item, index) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={index}
            href={item.href}
            onClick={() => setOpen?.(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#2D6A4F] text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950">
      <aside className="hidden w-64 flex-col border-r bg-zinc-950 text-white md:flex sticky top-0 h-screen">
        <div className="flex h-14 items-center border-b border-zinc-800 px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Activity className="h-6 w-6 text-[#2D6A4F]" />
            <span>ATP Analytics</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <Nav items={NAV_ITEMS} />
        </ScrollArea>
        <div className="mt-auto border-t border-zinc-800 p-4">
          <div className="text-xs text-zinc-500 text-center">
            Data sourced from Jeff Sackmann
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-zinc-950 px-6 text-white md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 text-white hover:bg-zinc-800">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col bg-zinc-950 text-white border-zinc-800 p-0">
            <div className="flex h-14 items-center border-b border-zinc-800 px-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => setOpen(false)}>
                <Activity className="h-6 w-6 text-[#2D6A4F]" />
                <span>ATP Analytics</span>
              </Link>
            </div>
            <ScrollArea className="flex-1 py-4">
              <Nav items={NAV_ITEMS} setOpen={setOpen} />
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 font-bold">
          <Activity className="h-5 w-5 text-[#2D6A4F]" />
          <span>ATP Analytics</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
