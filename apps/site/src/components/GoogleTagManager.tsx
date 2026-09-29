import Script from 'next/script'

export function GoogleTagManager({ containerId }: { containerId?: null | string }) {
  if (!containerId) return null
  if (!/^GTM-[A-Z0-9]+$/i.test(containerId)) {
    throw new Error('Google Tag Manager must use a valid GTM container ID (GTM-…).')
  }

  return (
    <>
      <noscript>
        <iframe
          height="0"
          src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
          width="0"
        />
      </noscript>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');`}
      </Script>
    </>
  )
}
