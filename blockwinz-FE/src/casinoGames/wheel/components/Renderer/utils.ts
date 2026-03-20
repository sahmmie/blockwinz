export const SCL = 1
export const W = 800 * SCL
export const H = 600 * SCL

export function setAspectR(container: HTMLDivElement) {
  const parentContainer = container.parentElement
  if (parentContainer) {
    const parentWidth = parentContainer.offsetWidth
    const aspectRatio = 4 / 3
    const height = parentWidth / aspectRatio
    parentContainer.style.height = `${height}px`
  }
}

export async function delay(time: number) {
  return new Promise<void>((res) => {
    setTimeout(res, time)
  })
}

/**
 * Darken a hex color by a given percentage (0-1)
 * @param color - hex color string (e.g. #RRGGBB)
 * @param amount - amount to darken (0.0 = no change, 1.0 = black)
 * @returns darkened hex color string
 */
export function darkenColor(color: string, amount: number): string {
  if (!/^#([A-Fa-f0-9]{6})$/.test(color)) return color;
  const num = parseInt(color.slice(1), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
