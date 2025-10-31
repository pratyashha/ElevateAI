import React from 'react'
import { Suspense } from 'react'
import { BarLoader } from 'react-spinners'

const Layout = ({children}) => {
  return (
    <div className='px-5'>
        <div className='flex items-center justify-between pt-6 pb-4'>
            <h1 className='text-6xl font-bold gradient-title'>Industry Insights</h1>
            
        </div>
        <Suspense fallback={<BarLoader className="mt-4" width="100%" color="gray" />}>
            <div className='mt-6'>
                {children}
            </div>
        </Suspense>
    </div>
   
  );
};

export default Layout