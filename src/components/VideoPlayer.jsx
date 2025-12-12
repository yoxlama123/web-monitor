import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';

const VideoPlayer = ({ src, poster }) => {
    const { isGlobalMuted, setIsGlobalMuted } = useApp();
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(isGlobalMuted);
    const [volume, setVolume] = useState(isGlobalMuted ? 0 : 0.25);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    // Animation state
    const [showAnimation, setShowAnimation] = useState(false);
    const [animationIcon, setAnimationIcon] = useState('play');

    // Sync local state when global state changes
    useEffect(() => {
        if (isMuted !== isGlobalMuted) {
            setIsMuted(isGlobalMuted);
            // If unmuting globally and volume is 0, reset to default
            if (!isGlobalMuted && volume === 0) {
                setVolume(0.25);
            }
        }
    }, [isGlobalMuted]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
        }
    }, [volume]);

    // Sync muted state
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);

        // Intersection Observer for Auto-play
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Attempt to auto-play
                        const playPromise = video.play();

                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                setIsPlaying(true);
                            }).catch((error) => {
                                // Auto-play was prevented
                                console.log("Auto-play prevented:", error);
                                // Fallback: Mute and try again if it was a NotAllowedError
                                if (error.name === 'NotAllowedError') {
                                    video.muted = true;
                                    setIsMuted(true);
                                    video.play().then(() => {
                                        setIsPlaying(true);
                                    }).catch(e => console.log("Auto-play failed even after mute:", e));
                                }
                                setIsPlaying(false);
                            });
                        }
                    } else {
                        // Pause when out of view
                        video.pause();
                        setIsPlaying(false);
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
            observer.disconnect();
        };
    }, []); // Run once on mount

    const triggerAnimation = (type) => {
        setAnimationIcon(type);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 500);
    };

    const togglePlay = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                triggerAnimation('pause');
            } else {
                videoRef.current.play();
                triggerAnimation('play');
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        const newMutedState = !isMuted;

        if (videoRef.current) {
            videoRef.current.muted = newMutedState;
            // If unmuting, revert to 25% volume if it was 0, or keep existing non-zero volume
            if (!newMutedState && volume === 0) {
                const defaultVol = 0.25;
                videoRef.current.volume = defaultVol;
                setVolume(defaultVol);
            }
        }

        setIsMuted(newMutedState);
        setIsGlobalMuted(newMutedState);
    };

    const handleVolumeChange = (e) => {
        e.stopPropagation();
        const newVolume = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);

            const isNowMuted = newVolume === 0;
            setIsMuted(isNowMuted);
            setIsGlobalMuted(isNowMuted);
        }
    };

    const handleSeek = (e) => {
        e.stopPropagation();
        const seekTime = (parseFloat(e.target.value) / 100) * duration;
        if (videoRef.current) {
            videoRef.current.currentTime = seekTime;
            setProgress(e.target.value);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full bg-black group flex justify-center items-center"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-auto object-contain max-h-[621px]"
                onClick={togglePlay}
                playsInline
                loop
            />

            {/* Play/Pause Animation Overlay (fleeting) */}
            <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm shadow-xl transform scale-100 transition-transform">
                    {animationIcon === 'play' ? (
                        <Play className="w-12 h-12 text-white fill-current ml-1" />
                    ) : (
                        <Pause className="w-12 h-12 text-white fill-current" />
                    )}
                </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 flex items-center gap-4 ${isHovering ? 'opacity-100' : 'opacity-0'}`} onClick={(e) => e.stopPropagation()}>
                {/* Play/Pause Small Button */}
                <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                {/* Seek Bar (only if duration > 10s) */}
                {duration > 10 && (
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-blue-400"
                    />
                )}

                {/* Spacer if seek bar is hidden */}
                {duration <= 10 && <div className="flex-1"></div>}

                {/* Volume Controls */}
                <div className="flex items-center gap-2 group/volume">
                    <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
