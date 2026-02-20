import React, { useState } from 'react';
import ModelViewer from './components/ModelViewer';
import RightPanel, { TitleSection } from './components/RightPanel';
import { X, Home, Layers, Info, DollarSign, PenTool, PhoneCall, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('exterior'); // 'exterior' or 'interior'
  const [viewIndex, setViewIndex] = useState(0);

  const nextView = () => setViewIndex((prev) => (prev + 1) % 4);
  const prevView = () => setViewIndex((prev) => (prev - 1 + 4) % 4);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-right-panel-bg font-sans text-charcoal overflow-x-hidden">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Mobile: Single column scrollable, Desktop: 50/50 split */}
        <div className="relative w-full md:w-[50%] bg-warm-neutral-light flex flex-col overflow-y-auto md:overflow-hidden custom-scrollbar">

          {/* 1. Mobile-Only Header Block (Includes Title) */}
          <div className="md:hidden px-10 pt-[20%] pb-10 bg-right-panel-bg flex flex-col gap-8">
            <TitleSection className="!p-0" />
          </div>

          {/* Floating Menu Button (Fixed to screen) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="fixed top-6 left-6 z-[60] md:hidden p-3 bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-black/5 text-charcoal transition-transform active:scale-95 flex flex-col gap-1 w-11 h-11 items-center justify-center cursor-pointer"
            aria-label="Open Menu"
          >
            <div className="h-0.5 w-5 bg-charcoal rounded-full" />
            <div className="h-0.5 w-3.5 bg-charcoal self-start ml-[3px] rounded-full" />
          </button>

          {/* 2. 3D Container (Image 1 Parity: Sticky on mobile) */}
          <div className="relative h-[35dvh] md:h-full sticky top-0 md:relative bg-warm-neutral-light overflow-hidden shrink-0 group z-30">
            {/* Logo (Desktop Only) */}
            <div className="absolute top-10 left-10 z-[35] hidden md:block">
              <h1 className="text-2xl font-normal tracking-tight">Samara</h1>
            </div>

            {/* View Mode Toggle (Fixed on top of canvas) */}
            <div className="absolute top-4 md:top-10 left-1/2 -translate-x-1/2 z-[40] pointer-events-none">
              <div className="flex bg-white/90 backdrop-blur-md p-0.5 md:p-1 rounded-full shadow-lg border border-black/5 pointer-events-auto">
                <button
                  onClick={() => { setViewMode('exterior'); setViewIndex(0); }}
                  className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[13px] md:text-sm font-medium transition-all ${viewMode === 'exterior'
                    ? 'bg-charcoal text-white shadow-sm'
                    : 'text-charcoal/60 hover:text-charcoal hover:bg-black/5'
                    }`}
                >
                  Exterior
                </button>
                <button
                  onClick={() => setViewMode('interior')}
                  className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[13px] md:text-sm font-medium transition-all ${viewMode === 'interior'
                    ? 'bg-charcoal text-white shadow-sm'
                    : 'text-charcoal/60 hover:text-charcoal hover:bg-black/5'
                    }`}
                >
                  Interior
                </button>
              </div>
            </div>

            <ModelViewer viewIndex={viewIndex} viewMode={viewMode} />

            {/* Navigation Arrows (Exterior Only) */}
            {viewMode === 'exterior' && (
              <div className="hidden md:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between px-8 pointer-events-none z-20">
                <button
                  onClick={prevView}
                  className="w-12 h-12 rounded-full bg-[#f2f2eb] shadow-lg border border-black/5 flex items-center justify-center pointer-events-auto transition-all cursor-pointer text-charcoal/60 hover:text-charcoal"
                  title="Previous View"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextView}
                  className="w-12 h-12 rounded-full bg-[#f2f2eb] shadow-lg border border-black/5 flex items-center justify-center pointer-events-auto transition-all cursor-pointer text-charcoal/60 hover:text-charcoal"
                  title="Next View"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {/* Price (Exterior Only & Desktop Only) */}
            {viewMode === 'exterior' && (
              <div className="hidden md:flex absolute md:bottom-20 left-1/2 -translate-x-1/2 z-10 flex-col items-center text-center pointer-events-none w-full px-4 text-md md:text-lg">
                <div className="pointer-events-auto">
                  <span className="font-normal text-charcoal md:bg-[#edede7] md:px-6 md:py-2.5 md:rounded-full md:shadow-md md:border md:border-warm-neutral-dark">
                    $285,000
                    <span className="ml-1 text-muted-gray font-normal">plus installation</span>
                  </span>
                </div>
              </div>
            )}

            {/* Financing (Exterior Only) */}
            {viewMode === 'exterior' && (
              <div className="absolute bottom-5 md:bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 text-xs md:text-base text-muted-gray pointer-events-auto cursor-help">
                <span>Financing options available.</span>
                <Info size={14} className="opacity-60" />
              </div>
            )}
          </div>

          {/* 3. Mobile-Only Configuration Section (Vertical Stack) */}
          <div className="md:hidden bg-right-panel-bg">
            <RightPanel />
          </div>
        </div>

        {/* Desktop-Only Right Panel (Scrollable Side) */}
        <div className="hidden md:block w-full md:w-[50%] bg-right-panel-bg overflow-y-auto custom-scrollbar border-l border-warm-neutral-dark">
          <RightPanel />
        </div>
      </div>

      {/* Floating Mobile Drawer (Image 3 Parity) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/5 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />

          {/* Floating Card Drawer */}
          <div className="absolute top-4 left-4 w-[240px] bg-white rounded-[24px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-black/5 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-left">
            <div className="p-4 flex flex-col gap-4">
              {/* Close Button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 -ml-1 text-muted-gray hover:text-charcoal transition-colors"
                aria-label="Close Menu"
              >
                <X size={18} />
              </button>

              {/* Nav Items */}
              <nav className="flex flex-col">
                <div className="flex flex-col gap-0.5 pb-3">
                  <NavItem icon={<Home size={16} />} label="Backyard" />
                  <NavItem icon={<Layers size={16} />} label="Models" hasArrow />
                  <NavItem icon={<Info size={16} />} label="How it works" />
                  <NavItem icon={<DollarSign size={16} />} label="Financing" />
                  <NavItem icon={<PenTool size={16} />} label="Design yours" active />
                </div>

                <div className="h-px bg-black/5 mx-2 my-1" />

                <div className="flex flex-col gap-0.5 pt-1">
                  <NavItem icon={<Building2 size={16} />} label="Visit Samara" />
                  <NavItem icon={<PhoneCall size={16} />} label="Contact us" />
                  <NavItem icon={<Building2 size={16} />} label="Multifamily" />
                </div>
              </nav>

              {/* Brand Footer */}
              <div className="mt-2 pt-2 border-t border-black/5 flex justify-center">
                <span className="text-lg font-normal tracking-tight text-muted-gray/40">Samara</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, hasArrow, active }) => (
  <a
    href="#"
    className={`flex items-center justify-between p-2 rounded-lg transition-all ${active ? 'text-charcoal bg-black/5' : 'text-muted-gray hover:bg-black/5'
      }`}
  >
    <div className="flex items-center gap-3">
      <span className="opacity-70">{icon}</span>
      <span className="text-[14px] font-normal tracking-tight">{label}</span>
    </div>
    {hasArrow && (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <path d="m9 18 6-6-6-6" />
      </svg>
    )}
  </a>
);

export default App;
