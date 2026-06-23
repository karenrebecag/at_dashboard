import gsap from 'gsap'

export type OdometerOptions = {
  duration?: number
  ease?: string
  digitStagger?: number
  revealDuration?: number
  revealEase?: string
  digitCycles?: number
  start?: number
  delay?: number
}

const defaults = {
  duration: 1,
  ease: 'power3.out',
  digitStagger: 0.04,
  revealDuration: 0.5,
  revealEase: 'power2.out',
  digitCycles: 2,
} as const

const activeTweens = new WeakMap<HTMLElement, gsap.core.Timeline>()

type Segment = {
  type: 'digit' | 'static'
  char: string
  startDigit?: number
  hidden?: boolean
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getLineHeightRatio(el: HTMLElement): number {
  const cs = getComputedStyle(el)
  const lh = cs.lineHeight
  if (lh === 'normal') return 1.2
  return parseFloat(lh) / parseFloat(cs.fontSize)
}

function parseSegments(text: string): Segment[] {
  return [...text].map((char) => ({
    type: /\d/.test(char) ? 'digit' : 'static',
    char,
  }))
}

function mapStartDigits(segments: Segment[], startValue: number): Segment[] {
  const digitSlots = segments.filter((s) => s.type === 'digit')
  const padded = String(Math.floor(Math.abs(startValue)))
    .padStart(digitSlots.length, '0')
    .slice(-digitSlots.length)
  let di = 0
  return segments.map((s) =>
    s.type === 'digit'
      ? { ...s, startDigit: parseInt(padded[di++] ?? '0', 10) }
      : s,
  )
}

function markHiddenSegments(segments: Segment[], startValue: number): Segment[] {
  const totalDigits = segments.filter((s) => s.type === 'digit').length
  const absStart = Math.floor(Math.abs(startValue))
  const startDigitCount = absStart === 0 ? 1 : String(absStart).length
  const leadingZeros = Math.max(0, totalDigits - startDigitCount)
  if (leadingZeros === 0) return segments

  let digitsSeen = 0
  let firstDigitSeen = false
  let prevDigitHidden = false
  return segments.map((seg) => {
    if (seg.type === 'digit') {
      firstDigitSeen = true
      const hidden = digitsSeen < leadingZeros
      prevDigitHidden = hidden
      digitsSeen++
      return { ...seg, hidden }
    }
    const hidden = firstDigitSeen && prevDigitHidden
    return { ...seg, hidden }
  })
}

function shouldGrow(
  startValue: number,
  hasExplicitStart: boolean,
  segments: Segment[],
): boolean {
  if (!hasExplicitStart) return false
  const absStart = Math.floor(Math.abs(startValue))
  const startDigitCount = absStart === 0 ? 1 : String(absStart).length
  const endDigitCount = segments.filter((s) => s.type === 'digit').length
  return startDigitCount < endDigitCount
}

function buildRollerDOM(
  el: HTMLElement,
  segments: Segment[],
  step: number,
  grow: boolean,
  digitCycles: number,
) {
  el.innerHTML = ''
  el.style.height = ''
  const rollers: { roller: HTMLElement; targetPos: number }[] = []
  const revealEls: HTMLElement[] = []
  const totalCells = 10 * digitCycles

  segments.forEach((seg) => {
    if (seg.type === 'static') {
      const span = document.createElement('span')
      span.setAttribute('data-odometer-part', 'static')
      span.style.height = `${step}em`
      span.style.lineHeight = String(step)
      span.textContent = seg.char
      el.appendChild(span)
      if (grow && seg.hidden) {
        gsap.set(span, { opacity: 0 })
        revealEls.push(span)
      }
      return
    }

    const mask = document.createElement('span')
    mask.setAttribute('data-odometer-part', 'mask')
    mask.style.height = `${step}em`
    mask.style.lineHeight = String(step)
    const roller = document.createElement('span')
    roller.setAttribute('data-odometer-part', 'roller')
    roller.style.lineHeight = String(step)

    const digits: number[] = []
    for (let d = 0; d < totalCells; d++) digits.push(d % 10)
    roller.textContent = digits.join('\n')
    mask.appendChild(roller)
    el.appendChild(mask)

    const startDigit = seg.startDigit ?? 0
    const isReveal = grow && seg.hidden
    gsap.set(roller, {
      y: isReveal ? `${step}em` : `${-startDigit * step}em`,
    })
    const endDigit = parseInt(seg.char, 10)
    const targetPos = endDigit > startDigit ? endDigit : 10 + endDigit
    rollers.push({ roller, targetPos })
    if (isReveal) revealEls.push(mask)
  })

  return { rollers, revealEls }
}

function cleanupElement(el: HTMLElement, originalText: string) {
  el.style.overflow = ''
  el.style.height = ''

  const digits = [...originalText].filter((c) => /\d/.test(c))
  let di = 0

  el.querySelectorAll('[data-odometer-part="mask"]').forEach((mask) => {
    const roller = mask.querySelector('[data-odometer-part="roller"]')
    if (roller) roller.remove()
    mask.textContent = digits[di++] ?? ''
    ;(mask as HTMLElement).style.opacity = ''
    ;(mask as HTMLElement).style.overflow = ''
  })

  el.querySelectorAll('[data-odometer-part="static"]').forEach((stat) => {
    ;(stat as HTMLElement).style.opacity = ''
  })
}

function killRunning(el: HTMLElement) {
  const existing = activeTweens.get(el)
  if (existing) {
    existing.kill()
    gsap.set(el, { clearProps: 'width,overflow' })
    activeTweens.delete(el)
  }
}

function runTimeline(
  el: HTMLElement,
  endText: string,
  options: OdometerOptions & { onComplete?: () => void },
) {
  killRunning(el)

  const duration = options.duration ?? defaults.duration
  const ease = options.ease ?? defaults.ease
  const digitStagger = options.digitStagger ?? defaults.digitStagger
  const revealDuration = options.revealDuration ?? defaults.revealDuration
  const revealEase = options.revealEase ?? defaults.revealEase
  const digitCycles = options.digitCycles ?? defaults.digitCycles
  const delay = options.delay ?? 0
  const hasExplicitStart = options.start !== undefined
  const startValue = options.start ?? 0

  const step = getLineHeightRatio(el)
  let segments = parseSegments(endText)
  segments = mapStartDigits(segments, startValue)
  segments = markHiddenSegments(segments, startValue)
  const grow = shouldGrow(startValue, hasExplicitStart, segments)
  const { rollers, revealEls } = buildRollerDOM(
    el,
    segments,
    step,
    grow,
    digitCycles,
  )

  const fontSize = parseFloat(getComputedStyle(el).fontSize)
  const revealData = revealEls.map((revealEl) => {
    const widthEm = revealEl.offsetWidth / fontSize
    gsap.set(revealEl, { width: 0, overflow: 'hidden' })
    return { el: revealEl, widthEm }
  })

  const tl = gsap.timeline({
    delay,
    onComplete() {
      cleanupElement(el, endText)
      activeTweens.delete(el)
      options.onComplete?.()
    },
  })
  activeTweens.set(el, tl)

  revealData.forEach(({ el: revealEl, widthEm }) => {
    tl.to(
      revealEl,
      {
        width: `${widthEm}em`,
        opacity: 1,
        duration: revealDuration,
        ease: revealEase,
      },
      0,
    )
  })

  rollers.forEach(({ roller, targetPos }, digitIdx) => {
    const reversedIdx = rollers.length - 1 - digitIdx
    tl.to(
      roller,
      {
        y: `${-targetPos * step}em`,
        duration,
        ease,
        force3D: true,
      },
      reversedIdx * digitStagger,
    )
  })

  return tl
}

export function animateOdometer(
  el: HTMLElement,
  endText: string,
  options: OdometerOptions = {},
) {
  if (prefersReducedMotion()) {
    el.textContent = endText
    return null
  }
  return runTimeline(el, endText, options)
}

export function updateOdometer(
  el: HTMLElement,
  newText: string,
  options: OdometerOptions = {},
) {
  const currentText = el.textContent?.trim() ?? ''
  if (currentText === newText) return null

  if (prefersReducedMotion()) {
    el.textContent = newText
    return null
  }

  killRunning(el)

  const duration = options.duration ?? defaults.duration
  const ease = options.ease ?? defaults.ease
  const digitStagger = options.digitStagger ?? defaults.digitStagger
  const revealDuration = options.revealDuration ?? defaults.revealDuration
  const revealEase = options.revealEase ?? defaults.revealEase
  const digitCycles = options.digitCycles ?? defaults.digitCycles
  const step = getLineHeightRatio(el)

  const fontSize = parseFloat(getComputedStyle(el).fontSize)
  const oldWidthEm = el.getBoundingClientRect().width / fontSize

  const startSegments = parseSegments(currentText)
  const startDigitsStr = startSegments
    .filter((s) => s.type === 'digit')
    .map((s) => s.char)
    .join('')
  const startValue = parseInt(startDigitsStr, 10) || 0

  let segments = parseSegments(newText)
  segments = mapStartDigits(segments, startValue)
  segments = markHiddenSegments(segments, startValue)
  const { rollers, revealEls } = buildRollerDOM(
    el,
    segments,
    step,
    true,
    digitCycles,
  )

  const newWidthEm = el.getBoundingClientRect().width / fontSize
  const widthChanged = Math.abs(oldWidthEm - newWidthEm) > 0.01
  if (widthChanged) {
    gsap.set(el, { width: `${oldWidthEm}em`, overflow: 'hidden' })
  }

  const tl = gsap.timeline({
    onComplete() {
      cleanupElement(el, newText)
      activeTweens.delete(el)
    },
  })
  activeTweens.set(el, tl)

  if (widthChanged) {
    tl.to(
      el,
      {
        width: `${newWidthEm}em`,
        duration: revealDuration,
        ease: revealEase,
      },
      0,
    )
  }

  revealEls.forEach((revealEl) => {
    if (revealEl.getAttribute('data-odometer-part') === 'static') {
      tl.to(revealEl, { opacity: 1, duration: 0.2 }, 0)
    }
  })

  rollers.forEach(({ roller, targetPos }, digitIdx) => {
    const reversedIdx = rollers.length - 1 - digitIdx
    tl.to(
      roller,
      {
        y: `${-targetPos * step}em`,
        duration,
        ease,
        force3D: true,
      },
      reversedIdx * digitStagger,
    )
  })

  return tl
}