"use client";

const steps = [
  {
    n: "01",
    title: "Register",
    body: "Fill the form with your Neolife details and submit.",
  },
  {
    n: "02",
    title: "Get Approved",
    body: "Admin reviews your registration and activates your account.",
  },
  {
    n: "03",
    title: "Attendance each day",
    body: "Bring your QR; an admin marks you present. You track streaks and history in the app.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="scroll-mt-20 bg-[var(--so-slate-50)] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl font-semibold text-slate-900 md:text-4xl">
          Up and running in minutes
        </h2>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div
            className="absolute left-[8%] right-[8%] top-7 hidden border-t-2 border-dashed border-slate-300 md:block lg:left-[12%] lg:right-[12%]"
            aria-hidden
          />

          <div className="grid gap-10 md:grid-cols-3 md:gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative text-center md:pt-2">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-[var(--so-slate-50)] bg-[#1E4DB7] font-display text-sm font-bold text-white shadow-md">
                  {s.n}
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
