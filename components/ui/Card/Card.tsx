// components/ui/Card/Card.tsx
import { ReactNode } from 'react';

interface CardProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string; // Add className prop
}

const Card = ({ title, description, footer, children, className }: CardProps) => {
  return (
    <div className={`w-full max-w-3xl m-auto my-8 border rounded-md p border-zinc-700 ${className}`}>
      <div className="px-5 py-4">
        <h3 className="mb-1 text-2xl font-medium">{title}</h3>
        <p className="text-zinc-300">{description}</p>
        {children}
      </div>
      {footer && (
        <div className="p-4 border-t rounded-b-md border-zinc-700 bg-zinc-900 text-zinc-500">
          {footer}
        </div>
      )}
    </div>
  );
};

// Export subcomponents if needed
export const CardHeader = ({ children }: { children: ReactNode }) => (
  <div className="card-header">{children}</div>
);
export const CardTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="card-title">{children}</h2>
);
export const CardDescription = ({ children }: { children: ReactNode }) => (
  <p className="card-description">{children}</p>
);
export const CardContent = ({ children }: { children: ReactNode }) => (
  <div className="card-content">{children}</div>
);
export const CardFooter = ({ children }: { children: ReactNode }) => (
  <div className="card-footer">{children}</div>
);

export default Card; // Default export
