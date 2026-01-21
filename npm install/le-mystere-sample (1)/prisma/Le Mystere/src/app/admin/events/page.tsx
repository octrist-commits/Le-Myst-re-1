"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type EventItem = {
  id: string;
  title: string;
  startAt: string;
  endAt?: string | null;
  location?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

export default function AdminEventsPage() {
  const { data, status } = useSession();
  const router = useRouter();
  const isAdmin = !!data?.user?.isAdmin;

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    startAt: "",
    endAt: "",
    location: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!data?.user) router.push("/");
  }, [data?.user, status, router]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/events");
      const json = await res.json();
      setEvents(json);
      setLoading(false);
    })();
  }, []);

  const disabled = useMemo(() => !form.title || !form.startAt, [form.title, form.startAt]);

  async function createEvent() {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        endAt: form.endAt || null,
      }),
    });

    if (!res.ok) {
      alert("Not authorized or error creating event.");
      return;
    }

    const created = await res.json();
    setEvents((prev) => [...prev, created].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt)));
    setForm({ title: "", startAt: "", endAt: "", location: "", description: "", imageUrl: "" });
  }

  async function deleteEvent(id: string) {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Not authorized or error deleting event.");
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  if (status === "loading") {
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Manage Events</h1>
        <p className="text-white/70 mt-2">Create and remove events.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-medium">Create event</h2>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <input
            className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => setForm({ ...form, startAt: e.target.value })}
          />

          <input
            className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
            type="datetime-local"
            value={form.endAt}
            onChange={(e) => setForm({ ...form, endAt: e.target.value })}
          />

          <input
            className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <input
            className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm md:col-span-2"
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />

          <textarea
            className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-sm md:col-span-2 min-h-[90px]"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <button
          className="mt-4 rounded-2xl bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-40"
          disabled={disabled}
          onClick={createEvent}
        >
          Create
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium mb-3">Existing events</h2>

        {loading ? (
          <div className="text-white/70">Loading…</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {events.map((e) => (
              <div key={e.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-white/60 mt-1">{new Date(e.startAt).toLocaleString()}</div>
                    {e.location && <div className="text-sm text-white/70 mt-2">📍 {e.location}</div>}
                  </div>

                  <button
                    className="rounded-2xl border border-white/20 px-3 py-2 text-xs hover:bg-white/10"
                    onClick={() => deleteEvent(e.id)}
                  >
                    Delete
                  </button>
                </div>

                {e.description && <p className="text-sm text-white/70 mt-3">{e.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
