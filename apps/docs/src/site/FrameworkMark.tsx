import type { Framework } from './settings'

/*
 * both marks are drawn in currentColor rather than their brand colours, so they take the
 * palette the control around them already sets and the site keeps one set of colours.
 *
 * the two boxes differ because the ink inside them does. one logo is thin strokes that
 * spill past the viewBox and the other is a solid pair of chevrons two thirds as tall as
 * it is wide, so a shared box left them 2.3px apart. these sizes measure 15.2px and
 * 14.7px of ink, both exactly on the row centre.
 */
const ReactMark = () => (
  <svg className="size-[15px]" viewBox="-11.5 -10.232 23 20.464" fill="none" aria-hidden="true" focusable="false">
    <circle r="2.05" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
)

const VueMark = () => (
  <svg className="size-[17px]" viewBox="0 0 261.76 226.69" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M0 0h52.36l78.52 135.7L209.4 0h52.36L130.88 226.69z" />
    <path d="M52.36 0h52.36l26.16 45.31L157.04 0h52.36l-78.52 135.7z" opacity="0.55" />
  </svg>
)

export const FRAMEWORK_MARK: Record<Framework, typeof ReactMark> = {
  react: ReactMark,
  vue: VueMark,
}

export const FRAMEWORK_LABEL: Record<Framework, string> = {
  react: 'React',
  vue: 'Vue',
}
