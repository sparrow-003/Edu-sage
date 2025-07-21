import React, { useRef, useEffect } from 'react';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { HeroVideoProps } from './HeroVideo.types';
import styles from './HeroVideo.module.css';

export const HeroVideo: React.FC<HeroVideoProps> = ({
    src,
    poster,
    autoplay = true,
    muted = true,
    loop = true,
    className,
    ...props
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        const videoElement = videoRef.current;

        if (!videoElement) return;

        const handleError = (error: ErrorEvent) => {
            errorHandler.captureException(error.error || new Error('Video playback error'), {
                component: 'HeroVideo',
                action: 'playback_error',
                metadata: {
                    src,
                    error: error.message
                }
            });
        };

        const handleCanPlay = () => {
            if (autoplay) {
                videoElement.play().catch(error => {
                    errorHandler.captureException(error, {
                        component: 'HeroVideo',
                        action: 'autoplay_failed',
                        metadata: { src }
                    });
                });
            }
        };

        videoElement.addEventListener('error', handleError);
        videoElement.addEventListener('canplay', handleCanPlay);

        return () => {
            videoElement.removeEventListener('error', handleError);
            videoElement.removeEventListener('canplay', handleCanPlay);
        };
    }, [src, autoplay]);

    return (
        <div className={`${styles.videoContainer} ${className || ''}`}>
            <video
                ref={videoRef}
                className={styles.video}
                poster={poster}
                muted={muted}
                loop={loop}
                playsInline
                {...props}
            >
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className={styles.overlay} />
        </div>
    );
};