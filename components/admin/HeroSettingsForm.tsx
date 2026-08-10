"use client";
import { useState, useTransition } from "react";
import ImageUpload from "./ImageUpload";
import { Loader2, Trash2 } from "lucide-react";

const isVideo = (url: string) => /\.(mp4|webm|ogg)($|\?)/i.test(url);

interface HeroSettingsFormProps {
  settings: {
    heroBadge?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    urgencyText?: string;
    heroImages?: string[];
    heroTitleSize?: string;
    heroSubtitleSize?: string;
    pill1Badge?: string;
    pill1Title?: string;
    pill1Desc?: string;
    pill2Badge?: string;
    pill2Title?: string;
    pill2Desc?: string;
  };
  action: (fd: FormData) => Promise<any>;
}

export default function HeroSettingsForm({ settings, action }: HeroSettingsFormProps) {
  const [images, setImages] = useState<string[]>(settings.heroImages || []);
  const [isPending, startTransition] = useTransition();

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddImage = (url: string) => {
    setImages((prev) => [...prev, url]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please upload or add at least one image for the hero slideshow.");
      return;
    }
    if (!window.confirm("Are you sure you want to update the Hero Banner and Urgency settings?")) return;
    
    const formData = new FormData(e.currentTarget);
    formData.set("heroImages", JSON.stringify(images));

    startTransition(async () => {
      try {
        await action(formData);
        alert("Hero Banner and Urgency settings updated successfully!");
      } catch (err) {
        console.error("Save settings failed:", err);
        alert("An error occurred while saving. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[20px] bg-white border border-[#F1D9D0] p-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-[#13253D] border-b border-[#F1D9D0] pb-2">Edit Hero Banner & Urgency Strip</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#13253D]">Hero Badge Text</label>
            <input
              type="text"
              name="heroBadge"
              defaultValue={settings.heroBadge}
              className="w-full mt-1.5 rounded-xl border px-3 py-2 text-sm text-[#13253D] font-medium"
              placeholder="e.g. Women-Only Travel Experience"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#13253D]">Urgency Banner Text (Supports {`{count}`})</label>
            <input
              type="text"
              name="urgencyText"
              defaultValue={settings.urgencyText}
              className="w-full mt-1.5 rounded-xl border px-3 py-2 text-sm text-[#13253D] font-medium font-semibold text-[#FF4A7D]"
              placeholder="e.g. ⚡ {count} Naaris enquired last hour"
            />
            <p className="text-[10px] text-[#3D4A5E]/70 mt-1">Use <code>{`{count}`}</code> where you want the dynamic, randomized enquiry counter to appear.</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[#13253D]">Hero Title (Supports HTML styling like &lt;br /&gt; or &lt;span&gt;)</label>
          <textarea
            name="heroTitle"
            defaultValue={settings.heroTitle}
            rows={3}
            className="w-full mt-1.5 rounded-xl border px-3 py-2 text-sm text-[#13253D] font-bold"
            placeholder="e.g. Solo on Paper.<br />\n<span class=&quot;font-serif italic font-normal text-[#FF4A7D]&quot;>Together in Spirit.</span>"
          />
          <p className="text-[10px] text-[#3D4A5E]/70 mt-1">
            Example formatting for italic pink suffix: <code>&lt;span class="font-serif italic font-normal text-[#FF4A7D]"&gt;Together in Spirit.&lt;/span&gt;</code>
          </p>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[#13253D]">Hero Subtitle (Description)</label>
          <textarea
            name="heroSubtitle"
            defaultValue={settings.heroSubtitle}
            rows={3}
            className="w-full mt-1.5 rounded-xl border px-3 py-2 text-sm text-[#3D4A5E] font-medium"
            placeholder="Describe the travel experience..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#13253D]">Hero Title Font Size</label>
            <select
              name="heroTitleSize"
              defaultValue={settings.heroTitleSize || "Large"}
              className="w-full mt-1.5 rounded-xl border px-3 py-2 text-sm text-[#13253D] bg-white font-medium"
            >
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Extra Large">Extra Large</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#13253D]">Hero Subtitle Font Size</label>
            <select
              name="heroSubtitleSize"
              defaultValue={settings.heroSubtitleSize || "Medium"}
              className="w-full mt-1.5 rounded-xl border px-3 py-2 text-sm text-[#13253D] bg-white font-medium"
            >
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>
        </div>

        <div className="border-t border-[#F1D9D0] pt-4 space-y-4">
          <h4 className="text-xs font-bold uppercase text-[#FF4A7D]">Popular Recommendation Pills (Hero Card)</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pill 1 */}
            <div className="rounded-xl border border-[#F1D9D0] p-4 bg-[#FFF8F0]/30 space-y-3">
              <span className="text-xs font-extrabold text-[#13253D] uppercase block border-b pb-1">Left Recommendation Pill</span>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#13253D]/70">Pill Badge/Tag (e.g. Most Loved)</label>
                <input
                  type="text"
                  name="pill1Badge"
                  defaultValue={settings.pill1Badge || "Most Loved"}
                  className="w-full mt-1 rounded-lg border px-3 py-1.5 text-xs text-[#13253D] font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#13253D]/70">Pill Title (e.g. Kashmir Tulip • 5D)</label>
                <input
                  type="text"
                  name="pill1Title"
                  defaultValue={settings.pill1Title || "Kashmir Tulip • 5D"}
                  className="w-full mt-1 rounded-lg border px-3 py-1.5 text-xs text-[#13253D] font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#13253D]/70">Pill Details (e.g. ₹21,999 • 8 seats)</label>
                <input
                  type="text"
                  name="pill1Desc"
                  defaultValue={settings.pill1Desc || "₹21,999 • 8 seats"}
                  className="w-full mt-1 rounded-lg border px-3 py-1.5 text-xs text-[#3D4A5E] font-medium bg-white"
                />
              </div>
            </div>

            {/* Pill 2 */}
            <div className="rounded-xl border border-[#F1D9D0] p-4 bg-[#FFF8F0]/30 space-y-3">
              <span className="text-xs font-extrabold text-[#13253D] uppercase block border-b pb-1">Right Recommendation Pill</span>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#13253D]/70">Pill Badge/Tag (e.g. Weekend)</label>
                <input
                  type="text"
                  name="pill2Badge"
                  defaultValue={settings.pill2Badge || "Weekend"}
                  className="w-full mt-1 rounded-lg border px-3 py-1.5 text-xs text-[#13253D] font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#13253D]/70">Pill Title (e.g. Tirthan 3D • Solo)</label>
                <input
                  type="text"
                  name="pill2Title"
                  defaultValue={settings.pill2Title || "Tirthan 3D • Solo"}
                  className="w-full mt-1 rounded-lg border px-3 py-1.5 text-xs text-[#13253D] font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#13253D]/70">Pill Details (e.g. ₹9,999 • Fri)</label>
                <input
                  type="text"
                  name="pill2Desc"
                  defaultValue={settings.pill2Desc || "₹9,999 • Fri"}
                  className="w-full mt-1 rounded-lg border px-3 py-1.5 text-xs text-[#3D4A5E] font-medium bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F1D9D0] pt-4">
          <label className="text-xs font-bold uppercase text-[#13253D] block mb-2">Hero Slideshow Photos (Trips & Ladies)</label>
          
          {/* Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {images.map((imgUrl, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden border border-[#F1D9D0] group h-32 bg-[#FFF8F0]">
                {isVideo(imgUrl) ? (
                  <video
                    src={imgUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={imgUrl}
                    alt={`Slide preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow transition-all scale-90 md:scale-100 group-hover:block"
                  title="Remove Slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] py-1 text-center font-bold">
                  Slide {idx + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Add Image Upload Widget */}
          <div className="max-w-md">
            <ImageUpload label="Add slide photo to Hero Banner" onUploaded={handleAddImage} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full rounded-full bg-[#13253D] hover:bg-[#FF4A7D] text-white py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
          isPending ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating Hero Settings...</span>
          </>
        ) : (
          "Save Hero Banner Settings →"
        )}
      </button>
    </form>
  );
}
