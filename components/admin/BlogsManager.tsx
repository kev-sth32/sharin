"use client";

import { useState, useMemo, useTransition } from "react";
import { Search, X, Plus, Edit2, Trash2, Loader2, Upload } from "lucide-react";
import ConfirmButton from "@/components/admin/ConfirmButton";
import ImageUpload from "./ImageUpload";
import { saveBlogPost, deleteBlog } from "@/lib/admin-store";

interface Blog {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  heroImage?: string;
  isPublished?: boolean;
}

interface BlogsManagerProps {
  initialBlogs: Blog[];
}

export default function BlogsManager({ initialBlogs }: BlogsManagerProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Safety");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory("Safety");
    setFormExcerpt("");
    setFormContent("");
    setHeroImage("");
    setIsPublished(true);
    setErrorMsg("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormTitle(blog.title);
    setFormSlug(blog.slug);
    setFormCategory(blog.category || "Safety");
    setFormExcerpt(blog.excerpt || "");
    setFormContent(blog.content || "");
    setHeroImage(blog.heroImage || "");
    setIsPublished(blog.isPublished !== false);
    setErrorMsg("");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBlog(null);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingBlog) {
      setFormSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrorMsg("Please provide a blog title.");
      return;
    }

    const formData = new FormData();
    const id = editingBlog ? editingBlog.id : Date.now();
    formData.set("id", String(id));
    formData.set("title", formTitle);
    formData.set("slug", formSlug || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    formData.set("category", formCategory);
    formData.set("excerpt", formExcerpt);
    formData.set("content", formContent);
    formData.set("heroImage", heroImage);
    formData.set("isPublished", String(isPublished));

    startTransition(async () => {
      try {
        const res = await saveBlogPost(formData);
        if (res?.success) {
          const updatedBlog: Blog = {
            id,
            title: formTitle,
            slug: formSlug || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            category: formCategory,
            excerpt: formExcerpt,
            content: formContent,
            heroImage,
            isPublished
          };

          if (editingBlog) {
            setBlogs(prev => prev.map(b => b.id === editingBlog.id || b.slug === editingBlog.slug ? updatedBlog : b));
          } else {
            setBlogs(prev => [...prev, updatedBlog]);
          }
          setIsFormOpen(false);
        }
      } catch (err: any) {
        if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        console.error("Save blog failed:", err);
        setErrorMsg("Failed to save blog post. Please try again.");
      }
    });
  };

  const handleDelete = async (slug: string) => {
    const res = await deleteBlog(slug);
    if (res?.success) {
      setBlogs(prev => prev.filter(b => b.slug !== slug));
    }
  };

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const cats = new Set(blogs.map(b => b.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [blogs]);

  // Filtered Blogs logic
  const filteredBlogs = useMemo(() => {
    let result = [...blogs];

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        b => b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q) || b.content?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(b => b.category === categoryFilter);
    }

    return result;
  }, [blogs, searchTerm, categoryFilter]);

  return (
    <div className="space-y-6 text-left">
      {/* Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="font-display font-bold text-2xl text-[#13253D]">Blogs & Resources — Direct CMS Control</h1>
        <button
          onClick={handleOpenAdd}
          className="rounded-full bg-[#FF4A7D] hover:bg-[#E63E6E] text-white px-5 py-2.5 text-sm font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Blog Post</span>
        </button>
      </div>

      {/* Editor Modal / Form Drawer */}
      {isFormOpen && (
        <div className="rounded-2xl border border-[#FF4A7D]/20 bg-[#FFF8F0] p-5 md:p-6 space-y-4 animate-in fade-in duration-200 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-[#F1D9D0]">
            <h3 className="font-bold text-sm text-[#13253D]">
              {editingBlog ? `Edit Blog Post: ${editingBlog.title}` : "Create New Blog Post"}
            </h3>
            <button onClick={handleCloseForm} className="text-[#3D4A5E]/40 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Is Kashmir Safe for Solo Women in 2026?"
                  value={formTitle}
                  onChange={e => handleTitleChange(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-xs bg-white outline-none focus:border-[#FF4A7D]/40 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Slug (URL segment)</label>
                <input
                  type="text"
                  placeholder="e.g. kashmir-safety-review"
                  value={formSlug}
                  onChange={e => setFormSlug(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-xs bg-white outline-none focus:border-[#FF4A7D]/40"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Safety, Guides, Food, etc."
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-xs bg-white outline-none focus:border-[#FF4A7D]/40"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Excerpt (Short intro/preview)</label>
                <input
                  type="text"
                  placeholder="A quick summary showing in lists..."
                  value={formExcerpt}
                  onChange={e => setFormExcerpt(e.target.value)}
                  className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-xs bg-white outline-none focus:border-[#FF4A7D]/40"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Hero Image URL</label>
                <input
                  type="text"
                  placeholder="https://... or select upload option below"
                  value={heroImage}
                  onChange={e => setHeroImage(e.target.value)}
                  className="w-full rounded-xl border border-[#F1D9D0] px-3 py-2 text-xs bg-white outline-none focus:border-[#FF4A7D]/40"
                />
                {heroImage && (
                  <img src={heroImage} alt="hero preview" className="mt-2 w-full h-32 object-cover rounded-xl border" />
                )}
                <div className="mt-2">
                  <ImageUpload label="Upload Blog Hero Photo" onUploaded={setHeroImage} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-[#13253D]/50 uppercase block mb-1">Full Article Content (Markdown supported)</label>
                <textarea
                  placeholder="Write the full body content here..."
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  className="w-full rounded-xl border border-[#F1D9D0] p-3 text-xs bg-white outline-none focus:border-[#FF4A7D]/40 font-mono"
                  rows={10}
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#13253D]">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={e => setIsPublished(e.target.checked)}
                    className="rounded border-[#F1D9D0] text-[#FF4A7D] focus:ring-[#FF4A7D]"
                  />
                  Publish Article?
                </label>
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-[#F1D9D0]">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-5 py-2 text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingBlog ? "Save Changes" : "Create Post"}</span>
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-full bg-white border border-[#F1D9D0] text-[#13253D] px-5 py-2 text-xs font-bold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#F1D9D0] rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#3D4A5E]/40" />
            <input
              type="text"
              placeholder="Search blogs by title or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#F1D9D0] bg-[#FFF8F0]/30 text-sm outline-none focus:border-[#FF4A7D]/40 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-3 text-[#3D4A5E]/40 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-[#FFF8F0] border border-[#F1D9D0] rounded-full px-3 py-1.5 w-full md:w-auto">
            <span className="text-[10px] font-bold text-[#13253D]/50 uppercase shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold outline-none text-[#13253D] w-full flex-1 min-w-0 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics info */}
      <div className="px-1 text-xs text-[#3D4A5E]">
        Showing <span className="font-semibold text-[#13253D]">{filteredBlogs.length}</span> of <span className="font-semibold text-[#13253D]">{blogs.length}</span> Articles
      </div>

      {/* Blogs Cards List */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredBlogs.map((b: Blog) => (
          <div key={b.slug} className="rounded-2xl bg-white border border-[#F1D9D0] p-4 shadow-sm flex flex-col justify-between text-left space-y-3">
            <div className="space-y-2">
              {b.heroImage && (
                <img src={b.heroImage} alt={b.title} className="w-full h-32 object-cover rounded-xl border mb-2" />
              )}
              <div className="flex justify-between items-center">
                <span className="rounded-full bg-[#FFF0F4] border border-[#FF4A7D]/20 px-2.5 py-0.5 text-[8px] uppercase font-bold text-[#FF4A7D]">
                  {b.category}
                </span>
                <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded-full ${b.isPublished !== false ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                  {b.isPublished !== false ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="font-bold text-sm text-[#13253D] line-clamp-1">{b.title}</div>
              <p className="text-xs text-[#3D4A5E] line-clamp-2 leading-relaxed">{b.excerpt}</p>
            </div>
            
            <div className="flex gap-2 pt-2.5 border-t border-[#F1D9D0]/40">
              <button
                onClick={() => handleOpenEdit(b)}
                className="rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white px-3.5 py-1 text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <ConfirmButton
                action={async () => {
                  await handleDelete(b.slug);
                }}
                confirmText={`Are you sure you want to delete this blog post?`}
                className="rounded-full bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 px-3.5 py-1 text-[10px] font-bold transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </ConfirmButton>
            </div>
          </div>
        ))}
        {filteredBlogs.length === 0 && (
          <div className="col-span-full p-12 text-center text-sm text-[#3D4A5E] bg-white border border-[#F1D9D0] rounded-2xl shadow-sm">
            <span className="text-3xl block mb-2">🔍</span>
            No Blog articles found matching your active filters.
          </div>
        )}
      </div>
    </div>
  );
}
