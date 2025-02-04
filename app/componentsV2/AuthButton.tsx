'use client'

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { LogIn, LogOut } from "lucide-react"
import { signInWithGoogle, signOutAction } from "@/app/actions/auth"

export function AuthButton({ user }: { user: any }) {
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="backdrop-blur-xl bg-black/20 border-white/20">
          <form action={signOutAction}>
            <DropdownMenuItem asChild>
              <button className="w-full flex items-center gap-2 text-white/90 cursor-pointer">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <form action={signInWithGoogle}>
      <Button 
        type="submit"
        className="backdrop-blur-xl bg-black/10 hover:bg-white/20 text-white/90 border border-white/20 flex items-center gap-2"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </Button>
    </form>
  )
}