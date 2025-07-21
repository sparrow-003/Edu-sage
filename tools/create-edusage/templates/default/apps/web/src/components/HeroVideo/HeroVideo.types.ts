export interface HeroVideoProps {
    src: string;
    poster: string;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    className?: string;
    [key: string]: any;
}