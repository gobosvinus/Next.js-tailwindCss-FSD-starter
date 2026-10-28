// Include before next-env.d.ts so SVG components take precedence over Next.js types.
declare module "*.svg" {
  import type { FC, SVGProps } from "react";

  const SvgComponent: FC<SVGProps<SVGSVGElement>>;

  export default SvgComponent;
}
