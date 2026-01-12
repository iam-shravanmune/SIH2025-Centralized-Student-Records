export default function Placeholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-prose text-sm text-muted-foreground">{description}</p>
      ) : null}
      <p className="mx-auto mt-6 max-w-prose text-xs text-muted-foreground">
        This section is ready to be filled. Tell me what data and actions you want here, and I’ll wire it up.
      </p>
    </div>
  );
}
