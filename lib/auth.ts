"use client";

import { neon } from "@/lib/neon/client";

export type AuthResult = { error?: string };

const friendly = (message: string | undefined, fallback: string) => message?.trim() || fallback;

export async function signUp(input: { name: string; email: string; password: string }): Promise<AuthResult> {
  const { error } = await neon.auth.signUp.email(input);
  return error ? { error: friendly(error.message, "Could not create your account.") } : {};
}

export async function signIn(input: { email: string; password: string }): Promise<AuthResult> {
  const { error } = await neon.auth.signIn.email(input);
  return error ? { error: friendly(error.message, "Could not sign you in.") } : {};
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await neon.auth.signOut();
  return error ? { error: friendly(error.message, "Could not sign you out.") } : {};
}
