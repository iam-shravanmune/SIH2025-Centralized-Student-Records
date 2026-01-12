import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "inline-flex items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold shadow-lg",
        sizeClasses[size]
      )}>
        <svg 
          width={size === "sm" ? 16 : size === "md" ? 20 : 28} 
          height={size === "sm" ? 16 : size === "md" ? 20 : 28} 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="drop-shadow-sm"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.8"/>
        </svg>
      </div>
      {showText && (
        <span className={cn(
          "font-semibold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent",
          textSizeClasses[size]
        )}>
          GradFolio
        </span>
      )}
    </div>
  );
}
