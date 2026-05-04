export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex">
      {/* Left branding panel — visible on md+ screens */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 flex-col items-center justify-center px-12 py-16">
        <div className="max-w-sm text-center">
          {/* Logo mark */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg">
            <svg
              className="h-9 w-9 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            MealPlan
          </h1>
          <p className="mt-3 text-base text-gray-600 leading-relaxed">
            Smart meal planning that fits your lifestyle, budget, and dietary
            preferences — all in one place.
          </p>

          <ul className="mt-8 space-y-3 text-left">
            {[
              'Personalised weekly meal plans',
              'Auto-generated shopping lists',
              'Budget tracking per week',
              'Dietary preference filters',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg
                    className="h-3 w-3"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        {/* Mobile logo — visible only on small screens */}
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center md:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-md">
              <svg
                className="h-7 w-7 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <span className="mt-2 text-lg font-bold text-gray-900">MealPlan</span>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white px-8 py-10 shadow-xl ring-1 ring-gray-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
