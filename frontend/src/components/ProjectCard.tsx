import Link from 'next/link';
import { ChevronRight, Clock, FileText, BadgeDollarSign } from 'lucide-react';
import { Project } from '../services/api';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const totalHours = project.lineItems?.reduce((sum, item) => sum + Number(item.estimatedHours), 0) || 0;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'SENT': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ACCEPTED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm glass transition-all hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 duration-300">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {totalHours} hrs
              </span>
            </div>
          </div>
          <div className="p-2 bg-secondary rounded-lg text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between text-sm border-t border-border pt-4">
           <div className="flex items-center gap-1.5 text-muted-foreground">
             <FileText className="w-4 h-4" />
             <span>{project.lineItems?.length || 0} items</span>
           </div>
           <div className="flex items-center gap-1.5 font-medium text-foreground">
             <BadgeDollarSign className="w-4 h-4 text-emerald-500" />
             {/* Note: This is base cost without margins, calculated properly in the detail view */}
             <span>{project.lineItems?.reduce((sum, item) => sum + (Number(item.estimatedHours) * Number(item.hourlyRate)), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
           </div>
        </div>
      </div>
    </Link>
  );
}
