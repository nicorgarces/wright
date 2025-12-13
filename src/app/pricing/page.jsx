"use client";

import Header from "../../components/Header";

const tiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    badge: "Best to try it out",
    description:
      "For individual pilots, students or enthusiasts that need occasional access to Colombian AIP charts.",
    features: [
      "Access to Colombian AIP aerodrome charts (limited refresh)",
      "1 device / browser",
      "Basic search by ICAO",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "/month",
    badge: "For frequent users",
    description:
      "Ideal for pilots, dispatchers and aviation nerds that use charts every day.",
    highlight: true,
    features: [
      "Full Colombian AIP chart access (more frequent updates)",
      "Up to 3 devices",
      "Advanced filters by chart type & procedure",
      "Priority support",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "Let’s talk",
    period: "",
    badge: "For schools & companies",
    description:
      "For ATOs, airlines, ANSPs or universities that need shared access for multiple people.",
    features: [
      "Multi-seat access (custom number of users)",
      "Central billing",
      "Custom domains & SSO (optional)",
      "Dedicated onboarding",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <Header />

      {/* Page header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Pricing
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Start free while we’re in early access. As the platform grows, we’ll
          add paid plans for power users, teams and training organizations —
          always with a fair and transparent structure.
        </p>
      </div>

      {/* Small status badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Early preview — pricing is indicative and may change.</span>
      </div>

      {/* Pricing cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={
              "flex flex-col rounded-xl border bg-white p-4 shadow-sm " +
              (tier.highlight
                ? "border-slate-900 shadow-md"
                : "border-slate-200")
            }
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {tier.name}
                </h2>
                {tier.badge && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {tier.badge}
                  </p>
                )}
              </div>
              {tier.highlight && (
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-50">
                  Most popular
                </span>
              )}
            </div>

            <div className="mb-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-xs text-slate-500">
                    {tier.period}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {tier.description}
              </p>
            </div>

            <ul className="flex-1 space-y-1.5 text-xs text-slate-700">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-slate-900" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={
                "mt-4 w-full rounded-full px-3 py-1.5 text-xs font-medium border transition " +
                (tier.highlight
                  ? "border-slate-900 bg-slate-900 text-slate-50 hover:bg-slate-800"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-400")
              }
            >
              {tier.id === "team"
                ? "Contact us"
                : "Get started"}
            </button>
          </div>
        ))}
      </div>

      {/* Small note */}
      <p className="text-[11px] text-slate-500">
        All prices are indicative and may change during the beta period. Some
        features described here are still under development.
      </p>
    </div>
  );
}
