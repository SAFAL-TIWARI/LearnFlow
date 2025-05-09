import React, { useEffect, useState } from 'react';

interface BlurTextAnimationProps {
    text: string;
    className?: string;
    speed?: number;
}

const BlurTextAnimation: React.FC<BlurTextAnimationProps> = ({
    text,
    className = "",
    speed = 500
}) => {
    const words = text.split(' ');
    const [visibleWords, setVisibleWords] = useState<number[]>([]);

    useEffect(() => {
        // Reset animation when text changes
        setVisibleWords([]);

        // Animate each word one by one
        words.forEach((_, index) => {
            setTimeout(() => {
                setVisibleWords(prev => [...prev, index]);
            }, index * speed);
        });
    }, [text, speed, words.length]);

    return (
        <span className={className}>
            {words.map((word, index) => (
                <span
                    key={index}
                    className={`inline-block transition-all duration-300 ${visibleWords.includes(index)
                            ? 'opacity-100 blur-none translate-y-0'
                            : 'opacity-0 blur-md translate-y-4'
                        }`}
                    style={{
                        transitionDelay: `${index * 100}ms`
                    }}
                >
                    {word}&nbsp;
                </span>
            ))}
        </span>
    );
};

export default BlurTextAnimation;