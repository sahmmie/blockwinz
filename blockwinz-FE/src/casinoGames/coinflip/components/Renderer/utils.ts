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
