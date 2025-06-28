import React, { Suspense } from 'react'
import { BarLoader } from 'react-spinners'

const layout = ({children}:any) => {
  return (
    <div className='px-5'>
      <Suspense fallback={<BarLoader className='mt-4' width={'100%'} color='gray'></BarLoader>}>
        {children}
      </Suspense>


    </div>
  )
}

export default layout