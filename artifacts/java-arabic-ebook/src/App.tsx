import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BookOpen, Bookmark, Check, ChevronLeft, ChevronRight, CircleHelp, Copy, Download, Layers3, Menu, Monitor, Moon, Play, Search, Sparkles, Sun, Terminal, Wrench, X } from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Chapter = {
  id: string;
  number: string;
  title: string;
  description: string;
  available: boolean;
};

const chapters: Chapter[] = [
  { id: 'chapter-1', number: '01', title: 'بداية الرحلة مع Java', description: 'الفكرة، الأدوات، وأول برنامج', available: true },
  { id: 'planned-chapters', number: '02', title: 'المتغيرات وأنواع البيانات', description: 'كيف نخزن المعلومات ونصفها', available: false },
  { id: 'planned-chapters', number: '03', title: 'العمليات واتخاذ القرار', description: 'اجعل برنامجك يفكر ويختار', available: false },
  { id: 'planned-chapters', number: '04', title: 'الحلقات', description: 'كرر العمل دون تكرار الكود', available: false },
  { id: 'planned-chapters', number: '05', title: 'الدوال والكائنات', description: 'نظم أفكارك في وحدات واضحة', available: false },
  { id: 'planned-chapters', number: '06', title: 'مشروع تطبيقي', description: 'ابنِ شيئاً يعمل من البداية للنهاية', available: false },
];

const toc = [
  { id: 'why-java', label: 'لماذا Java؟', chapter: '01' },
  { id: 'write-once', label: 'اكتب مرة، شغّل في أي مكان', chapter: '01' },
  { id: 'java-stack', label: 'JDK و JRE و JVM', chapter: '01' },
  { id: 'setup', label: 'تجهيز بيئة العمل', chapter: '01' },
  { id: 'hello-world', label: 'برنامجك الأول', chapter: '01' },
  { id: 'line-by-line', label: 'قراءة البرنامج سطراً سطراً', chapter: '01' },
  { id: 'notes', label: 'ملاحظات للمبتدئ', chapter: '01' },
  { id: 'exercise', label: 'تمرين الفصل', chapter: '01' },
];

const helloWorld = `public class Main {
    public static void main(String[] args) {
        System.out.println("أهلاً بك في عالم جافا!");
    }
}`;

const variablesExample = `int age = 20;
String name = "ليان";
System.out.println(name + " عمرها " + age);`;

declare global {
  interface Window {
    Prism?: {
      languages: { java?: unknown };
      highlight: (code: string, grammar: unknown, language: string) => string;
    };
    html2pdf?: () => {
      set: (options: Record<string, unknown>) => { from: (element: HTMLElement) => { save: () => Promise<void> } };
    };
  }
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fallbackHighlight(value: string) {
  return escapeHtml(value)
    .replace(/(\/\/.*)$/gm, '<span class="token-comment">$1</span>')
    .replace(/(&quot;.*?&quot;)/g, '<span class="token-string">$1</span>')
    .replace(/\b(public|class|static|void|new|int|String|private|return)\b/g, '<span class="token-keyword">$1</span>')
    .replace(/\b(main|println|System|Main)\b/g, '<span class="token-function">$1</span>');
}

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('تعذر تحميل الأداة'));
    document.head.appendChild(script);
  });
}

function CodeCard({ code, label, id }: { code: string; label: string; id: string }) {
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState(() => fallbackHighlight(code));

  useEffect(() => {
    let cancelled = false;
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js', 'prism-core')
      .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-java.min.js', 'prism-java'))
      .then(() => {
        if (!cancelled && window.Prism?.languages.java) {
          setHtml(window.Prism.highlight(code, window.Prism.languages.java, 'java'));
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [code]);

  const copyCode = async () => {
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="code-card page-avoid overflow-hidden rounded-2xl border border-slate-700/80 bg-[#1b2433] text-slate-100 shadow-xl shadow-slate-900/10" data-testid={`code-card-${id}`}>
      <div className="flex items-center justify-between border-b border-slate-700/80 px-4 py-3" dir="rtl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-300 text-slate-900"><Terminal size={14} /></span>
          <span>{label}</span>
        </div>
        <button type="button" onClick={copyCode} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300" data-testid={`button-copy-${id}`} aria-label="نسخ الكود">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'تم النسخ' : 'نسخ'}
        </button>
      </div>
      <pre className="code-block overflow-x-auto px-5 py-5 text-[13px] leading-7 sm:text-sm" dir="ltr"><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </div>
  );
}

function InfoCard({ icon, title, children, tone = 'teal' }: { icon: ReactNode; title: string; children: ReactNode; tone?: 'teal' | 'amber' }) {
  return (
    <aside className={`info-card page-avoid my-8 rounded-2xl border p-5 ${tone === 'amber' ? 'border-amber-300/60 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-300/10' : 'border-teal-200 bg-teal-50/70 dark:border-teal-700/60 dark:bg-teal-400/10'}`} data-testid={`info-card-${title}`}>
      <div className="mb-2 flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone === 'amber' ? 'bg-amber-300 text-slate-900' : 'bg-teal-700 text-white dark:bg-teal-400 dark:text-slate-950'}`}>{icon}</span>
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="text-sm leading-7 text-muted-foreground">{children}</div>
    </aside>
  );
}

function SectionTitle({ id, eyebrow, children }: { id: string; eyebrow?: string; children: ReactNode }) {
  return (
    <div id={id} className="chapter-heading mb-6 scroll-mt-28">
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">{eyebrow}</p>}
      <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{children}</h2>
    </div>
  );
}

function Cover({ onStart }: { onStart: () => void }) {
  return (
    <section className="pdf-cover page-avoid relative overflow-hidden rounded-[2rem] border border-slate-700 bg-[#202b3e] px-6 py-14 text-white shadow-2xl shadow-slate-900/20 sm:px-12 sm:py-20" id="cover">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border-[36px] border-amber-300/10" />
      <div className="absolute -bottom-28 -right-12 h-72 w-72 rounded-full bg-teal-400/10 blur-2xl" />
      <div className="relative z-10 max-w-3xl">
        <div className="mb-16 flex items-center gap-3 text-sm font-semibold text-amber-200">
          <span className="cover-mark flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-xl font-black text-slate-900">J</span>
          <span>دفتر التعلّم البرمجي</span>
        </div>
        <p className="mb-5 text-sm font-bold tracking-[0.22em] text-teal-300">الطبعة الأولى · للمبتدئين</p>
        <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.12] tracking-tight sm:text-7xl">كتاب Java<br /><span className="text-amber-300">للمبتدئين</span></h1>
        <p className="mt-7 max-w-xl text-lg leading-9 text-slate-300">رحلة هادئة وعملية من أول سطر كود إلى فهم الطريقة التي تفكّر بها البرامج.</p>
        <div className="mt-14 flex flex-wrap items-center gap-4">
          <button type="button" onClick={onStart} className="group inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200" data-testid="button-start-reading">
            ابدأ القراءة <ChevronLeft size={18} className="transition group-hover:-translate-x-1" />
          </button>
          <span className="text-sm text-slate-400">الفصل الأول من ستة فصول</span>
        </div>
      </div>
      <div className="relative z-10 mt-20 flex items-end justify-between border-t border-white/10 pt-5 text-xs text-slate-400">
        <span>إعداد: فريق كتاب</span>
        <span>2024</span>
      </div>
    </section>
  );
}

function Sidebar({ open, onClose, activeId, search, setSearch, onNavigate }: { open: boolean; onClose: () => void; activeId: string; search: string; setSearch: (value: string) => void; onNavigate: (id: string) => void }) {
  const filteredToc = useMemo(() => toc.filter((item) => item.label.includes(search.trim()) || !search.trim()), [search]);
  return (
    <>
      {open && <button type="button" className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden" onClick={onClose} aria-label="إغلاق القائمة" data-testid="button-close-sidebar-overlay" />}
      <aside className={`no-print fixed inset-y-0 right-0 z-50 flex w-[min(88vw,340px)] flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-[100dvh] lg:w-[310px] lg:translate-x-0 ${open ? 'translate-x-0' : 'translate-x-full'}`} aria-label="فهرس الكتاب">
        <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary font-black text-sidebar-primary-foreground">J</span>
            <div>
              <p className="font-bold">كتاب Java</p>
              <p className="text-xs text-sidebar-foreground/60">فهرس القراءة</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden" data-testid="button-close-sidebar"><X size={18} /></button>
        </div>
        <div className="p-4">
          <label className="relative block">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/45" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="ابحث في الفهرس..." className="w-full rounded-xl border border-sidebar-border bg-sidebar-accent py-2.5 pr-9 pl-3 text-sm text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/45 focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/20" data-testid="input-search-chapters" />
          </label>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-5" aria-label="أقسام الكتاب">
          <p className="mb-3 px-3 text-[11px] font-bold tracking-[0.18em] text-sidebar-foreground/45">محتويات الكتاب</p>
          <div className="space-y-1">
            {filteredToc.map((item, index) => (
              <button type="button" key={item.id} onClick={() => onNavigate(item.id)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition ${activeId === item.id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`} data-testid={`button-toc-${item.id}`}>
                <span className={`font-mono text-[10px] ${activeId === item.id ? 'text-sidebar-primary-foreground/70' : 'text-sidebar-foreground/40'}`}>{String(index + 1).padStart(2, '0')}</span>
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}
            {!filteredToc.length && <p className="px-3 py-6 text-sm text-sidebar-foreground/60">لا توجد نتيجة بهذا الاسم.</p>}
          </div>
          <div className="my-6 border-t border-sidebar-border" />
          <p className="mb-3 px-3 text-[11px] font-bold tracking-[0.18em] text-sidebar-foreground/45">الفصول</p>
          <div className="space-y-1">
            {chapters.map((chapter) => (
              <button type="button" key={`${chapter.number}-${chapter.title}`} onClick={() => onNavigate(chapter.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition ${chapter.available ? 'text-sidebar-foreground/80 hover:bg-sidebar-accent' : 'text-sidebar-foreground/40 hover:bg-sidebar-accent/70'}`} data-testid={`button-chapter-${chapter.number}`}>
                <span className="font-mono text-[10px]">{chapter.number}</span>
                <span className="min-w-0"><span className="block truncate text-sm font-semibold">{chapter.title}</span><span className="block truncate text-[11px]">{chapter.available ? 'متاح للقراءة' : 'قريباً'}</span></span>
              </button>
            ))}
          </div>
        </nav>
        <div className="border-t border-sidebar-border px-5 py-4 text-xs leading-6 text-sidebar-foreground/55">اقترب كل يوم سطراً واحداً.<br />المعرفة تتراكم بهدوء.</div>
      </aside>
    </>
  );
}

function Topbar({ dark, onTheme, onDownload, onMenu, progress }: { dark: boolean; onTheme: () => void; onDownload: () => void; onMenu: () => void; progress: number }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-7">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenu} className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted lg:hidden" aria-label="فتح الفهرس" data-testid="button-open-sidebar"><Menu size={19} /></button>
          <div className="hidden items-center gap-2 text-sm font-bold text-muted-foreground sm:flex"><BookOpen size={17} className="text-teal-700 dark:text-teal-300" /> جلسة قراءة مركزة</div>
          <div className="flex items-center gap-2 text-sm font-bold sm:hidden"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">J</span> كتاب Java</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-semibold text-muted-foreground md:inline">تقدمك في الفصل</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:w-32" aria-label={`التقدم ${progress}%`}><div className="progress-line h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} /></div>
          <span className="w-8 text-left font-mono text-[11px] text-muted-foreground">{progress}%</span>
          <button type="button" onClick={onTheme} className="rounded-xl border border-border p-2 text-muted-foreground transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground" aria-label={dark ? 'الوضع الفاتح' : 'الوضع الداكن'} data-testid="button-toggle-theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
          <button type="button" onClick={onDownload} className="hidden items-center gap-2 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-700 sm:inline-flex dark:bg-amber-300 dark:text-slate-900 dark:hover:bg-amber-200" data-testid="button-download-pdf"><Download size={15} /> تحميل الكتاب كـ PDF</button>
        </div>
      </div>
    </header>
  );
}

function Reader() {
  const [dark, setDark] = useState(() => localStorage.getItem('java-book-theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState('chapter-1');
  const [progress, setProgress] = useState(0);
  const readerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('java-book-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const onScroll = () => {
      const element = readerRef.current;
      if (!element) return;
      const top = element.getBoundingClientRect().top + window.scrollY;
      const total = Math.max(element.scrollHeight - window.innerHeight * 0.7, 1);
      const value = Math.min(100, Math.max(0, Math.round(((window.scrollY - top + 100) / total) * 100)));
      setProgress(value);
      const visible = toc.slice().reverse().find((item) => {
        const section = document.getElementById(item.id);
        return section && section.getBoundingClientRect().top < 170;
      });
      if (visible) setActiveId(visible.id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigateTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
    setSidebarOpen(false);
  };

  const downloadPdf = async () => {
    const element = document.getElementById('pdf-document');
    if (!element) return;
    try {
      if (!window.html2pdf) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', 'html2pdf-script');
      await window.html2pdf?.().set({
        margin: [10, 10, 14, 10],
        filename: 'كتاب-Java-للمبتدئين.pdf',
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 1.8, useCORS: true, backgroundColor: '#fbf8f1' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      }).from(element).save();
    } catch {
      window.print();
    }
  };

  return (
    <div dir="rtl" className="book-grain min-h-[100dvh] bg-background text-foreground">
      <Topbar dark={dark} onTheme={() => setDark((value) => !value)} onDownload={downloadPdf} onMenu={() => setSidebarOpen(true)} progress={progress} />
      <div className="mx-auto flex w-full max-w-[1500px] items-start lg:flex-row-reverse">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeId={activeId} search={search} setSearch={setSearch} onNavigate={navigateTo} />
        <main ref={readerRef} className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-14 lg:py-10">
          <div id="pdf-document" className="mx-auto max-w-4xl">
            <div className="mb-4 hidden items-center justify-between border-b border-slate-300 pb-3 text-[10px] font-bold text-slate-500 print:flex">
              <span>كتاب Java للمبتدئين</span>
              <span>دفتر التعلّم البرمجي · قراءة من اليمين إلى اليسار</span>
            </div>
            <Cover onStart={() => navigateTo('chapter-1')} />
            <article className="pdf-section mt-12">
              <div className="mb-12 flex flex-wrap items-end justify-between gap-5 border-b border-border pb-7">
                <div>
                  <p className="mb-3 font-mono text-sm font-bold text-teal-700 dark:text-teal-300">الفصل 01 / 06</p>
                  <h2 id="chapter-1" className="scroll-mt-28 text-4xl font-extrabold tracking-tight sm:text-5xl">بداية الرحلة مع Java</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"><span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-300" /> فصل متاح للقراءة</div>
              </div>

              <section className="prose prose-slate max-w-none text-base leading-8 dark:prose-invert">
                <SectionTitle id="why-java" eyebrow="01 · الفكرة الأولى">لماذا نتعلم Java؟</SectionTitle>
                <p>تخيّل أن لديك وصفة دقيقة يمكن أن يقرأها طاهٍ في أي مطبخ، من دون أن تعيد كتابة الوصفة لكل فرن. هذه هي الفكرة الجميلة خلف Java: تكتب تعليماتك مرة، ثم تجعلها تعمل على أجهزة وأنظمة مختلفة.</p>
                <p>Java لغة برمجة ناضجة، واضحة القواعد، وتُستخدم في تطبيقات الشركات، والخدمات السحابية، وأدوات الأندرويد، والأنظمة التي تحتاج إلى الاعتمادية. للمبتدئ، ميزتها الأهم أنها تجبرك على ترتيب أفكارك؛ وهذا الترتيب يتحول لاحقاً إلى عادة نافعة في أي لغة أخرى.</p>
                <InfoCard icon={<SparklesIcon />} title="الفكرة التي نريد الاحتفاظ بها">لا تحفظ الكلمات كقائمة منفصلة. في كل مثال اسأل نفسك: ما البيانات التي أمتلكها؟ وما الخطوة التي أريد من البرنامج تنفيذها؟</InfoCard>

                <SectionTitle id="write-once" eyebrow="02 · الوعد الكبير">اكتب مرة، شغّل في أي مكان</SectionTitle>
                <p>لا تُرسل Java ملف المصدر مباشرة إلى نظام التشغيل. بدلاً من ذلك، يترجم المترجم الكود إلى صيغة وسيطة اسمها <strong>Bytecode</strong>. ثم تأتي آلة Java الافتراضية لتقرأ هذه الصيغة وتنفذها على النظام الموجود أمامها.</p>
                <div className="my-10 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                  <StackStep number="01" title="كود Java" detail="ملف .java" />
                  <ChevronLeft className="hidden text-primary sm:block" size={22} />
                  <StackStep number="02" title="Bytecode" detail="ملف .class" />
                  <ChevronLeft className="hidden text-primary sm:block" size={22} />
                  <StackStep number="03" title="أي نظام" detail="JVM تنفّذ" />
                </div>
                <p>لهذا السبب يمكنك تطوير البرنامج على جهازك ثم تشغيله على خادم مختلف، ما دامت البيئة المناسبة لـ Java مثبتة عليه. ليست عبارة «في أي مكان» سحراً؛ إنها اتفاق واضح بين الكود وبيئة التشغيل.</p>

                <SectionTitle id="java-stack" eyebrow="03 · الأدوات الثلاث">JDK و JRE و JVM</SectionTitle>
                <p>تظهر هذه الاختصارات في كل درس تقريباً. افصل بينها بهذه الصورة: واحدة تبني، وأخرى تشغّل، وثالثة هي التي تنفّذ فعلياً.</p>
                <div className="my-8 overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
                    <StackPanel icon={<WrenchIcon />} title="JDK" subtitle="Java Development Kit" text="حزمة المطوّر: تحتوي أدوات الكتابة والترجمة والتشغيل. ستحتاج إليها لتبني برامجك." tone="amber" />
                    <StackPanel icon={<Play size={19} />} title="JRE" subtitle="Java Runtime Environment" text="بيئة التشغيل: الملفات اللازمة لتشغيل برامج Java الجاهزة، دون أدوات التطوير." tone="teal" />
                    <StackPanel icon={<Monitor size={19} />} title="JVM" subtitle="Java Virtual Machine" text="الآلة الافتراضية: الجزء الذي يقرأ الـ Bytecode وينفذه على نظامك." tone="slate" />
                  </div>
                </div>
                <InfoCard icon={<Layers3 size={19} />} title="قاعدة سريعة" tone="amber">الـ <b>JDK</b> يحتوي الـ <b>JRE</b>، والـ <b>JRE</b> يحتوي الـ <b>JVM</b>. إذا كنت تكتب كوداً جديداً فثبّت JDK.</InfoCard>

                <SectionTitle id="setup" eyebrow="04 · أول تجهيز">تجهيز بيئة العمل</SectionTitle>
                <p>نحتاج إلى مكان نكتب فيه، ومترجم Java. اتبع الخطوات التالية بهدوء:</p>
                <ol className="space-y-4 pr-6 marker:font-mono marker:font-bold marker:text-teal-700 dark:marker:text-teal-300">
                  <li><b>ثبّت JDK حديثاً:</b> اختر توزيعة موثوقة مثل Eclipse Temurin أو Oracle JDK، ثم تأكد من اختيار النسخة المناسبة لنظامك.</li>
                  <li><b>افتح الطرفية:</b> اكتب الأمر <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" dir="ltr">java --version</code>. ظهور رقم الإصدار يعني أن بيئة التشغيل معروفة.</li>
                  <li><b>اختر محرراً:</b> يمكنك البدء بمحرر بسيط، ثم الانتقال إلى IntelliJ IDEA Community عندما تريد اقتراحات ومساعدة أكثر.</li>
                  <li><b>أنشئ مجلداً للتجارب:</b> سمّه <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" dir="ltr">java-notes</code>، واجعل لكل فكرة ملفاً صغيراً.</li>
                </ol>
                <CodeCard id="version" label="تحقق من التثبيت" code={`java --version\njavac --version`} />

                <SectionTitle id="hello-world" eyebrow="05 · لحظة الوصول">برنامجك الأول: Hello World</SectionTitle>
                <p>سنكتب برنامجاً صغيراً يطبع تحية. لاحظ أن الكلمات البرمجية وأسماء الدوال تبقى بالإنجليزية؛ أما النص الذي سيظهر للمستخدم فيمكن أن يكون عربياً تماماً.</p>
                <CodeCard id="hello-world" label="Main.java" code={helloWorld} />

                <SectionTitle id="line-by-line" eyebrow="06 · فكّك ثم افهم">قراءة البرنامج سطراً سطراً</SectionTitle>
                <div className="space-y-4">
                  <LineExplain code="public class Main {" text="نعرّف فئة عامة اسمها Main. في Java يجب أن يطابق اسم الملف اسم الفئة العامة، لذلك نحفظ الملف باسم Main.java." />
                  <LineExplain code="public static void main(String[] args) {" text="هذه هي نقطة البداية. عندما نشغّل البرنامج تبحث Java عن الدالة main لتعرف من أين تبدأ التنفيذ." />
                  <LineExplain code="System.out.println(...);" text="نطلب من النظام طباعة نص في الطرفية، ثم الانتقال إلى سطر جديد بعده." />
                  <LineExplain code="}" text="القوس يغلق الكتلة التي فتحناها. لكل قوس فتح في Java قوس إغلاق يقابله." />
                </div>
                <InfoCard icon={<CircleHelp size={19} />} title="لماذا كل هذه الكلمات؟">ستبدو جملة <code dir="ltr" className="font-mono text-xs">public static void main</code> طويلة الآن، وهذا طبيعي. احفظ دورها العملي فقط: إنها الباب الذي يبدأ منه البرنامج. سنعود إلى تفاصيلها عندما تصبح الكائنات والدوال مألوفة.</InfoCard>

                <SectionTitle id="notes" eyebrow="07 · ملاحظات على الهامش">ملاحظات للمبتدئ</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Note title="الفاصلة المنقوطة" text="كل تعليمة تقريباً تنتهي بـ ;. نسيانها من أكثر الأخطاء شيوعاً، وسيخبرك المترجم بمكانها." />
                  <Note title="الحروف مهمة" text="Main و main اسمان مختلفان. Java تفرّق بين الحروف الكبيرة والصغيرة." />
                  <Note title="الرسائل صديقة" text="اقرأ رسالة الخطأ من أولها، ثم اذهب إلى رقم السطر. لا تحاول إصلاح كل شيء دفعة واحدة." />
                  <Note title="جرّب تغييراً واحداً" text="بدّل نص التحية ثم شغّل من جديد. التعلم يصبح أسرع عندما ترى أثر قرارك فوراً." />
                </div>
                <CodeCard id="variables" label="تجربة صغيرة بعد التحية" code={variablesExample} />

                <SectionTitle id="exercise" eyebrow="08 · دورك الآن">تمرين قصير</SectionTitle>
                <div className="rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/60 p-6 dark:border-teal-700 dark:bg-teal-400/10">
                  <div className="mb-3 flex items-center gap-2 font-bold text-teal-800 dark:text-teal-200"><Bookmark size={18} /> تحدٍّ من خمس دقائق</div>
                  <p className="m-0 text-sm leading-8">أنشئ فئة اسمها <code dir="ltr" className="rounded bg-white px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">Greeting</code>، واجعل برنامجها يطبع اسمك في سطر، وجملة «أنا أتعلم Java» في سطر آخر. جرّب بعد ذلك تغيير اسم الفئة دون تغيير اسم الملف، ولاحظ رسالة الخطأ.</p>
                  <details className="mt-5 rounded-xl bg-background/75 p-4 text-sm">
                    <summary className="cursor-pointer font-bold text-teal-800 dark:text-teal-200" data-testid="button-show-exercise-hint">أظهر تلميحاً</summary>
                    <p className="mb-0 mt-3 leading-7 text-muted-foreground">ستحتاج إلى استدعاء <code dir="ltr" className="font-mono text-xs">System.out.println</code> مرتين. ابدأ بنسخ الهيكل السابق، ثم غيّر الاسم والنص فقط.</p>
                  </details>
                </div>
              </section>
            </article>

            <section id="planned-chapters" className="pdf-section mt-20 scroll-mt-28 border-t border-border pt-12">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold tracking-[0.18em] text-teal-700 dark:text-teal-300">خريطة الطريق</p>
                  <h2 className="text-3xl font-extrabold">الفصول القادمة</h2>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:block">نكملها معاً خطوة بخطوة</span>
              </div>
              <div className="space-y-3">
                {chapters.slice(1).map((chapter) => (
                    <button type="button" onClick={() => navigateTo('planned-chapters')} key={chapter.number} className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-right transition hover:-translate-x-1 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-900/5" data-testid={`button-planned-${chapter.number}`}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted font-mono text-sm font-bold text-muted-foreground group-hover:bg-teal-700 group-hover:text-white dark:group-hover:bg-teal-300 dark:group-hover:text-slate-900">{chapter.number}</span>
                    <span className="min-w-0 flex-1"><span className="block font-bold">{chapter.title}</span><span className="mt-1 block text-sm text-muted-foreground">{chapter.description}</span></span>
                    <span className="hidden rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground sm:block">قريباً</span>
                    <ChevronLeft size={18} className="text-muted-foreground transition group-hover:-translate-x-1" />
                  </button>
                ))}
              </div>
            </section>

            <footer className="mt-16 border-t border-border py-8 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span>كتاب Java للمبتدئين</span>
                <span>الفصل 01 · صفحة القراءة</span>
                <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 font-bold text-teal-700 hover:text-teal-900 dark:text-teal-300" data-testid="button-back-to-top">العودة إلى الغلاف <ChevronRight size={16} /></button>
              </div>
              <div className="mt-5 hidden justify-between border-t border-slate-300 pt-3 text-[10px] font-bold text-slate-500 print:flex">
                <span>كتاب Java للمبتدئين · الطبعة الأولى</span>
                <span>صفحة 1</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
      <button type="button" onClick={downloadPdf} className="no-print fixed bottom-5 left-5 z-20 flex items-center gap-2 rounded-full bg-slate-800 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-1 sm:hidden dark:bg-amber-300 dark:text-slate-900" data-testid="button-mobile-download-pdf"><Download size={15} /> PDF</button>
    </div>
  );
}

function StackStep({ number, title, detail }: { number: string; title: string; detail: string }) {
  return <div className="rounded-2xl border border-border bg-card p-4 text-center"><span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300">{number}</span><strong className="mt-1 block">{title}</strong><span className="mt-1 block text-xs text-muted-foreground" dir="ltr">{detail}</span></div>;
}

function StackPanel({ icon, title, subtitle, text, tone }: { icon: ReactNode; title: string; subtitle: string; text: string; tone: 'amber' | 'teal' | 'slate' }) {
  const color = tone === 'amber' ? 'bg-amber-300 text-slate-900' : tone === 'teal' ? 'bg-teal-700 text-white dark:bg-teal-300 dark:text-slate-900' : 'bg-slate-700 text-white dark:bg-slate-600';
  return <div className="p-5"><div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>{icon}</div><h3 className="text-xl font-extrabold">{title}</h3><p className="mt-1 font-mono text-[10px] text-muted-foreground" dir="ltr">{subtitle}</p><p className="mt-4 text-sm leading-7 text-muted-foreground">{text}</p></div>;
}

function LineExplain({ code, text }: { code: string; text: string }) {
  return <div className="grid gap-2 rounded-xl border-r-4 border-primary bg-muted/60 p-4 sm:grid-cols-[minmax(180px,0.8fr)_1.7fr] sm:items-center"><code dir="ltr" className="overflow-x-auto font-mono text-xs text-teal-800 dark:text-teal-200">{code}</code><p className="m-0 text-sm leading-7 text-muted-foreground">{text}</p></div>;
}

function Note({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl border border-border bg-card p-5"><h3 className="mb-2 text-sm font-bold">{title}</h3><p className="m-0 text-sm leading-7 text-muted-foreground">{text}</p></div>;
}

function SparklesIcon() {
  return <Sparkles size={18} />;
}

function WrenchIcon() {
  return <Wrench size={18} />;
}

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={Reader} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;