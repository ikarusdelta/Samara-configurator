import React from 'react';

const ColorSwatchSection = ({ title, options }) => {
    const selectedOption = options.find(o => o.selected) || options[0];

    return (
        <section className="flex flex-col gap-6">
            <h3 className="text-xl font-normal tracking-tight">{title}</h3>

            <div className="flex flex-wrap gap-4">
                {options.map((opt, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                        <div
                            className={`w-28 h-[72px] rounded-xl border-2 transition-all cursor-pointer p-1 ${opt.selected ? 'border-samara-blue shadow-sm' : 'border-transparent hover:scale-105'
                                }`}
                        >
                            <div
                                className="w-full h-full rounded-lg border border-black/10 shadow-inner"
                                style={{ backgroundColor: opt.color }}
                            />
                        </div>
                        {opt.price && (
                            <span className="text-sm font-normal px-3 py-1 bg-transparent rounded-lg border border-[#666665] text-[#666665]">
                                {opt.price}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-0 mt-2 pt-6 border-t border-black/5">
                <h4 className="text-lg font-normal tracking-tight">{selectedOption.name}</h4>
                <p className="text-sm text-muted-gray">{selectedOption.description}</p>
            </div>
        </section>
    );
};

export default ColorSwatchSection;
