'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      posthog.capture('$pageview', { $current_url: window.location.href })
    }
  }, [pathname, searchParams])

  return null
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
    // Defer PostHog init until after the page is interactive
    const id = requestIdleCallback(
      () => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: false,
          session_recording: {
            maskAllInputs: false,
            maskInputOptions: { password: true },
          },
        })
        setReady(true)
      },
      { timeout: 3000 }
    )
    return () => cancelIdleCallback(id)
  }, [])

  return (
    <PostHogProvider client={posthog}>
      {children}
      {ready && <PageViewTracker />}
    </PostHogProvider>
  )
}
