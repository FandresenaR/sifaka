'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const MapInner = dynamic(() => import('./MapInner'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading map...</div>,
});

export default MapInner;
