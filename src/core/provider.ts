export function inferProviderName(url: string | RegExp): string {
  if (typeof url !== 'string') {
    return ''
  }

  let pathname = url

  try {
    const parsed = new URL(url, 'http://placeholder.local')
    pathname = parsed.pathname
  } catch {
    // Ignore - treat as relative path
  }

  const cleaned = pathname.replace(/^[/#]+/, '')
  if (!cleaned) return ''

  const [firstSegment] = cleaned.split('/')
  return firstSegment || ''
}
