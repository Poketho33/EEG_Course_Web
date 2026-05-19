'use client'

import { useState } from 'react';

export default function Derivation({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="p-4 bg-lighter rounded-md relative">
            <p className="pb-1 font-bold">Explanation</p>
            <button    
                className="bg-pastel_3 w-6 h-6 bg-secondary rounded-full absolute right-4 top-4 fill-background cursor-pointer flex items-center justify-center"
                onClick={() => setOpen(prev => !prev)}
            >
                <svg
                    className={`w-[18px] h-[18px] transition-transform duration-200 ${open ? '-rotate-90' : 'rotate-90'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1024 1024"
                >
                    <path d="M338.752 104.704a64 64 0 000 90.496l316.8 316.8-316.8 316.8a64 64 0 0090.496 90.496l362.048-362.048a64 64 0 000-90.496L429.248 104.704a64 64 0 00-90.496 0z" />
                </svg>
            </button>
            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="mt-2">{children}</div>
                </div>
            </div>
        </div>
    );
}