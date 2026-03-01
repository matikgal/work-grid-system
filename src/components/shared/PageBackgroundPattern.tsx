import React from 'react';

export const PageBackgroundPattern: React.FC = () => {
    return (
        <>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[1.0]" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.06) 1.5px, transparent 0)', backgroundSize: '24px 24px' }}>
            </div>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[1.0] hidden dark:block" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.08) 1.5px, transparent 0)', backgroundSize: '24px 24px' }}>
            </div>
        </>
    );
};
