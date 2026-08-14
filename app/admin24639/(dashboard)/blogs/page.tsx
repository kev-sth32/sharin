import { getAdminData } from "@/lib/admin-store";
import BlogsManager from "@/components/admin/BlogsManager";

export default async function BlogsAdmin() {
  const { blogs } = await getAdminData();

  return (
    <div>
      <BlogsManager initialBlogs={blogs} />
    </div>
  );
}
