import React from 'react';
import LayoutSection from './LayoutSection';
import ColorSwatchSection from './ColorSwatchSection';
import OptionCard from './OptionCard';

export const TitleSection = ({ className = "" }) => (
    <section className={`flex flex-col gap-6 ${className}`}>
        <h2 className="text-[28px] md:text-[32px] font-normal leading-tight tracking-tight text-charcoal">
            Design your Cabin
        </h2>
        <div className="flex flex-col gap-5">
            <p className="text-[18px] md:text-[20px] text-muted-gray font-normal leading-relaxed">
                Make it yours. From layout to cladding and other options.
            </p>
        </div>
    </section>
);

const RightPanel = ({ config = {}, onColorChange, onBedChange, onCabinetChange, onLayoutChange }) => {
    return (
        <div className="px-10 pt-[36px] pb-12 md:px-[15%] xl:px-[27.5%] md:pt-[80px] md:pb-16 flex flex-col gap-12 w-full mx-auto">
            {/* Title Section (Desktop Only in this panel) */}
            <div className="hidden md:block">
                <TitleSection />
            </div>

            {/* Layout Selection */}
            <LayoutSection
                selected={config.selectedLayout}
                onChange={onLayoutChange}
            />

            {/* Cladding Color */}
            <ColorSwatchSection
                title="Choose your cladding color"
                options={[
                    { id: 'light', color: '#ffffff', name: 'Bone white', description: 'A warm and simple white. Classic.' },
                    { id: 'dark', color: '#d9d9d9', name: 'Cloud gray', description: 'Light, airy neutral gray.' },
                ]}
                selectedId={config.selectedColor}
                onChange={onColorChange}
            />

            {/* Bed Type */}
            <section className="flex flex-col gap-6">
                <h3 className="text-xl font-normal tracking-tight">Choose your Bed Type</h3>
                <div className="flex flex-col gap-4">
                    <OptionCard
                        title="Normal Bed"
                        subtitle="Standard single bed"
                        selected={config.selectedBed === 'normal'}
                        onClick={() => onBedChange('normal')}
                    />
                    <OptionCard
                        title="Bunk Bed"
                        subtitle="Space-saving bunk bed"
                        selected={config.selectedBed === 'bunk'}
                        onClick={() => onBedChange('bunk')}
                    />
                </div>
            </section>

            {/* Interior Cabinet Style */}
            <section className="flex flex-col gap-6">
                <h3 className="text-xl font-normal tracking-tight">Choose your Interior Cabinet Style</h3>
                <div className="flex flex-col gap-4">
                    <OptionCard
                        title="Stripped Down"
                        subtitle="Kitchen base only"
                        selected={config.selectedCabinet === 'stripped'}
                        onClick={() => onCabinetChange('stripped')}
                    />
                    <OptionCard
                        title="Full"
                        subtitle="Kitchen with cabinet doors"
                        price="+$11,300"
                        selected={config.selectedCabinet === 'full'}
                        onClick={() => onCabinetChange('full')}
                    />
                </div>
            </section>

            {/* Additional Options */}
            <section className="flex flex-col gap-6 mb-12">
                <h3 className="text-xl font-normal tracking-tight">Choose your Additional Options</h3>
                <div className="flex flex-col gap-4">
                    <OptionCard
                        title="Wooden Deck"
                        subtitle="5' x 5'"
                        selected={true}
                    />
                </div>
            </section>
        </div>
    );
};

export default RightPanel;
