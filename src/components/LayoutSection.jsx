import React from 'react';

const LayoutCard = ({ title, subtitle, selected, onClick }) => (
    <div
        onClick={onClick}
        className={`p-6 rounded-2xl transition-all border cursor-pointer ${selected
            ? 'border-samara-blue bg-white shadow-sm ring-1 ring-samara-blue/20'
            : 'border-transparent bg-card-bg hover:bg-card-hover'
            }`}
    >
        <div className="flex flex-col gap-0">
            <h4 className="text-lg font-normal tracking-tight">{title}</h4>
            <p className="text-sm text-subtext-gray">{subtitle}</p>
        </div>
    </div>
);

const LayoutSection = ({ selected, onChange }) => {
    return (
        <section className="flex flex-col gap-6">
            <h3 className="text-xl font-normal tracking-tight">Choose your layout</h3>
            <div className="flex flex-col gap-3">
                <LayoutCard
                    title="Base 1"
                    subtitle="1 bath • 420 gross sq. ft."
                    selected={selected === 'base1'}
                    onClick={() => onChange('base1')}
                />
                <LayoutCard
                    title="Base 1+"
                    subtitle="2 bedrooms, 2 baths • 960 gross sq. ft."
                    selected={selected === 'base1plus'}
                    onClick={() => onChange('base1plus')}
                />
            </div>
        </section>
    );
};

export default LayoutSection;
