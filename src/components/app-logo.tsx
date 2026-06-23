import Image from "next/image";

type AppLogoProps = {
  className?: string;
  priority?: boolean;
  width?: number;
};

const LOGO_WIDTH = 4726;
const LOGO_HEIGHT = 2682;

export function AppLogo({ className, priority = false, width = 220 }: AppLogoProps) {
  const height = Math.round((width * LOGO_HEIGHT) / LOGO_WIDTH);

  return (
    <div className={className}>
      <Image
        alt="Quarteto Fantastico"
        className="block h-auto max-w-full"
        height={height}
        priority={priority}
        src="/quarteto-fantastico.png"
        width={width}
      />
    </div>
  );
}
