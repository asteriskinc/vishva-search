// app/actions/auth.ts
"use server"

import { signIn, signOut } from "@/auth"

export async function signInWithGoogle() {
  await signIn("google")
}

export async function signOutAction() {
  await signOut()
}