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
            {/* <div className="flex flex-col gap-0.5">
                <p className="text-[14px] md:text-[16px] text-muted-gray font-normal">Don't want to start with a design?</p>
                <a href="#" className="text-samara-blue text-[14px] md:text-[16px] font-normal inline-flex items-center gap-1">
                    Check availability for your property
                </a>
            </div> */}
        </div>
    </section>
);

const RightPanel = () => {
    return (
        <div className="px-10 pt-[36px] pb-12 md:px-[15%] xl:px-[27.5%] md:pt-[80px] md:pb-16 flex flex-col gap-12 w-full mx-auto">
            {/* Title Section (Desktop Only in this panel) */}
            <div className="hidden md:block">
                <TitleSection />
            </div>

            {/* Layout Selection */}
            <LayoutSection />

            {/* Cladding Material */}
            {/* <section className="flex flex-col gap-6">
                <h3 className="text-xl font-normal tracking-tight">Choose your cladding material</h3>
                <div className="flex flex-col gap-4">
                    <OptionCard
                        title="Fiber cement"
                        subtitle="Durable and weather resistant"
                        selected={true}
                        list={[
                            "Vertical 7\" panels with V-groove",
                            "Five standard colors or custom color",
                            "Fire-, moisture-, and rot-resistant"
                        ]}
                    />
                    <OptionCard
                        title="Smooth-coated steel"
                        subtitle="Lustrous and maintenance-free"
                        price="+$27,500"
                    />
                </div>
            </section> */}

            {/* Cladding Color */}
            <ColorSwatchSection
                title="Choose your cladding color"
                options={[
                    { color: '#ffffff', name: 'Bone white', description: 'A warm and simple white. Classic.', selected: true },
                    { color: '#d9d9d9', name: 'Cloud gray', description: 'Light, airy neutral gray.' },
                    // { color: '#e5e1da', name: 'Sandstone', description: 'A soft, sandy beige tone.' },
                    // { color: '#2f3b30', name: 'Forest green', description: 'Deep, muted evergreen.' },
                    // { color: '#3c3631', name: 'Dark bronze', description: 'Rich, earthy charcoal brown.' },
                ]}
            />

            {/* Roof Color */}
            {/* <ColorSwatchSection
                title="Choose your roof color"
                options={[
                    { color: '#1a1a1a', name: 'Dark bronze', description: 'Extremely versatile, deep and muted.', selected: true },
                    { color: '#f0f0f0', name: 'Solar', description: 'Clean solar-ready white.', price: '+$2,500' },
                ]}
            /> */}

            {/* Front Windows/Doors */}
            <section className="flex flex-col gap-6">
                <h3 className="text-xl font-normal tracking-tight">Choose your Window Type</h3>
                <div className="flex flex-col gap-4">
                    <OptionCard
                        title="Wood window"
                        subtitle="5' x 5'"
                        price="-$11,300"
                    />
                    <OptionCard
                        title="Aluminium window"
                        subtitle={"5' x 6'8\""}
                        selected={true}
                    />
                </div>
            </section>

            {/* Living Room Windows/Doors */}
            <section className="flex flex-col gap-6">
                <h3 className="text-xl font-normal tracking-tight">Choose your Interior Cabinet Style</h3>
                <div className="flex flex-col gap-4">
                    <OptionCard
                        title="Stripped Down"
                        // subtitle="5' x 5'"
                        selected={true}
                    />
                    <OptionCard
                        title="Full"
                        // subtitle={"5' x 6'8\" glass doors"}
                        price="+$11,300"
                    />
                </div>
            </section>

            {/* Secondary Bedroom Windows/Doors */}
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
