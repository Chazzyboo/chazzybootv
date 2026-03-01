import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = 3000;


  // API Routes
  app.get("/api/live-feed", async (req, res) => {
    try {
      const youtubeKey = process.env.YOUTUBE_API_KEY;
      const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID;
      const instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN;

      console.log("API Keys check: YT_KEY=", !!youtubeKey, "YT_CID=", !!youtubeChannelId);

      let feedItems: any[] = [];

      // Fetch YouTube Latest
      if (youtubeKey && youtubeChannelId) {
        try {
          const ytRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${youtubeKey}&channelId=${youtubeChannelId}&part=snippet,id&order=date&maxResults=12&type=video`
          );
          const ytData = await ytRes.json();
          if (ytData.items) {
            const ytItems = ytData.items.map((item: any) => ({
              id: item.id.videoId,
              type: 'YOUTUBE',
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.high.url,
              publishedAt: item.snippet.publishedAt,
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            }));
            feedItems = [...feedItems, ...ytItems];
          }
        } catch (e) {
          console.error("YouTube fetch error", e);
        }
      }

      // Fetch Instagram Latest (New Instagram API)
      if (instagramToken) {
        try {
          // The new API uses graph.instagram.com/v21.0/me/media (or similar depending on the exact token type)
          // For User Access Tokens from the new "Instagram API with Instagram Login"
          const igRes = await fetch(
            `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${instagramToken}`
          );
          const igData = await igRes.json();
          if (igData.data) {
            const igItems = igData.data.map((item: any) => ({
              id: item.id,
              type: 'INSTAGRAM',
              title: item.caption || "Instagram Post",
              thumbnail: item.media_url,
              publishedAt: item.timestamp,
              url: item.permalink
            }));
            feedItems = [...feedItems, ...igItems];
          }
        } catch (e) {
          console.error("Instagram fetch error", e);
        }
      }

      // Sort by date descending
      feedItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      // If no keys provided, return mock data for demo purposes
      if (feedItems.length === 0) {
        const mockVideos = [
          { id: 'x6ZOmTS_AxE', title: 'CHAZZY BOO - BOOL\'N (OFFICIAL MUSIC VIDEO)' },
          { id: 'dQw4w9WgXcQ', title: 'CHAZZY BOO - LATE NIGHT STUDIO SESSIONS' },
          { id: 'x6ZOmTS_AxE', title: 'CHAZZY BOO - ONYX VIBES (LIVE SET)' },
          { id: 'dQw4w9WgXcQ', title: 'CHAZZY BOO - SATELLITE DREAM' },
          { id: 'x6ZOmTS_AxE', title: 'CHAZZY BOO - BEHIND THE SCENES: BOOL\'N' },
          { id: 'dQw4w9WgXcQ', title: 'CHAZZY BOO - INDUSTRIAL TEXTURES VOL. 1' },
          { id: 'x6ZOmTS_AxE', title: 'CHAZZY BOO - TRANSMISSION 01 REHEARSAL' },
          { id: 'dQw4w9WgXcQ', title: 'CHAZZY BOO - MIDNIGHT FREQUENCIES' },
          { id: 'x6ZOmTS_AxE', title: 'CHAZZY BOO - UNRELEASED TRACK TEASER' },
          { id: 'dQw4w9WgXcQ', title: 'CHAZZY BOO - FASHION WEEK HIGHLIGHTS' }
        ];

        feedItems = mockVideos.map((video, index) => ({
          id: video.id + index,
          type: 'YOUTUBE',
          title: video.title,
          thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
          publishedAt: new Date(Date.now() - index * 86400000).toISOString(),
          url: `https://www.youtube.com/watch?v=${video.id}`
        }));

        feedItems.push({
          id: 'mock-ig-1',
          type: 'INSTAGRAM',
          title: 'STUDIO_VIBES: MIDNIGHT_ONYX',
          thumbnail: 'https://picsum.photos/seed/ig/1080/1080',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          url: 'https://instagram.com/chazzyboo.jpeg'
        });
        feedItems.push({
          id: 'mock-ig-2',
          type: 'INSTAGRAM',
          title: 'NEW_MERCH: BROADCAST_NOIR_SERIES',
          thumbnail: 'https://picsum.photos/seed/ig2/1080/1080',
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          url: 'https://instagram.com/chazzyboo.jpeg'
        });

        // Sort by date descending
        feedItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      }

      res.json(feedItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feed" });
    }
  });

  app.get("/api/portfolio-feed", async (req, res) => {
    try {
      // Direct Local Folder Implementation 
      const portfolioDir = path.join(process.cwd(), 'public', 'portfolio');
      let portfolioItems: any[] = [];
      const fs = await import('fs/promises');

      try {
        // Create directory if it doesn't exist so user can drag and drop
        await fs.mkdir(portfolioDir, { recursive: true });

        const files = await fs.readdir(portfolioDir);
        const imageFiles = files.filter(file =>
          file.toLowerCase().endsWith('.jpg') ||
          file.toLowerCase().endsWith('.jpeg') ||
          file.toLowerCase().endsWith('.png') ||
          file.toLowerCase().endsWith('.webp')
        );

        // Sort files by modification time descending (newest first)
        const fileStats = await Promise.all(
          imageFiles.map(async (file) => {
            const stat = await fs.stat(path.join(portfolioDir, file));
            return { file, mtime: stat.mtime.getTime() };
          })
        );
        fileStats.sort((a, b) => b.mtime - a.mtime);

        portfolioItems = fileStats.map(({ file }, index) => {
          const isos = [100, 200, 400, 800, 1600, 3200];
          const shutters = ['1/30', '1/60', '1/125', '1/250', '1/500', '1/1000', '1/4000', '1/15'];
          const lenses = ['24mm f/1.4', '35mm f/1.4', '50mm f/1.2', '85mm f/1.8', '50mm f/1.8', '24mm f/2.8'];

          // Clean up the filename for the aesthetic title (removing extensions and hyphens)
          const cleanName = file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').substring(0, 20).toUpperCase();

          return {
            id: index + 1,
            src: `/portfolio/${file}`,
            label: cleanName || `ARCHIVE ${index + 1}`,
            iso: isos[index % isos.length],
            shutter: shutters[index % shutters.length],
            lens: lenses[index % lenses.length],
            url: `/portfolio/${file}` // Just linking to the full image since there's no IG link
          };
        });

      } catch (e) {
        console.error("Local portfolio scan error", e);
      }

      // If no files are placed in the folder yet, fallback to the placeholder assets
      if (portfolioItems.length === 0) {
        portfolioItems = [
          { id: 1, src: '/cbtv-theme/assets/vision_1.png', label: 'BRUTALIST ARCHIVE', iso: 400, shutter: '1/125', lens: '35mm f/1.4' },
          { id: 2, src: '/cbtv-theme/assets/vision_2.png', label: 'SYSTEM GLITCH', iso: 800, shutter: '1/60', lens: '50mm f/1.8' },
          { id: 3, src: '/cbtv-theme/assets/vision_3.png', label: 'STUDIO MIX BOARD', iso: 100, shutter: '1/1000', lens: '85mm f/1.2' },
          { id: 4, src: '/cbtv-theme/assets/vision_4.png', label: 'URBAN NOIR 01', iso: 1600, shutter: '1/30', lens: '24mm f/2.8' },
          { id: 5, src: '/cbtv-theme/assets/vision_5.png', label: 'SERVER NODE 1A', iso: 200, shutter: '1/250', lens: '35mm f/1.4' },
          { id: 6, src: '/cbtv-theme/assets/vision_1.png', label: 'BRUTALIST ARCHIVE 02', iso: 400, shutter: '1/500', lens: '50mm f/1.8' },
          { id: 7, src: '/cbtv-theme/assets/vision_2.png', label: 'SYSTEM GLITCH 02', iso: 3200, shutter: '1/15', lens: '35mm f/1.4' },
          { id: 8, src: '/cbtv-theme/assets/vision_3.png', label: 'STUDIO MIX BOARD 02', iso: 400, shutter: '1/200', lens: '50mm f/1.2' },
          { id: 9, src: '/cbtv-theme/assets/vision_4.png', label: 'URBAN NOIR 02', iso: 100, shutter: '1/4000', lens: '24mm f/1.4' },
          { id: 10, src: '/cbtv-theme/assets/vision_5.png', label: 'SERVER NODE 1B', iso: 800, shutter: '1/125', lens: '85mm f/1.8' }
        ];
      }

      res.json(portfolioItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio feed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
