import { getAdminData, createBlogPost } from "@/lib/admin-store";
import fs from "fs";
import path from "path";
import ConfirmForm from "@/components/admin/ConfirmForm";

function getCustomBlogs() {
  try {
    const fp = path.join(process.cwd(), ".data", "blogs_custom.json");
    if (!fs.existsSync(fp)) return [];
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch { return []; }
}

export default async function BlogsAdmin() {
  const { blogs } = await getAdminData();
  const custom = getCustomBlogs();
  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Blogs / Resources — Create & Publish</h1>
      <div className="mt-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 grid gap-3">
          {[...blogs, ...custom].map((b: any)=>(
            <div key={b.slug} className="rounded-2xl bg-white border border-[#F1D9D0] p-5">
              <div className="text-[11px] uppercase font-bold text-[#FF4A7D]">{b.category}</div>
              <div className="font-semibold mt-1">{b.title}</div>
              <div className="text-xs text-[#3D4A5E] mt-1">{b.excerpt}</div>
              <div className="text-[10px] mt-2">Published: {b.isPublished!==false?'Yes':'Draft'} • SEO ready</div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-5">
          <ConfirmForm
            action={async(formData: FormData)=>{ "use server"; await createBlogPost({ title: formData.get("title") as string, slug: formData.get("slug") as string, excerpt: formData.get("excerpt") as string, content: formData.get("content") as string, category: formData.get("category") as string }); }}
            confirmText="Are you sure you want to create this blog post?"
            buttonText="Create →"
            buttonClassName="w-full rounded-full bg-[#13253D] text-white py-2 text-sm font-bold"
            className="rounded-2xl bg-white border border-[#F1D9D0] p-6 sticky top-6 space-y-3"
          >
            <h3 className="font-semibold">New Blog Post</h3>
            <input name="title" required placeholder="Title" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <input name="slug" required placeholder="slug e.g. my-first-solo" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <input name="category" placeholder="Category Safety/Tips" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <input name="excerpt" placeholder="Excerpt" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <textarea name="content" placeholder="Full content" rows={6} className="w-full rounded-xl border px-3 py-2 text-sm" />
          </ConfirmForm>
        </div>
      </div>
    </div>
  );
}
