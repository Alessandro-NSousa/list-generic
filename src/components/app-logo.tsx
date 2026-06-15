type AppLogoProps = {
  className?: string;
  priority?: boolean;
  width?: number;
};

export function AppLogo({ className, priority: _priority = false, width = 220 }: AppLogoProps) {
  return (
    <div className={className}>
      <img
        alt="Quarteto Fantastico"
        className="block h-auto max-w-full"
        decoding="async"
        src="/quarteto-fantastico.png"
        width={width}
      />
    </div>
  );
}
