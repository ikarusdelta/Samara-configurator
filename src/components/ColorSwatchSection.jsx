import React from 'react';

const ColorSwatchSection = ({ title, options, selectedId, onChange }) => {
    const selectedOption = options.find(o => o.id === selectedId) || options[0];

    return (
        <section className="flex flex-col gap-6">
            <h3 className="text-xl font-normal tracking-tight">{title}</h3>

            <div className="flex flex-wrap gap-4">
                {options.map((opt) => (
                    <div
                        key={opt.id}
                        className="flex flex-col items-center gap-3 cursor-pointer"
                        onClick={() => onChange(opt.id)}
                    >
                        <div
                            className={`w-28 h-[72px] rounded-xl border-2 transition-all p-1 ${opt.id === selectedId ? 'border-samara-blue shadow-sm' : 'border-transparent hover:scale-105'
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
