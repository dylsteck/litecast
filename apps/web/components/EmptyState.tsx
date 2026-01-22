interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-system-secondary-background mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-system-label mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-system-secondary-label max-w-sm">{description}</p>
      )}
    </div>
  );
}
