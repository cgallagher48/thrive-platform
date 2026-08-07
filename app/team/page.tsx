import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FramedPhoto from "@/components/FramedPhoto";

export const metadata: Metadata = {
  title: "Meet the Team | Thrive Automation Agency",
  description:
    "The people behind Thrive: Casey Gallagher and David Ricco, building automation systems for small businesses.",
};

const TEAM = [
  {
    slug: "casey",
    photo: "/images/team-casey.jpg",
    name: "Casey Gallagher",
    role: "Founder",
    message:
      "I am Casey Gallagher, founder of Thrive. I started out running a small power washing business with a friend, and like a lot of owners, I spent my nights buried in busywork instead of the actual work. I have always liked building systems, so I started building tools to take that load off myself. They worked, and it hit me that the owners around me were fighting the exact same thing. So that is what I do now. I build the tools that handle the busywork for you, the dashboard, the follow ups, the scheduling, and I keep them tuned to how your business actually runs. If something is not working, I want to hear about it, and I will make it right. You are not a ticket number here. You are working with someone who built the thing and genuinely cares that it helps you. The goal is simple. Give small businesses the same tools the big companies have, at a price that makes sense for a real shop.",
  },
  {
    slug: "david",
    photo: "/images/team-david.png",
    name: "David Ricco",
    role: "Co-Founder",
    message:
      "As a business student at Marquette University, I wanted to take my skills and background and put them to work solving the problems that hold small businesses back. Together with my co-founder, Casey Gallagher, that vision of simplifying and automating the day to day work of running a business has become real. As head of client relations, my commitment is simple: help business owners handle whatever gets thrown their way, with AI automation doing the heavy lifting. At Thrive, our first and only goal is making your life easier. Let's take on your problems together.",
  },
];

export default function TeamPage() {
  return (
    <>
      <Nav />
      <main>
        {/* Meet the Team */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              Meet the Team
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The people behind Thrive.
            </h1>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {TEAM.map((member) => (
                <div
                  key={member.slug}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-8"
                >
                  <FramedPhoto
                    src={member.photo}
                    alt={`Portrait of ${member.name}, ${member.role} of Thrive`}
                    aspect="4 / 5"
                    sizes="(min-width: 768px) 45vw, 100vw"
                  />
                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-violet-600">
                    {member.role}
                  </p>
                  <p className="mt-4 leading-relaxed text-slate-600">
                    &ldquo;{member.message}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
