'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
    as?: 'a' | 'button' | 'link';
}

export default function MagneticButton({
    children,
    href,
    onClick,
    className = "",
    style = {},
    as = 'button'
}: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();

        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);

        setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const innerContent = (
        <motion.div
            style={{ display: 'inline-flex' }}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {children}
        </motion.div>
    );

    const ElementProps: any = {
        className: `${className}`,
        style: { ...style, display: 'inline-flex' },
        onClick: onClick
    };

    let Element: any = 'button';
    if (as === 'link' || as === 'a') {
        Element = 'a';
        ElementProps['href'] = href;
    }

    return (
        <div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            style={{ display: 'inline-block', position: 'relative' }}
        >
            <Element {...ElementProps}>
                {innerContent}
            </Element>
        </div>
    );
}
