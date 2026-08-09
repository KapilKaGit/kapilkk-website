export const stats = { images: 128, notes: 42, projects: 9, tools: 4, documents: 31 };
export const tags = ['design','typescript','photography','nextjs','research','personal','automation','reference','ui','archive'];
export const images = Array.from({length:9},(_,i)=>({id:`img-${i+1}`,title:['Desk setup','Mountain light','Notebook scan','Old library','Prototype board','City texture','Warm gradient','Travel receipt','Reference wall'][i],tag:tags[i%tags.length],date:`2026-0${(i%6)+1}-1${i%9}`,size:['1.2 MB','860 KB','2.4 MB'][i%3],resolution:['2400×1600','1920×1280','3000×2100'][i%3],format:['JPG','PNG','WEBP'][i%3],src:`https://picsum.photos/seed/kapil-${i+1}/700/${[860,520,680,780,560,720,600,840,640][i]}`}));
export const tools = ['Image Resize Tool','Image Format Converter','Image Compressor','Metadata Viewer'];
export const projects = [
{title:'Archive Indexer',desc:'A fast personal catalog for files, notes, and image references.',tech:['Next.js','TypeScript','Search'],image:'https://picsum.photos/seed/archive/900/520'},
{title:'Utility Bench',desc:'Browser-first image and document utilities for everyday workflows.',tech:['Canvas','Tailwind','PWA'],image:'https://picsum.photos/seed/bench/900/520'},
{title:'Knowledge Map',desc:'Linked notes and resources arranged around topics and tags.',tech:['Markdown','Graph','UX'],image:'https://picsum.photos/seed/map/900/520'}];
export const notes = [
{title:'Designing small tools',cat:'Engineering',tags:['tools','ui'],excerpt:'Notes on keeping utilities focused, fast, and understandable.'},
{title:'Personal archive taxonomy',cat:'Archive',tags:['tags','research'],excerpt:'A simple category system for images, documents, and project records.'},
{title:'Markdown reading mode',cat:'Writing',tags:['notes','markdown'],excerpt:'Readable knowledge-base pages with calm spacing and clear hierarchy.'}];
export const documents = ['Resume.pdf','Project Brief.pdf','Research Notes.pdf','Invoice Template.docx','Reading List.pdf'];
export const searchGroups = { Images: images.slice(0,3).map(x=>x.title), Tools: tools, Notes: notes.map(n=>n.title), Projects: projects.map(p=>p.title), Documents: documents };
