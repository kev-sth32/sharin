# Guide: Hosting Next.js with MySQL on cPanel

This guide provides step-by-step instructions to deploy your Next.js application (using Drizzle ORM and MySQL) onto a cPanel-managed server.

```mermaid
graph TD
    A[Local Project] -->|Add standalone output| B(next.config.ts)
    A -->|1. npm run build| C[Build Standalone]
    C -->|2. Copy public & static folders| D[Bundle Folder]
    D -->|3. Compress to ZIP| E[deploy.zip]
    E -->|4. Upload & Extract| F[cPanel App Directory]
    F -->|5. Setup Node.js App| G[Phusion Passenger]
    G -->|6. Start App| H[Live Website]
    I[(cPanel MySQL)] -.->|Database Connection| G
```

---

## Phase 1: Prepare the MySQL Database in cPanel

Since your project uses MySQL (via Drizzle ORM), you must create a database and import your local schema/data.

1. **Log in to cPanel** and locate the **Databases** section.
2. Click on **MySQL® Database Wizard**.
3. **Step 1: Create a Database**
   - Enter a database name (e.g., `tripnaari_db`) and click **Next Step**.
4. **Step 2: Create Database Users**
   - Enter a username (e.g., `tripnaari_user`).
   - Generate a strong password and save it securely. Click **Create User**.
5. **Step 3: Add User to the Database**
   - Check **ALL PRIVILEGES**.
   - Click **Make Changes**.
6. **Note your production credentials**:
   - **Database Host**: `localhost` (or `127.0.0.1`)
   - **Database Name**: `yourcpanelusername_tripnaari_db`
   - **Database User**: `yourcpanelusername_tripnaari_user`
   - **Database Password**: `your_saved_password`

---

## Phase 2: Export Local Database Schema & Import to cPanel

The easiest way to replicate your database tables to production is using phpMyAdmin:

1. **Export Local Database**:
   - Open your local phpMyAdmin (typically `http://localhost/phpmyadmin`).
   - Select your local `tripnaari` database.
   - Click the **Export** tab and select the **Quick** export method. Click **Go** to download the `.sql` file.
2. **Import to cPanel**:
   - In cPanel, find and open **phpMyAdmin**.
   - Select your newly created database (e.g., `yourcpanelusername_tripnaari_db`) from the left sidebar.
   - Click the **Import** tab.
   - Choose the `.sql` file you exported and click **Import** (or **Go**).

---

## Phase 3: Configure & Build Next.js locally

Shared hosting environments have limited RAM. Next.js's **Standalone Output** resolves this by compiling only the necessary code and assets into a single folder (`.next/standalone`).

### 1. Update `next.config.ts`
Add the `output: 'standalone'` directive. Open your [next.config.ts](file:///d:/ai%20websites/tripnaari-website/next.config.ts) and edit it as follows:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // <-- ADD THIS LINE
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "://unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "**.vercel.app" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
};

export default nextConfig;
```

### 2. Set Up Environment Variables for Building
> [!IMPORTANT]
> Next.js bakes environment variables prefixed with `NEXT_PUBLIC_` into the client-side bundle *at build time*. 
> Before building, make sure you configure these in your local `.env` file to match your production domain.
>
> Example:
> ```env
> NEXT_PUBLIC_SITE_URL=https://yourdomain.com
> NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_production_public_vapid_key
> ```

### 3. Run Build Command
In your local terminal, run:
```powershell
npm run build
```
This will compile your project and create the `.next/standalone` folder.

---

## Phase 4: Prepare the Deployment Bundle

The standalone server requires static files and public assets to be manually copied into the standalone structure before uploading.

1. **Copy static assets**:
   - Copy the `public` folder from the root of your project and paste it inside `.next/standalone/public`.
   - Copy the `.next/static` folder and paste it inside `.next/standalone/.next/static`.
2. **Create a Production `.env` File**:
   - Create a new `.env` file directly inside the `.next/standalone/` folder.
   - Add the production variables (especially database credentials and security keys):
     ```env
     DATABASE_URL=mysql://yourcpanelusername_tripnaari_user:your_saved_password@127.0.0.1:3306/yourcpanelusername_tripnaari_db
     NEXT_PUBLIC_SITE_URL=https://yourdomain.com
     RESEND_API_KEY=your_resend_api_key
     NOTIFICATION_EMAIL=hello@yourdomain.com
     ADMIN_PASSWORD=your_secure_admin_password
     NEXTAUTH_SECRET=generate_a_random_long_string
     GEMINI_API_KEY=your_gemini_api_key
     VAPID_PRIVATE_KEY=your_private_vapid_key
     VAPID_SUBJECT=mailto:hello@yourdomain.com
     ```
3. **Compress to ZIP**:
   - Go inside `.next/standalone/`.
   - Select all files and folders (including `server.js`, `public`, `.next`, `package.json`, and `.env`).
   - Compress them into a ZIP file named `deploy.zip`.

---

## Phase 5: Upload & Run on cPanel

### 1. Upload the ZIP File
1. In cPanel, open **File Manager**.
2. Navigate to your root directory (e.g., `/home/yourusername/`).
3. **Do not upload directly to `public_html`**. Instead, create a new folder named `tripnaari-app` (e.g., `/home/yourusername/tripnaari-app/`).
4. Upload `deploy.zip` to this new folder and extract it.

### 2. Set Up Node.js Application in cPanel
1. In cPanel search, type and open **Setup Node.js App**.
2. Click **Create Application**.
3. Fill in the fields:
   - **Node.js version**: Choose the version closest to your local environment (Node 18 or 20 is recommended).
   - **Application mode**: `Production`
   - **Application root**: `tripnaari-app` (corresponds to `/home/yourusername/tripnaari-app`)
   - **Application URL**: Select your domain name (e.g., `yourdomain.com`) from the dropdown.
   - **Application startup file**: `server.js`
4. Click **Create** at the top-right. This starts a virtual environment.
5. In the same page under **Environment variables**, you can verify if the `.env` settings are correctly loaded or add them manually.
6. Click **Restart** to apply all configurations.

Your website is now live! Visit `https://yourdomain.com` to verify.

---

## Troubleshooting & Tips

### 🔴 503 Service Unavailable / Phusion Passenger Errors
* **Cause**: Node.js app failed to start or crashed.
* **Fix**: Check the application log. In the cPanel **Setup Node.js App** page, look for the log path under "Application Log file" or check the file `passenger.log` (often located in `/home/yourusername/logs/` or `/home/yourusername/tripnaari-app/stderr.log`).

### 🔴 Database Connection Failed
* **Cause**: Incorrect database URL or the DB server isn't accepting connections.
* **Fix**: Ensure the database URL format matches:
  `mysql://<username>:<password>@127.0.0.1:3306/<database_name>`.
  On some cPanel hosts, you must use `127.0.0.1` instead of `localhost` or vice-versa.

### 🔴 Missing CSS/JS styling or images in production
* **Cause**: You forgot to copy `public` or `.next/static` folder before zipping.
* **Fix**: Re-read **Phase 4** and ensure they are pasted into `.next/standalone/public` and `.next/standalone/.next/static` respectively.
