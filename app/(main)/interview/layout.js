import React, { Suspense } from 'react';
import { BarLoader } from 'react-spinners';

const InterviewLayout = ({ children }) => {
  return (
    <div className='space-y-6'>
      <h1 className='text-4xl md:text-5xl lg:text-6xl font-extrabold gradient-title'>
        Interview Preparation
      </h1>
      <Suspense fallback={<BarLoader className="mt-4" width="100%" color="gray" />}>
        <div className='mt-6'>
          {children}
        </div>
      </Suspense>
    </div>
  );
};

export default InterviewLayout;
