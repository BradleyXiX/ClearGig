'use client';
import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { api, Project, Client } from '@/services/api';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    Promise.all([api.getProjects(), api.getClients()]).then(([pData, cData]) => {
      setProjects(pData);
      setClients(cData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedProject]);

  useGSAP(() => {
    if (loading) return;
    
    // Smooth bezier curve for high-end feel
    const customEase = 'cubic-bezier(0.16, 1, 0.3, 1)';

    if (!selectedProject) {
      gsap.fromTo('.dashboard-item', 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: customEase, overwrite: 'auto' }
      );
      gsap.to('.dashboard-container', { opacity: 1, scale: 1, filter: 'blur(0px)', pointerEvents: 'auto', duration: 0.4, ease: customEase });
      
      gsap.to('.project-drawer', { x: '100%', pointerEvents: 'none', duration: 0.5, ease: customEase });
      gsap.to('.drawer-backdrop', { opacity: 0, pointerEvents: 'none', duration: 0.4 });
    } else {
      gsap.to('.dashboard-container', { opacity: 0.4, scale: 0.99, filter: 'blur(2px)', pointerEvents: 'none', duration: 0.5, ease: customEase });
      
      gsap.to('.drawer-backdrop', { opacity: 1, pointerEvents: 'auto', duration: 0.4 });
      gsap.fromTo('.project-drawer', 
        { x: '100%' },
        { x: '0%', pointerEvents: 'auto', duration: 0.6, ease: customEase }
      );
      
      gsap.fromTo('.drawer-content > *',
        { opacity: 0, x: 15 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: customEase, delay: 0.1 }
      );
    }
  }, [loading, selectedProject]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-primary uppercase tracking-widest text-sm">Loading...</div>;

  let totalFrontend = 0;
  let totalBackend = 0;
  
  projects.forEach(p => {
    p.lineItems?.forEach(li => {
      if (li.category === 'FRONTEND') totalFrontend += li.estimatedHours;
      if (li.category === 'BACKEND') totalBackend += li.estimatedHours;
    });
  });
  
  const totalHours = totalFrontend + totalBackend || 1;
  const fePercent = (totalFrontend / totalHours) * 100;
  const bePercent = (totalBackend / totalHours) * 100;

  const clientRevenue = clients.map(c => {
    let rev = 0;
    projects.filter(p => p.clientId === c.id).forEach(p => {
      p.lineItems?.forEach(li => rev += li.estimatedHours * li.hourlyRate);
      rev += rev * (p.contingencyPercentage / 100);
    });
    return { name: c.name, rev };
  }).sort((a, b) => b.rev - a.rev);
  const maxRev = Math.max(...clientRevenue.map(c => c.rev), 1);

  const renderProjectDetails = () => {
    if (!selectedProject) return null;
    
    let baseCost = 0;
    selectedProject.lineItems?.forEach(li => baseCost += li.estimatedHours * li.hourlyRate);
    const contingencyValue = baseCost * (selectedProject.contingencyPercentage / 100);
    const totalCost = baseCost + contingencyValue;
    const clientInfo = clients.find(c => c.id === selectedProject.clientId);

    return (
      <>
        <div 
          className="drawer-backdrop fixed inset-0 z-40 bg-black/40 backdrop-blur-sm opacity-0 pointer-events-none cursor-none"
          onClick={() => setSelectedProject(null)}
        />
        
        {/* Refined Drawer: Slight border radius, elegant shadow, subtle background */}
        <div className="project-drawer fixed top-0 right-0 h-screen z-50 pointer-events-none flex justify-end w-full max-w-xl bg-background/95 backdrop-blur-xl border-l border-border/40 shadow-2xl transform translate-x-full">
          
          <div className="w-full h-full p-8 md:p-12 relative pointer-events-auto overflow-y-auto drawer-content">
            
            <button 
              onClick={() => setSelectedProject(null)} 
              className="absolute top-10 right-10 text-muted-foreground hover:text-foreground transition-colors cursor-none"
            >
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            <div className="mb-10 border-b border-border/30 pb-8 mt-4">
              <h2 className="text-primary text-[10px] tracking-[0.2em] uppercase mb-4 font-semibold">Estimate Record</h2>
              <h1 className="text-3xl font-bold uppercase tracking-tight leading-tight text-foreground/90">{selectedProject.title}</h1>
              <div className="text-muted-foreground text-xs tracking-widest uppercase mt-4">{clientInfo?.name}</div>
            </div>

            <div className="space-y-6 mb-12 font-mono">
              <div className="flex justify-between items-end border-b border-border/20 pb-4">
                 <div className="text-xs tracking-widest uppercase text-muted-foreground">Base Execution</div>
                 <div className="text-lg text-foreground/80">${baseCost.toLocaleString()}</div>
              </div>
              <div className="flex justify-between items-end border-b border-border/20 pb-4">
                 <div className="text-xs tracking-widest uppercase text-muted-foreground">Risk Buffer ({selectedProject.contingencyPercentage}%)</div>
                 <div className="text-lg text-foreground/80">${contingencyValue.toLocaleString()}</div>
              </div>
              <div className="flex justify-between items-end pt-4 mt-4">
                 <div className="text-xs tracking-widest uppercase text-primary">Final Allocation</div>
                 <div className="text-3xl font-bold text-primary">
                   ${totalCost.toLocaleString()}
                 </div>
              </div>
            </div>

            <div>
               <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-6 font-semibold">Scope Modules</div>
               <div className="space-y-3">
                 {selectedProject.lineItems?.map((li) => (
                    <div key={li.id} className="flex flex-col text-sm border border-border/30 p-5 rounded-xl bg-card/20 hover:bg-card/40 transition-colors">
                       <div className="flex justify-between items-start mb-3">
                         <span className="font-semibold text-sm tracking-tight text-foreground/90">{li.description}</span>
                         <span className="text-muted-foreground border border-border/50 px-2 py-0.5 rounded text-[9px] tracking-wider uppercase">{li.category}</span>
                       </div>
                       <div className="font-mono text-muted-foreground text-xs flex justify-between items-center">
                         <span>{li.estimatedHours}h <span className="mx-1 opacity-50">×</span> ${li.hourlyRate}/hr</span>
                         <span className="text-foreground/80 font-medium">${(li.estimatedHours * li.hourlyRate).toLocaleString()}</span>
                       </div>
                    </div>
                 ))}
                 {!selectedProject.lineItems?.length && (
                   <div className="text-xs text-muted-foreground italic">No modules defined.</div>
                 )}
               </div>
            </div>

          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen font-mono text-foreground relative">
      
      {renderProjectDetails()}

      <div className="dashboard-container pt-24 px-8 md:px-16 pb-16 z-10 relative">
        <div className="mb-12 border-b border-border/30 pb-6 flex items-center justify-between">
           <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
             Overview
           </h1>
           <span className="text-[10px] tracking-widest text-primary uppercase border border-primary/30 px-3 py-1 rounded-full bg-primary/5">
             Live Sync
           </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Refined Cards: Subtle rounded corners, delicate borders, muted background */}
          <div className="dashboard-item bg-card/30 backdrop-blur-sm border border-border/40 rounded-2xl p-8 flex flex-col justify-between">
            <h2 className="text-[10px] tracking-widest uppercase text-muted-foreground mb-8 font-semibold">Time Allocation</h2>
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
               <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="#D4FF00" strokeWidth="4" strokeDasharray={`${fePercent * 2.64} 264`} strokeLinecap="round" />
                  
                  <circle cx="50" cy="50" r="32" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                  <circle cx="50" cy="50" r="32" fill="transparent" stroke="#8F8F94" strokeWidth="4" strokeDasharray={`${bePercent * 2.01} 201`} strokeLinecap="round" />
               </svg>
               <div className="text-center relative z-10">
                  <div className="text-2xl font-semibold text-foreground/90">{totalHours}</div>
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">Hours</div>
               </div>
            </div>
            <div className="mt-8 space-y-3">
               <div className="flex justify-between items-end border-b border-border/20 pb-2">
                 <span className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Frontend</span>
                 <span className="font-medium text-sm">{totalFrontend}h</span>
               </div>
               <div className="flex justify-between items-end border-b border-border/20 pb-2">
                 <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" /> Backend</span>
                 <span className="font-medium text-sm">{totalBackend}h</span>
               </div>
            </div>
          </div>

          <div className="dashboard-item bg-card/30 backdrop-blur-sm border border-border/40 rounded-2xl p-8 md:col-span-2 flex flex-col justify-between">
            <h2 className="text-[10px] tracking-widest uppercase text-muted-foreground mb-8 font-semibold">Revenue Distribution</h2>
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              {clientRevenue.map((c, i) => (
                <div key={i} className="space-y-2.5">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest">
                    <span className="text-foreground/80">{c.name}</span>
                    <span className="font-medium">${c.rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${(c.rev / maxRev) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {clientRevenue.length === 0 && <div className="text-muted-foreground text-xs italic">No data available.</div>}
            </div>
          </div>

          <div className="dashboard-item bg-card/30 backdrop-blur-sm border border-border/40 rounded-2xl p-8 md:col-span-3">
            <h2 className="text-[10px] tracking-widest uppercase text-muted-foreground mb-6 font-semibold">Recent Estimates</h2>
            <div className="space-y-2">
              {projects.length === 0 && <div className="text-muted-foreground text-xs italic">No estimates generated yet.</div>}
              {projects.map(p => {
                let rev = 0;
                p.lineItems?.forEach(li => rev += li.estimatedHours * li.hourlyRate);
                rev += rev * (p.contingencyPercentage / 100);
                
                return (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedProject(p)}
                    className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border/50 hover:bg-card/40 transition-all cursor-none group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                        <span className="text-[10px] text-foreground/50 group-hover:text-primary transition-colors">{p.status === 'ACCEPTED' ? '✓' : '⧖'}</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm tracking-tight text-foreground/90">{p.title}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                          {p.client?.name || 'Unknown'} <span className="mx-1.5 opacity-30">•</span> {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-foreground/90">
                        ${rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">{p.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
