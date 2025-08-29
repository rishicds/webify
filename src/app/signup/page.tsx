"use client"

import Link from 'next/link';

// This page is no longer needed with Google Authentication
// We redirect users to the login page.
export default function SignupPage() {

  return (
     <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
        <h1 className="text-2xl font-bold mb-4">Sign up is now handled by Google</h1>
        <p className="text-muted-foreground mb-8">Please proceed to the login page to sign in with your Google account.</p>
        <Link href="/login" className="underline hover:text-primary font-medium">
            Go to Login
        </Link>
    </div>
  );
}
