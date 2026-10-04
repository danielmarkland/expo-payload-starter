const containerIdPattern = /^GTM-[A-Z0-9]+$/i

type GtmWindow = { dataLayer?: unknown[]; document: Document }

export function appendGoogleTagManager(
  containerId: string | undefined,
  browserWindow: GtmWindow,
  documentRef: Pick<Document, 'createElement' | 'getElementById' | 'head'>,
) {
  if (!containerId || !containerIdPattern.test(containerId)) return

  const scriptId = `google-tag-manager-${containerId}`
  if (documentRef.getElementById(scriptId)) return

  browserWindow.dataLayer = browserWindow.dataLayer || []
  browserWindow.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

  const script = documentRef.createElement('script')
  script.id = scriptId
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`
  documentRef.head.appendChild(script)
}
