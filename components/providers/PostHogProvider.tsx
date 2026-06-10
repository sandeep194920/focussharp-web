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

    const init = () => {
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
    }

    // Defer PostHog init until after the page is interactive.
    // requestIdleCallback isn't supported on Safari (desktop or iOS), so fall
    // back to setTimeout there.
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(init, { timeout: 3000 })
      return () => cancelIdleCallback(id)
    } else {
      const id = setTimeout(init, 1000)
      return () => clearTimeout(id)
    }
  }, [])

  return (
    <PostHogProvider client={posthog}>
      {children}
      {ready && <PageViewTracker />}
    </PostHogProvider>
  )
}
