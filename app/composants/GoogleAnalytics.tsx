'use client'

import Script from 'next/script'

// Déclaration globale pour gtag avec des types plus spécifiques
declare global {
  interface Window {
    gtag: (
      command: 'js' | 'config' | 'event',
      targetId: string,
      config?: {
        page_title?: string
        page_location?: string
        event_category?: string
        event_label?: string
      }
    ) => void
  }
}

// Utilise la variable d'environnement ou l'ID par défaut
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function GoogleAnalytics() {
  // Ne pas afficher si l'ID n'est pas configuré
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}

// Fonction pour tracker les événements personnalisés
export const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    })
  }
}

// Fonction pour tracker les conversions PDF
export const trackPDFConversion = (imageCount: number, fileName: string) => {
  trackEvent('pdf_generated', 'conversion', `${imageCount}_images_${fileName}`)
} 
