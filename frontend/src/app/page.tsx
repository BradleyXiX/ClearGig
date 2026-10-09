/* eslint-disable */
'use client';
import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Home() {
  const [step, setStep] = useState(0);
  const [client, setClient] = useState('');
  const [title, setTitle] = useState('');
  const [frontend, setFrontend] = useState('');
  const [backend, setBackend] = useState('');
  
  // Professional calculation breakdown
  const frontendCost = Number(frontend) * 150;
  const backendCost = Number(backend) * 150;
  const subtotal = frontendCost + backendCost;
  const contingency = subtotal * 0.15; // 15% buffer
  const total = subtotal + contingency;

  // Generate a fake invoice ID (client-side only to avoid hydration mismatch)
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInvoiceId(`EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
    setDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  useGSAP(() => {
    gsap.to('.scanner-line', {
      y: '90vh',
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = step === 5 ? 'auto' : 'hidden'; // Allow scrolling ONLY on the final report
    return () => { document.body.style.overflow = 'auto'; };
  }, [step]);

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step < 5) setStep(step + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNext();
  };

  const getStepClasses = (index: number) => {
    if (step === 5) return 'opacity-0 scale-[4] blur-3xl z-0 pointer-events-none translate-y-[-20%]'; // Hide all steps on final report
    if (step === index) return 'opacity-100 scale-100 blur-none z-20 pointer-events-auto';
    if (step > index) return 'opacity-0 scale-[4] blur-3xl z-0 pointer-events-none translate-y-[-20%]'; 
    return 'opacity-0 scale-50 blur-xl z-0 pointer-events-none translate-y-[20%]'; 
  };

  return (
    <div className={`relative w-full ${step === 5 ? 'min-h-screen overflow-auto' : 'h-screen overflow-hidden'} text-foreground transition-colors duration-[850ms]`}>
      
      {/* Right Panel: The Blueprint (Expands to Full Screen on Step 5) */}
      <div className={`absolute top-0 right-0 z-10 pointer-events-none transition-all duration-[850ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${step === 5 ? 'w-full min-h-screen p-4 md:p-12 relative' : 'w-full md:w-1/2 h-screen p-8 md:p-12'}`}>
        <div className={`w-full glass rounded-3xl p-8 flex flex-col font-mono relative pointer-events-auto transition-all duration-[850ms] ${step === 5 ? 'min-h-[90vh] bg-card/80 backdrop-blur-3xl border-primary/30 shadow-[0_0_80px_rgba(212,255,0,0.1)]' : 'h-full justify-between'}`}>
          
          {step !== 5 && <div className="scanner-line absolute top-0 left-0 w-full h-[2px] bg-primary/80 shadow-[0_0_30px_#D4FF00] z-50 pointer-events-none" />}
          
          {/* Header */}
          <div className={`flex justify-between items-start transition-all duration-[850ms] ${step === 5 ? 'mb-20' : 'mb-12'}`}>
            <h2 className="text-primary text-xs tracking-[0.3em] uppercase flex items-center gap-4">
              <span className={`w-2 h-2 bg-primary rounded-full ${step === 5 ? '' : 'animate-pulse'}`} />
              {step === 5 ? 'Official Estimate Statement' : 'Project Blueprint'}
            </h2>
            {step === 5 && (
              <div className="text-right">
                <div className="text-foreground text-sm font-bold tracking-widest">{invoiceId}</div>
                <div className="text-muted-foreground text-xs uppercase tracking-widest mt-1">{date}</div>
              </div>
            )}
          </div>
          
          {/* Main Content Area */}
          <div className={`transition-all duration-[850ms] ${step === 5 ? 'flex-1 grid grid-cols-1 md:grid-cols-2 gap-16' : 'space-y-8 text-sm md:text-base'}`}>
            
            {/* Left Column in Report / Main List in Blueprint */}
            <div className="space-y-8">
              <div className="border-b border-border/50 pb-4">
                <div className="text-muted-foreground uppercase tracking-widest text-xs mb-2">Client Entity</div>
                <div className={`text-foreground font-bold transition-all duration-[850ms] ${step === 5 ? 'text-4xl' : ''}`}>{client || '---'}</div>
              </div>
              
              <div className="border-b border-border/50 pb-4">
                <div className="text-muted-foreground uppercase tracking-widest text-xs mb-2">Directive</div>
                <div className={`text-foreground font-bold transition-all duration-[850ms] ${step === 5 ? 'text-3xl text-primary' : ''}`}>{title || '---'}</div>
              </div>

              {step === 5 && (
                <div className="pt-8 space-y-4 text-xs text-muted-foreground max-w-sm leading-relaxed">
                  <p>This estimate outlines the architectural and engineering scope required to execute the above directive.</p>
                  <p>All intellectual property transfers upon final payment. Estimate valid for 30 days.</p>
                </div>
              )}
            </div>

            {/* Right Column in Report (Financial Breakdown) / Hidden in Blueprint */}
            <div className={`space-y-6 ${step === 5 ? 'block' : 'hidden'}`}>
              <div className="text-primary uppercase tracking-widest text-xs mb-8 border-b border-primary/30 pb-4">Scope & Logistics</div>
              
              <div className="flex justify-between items-end border-b border-border/30 pb-4">
                <div>
                  <div className="text-foreground font-bold">Frontend Engineering</div>
                  <div className="text-muted-foreground text-xs mt-1">{frontend || 0} hrs @ $150/hr</div>
                </div>
                <div className="text-foreground font-mono">${frontendCost.toLocaleString()}</div>
              </div>

              <div className="flex justify-between items-end border-b border-border/30 pb-4">
                <div>
                  <div className="text-foreground font-bold">Backend Engineering</div>
                  <div className="text-muted-foreground text-xs mt-1">{backend || 0} hrs @ $150/hr</div>
                </div>
                <div className="text-foreground font-mono">${backendCost.toLocaleString()}</div>
              </div>

              <div className="flex justify-between items-end border-b border-border/30 pb-4">
                <div>
                  <div className="text-foreground font-bold">Contingency Buffer</div>
                  <div className="text-muted-foreground text-xs mt-1">15% Risk & Scope Creep</div>
                </div>
                <div className="text-foreground font-mono">${contingency.toLocaleString()}</div>
              </div>
            </div>

            {/* Compact Scope for Blueprint View */}
            {step !== 5 && (
              <>
                <div className="flex justify-between border-b border-border/50 pb-4 transition-colors duration-[850ms]" style={{ borderColor: step > 2 ? 'rgba(212,255,0,0.5)' : '' }}>
                  <span className="text-muted-foreground uppercase tracking-widest text-xs">Frontend Scope</span>
                  <span className="text-foreground font-bold">{frontend ? `${frontend} hrs` : '---'}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-4 transition-colors duration-[850ms]" style={{ borderColor: step > 3 ? 'rgba(212,255,0,0.5)' : '' }}>
                  <span className="text-muted-foreground uppercase tracking-widest text-xs">Backend Scope</span>
                  <span className="text-foreground font-bold">{backend ? `${backend} hrs` : '---'}</span>
                </div>
              </>
            )}
          </div>
          
          {/* Footer Area */}
          <div className={`mt-auto border-t border-primary/30 pt-6 transition-all duration-[850ms] ${step === 5 ? 'mt-16 flex flex-col md:flex-row justify-between items-end' : ''}`}>
            
            {step === 5 && (
              <div className="mb-8 md:mb-0 space-y-4">
                <div className="w-48 border-b-2 border-foreground/20 pb-2"></div>
                <div className="text-muted-foreground text-xs uppercase tracking-widest">Authorized Signature</div>
              </div>
            )}

            <div className={`flex ${step === 5 ? 'flex-col items-end gap-2' : 'justify-between items-end'}`}>
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Final Estimated Total</span>
              <span className={`text-primary font-bold tracking-tighter transition-all duration-[850ms] ${step === 5 ? 'text-7xl' : 'text-5xl'}`}>
                ${total.toLocaleString()}
              </span>
            </div>
          </div>
          
          {step === 5 && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
               <button onClick={() => { setStep(0); setClient(''); setTitle(''); setFrontend(''); setBackend(''); }} className="px-6 py-2 bg-secondary text-foreground text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-colors cursor-none">Start Over</button>
               <button className="px-6 py-2 bg-primary text-black text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform cursor-none shadow-[0_0_15px_rgba(212,255,0,0.4)]">Export PDF</button>
            </div>
          )}

        </div>
      </div>

      {/* Left Panel: The Interactive Steps (Hidden on Step 5) */}
      <div className={`w-full md:w-1/2 h-full relative z-20 ${step === 5 ? 'pointer-events-none' : ''}`}>
        
        <div className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 transition-all duration-[850ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${getStepClasses(0)}`}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight mb-8">
            Who are we <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">working with?</span>
          </h1>
          <input 
            type="text" 
            placeholder="Type client name..." 
            value={client}
            onChange={e => setClient(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-2xl md:text-4xl bg-transparent border-b-2 border-border focus:border-primary focus:outline-none py-4 w-full md:w-3/4 transition-colors font-mono"
            autoFocus
          />
          <button onClick={handleNext} className="mt-12 self-start uppercase tracking-widest text-xs text-primary font-bold hover:scale-110 transition-transform cursor-none flex items-center gap-2">
            Press Enter <span className="text-lg">→</span>
          </button>
        </div>

        <div className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 transition-all duration-[850ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${getStepClasses(1)}`}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight mb-8">
            What is the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">directive?</span>
          </h1>
          <input 
            type="text" 
            placeholder="E-commerce Redesign..." 
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-2xl md:text-4xl bg-transparent border-b-2 border-border focus:border-primary focus:outline-none py-4 w-full md:w-3/4 transition-colors font-mono"
          />
          <div className="mt-12 flex gap-8">
            <button onClick={() => setStep(0)} className="uppercase tracking-widest text-xs text-muted-foreground hover:text-foreground transition-colors cursor-none">← Back</button>
            <button onClick={handleNext} className="uppercase tracking-widest text-xs text-primary font-bold hover:scale-110 transition-transform cursor-none flex items-center gap-2">Press Enter <span className="text-lg">→</span></button>
          </div>
        </div>

        <div className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 transition-all duration-[850ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${getStepClasses(2)}`}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8">
            Define the <br/><span className="text-primary">Frontend</span> scope.
          </h1>
          <div className="flex items-end gap-4 w-full md:w-3/4">
            <input 
              type="number" 
              placeholder="0" 
              value={frontend}
              onChange={e => setFrontend(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-4xl md:text-6xl bg-transparent border-b-2 border-border focus:border-primary focus:outline-none py-4 w-32 transition-colors font-mono"
            />
            <span className="text-2xl md:text-3xl text-muted-foreground mb-4 font-mono">hours</span>
          </div>
          <div className="mt-12 flex gap-8">
            <button onClick={() => setStep(1)} className="uppercase tracking-widest text-xs text-muted-foreground hover:text-foreground transition-colors cursor-none">← Back</button>
            <button onClick={handleNext} className="uppercase tracking-widest text-xs text-primary font-bold hover:scale-110 transition-transform cursor-none flex items-center gap-2">Press Enter <span className="text-lg">→</span></button>
          </div>
        </div>

        <div className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 transition-all duration-[850ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${getStepClasses(3)}`}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8">
            Define the <br/><span className="text-primary">Backend</span> scope.
          </h1>
          <div className="flex items-end gap-4 w-full md:w-3/4">
            <input 
              type="number" 
              placeholder="0" 
              value={backend}
              onChange={e => setBackend(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-4xl md:text-6xl bg-transparent border-b-2 border-border focus:border-primary focus:outline-none py-4 w-32 transition-colors font-mono"
            />
            <span className="text-2xl md:text-3xl text-muted-foreground mb-4 font-mono">hours</span>
          </div>
          <div className="mt-12 flex gap-8">
            <button onClick={() => setStep(2)} className="uppercase tracking-widest text-xs text-muted-foreground hover:text-foreground transition-colors cursor-none">← Back</button>
            <button onClick={handleNext} className="uppercase tracking-widest text-xs text-primary font-bold hover:scale-110 transition-transform cursor-none flex items-center gap-2">Press Enter <span className="text-lg">→</span></button>
          </div>
        </div>

        <div className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 transition-all duration-[850ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${getStepClasses(4)}`}>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-12">
            Blueprint <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">Assembled.</span>
          </h1>
          <button onClick={handleNext} className="bg-primary text-primary-foreground font-bold text-xl md:text-2xl px-12 py-6 rounded-full hover:scale-105 transition-transform duration-[850ms] shadow-[0_0_40px_rgba(212,255,0,0.4)] cursor-none self-start">
            Generate Proposal
          </button>
          <button onClick={() => setStep(3)} className="mt-8 self-start uppercase tracking-widest text-xs text-muted-foreground hover:text-foreground transition-colors cursor-none">
            ← Edit Scope
          </button>
        </div>

      </div>
    </div>
  );
}
