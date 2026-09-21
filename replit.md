# كتاب Java للمبتدئين

تطبيق قراءة عربي تفاعلي لتعلّم Java للمبتدئين وتصدير الكتاب بصيغة PDF.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/java-arabic-ebook/src/App.tsx` — واجهة القارئ، المحتوى العربي، الفهرس والتفاعلات.
- `artifacts/java-arabic-ebook/src/index.css` — ألوان الكتاب، خط Cairo، RTL وتنسيقات الطباعة/PDF.
- `artifacts/java-arabic-ebook/.replit-artifact/artifact.toml` — تعريف التطبيق ومسار المعاينة.

## Architecture decisions

- التطبيق واجهة ثابتة من جهة العميل؛ محتوى الكتاب مضمّن لتعمل القراءة والتصدير دون حساب أو قاعدة بيانات.
- يتم تحميل Prism.js وhtml2pdf.js عند الحاجة للحفاظ على بداية تشغيل سريعة، مع إبراز احتياطي إذا تعذر تحميل Prism.
- اتجاه الصفحة RTL، بينما كل كتلة Java تستخدم LTR مستقلاً حتى لا تنعكس الأقواس أو الكلمات البرمجية.
- إعدادات الوضع الداكن محفوظة محلياً في المتصفح.

## Product

- قراءة الفصل الأول بالعربية مع شرح Java وJDK/JRE/JVM وHello World وتمرين عملي.
- فهرس قابل للبحث والتنقل، شريط تقدم، وضع فاتح/داكن، ونسخ مباشر لكتل Java.
- تصدير PDF منسق بغلاف وفواصل صفحات ورأس وتذييل، مع زر ثابت في الشريط العلوي.

## User preferences

- كل واجهة الكتاب والمحتوى التعليمي باللغة العربية الواضحة.
- تبقى أكواد Java بالإنجليزية وباتجاه LTR.

## Gotchas

- بناء Vite اليدوي يحتاج `PORT` و`BASE_PATH`؛ استخدم سير العمل المُدار لتشغيل المعاينة.
- لا تضع نصاً عربياً داخل أسماء المتغيرات أو الكلمات المحجوزة في أمثلة Java.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
