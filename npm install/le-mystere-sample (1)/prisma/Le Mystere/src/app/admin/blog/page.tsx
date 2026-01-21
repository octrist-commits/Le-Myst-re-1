"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type PostItem = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  createdAt: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/ +/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminBlogPage() {
  const { data, status } = useSession();
  const router = useRouter();
  const isAdmin = !!data?.user?.isAdmin;

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    coverUrl: "",
    content: "",
    published: true,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!data?.user) router.push("/");
  }, [data?.user, status, router]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/posts");
      const json = res.ok ? await res.json() : [];
      setPosts(json);
      setLoading(false);
    })();
  }, []);

  const disabled = useMemo(() => !form.title || !form.slug || !form.content, [form]);

  async function createPost() {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("Not authorized or error creating post.");
      return;
    }

    const created = await res.json();
    setPosts((prev) => [
      { id: created.id, title: created.title, slug: created.slug, excerpt: created.excerpt, coverUrl: created.coverUrl, createdAt: created.createdAt },
      ...prev,
    ]);
    setForm({ title: "", slug: "", excerpt: "", coverUrl: "", content: "", published: true });
  }

  async function deletePost(slug: string) {
    const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Not authorized or error deleting post.");
      return;
    }
    setPosts((prev) => prev.filter((p) => p.slug !== slug));
  }

  if (status === "loading") return <div className="mx-auto max-w-3xl px-4 py-10 text-white/70">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-white/70 mt-2">You’re signed in, but you’re not an admin.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Manage Blog</h1>
        <p className="text-white/70 mt-2">Create member-only posts (Markdown supported).</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-medium">Create post</h2>

          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <input
              className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
              placeholder="Title"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: f.slug || slugify(title) }));
              }}
            />

            <input
              className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
              placeholder="Slug (unique)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />

            <input
              className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm md:col-span-2"
              placeholder="Cover image URL (optional)"
              value={form.coverUrl}
              onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
            />

            <textarea
              className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm md:col-span-2 min-h-[70px]"
              placeholder="Excerpt (optional)"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />

            <textarea
              className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm md:col-span-2 min-h-[170px]"
              placeholder="Markdown content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 mt-3">
            <label className="text-sm text-white/70 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Published
            </label>

            <button
              className="ml-auto rounded-2xl bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-40"
              disabled={disabled}
              onClick={createPost}
            >
              Create
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-medium">Preview</div>
          <div className="mt-3 prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {form.content || "_Start typing markdown to preview here…_"}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium mb-3">Existing posts</h2>

        {loading ? (
          <div className="text-white/70">Loading…</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {posts.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-white/60 mt-1">/{p.slug}</div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      className="rounded-2xl border border-white/20 px-3 py-2 text-xs hover:bg-white/10"
                      href={`/admin/blog/${p.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      className="rounded-2xl border border-white/20 px-3 py-2 text-xs hover:bg-white/10"
                      onClick={() => deletePost(p.slug)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {p.excerpt && <p className="text-sm text-white/70 mt-3">{p.excerpt}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
