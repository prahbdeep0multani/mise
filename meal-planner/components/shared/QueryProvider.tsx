'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  })
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // useState ensures each server request gets its own QueryClient while
  // the browser keeps a single shared instance across re-renders.
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <DevtoolsPanel />}
    </QueryClientProvider>
  )
}

// Render devtools only in development. The conditional import keeps the
// production bundle clean — bundlers tree-shake the unreachable branch.
function DevtoolsPanel() {
  try {
    // @tanstack/react-query-devtools is an optional dev dependency.
    // If not installed, this silently does nothing.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ReactQueryDevtools } = require('@tanstack/react-query-devtools') as {
      ReactQueryDevtools: React.ComponentType<{ initialIsOpen?: boolean }>
    }
    return <ReactQueryDevtools initialIsOpen={false} />
  } catch {
    return null
  }
}
