# DocXume — Smart Resume, CV & Biodata Builder

DocXume is a client-side document builder (Next.js 15 + React 19 + TypeScript) that lets users create professional resumes, CVs, cover letters, and traditional biodatas entirely in the browser, then export polished PDFs. No data leaves the user's device for document creation.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
- **UI:** React 19, TypeScript, CSS Modules
- **State:** [Zustand](https://github.com/pmndrs/zustand)
- **PDF generation:** `html2pdf.js` (single-page export), `jspdf` + `html2canvas` (multi-page rasterization), `pdf-lib` (PDF tooling: merge/split)
- **Icons:** `lucide-react`

## Getting Started

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:3000
npm run build     # production build (also type-checks the project)
npm start         # serve the production build
npm run lint      # run ESLint
```

## Project Architecture

DocXume has **two parallel but complementary template systems** plus a standalone PDF-tools module.

### 1. Canvas / Registry System (design-led)

Templates are authored as `CanvasDocument` objects and stored under [`src/templates/<category>/`](src/templates). A central [`registry.ts`](src/templates/registry.ts) merges all category maps into a single `templateRegistry` keyed by template ID, with a runtime check that each file's `doc.id` matches its registry key.

- **Categories:** `resume`, `cv`, `biodata`, `cover-letter`
- **Editor:** [`src/app/editor/[category]/[templateId]/`](src/app/editor) — full visual canvas editor (drag, layers, color pickers, frames, QR codes, etc.)
- **Marketplace:** [`src/app/templates/`](src/app/templates) — browsable gallery that deep-links into the editor.
- **Renderer:** [`src/components/shared/CanvasDocumentRenderer.tsx`](src/components/shared/CanvasDocumentRenderer.tsx) renders `CanvasDocument` data to screen and PDF.

Template files are written on disk (by the admin API) using `JSON.stringify`, so they are plain serializable objects — never `Function()`/`eval`-parsed.

### 2. Form-Based Generators (content-led, quick fill)

Two quick builders let users fill structured forms and export instantly without touching the canvas:

- **Resume Generator:** [`src/app/generator/page.tsx`](src/app/generator/page.tsx) + [`src/components/generator/`](src/components/generator). Uses `useGeneratorStore` and `ResumePreview*` components. Export via `generatePDF` ([`src/utils/pdfGenerator.ts`](src/utils/pdfGenerator.ts)).
- **Biodata Generator:** [`src/app/biodata-generator/page.tsx`](src/app/biodata-generator/page.tsx) + [`src/components/biodata/`](src/components/biodata). Uses `useBiodataGeneratorStore` and `BiodataForm`/`BiodataPreview`. Export via `downloadBiodataPdf` ([`src/utils/biodataPdf.ts`](src/utils/biodataPdf.ts)).

### 3. Admin Template Builder

- **Dashboard:** [`src/app/admin/page.tsx`](src/app/admin/page.tsx) — lists, filters, and deletes templates.
- **Builder:** [`src/app/admin/templates/page.tsx`](src/app/admin/templates/page.tsx) — the in-app canvas where new templates are designed and published.
- **API:** [`src/app/api/admin/templates/route.ts`](src/app/api/admin/templates/route.ts) — `GET` (read template), `POST` (publish/create), `DELETE` (remove). Uses the Node.js runtime (`fs`) and validates all IDs/filenames against strict allow-lists to prevent path traversal.

#### Publish overwrite flow
When you publish a template whose `templateId` is already owned by a **different** `.ts` file, the API responds `409` with an `existingFile` field. The admin UI catches this and shows a `window.confirm()` dialog ("This template already exists under a different name… Do you want to overwrite it?"). Confirming re-sends the request with `overwriteConfirmation: true`, which lets the server safely replace the old file. Cancelling preserves the existing template.

### 4. PDF Tools

- **Merge / Split:** [`src/app/pdf-tools/`](src/app/pdf-tools) — pure client-side file manipulation using `pdf-lib`.
- **Document export:**
  - Generator & canvas editor → `html2pdf.js` (single page) or `jspdf` + `html2canvas` (multi-page, via [`src/canvas/pdfExport.ts`](src/canvas/pdfExport.ts) → [`src/utils/pdfGenerator.ts`](src/utils/pdfGenerator.ts)).
  - Biodata generator → `jspdf` + `html2canvas` ([`src/utils/biodataPdf.ts`](src/utils/biodataPdf.ts)).

## PDF Library Usage (audit)

| Flow | Library | File |
|------|---------|------|
| Resume generator export | `html2pdf.js` (+ `jspdf`/`html2canvas` for multi-page) | [`src/utils/pdfGenerator.ts`](src/utils/pdfGenerator.ts) |
| Canvas editor export | `html2pdf.js` / `jspdf` + `html2canvas` | [`src/canvas/pdfExport.ts`](src/canvas/pdfExport.ts) |
| Biodata generator export | `jspdf` + `html2canvas` | [`src/utils/biodataPdf.ts`](src/utils/biodataPdf.ts) |
| PDF merge / split tools | `pdf-lib` | [`src/app/pdf-tools/merge`](src/app/pdf-tools/merge), [`src/app/pdf-tools/split`](src/app/pdf-tools/split) |

All four libraries are actively used — there is **no dead redundancy**. `html2pdf.js` is used in the `@types/html2pdf.d.ts` shim and the generator/editor paths; `jspdf` + `html2canvas` back the multi-page and biodata rasterization; `pdf-lib` powers the merge/split utilities.

## Deployment Notes

- The admin API route declares `export const runtime = 'nodejs'` because it uses `fs`/`path` for filesystem writes. **Do not** deploy this to an Edge-only runtime, or template publishing will fail.
- Template files are written into `src/templates/<category>/` at publish time. On serverless platforms (e.g. Vercel), filesystem writes are ephemeral — published templates persist only for the life of the instance. For durable templates, commit them to the repo or store them in object storage.
- `npm run build` both compiles and type-checks; a passing build is required before deploy.

## Project Structure

```
src/
  app/
    admin/                 # admin dashboard + template builder
    api/admin/templates/   # admin REST API (GET/POST/DELETE)
    biodata-generator/     # form-based biodata builder
    editor/[category]/[templateId]/  # canvas visual editor
    generator/             # form-based resume generator
    pdf-tools/             # merge & split utilities
    privacy-policy/        # legal page
    terms-of-service/      # legal page
    templates/             # marketplace gallery
  canvas/                  # canvas store, types, PDF export glue
  components/
    biodata/ generator/ shared/ admin/
  hooks/                   # zustand stores
  templates/               # template definitions + registry
  utils/                   # pdfGenerator.ts, biodataPdf.ts
```

## License

See repository settings.
