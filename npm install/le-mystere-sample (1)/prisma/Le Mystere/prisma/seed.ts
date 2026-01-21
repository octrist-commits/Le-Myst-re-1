import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.event.createMany({
    data: [
      {
        title: "Le Mystere — Winter Social",
        startAt: new Date("2026-01-10T19:00:00"),
        endAt: new Date("2026-01-10T22:00:00"),
        location: "Brooklyn, NY",
        description: "Music • Networking • Refreshments. Dress code: Purple glow.",
        imageUrl: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1200&q=60",
      },
      {
        title: "Open Mic Night",
        startAt: new Date("2026-01-24T20:00:00"),
        endAt: new Date("2026-01-24T23:00:00"),
        location: "Queens, NY",
        description: "Bring your talent. Family-friendly early set.",
        imageUrl: "https://images.unsplash.com/photo-1521336575822-6da63fb45455?auto=format&fit=crop&w=1200&q=60",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.post.upsert({
    where: { slug: "welcome-to-le-mystere" },
    update: {},
    create: {
      title: "Welcome to Le Mystere",
      slug: "welcome-to-le-mystere",
      excerpt: "Member-only updates, events, and announcements.",
      content: `# Welcome to Le Mystere

This is a **member-only** post.

## What’s inside
- Events calendar
- Private blog updates
- Booking (next)

\`\`\`js
console.log("Le Mystere")
\`\`\`
`,
      coverUrl: "https://images.unsplash.com/photo-1520975682031-a5ba29d1b4c7?auto=format&fit=crop&w=1200&q=60",
      published: true,
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
