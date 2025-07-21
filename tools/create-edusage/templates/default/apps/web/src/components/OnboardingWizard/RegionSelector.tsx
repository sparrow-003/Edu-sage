import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface RegionSelectorProps {
    selectedRegion: string;
    onSelectRegion: (region: string) => void;
}

interface Region {
    id: string;
    name: string;
    path: string;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
    selectedRegion,
    onSelectRegion
}) => {
    const [regions, setRegions] = useState<Region[]>([]);
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        // In a real app, this would be loaded from a data file or API
        setRegions([
            { id: 'north-america', name: 'North America', path: 'M50,120 L100,80 L150,100 L120,150 Z' },
            { id: 'south-america', name: 'South America', path: 'M120,180 L140,220 L100,250 L80,200 Z' },
            { id: 'europe', name: 'Europe', path: 'M200,100 L230,80 L250,110 L220,130 Z' },
            { id: 'africa', name: 'Africa', path: 'M210,150 L250,140 L260,200 L200,210 Z' },
            { id: 'asia', name: 'Asia', path: 'M280,100 L350,90 L360,150 L300,180 L270,130 Z' },
            { id: 'oceania', name: 'Oceania', path: 'M350,200 L380,190 L390,220 L360,230 Z' }
        ]);
    }, []);

    const handleRegionClick = (regionId: string) => {
        try {
            onSelectRegion(regionId);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'RegionSelector',
                action: 'selectRegion'
            });
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-6">Select Your Region</h2>

            <div className="relative w-full max-w-2xl h-80 mb-8">
                {/* World map SVG */}
                <svg
                    viewBox="0 0 450 300"
                    className="w-full h-full"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.3))' }}
                >
                    {/* Base map */}
                    <rect x="0" y="0" width="450" height="300" fill="#1F2937" rx="10" />

                    {/* Grid lines */}
                    {Array.from({ length: 9 }).map((_, i) => (
                        <line
                            key={`h-${i}`}
                            x1="0"
                            y1={i * 30 + 30}
                            x2="450"
                            y2={i * 30 + 30}
                            stroke="#374151"
                            strokeWidth="0.5"
                        />
                    ))}

                    {Array.from({ length: 15 }).map((_, i) => (
                        <line
                            key={`v-${i}`}
                            x1={i * 30 + 30}
                            y1="0"
                            x2={i * 30 + 30}
                            y2="300"
                            stroke="#374151"
                            strokeWidth="0.5"
                        />
                    ))}

                    {/* Regions */}
                    {regions.map((region) => (
                        <motion.path
                            key={region.id}
                            d={region.path}
                            fill={selectedRegion === region.id ? '#06B6D4' : '#4B5563'}
                            stroke={hoveredRegion === region.id ? '#06B6D4' : '#6B7280'}
                            strokeWidth="1.5"
                            initial={{ opacity: 0.5 }}
                            animate={{
                                opacity: selectedRegion === region.id || hoveredRegion === region.id ? 1 : 0.7,
                                filter: selectedRegion === region.id
                                    ? 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))'
                                    : 'none'
                            }}
                            transition={{ duration: 0.3 }}
                            onClick={() => handleRegionClick(region.id)}
                            onMouseEnter={() => setHoveredRegion(region.id)}
                            onMouseLeave={() => setHoveredRegion(null)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </svg>

                {/* Region labels */}
                <div className="absolute inset-0 pointer-events-none">
                    {regions.map((region) => (
                        <motion.div
                            key={`label-${region.id}`}
                            className={`absolute text-sm font-medium ${selectedRegion === region.id
                                ? 'text-cyan-300'
                                : hoveredRegion === region.id
                                    ? 'text-cyan-400'
                                    : 'text-gray-300'
                                }`}
                            style={getRegionLabelPosition(region.id)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {region.name}
                        </motion.div>
                    ))}
                </div>
            </div>

            <p className="text-gray-300 text-center max-w-md">
                Select the region where you'll primarily be using EduΣage. This helps us optimize content delivery and language suggestions.
            </p>
        </div>
    );
};

function getRegionLabelPosition(regionId: string): React.CSSProperties {
    switch (regionId) {
        case 'north-america':
            return { top: '30%', left: '20%' };
        case 'south-america':
            return { top: '60%', left: '25%' };
        case 'europe':
            return { top: '25%', left: '50%' };
        case 'africa':
            return { top: '50%', left: '50%' };
        case 'asia':
            return { top: '30%', left: '70%' };
        case 'oceania':
            return { top: '70%', left: '80%' };
        default:
            return { top: '50%', left: '50%' };
    }
