import React from 'react'

const MainLayout = ({children}) => {
    // Redirect to Onboarding
    
  return (
    <div className='w-full px-2 sm:px-4 lg:px-6 mt-24 mb-20'>
        {children}
    </div>
  )
}

export default MainLayout