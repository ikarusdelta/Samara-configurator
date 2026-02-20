import React from 'react';

const OptionCard = ({ title, subtitle, price, selected, description, list }) => {
    return (
        <div className={`p-6 rounded-2xl flex flex-col gap-4 border transition-all ${selected
            ? 'border-samara-blue bg-white shadow-sm ring-1 ring-samara-blue/20'
            : 'border-transparent bg-card-bg hover:bg-card-hover'
            }`}>
            <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-0">
                    <h4 className="text-lg font-normal tracking-tight">{title}</h4>
                    <p className="text-sm text-subtext-gray">{subtitle}</p>
                </div>

                {price && (
                    <span className="text-sm font-normal px-3 py-1 bg-transparent rounded-lg border border-[#666665] text-[#666665]">
                        {price}
                    </span>
                )}
            </div>

            {(description || (list && list.length > 0)) && (
                <div className="flex flex-col gap-3 mt-1">
                    {description && (
                        <p className="text-sm text-subtext-gray leading-relaxed">
                            {description}
                        </p>
                    )}
                    {list && list.length > 0 && (
                        <ul className="flex flex-col gap-1.5">
                            {list.map((item, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-subtext-gray leading-relaxed">
                                    <span className="opacity-60">—</span> {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default OptionCard;
