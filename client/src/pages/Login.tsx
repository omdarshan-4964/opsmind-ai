import React from 'react'
import { SignIn } from '@clerk/clerk-react'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Sign in to OpsMind</h2>
        <SignIn path="/sign-in" routing="path" />
      </div>
    </div>
  )
}
