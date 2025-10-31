import { SignIn } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <SignIn 
      fallbackRedirectUrl="/redirect"
    />
  )
}

export default page