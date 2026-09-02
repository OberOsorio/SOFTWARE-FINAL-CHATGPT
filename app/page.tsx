import Link from "next/link";
import {
  ArrowRight, BarChart3, Bot, Check, CircleCheckBig, FileCheck2,
  Fingerprint, Landmark, MapPinned, Menu, ScanLine, ShieldCheck,
  Sparkles, Target, TrendingUp, Users, Zap,
} from "lucide-react";

const features = [
  { icon: Bot, eyebrow: "Inteligencia", title: "Estrategia que aprende", text: "Discursos, debates y narrativa alineados con su programa de gobierno.", metric: "24/7", label: "asistencia estratégica" },
  { icon: MapPinned, eyebrow: "Territorio", title: "Cada voto, visible", text: "CRM 1x10, líderes, barrios y mapas de calor en una única operación.", metric: "+92%", label: "cobertura operativa" },
  { icon: ScanLine, eyebrow: "Día D", title: "Defensa en tiempo real", text: "Testigos, novedades y actas E-14 centralizadas para actuar a tiempo.", metric: "10 s", label: "validación por acta" },
];

const plans = [
  { name: "Starter Local", price: "119", description: "Hasta 10.000 votantes", features: ["CRM territorial", "500 consultas AI", "20 mesas E-14"] },
  { name: "Campaña Pro", price: "319", description: "Hasta 100.000 votantes", features: ["Copiloto AI ilimitado", "OCR E-14 sin límite", "Control CNE y topes"] },
  { name: "Cobertura Nacional", price: "719", description: "Capacidad ilimitada", features: ["Defensa jurídica completa", "Soporte Día D 24/7", "Operación multi-región"] },
];

function CommandCenter() {
  const stats = [
    [Users, "Votos confirmados", "34.280", "+8,4%"],
    [MapPinned, "Líderes activos", "426", "91% activos"],
    [FileCheck2, "Mesas cubiertas", "1.102", "92% total"],
    [Landmark, "Presupuesto", "$52,6 M", "disponible"],
  ] as const;

  return <div className="relative mx-auto w-full max-w-[590px]">
    <div className="absolute -inset-8 rounded-full bg-blue-500/20 blur-3xl" />
    <div className="relative rounded-[28px] border border-white/15 bg-white/[.08] p-3 shadow-2xl backdrop-blur-xl">
      <div className="overflow-hidden rounded-[20px] bg-[#f5f8fc] text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white"><Target size={18}/></span>
            <div><p className="text-sm font-black">Centro de comando</p><p className="text-[11px] text-slate-500">Elección local · Actualizado ahora</p></div>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700"><i className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>En vivo</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(([Icon,label,value,change]) => <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon size={16}/></span><span className="text-[10px] font-bold text-emerald-600">{change}</span></div>
              <p className="mt-3 text-[11px] text-slate-500">{label}</p><p className="mt-0.5 text-xl font-black">{value}</p>
            </div>)}
          </div>
          <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between"><div><p className="text-xs font-black">Crecimiento territorial</p><p className="text-[10px] text-slate-400">Últimas 8 semanas</p></div><span className="flex items-center gap-1 text-xs font-black text-emerald-600"><TrendingUp size={14}/>+24,8%</span></div>
            <div className="mt-5 flex h-24 items-end gap-2">{[30,41,38,55,63,58,76,89,83,100].map((height,index) => <span key={index} style={{height:`${height}%`}} className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-cyan-400"/>)}</div>
          </div>
        </div>
      </div>
    </div>
    <div className="absolute -bottom-6 -left-5 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1d33]/95 p-4 text-white shadow-2xl backdrop-blur-xl sm:flex">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400"><ShieldCheck size={21}/></span>
      <div><p className="text-xs font-black">Operación protegida</p><p className="text-[10px] text-slate-400">Roles, auditoría y RLS</p></div>
    </div>
  </div>;
}

export default function Home() {
  return <main className="overflow-hidden bg-[#f6f8fb]">
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#06111f]/80 text-white backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_30px_rgba(37,99,235,.35)]">CG</span><span>Campaña Ganadora <span className="text-cyan-300">AI</span></span></Link>
        <div className="hidden items-center gap-8 text-sm font-semibold text-slate-300 md:flex"><a href="#plataforma">Plataforma</a><a href="#metodo">Metodología</a><a href="#resultados">Resultados</a><a href="#planes">Planes</a></div>
        <Link href="/modulos" className="hidden items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/15 sm:flex">Ingresar <ArrowRight size={16}/></Link>
        <Link href="/modulos" aria-label="Abrir módulos" className="rounded-xl border border-white/15 p-2.5 sm:hidden"><Menu size={20}/></Link>
      </nav>
    </header>

    <section className="relative min-h-[850px] bg-[#06111f] px-5 pb-24 pt-40 text-white lg:px-8 lg:pt-48">
      <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_72%_30%,rgba(30,99,184,.45),transparent_32%),radial-gradient(circle_at_15%_80%,rgba(8,145,178,.18),transparent_27%)]"/>
      <div className="pointer-events-none absolute inset-0 opacity-[.055] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:72px_72px]"/>
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.03fr_.97fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-200"><Sparkles size={14}/>Tecnología electoral de nueva generación</div>
          <h1 className="mt-8 max-w-3xl text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-[78px]">Convierta su campaña en una <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">operación ganadora.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">Estrategia, territorio, cumplimiento CNE y defensa del voto. Todo su equipo tomando mejores decisiones desde una sola plataforma.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/modulos" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-bold shadow-[0_14px_45px_rgba(37,99,235,.32)] hover:-translate-y-0.5 hover:bg-blue-500">Explorar la plataforma <ArrowRight size={18}/></Link><a href="#plataforma" className="rounded-xl border border-white/15 bg-white/5 px-6 py-4 font-bold hover:bg-white/10">Ver cómo funciona</a></div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-400">{["Sin instalación","Datos protegidos","Soporte electoral"].map(item => <span key={item} className="flex items-center gap-2"><CircleCheckBig size={15} className="text-emerald-400"/>{item}</span>)}</div>
        </div>
        <CommandCenter/>
      </div>
      <div className="relative mx-auto mt-24 flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-white/10 pt-8 text-[11px] font-black tracking-[.17em] text-slate-500 lg:justify-between">{["ALCALDÍAS","GOBERNACIONES","CONCEJOS & ASAMBLEAS","CÁMARA & SENADO","CUMPLIMIENTO CNE"].map(item => <span key={item}>{item}</span>)}</div>
    </section>

    <section id="plataforma" className="px-5 py-28 lg:px-8"><div className="mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><span className="label text-blue-600">Una plataforma. Toda la campaña.</span><h2 className="mt-4 text-4xl font-black leading-tight tracking-[-.035em] text-slate-950 sm:text-5xl">La claridad que necesita para decidir.</h2><p className="mt-5 max-w-md leading-7 text-slate-500">Reemplace hojas dispersas, reportes tardíos y datos incompletos por una visión operacional compartida.</p></div><div className="grid gap-4 sm:grid-cols-3">{[["50.000","votos objetivo"],["108 h","ahorradas / semana"],["60%","más eficiencia"]].map(([value,label]) => <div key={value} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,.05)]"><p className="text-3xl font-black text-blue-600">{value}</p><p className="mt-2 text-sm text-slate-500">{label}</p></div>)}</div></div>
      <div className="mt-14 grid gap-5 lg:grid-cols-3">{features.map(({icon:Icon,eyebrow,title,text,metric,label}) => <article key={title} className="group rounded-[26px] border border-slate-200 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,.055)] hover:-translate-y-1 hover:border-blue-200"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#08182b] text-cyan-300"><Icon size={25}/></span><p className="label mt-7 text-blue-600">{eyebrow}</p><h3 className="mt-2 text-2xl font-black text-slate-950">{title}</h3><p className="mt-4 min-h-24 leading-7 text-slate-500">{text}</p><div className="mt-6 border-t border-slate-100 pt-5"><span className="text-2xl font-black text-slate-950">{metric}</span><span className="ml-2 text-xs text-slate-500">{label}</span></div></article>)}</div>
    </div></section>

    <section id="metodo" className="bg-white px-5 py-28 lg:px-8"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-2xl text-center"><span className="label text-blue-600">De la estrategia a la victoria</span><h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Una metodología que ordena el caos.</h2><p className="mt-5 text-slate-500">Cuatro etapas claras para convertir información en capacidad electoral.</p></div><div className="mt-16 grid gap-5 md:grid-cols-4">{[["01","Configure","Defina candidatura, territorio y meta de votos."],["02","Organice","Active líderes y consolide su base electoral."],["03","Movilice","Concentre al equipo donde genera más impacto."],["04","Defienda","Cubra mesas y valide cada acta E-14."]].map(([number,title,text]) => <article key={number} className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-6"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 font-black text-white shadow-lg">{number}</span><h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{text}</p></article>)}</div></div></section>

    <section id="resultados" className="relative bg-[#071326] px-5 py-28 text-white lg:px-8"><div className="absolute inset-0 opacity-[.05] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]"/><div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2"><div><span className="label text-cyan-300">Inteligencia en acción</span><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Su equipo ve lo mismo. Actúa a tiempo.</h2><p className="mt-5 max-w-lg leading-7 text-slate-300">Cada registro fortalece el mapa de campaña. Cada alerta llega al responsable correcto.</p><div className="mt-9 grid grid-cols-2 gap-3">{[[Fingerprint,"Accesos por rol"],[ShieldCheck,"Habeas Data"],[Zap,"Alertas en vivo"],[BarChart3,"Reportes ejecutivos"]].map(([Icon,label]) => <div key={String(label)} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-bold"><Icon size={19} className="text-cyan-300"/>{String(label)}</div>)}</div></div><div className="rounded-[28px] border border-white/10 bg-white/[.06] p-8 backdrop-blur-sm"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300"><Bot/></span><div><p className="font-black">Copiloto estratégico</p><p className="text-xs text-slate-400">Análisis de narrativa electoral</p></div></div><div className="mt-7 rounded-2xl bg-[#06101e] p-5 text-sm leading-7 text-slate-300">“Construya tres mensajes para jóvenes que conecten empleo, educación digital y movilidad sostenible.”</div><div className="mt-3 rounded-2xl bg-cyan-300/[.06] p-5"><p className="label text-cyan-300">Recomendación</p><p className="mt-3 text-sm leading-7 text-slate-200">Centre la narrativa en oportunidades verificables, compromisos medibles y una historia humana por territorio.</p></div></div></div></section>

    <section id="planes" className="px-5 py-28 lg:px-8"><div className="mx-auto max-w-7xl"><div><span className="label text-blue-600">Planes transparentes</span><h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Crece con su campaña.</h2></div><div className="mt-14 grid gap-5 lg:grid-cols-3">{plans.map((plan,index) => <article key={plan.name} className={`relative rounded-[26px] p-7 ${index===1?"bg-[#08182b] text-white shadow-2xl ring-4 ring-blue-100":"border border-slate-200 bg-white text-slate-950"}`}>{index===1&&<span className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase">Recomendado</span>}<p className={`label ${index===1?"text-cyan-300":"text-blue-600"}`}>Plan mensual</p><h3 className="mt-4 text-2xl font-black">{plan.name}</h3><p className={`mt-2 text-sm ${index===1?"text-slate-400":"text-slate-500"}`}>{plan.description}</p><p className="mt-7 text-5xl font-black"><sup className="mr-1 text-lg">$</sup>{plan.price}<span className="ml-1 text-sm font-normal text-slate-400">USD/mes</span></p><ul className="mt-7 space-y-3">{plan.features.map(item => <li key={item} className="flex gap-3 text-sm"><Check size={17} className="text-cyan-400"/>{item}</li>)}</ul><Link href="/modulos" className={`mt-8 block rounded-xl px-5 py-3.5 text-center text-sm font-black ${index===1?"bg-blue-600 text-white":"bg-slate-100 text-slate-900"}`}>Seleccionar plan</Link></article>)}</div></div></section>

    <section className="px-5 pb-24 lg:px-8"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-700 to-blue-500 px-7 py-14 text-center text-white shadow-[0_30px_80px_rgba(37,99,235,.25)]"><div className="relative mx-auto max-w-3xl"><p className="label text-blue-100">Su próxima campaña empieza aquí</p><h2 className="mt-4 text-4xl font-black sm:text-5xl">Organice hoy la operación que ganará mañana.</h2><p className="mt-5 text-blue-100">Explore cada módulo en modo demostración.</p><Link href="/modulos" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 font-black text-blue-700 shadow-xl">Entrar a la plataforma <ArrowRight size={18}/></Link></div></div></section>
    <footer className="border-t border-slate-200 bg-white px-5 py-9"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row"><Link href="/" className="font-black text-slate-900">Campaña Ganadora <span className="text-blue-600">AI</span></Link><p>Inteligencia, territorio y defensa de cada voto.</p><p>© 2026</p></div></footer>
  </main>;
}
