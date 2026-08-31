import { useState, useEffect } from 'react';

export function useIsMobileOrTouch(): boolean {
    const [isMobileOrTouch, setIsMobileOrTouch] = useState(false);
    useEffect(() => {
        const check = () => {
            const mobile =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                window.innerWidth <= 768 ||
                window.matchMedia('(pointer: coarse)').matches ||
                (navigator.maxTouchPoints > 0);
            setIsMobileOrTouch(mobile);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobileOrTouch;
}
