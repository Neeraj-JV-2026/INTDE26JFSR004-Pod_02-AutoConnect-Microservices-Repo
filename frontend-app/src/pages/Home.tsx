import { Link } from 'react-router-dom';
import {
  PhoneCall, ChevronDown, Car, DollarSign, Wrench, Package,
  BarChart3, Users, ShieldCheck, Zap, Globe, HeartHandshake,
  ArrowRight, Star, CheckCircle2,
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────────────────

const MODULES = [
  {
    icon: Users,
    color: 'from-yellow-500 to-amber-400',
    ring: 'ring-yellow-200',
    label: 'Sales Console',
    desc: 'Manage leads, build quotes, run trade-in valuations, and close deals — all from one Kanban-style workspace.',
  },
  {
    icon: DollarSign,
    color: 'from-emerald-500 to-green-400',
    ring: 'ring-emerald-200',
    label: 'Finance Dashboard',
    desc: 'Generate invoices, track commissions, reconcile accounts, and process recall-remediation billing with full audit trails.',
  },
  {
    icon: Wrench,
    color: 'from-blue-500 to-sky-400',
    ring: 'ring-blue-200',
    label: 'Service Advisor Console',
    desc: 'Schedule appointments, dispatch technicians, manage warranty claims, and keep customers informed in real time.',
  },
  {
    icon: Package,
    color: 'from-violet-500 to-purple-400',
    ring: 'ring-violet-200',
    label: 'Parts Manager',
    desc: 'Control parts inventory, reserve stock for active work orders, and trigger reorder alerts before shortages occur.',
  },
  {
    icon: Car,
    color: 'from-rose-500 to-red-400',
    ring: 'ring-rose-200',
    label: 'Inventory & Recalls',
    desc: 'Track every vehicle from arrival to sale, flag active recalls, and coordinate manufacturer remediation workflows.',
  },
  {
    icon: BarChart3,
    color: 'from-slate-500 to-gray-400',
    ring: 'ring-slate-200',
    label: 'Insights & BI',
    desc: 'Executive KPI dashboards, custom report builder, CSV/PDF exports, and live revenue analytics — all role-gated.',
  },
];

const PILLARS = [
  {
    icon: Zap,
    title: 'Microservices Architecture',
    body: 'Every domain — Sales, Finance, Inventory, CRM, Notifications — runs as an independent Spring Boot service behind an API Gateway, enabling zero-downtime deployments and team-level autonomy.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Security',
    body: 'JWT-backed authentication with fine-grained Spring Security annotations. Each role (Admin, Sales Consultant, Finance Officer, Service Advisor, Technician, Parts Manager, Customer) sees exactly what they need.',
  },
  {
    icon: Globe,
    title: 'Real-Time Notifications',
    body: 'An in-house notification service broadcasts in-app, email, and SMS alerts the moment a deal closes, an invoice goes overdue, or a recall is issued — keeping every stakeholder in sync.',
  },
  {
    icon: HeartHandshake,
    title: 'Customer-First Portal',
    body: 'Customers book service appointments, track their vehicles, view invoices, read recall notices, and message the service team — all from a single self-service portal.',
  },
];

const STATS = [
  { value: '8', label: 'Microservices' },
  { value: '6', label: 'Role Dashboards' },
  { value: '50+', label: 'API Endpoints' },
  { value: '100%', label: 'Type-Safe Frontend' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#020617] text-white">

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — full viewport
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[calc(100vh-104px)] flex items-center overflow-hidden">

        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)' }}
        />

        <div className="container mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between z-10 w-full h-full">

          {/* Left — copy */}
          <div className="flex flex-col items-start w-full md:w-5/12 md:pr-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-brand-yellow uppercase mb-5 px-3 py-1.5 rounded-full border border-brand-yellow/30 bg-brand-yellow/5">
              <Star className="w-3 h-3 fill-brand-yellow" />
              Dealership Management Platform
            </span>

            <h1 className="text-4xl md:text-[52px] font-extrabold text-white leading-[1.15] tracking-tight mb-4 max-w-xl">
              A Better <span className="text-brand-yellow drop-shadow-sm">Way</span><br />
              To buy, sell or finance<br />
              your car.
            </h1>

            <p className="text-base md:text-lg text-gray-400 font-medium mb-8 max-w-lg leading-relaxed">
              Your Car Journey, All in One Place — Everything You Need, Before and After the Drive.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="bg-brand-yellow hover:bg-yellow-400 text-gray-900 font-bold py-2.5 px-6 rounded-lg shadow-md active:scale-[0.97] transition-all duration-150 text-base text-center w-full sm:w-auto flex items-center justify-center gap-2"
              >
                Sign Up Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="bg-transparent hover:bg-white/10 text-white border border-white/20 font-bold py-2.5 px-6 rounded-lg transition-all duration-150 text-base text-center w-full sm:w-auto"
              >
                Login
              </Link>

              <div className="flex items-center ml-2 mt-4 sm:mt-0">
                <PhoneCall className="text-brand-red w-6 h-6 mr-2 shrink-0" />
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-gray-400 text-[10px] font-semibold tracking-wide uppercase">Call Us Today!</span>
                  <span className="text-white font-bold text-base">+1 800 123 4567</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — car image */}
          <div className="w-full md:w-7/12 mt-8 md:mt-0 flex justify-end items-center relative h-full">
            <img
              src="/hero-cars.png"
              alt="Luxury Car"
              className="w-full max-w-[850px] h-auto object-contain mix-blend-screen brightness-110 contrast-125 transform md:translate-x-12 lg:scale-110"
            />
          </div>
        </div>

        {/* Scroll cue */}
        <button
          onClick={scrollToAbout}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-500 hover:text-brand-yellow transition-colors duration-200 group z-20"
          aria-label="Scroll to About"
        >
          <span className="text-[10px] font-semibold tracking-widest uppercase">Discover More</span>
          <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-brand-yellow" />
        </button>

        {/* Dark bar at bottom */}
        <div className="absolute bottom-0 w-full h-8 bg-black z-10" />
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          ABOUT US
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="bg-white text-gray-900">

        {/* ── Intro ── */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-24 pb-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-yellow bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 mb-5">
            About AutoConnect
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            One Platform.<br />
            <span className="text-brand-yellow">Every Role. Every Workflow.</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
            AutoConnect is a fully integrated <strong className="text-gray-700">Dealership Management System</strong> built on
            a cloud-native microservices architecture. From the moment a lead walks in to the moment a vehicle
            is serviced years later, AutoConnect gives every team member — salespeople, finance officers,
            service advisors, technicians, parts managers, and customers — a dedicated, role-aware workspace
            that talks to every other part of the business in real time.
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div className="bg-[#020617]">
          <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-black text-brand-yellow tabular-nums">{value}</p>
                <p className="text-sm text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Module grid ── */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20">
          <div className="text-center mb-14">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">Built for Every Role</h3>
            <p className="text-gray-500 max-w-xl mx-auto">
              Six purpose-built consoles, each tailored to a specific team — connected by shared inventory,
              customer records, and a live notification bus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map(({ icon: Icon, color, ring, label, desc }) => (
              <div
                key={label}
                className={`group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-md transition-all duration-200 p-6 hover:-translate-y-0.5`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} ring-4 ${ring} mb-5 shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">{label}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Technology pillars ── */}
        <div className="bg-slate-50 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-20">
            <div className="text-center mb-14">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">Built to Scale</h3>
              <p className="text-gray-500 max-w-xl mx-auto">
                AutoConnect is engineered from the ground up on modern enterprise patterns — not bolted together.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {PILLARS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-[#020617] flex items-center justify-center shadow-sm mt-0.5">
                    <Icon className="w-5 h-5 text-brand-yellow" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Why choose us ── */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text side */}
            <div>
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-yellow bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 mb-5">
                Our Mission
              </span>
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 mb-5 leading-snug">
                Dealership operations shouldn't require a dozen disconnected tools.
              </h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                We built AutoConnect because dealerships deserve software that reflects how they actually work —
                where a deal closed by Sales instantly triggers a Finance invoice, a vehicle sold in Inventory is
                immediately reflected in the Customer's portal, and a recalled model surfaces in both the
                Admin panel and the Service team's queue without anyone sending a spreadsheet.
              </p>
              <ul className="space-y-3">
                {[
                  'End-to-end traceability from lead to lifetime service record',
                  'Event-driven notifications — no manual follow-ups required',
                  'Secure, role-scoped access to exactly the right data',
                  'Designed for multi-team dealerships of any size',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual card stack */}
            <div className="space-y-4">
              {[
                { role: 'Sales Consultant', action: 'Converted lead → created quote → notified Finance', color: 'border-l-yellow-400' },
                { role: 'Finance Officer',  action: 'Generated invoice → marked PAID → updated commission', color: 'border-l-emerald-400' },
                { role: 'Service Advisor',  action: 'Scheduled service → dispatched technician → sent customer update', color: 'border-l-blue-400' },
                { role: 'Customer',         action: 'Booked appointment → tracked status → received receipt', color: 'border-l-violet-400' },
              ].map(({ role, action, color }) => (
                <div key={role} className={`bg-white rounded-xl border border-gray-100 shadow-card border-l-4 ${color} px-5 py-4`}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{role}</p>
                  <p className="text-sm text-gray-700 font-medium">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA footer ── */}
        <div className="bg-[#020617]">
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-20 text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              Ready to run your dealership smarter?
            </h3>
            <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto">
              Create an account in seconds and explore every module. No setup fees, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-brand-yellow hover:bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-lg text-base active:scale-[0.97] transition-all duration-150 shadow-md flex items-center gap-2"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white font-semibold py-3 px-8 rounded-lg border border-white/10 hover:bg-white/5 transition-all duration-150 text-base"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Footer strip */}
          <div className="border-t border-white/5 py-6 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} AutoConnect Dealership Management System · All rights reserved
          </div>
        </div>

      </section>
    </div>
  );
}
