// Default export used for non-SVG static assets
const file = 'FileMock';
export default file;

// Named export used by SVGR imports: `import { ReactComponent as Logo } from '...svg'`
export const ReactComponent = (props: React.SVGProps<SVGSVGElement>): React.ReactElement =>
  React.createElement('svg', props);
