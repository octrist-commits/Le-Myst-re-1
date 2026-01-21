"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  content: string;
  published: boolean;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/ +/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminEditPostPage({ params }: { params: { id: string } }) {
  const { data, status } = useSession();
  const router = useRouter();
  const isAdmin = !!data?.user?.isAdmin;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
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
      const res = await fetch(`/api/posts/id/${params.id}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const p = await res.json();
      setPost(p);
      setForm({
        title: p.title || "",
        slug: p.slug || "",
        excerpt: p.excerpt || "",
        coverUrl: p.coverUrl || "",
        content: p.content || "",
        published: !!p.published,
      });
      setLoading(false);
    })();
  }, [params.id]);

  const disabled = useMemo(() => !form.title || !form.slug || !form.content || saving, [form, saving]);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/posts/id/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);

    if (!res.ok) {
      alert("Error saving post.");
      return;
    }

    alert("Saved!");
  }

  if (status === "loading" || loading) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-white/70">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-white/70 mt-2">You’re signed in, but you’re not an admin.</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Not found</h1>
        <p className="text-white/70 mt-2">This post doesn’t exist.</p>
        <Link className="inline-block mt-4 text-white/80 hover:text-white" href="/admin/blog">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link className="text-sm text-white/70 hover:text-white" href="/admin/blog">
            ← Back to Admin Blog
          </Link>
          <h1 className="text-3xl font-semibold mt-2">Edit Post</h1>
          <p className="text-white/70 mt-2">Update title, slug, cover, content, and publish status.</p>
        </div>

        <button
          className="rounded-2xl bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-40"
          disabled={disabled}
          onClick={save}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-medium">Editor</div>

          <div className="grid gap-3 mt-4">
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
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />

            <input
              className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
              placeholder="Cover image URL (optional)"
              value={form.coverUrl}
              onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
            />

            <textarea
              className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm min-h-[80px]"
              placeholder="Excerpt (optional)"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />

            <textarea
              className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm min-h-[220px]"
              placeholder="Markdown content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />

            <label className="text-sm text-white/70 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Published
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-medium">Live Preview</div>
          <div className="mt-3 prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {form.content || "_Start typing markdown to preview here…_"}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
