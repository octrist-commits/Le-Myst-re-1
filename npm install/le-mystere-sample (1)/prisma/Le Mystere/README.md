# Le Mystere sample (Design 2 + Google Login + Events + Member Blog)

## 1) Install
```bash
npm install
```

## 2) Create `.env.local`
Copy and fill this:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_a_long_random_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

DATABASE_URL="file:./dev.db"

# Admin access (your Google email)
ADMIN_EMAIL=jeanrivaldo017@gmail.com
```

Generate a secret quickly:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3) Database
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

## 4) Run
```bash
npm run dev
```

Open:
- http://localhost:3000/
- /events
- /blog (requires Google sign-in)
- /admin/events (admin only)
- /admin/blog (admin only)
