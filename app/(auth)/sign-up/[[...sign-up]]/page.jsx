import { SignUp } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <SignUp 
      fallbackRedirectUrl="/redirect"
    />
  )
}

export default page