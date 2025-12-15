'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const home = () => {
  const router = useRouter();
  return (
    <div>
      <button
      onClick={()=>router.push('/test')}
      className='cursor-pointer'
      >
        test page
      </button>
    </div>
  );
};

export default home;