import { parse, HTMLElement, TextNode } from 'node-html-parser'

interface OptimizationOptions {
  removeMetaTags?: boolean
  removeScriptTags?: boolean
  removeStyleTags?: boolean
  removeEmptyTags?: boolean
  removeAttributes?: boolean
  preserveAttributes?: string[]
  removeComments?: boolean
  minifyWhitespace?: boolean
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  removeMetaTags: true,
  removeScriptTags: true,
  removeStyleTags: true,
  removeEmptyTags: true,
  removeAttributes: true,
  preserveAttributes: ['href', 'src', 'alt', 'title'],
  removeComments: true,
  minifyWhitespace: true,
}

/**
 * Optimizes HTML content for AI processing by removing unnecessary elements
 * while preserving content and structure
 */
export function optimizeHtmlForAI(html: string, options: OptimizationOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Parse the HTML
  const root = parse(html)

  // Process the DOM tree
  processElement(root, opts)

  // Get the optimized HTML
  let optimizedHtml = root.innerHTML

  // Minify whitespace if requested
  if (opts.minifyWhitespace) {
    optimizedHtml = minifyWhitespace(optimizedHtml)
  }

  return optimizedHtml
}

function processElement(element: HTMLElement, options: OptimizationOptions): void {
  const children = [...element.childNodes]

  for (const child of children) {
    if (child instanceof HTMLElement) {
      const tagName = child.tagName.toLowerCase()

      // Remove unwanted tags
      if (shouldRemoveTag(tagName, options)) {
        child.remove()
        continue
      }

      // Remove attributes if requested
      if (options.removeAttributes) {
        removeAttributes(child, options.preserveAttributes || [])
      }

      // Recursively process children
      processElement(child, options)

      // Remove empty tags after processing children
      if (options.removeEmptyTags && isEmptyTag(child)) {
        child.remove()
      }
    } else if (child instanceof TextNode) {
      // Remove comment nodes
      if (options.removeComments) {
        child.remove()
      }
    }
  }
}

function shouldRemoveTag(tagName: string, options: OptimizationOptions): boolean {
  const tagsToRemove = new Set<string>()

  if (options.removeMetaTags) {
    tagsToRemove.add('meta')
    tagsToRemove.add('link')
    tagsToRemove.add('title')
  }

  if (options.removeScriptTags) {
    tagsToRemove.add('script')
  }

  if (options.removeStyleTags) {
    tagsToRemove.add('style')
  }

  // Always remove these tags as they're not useful for AI processing
  tagsToRemove.add('noscript')
  tagsToRemove.add('template')

  return tagsToRemove.has(tagName)
}

function removeAttributes(element: HTMLElement, preserveAttributes: string[]): void {
  const attributesToPreserve = new Set(preserveAttributes)
  const attributes = element.attributes

  for (const [name] of Object.entries(attributes)) {
    if (!attributesToPreserve.has(name.toLowerCase())) {
      element.removeAttribute(name)
    }
  }
}

function isEmptyTag(element: HTMLElement): boolean {
  // Don't remove self-closing tags that might be meaningful
  const selfClosingTags = new Set([
    'img',
    'br',
    'hr',
    'input',
    'area',
    'base',
    'col',
    'embed',
    'source',
    'track',
    'wbr',
  ])

  if (selfClosingTags.has(element.tagName.toLowerCase())) {
    return false
  }

  // Check if element has no meaningful content
  const hasText = element.innerText.trim().length > 0
  const hasChildren = element.childNodes.some(
    (child) =>
      child instanceof HTMLElement || (child instanceof TextNode && child.text.trim().length > 0),
  )

  return !hasText && !hasChildren
}

function minifyWhitespace(html: string): string {
  return (
    html
      // Remove extra whitespace between tags
      .replace(/>\s+</g, '><')
      // Remove extra whitespace within text content (but preserve single spaces)
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
  )
}

// Alternative lightweight version without external dependencies
export function optimizeHtmlForAILightweight(html: string): string {
  let optimized = html

  // Remove DOCTYPE, meta tags, scripts, styles
  optimized = optimized.replace(/<!DOCTYPE[^>]*>/gi, '')
  optimized = optimized.replace(/<meta[^>]*>/gi, '')
  optimized = optimized.replace(/<link[^>]*>/gi, '')
  optimized = optimized.replace(/<title[^>]*>.*?<\/title>/gis, '')
  optimized = optimized.replace(/<script[^>]*>.*?<\/script>/gis, '')
  optimized = optimized.replace(/<style[^>]*>.*?<\/style>/gis, '')
  optimized = optimized.replace(/<noscript[^>]*>.*?<\/noscript>/gis, '')

  // Remove HTML comments
  optimized = optimized.replace(/<!--[\s\S]*?-->/g, '')

  // Remove template tags and their content
  optimized = optimized.replace(/<template[^>]*>.*?<\/template>/gis, '')

  // Remove most attributes, keeping only href, src, alt, title
  optimized = optimized.replace(
    /<([a-zA-Z][a-zA-Z0-9]*)\s+[^>]*?((?:href|src|alt|title)="[^"]*"[^>]*?)*>/gi,
    (match, tagName, preservedAttrs) => {
      const attrs = preservedAttrs || ''
      return `<${tagName}${attrs ? ' ' + attrs : ''}>`
    },
  )

  // Remove empty tags (simple approach)
  optimized = optimized.replace(/<([^>]+)>\s*<\/\1>/g, '')

  // Minify whitespace
  optimized = optimized.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim()

  return optimized
}
