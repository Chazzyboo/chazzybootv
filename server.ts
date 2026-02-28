import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  // Socket.io Logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    socket.on("send_message", (data) => {
      // Broadcast to all clients including sender
      io.emit("receive_message", {
        id: Math.random().toString(36).substr(2, 9),
        user: data.user || "ANON_SIGNAL",
        text: data.text,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // API Routes
  app.get("/api/live-feed", async (req, res) => {
    try {
      const youtubeKey = process.env.YOUTUBE_API_KEY;
      const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID;
      const instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN;

      let feedItems: any[] = [];

      // Fetch YouTube Latest
      if (youtubeKey && youtubeChannelId) {
        try {
          const ytRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${youtubeKey}&channelId=${youtubeChannelId}&part=snippet,id&order=date&maxResults=5&type=video`
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

      // Fetch Instagram Latest (Basic Display API)
      if (instagramToken) {
        try {
          const igRes = await fetch(
            `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${instagramToken}`
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
        feedItems = [
          {
            id: 'mock1',
            type: 'YOUTUBE',
            title: 'LATEST_MUSIC_VIDEO: SATELLITE_DREAM',
            thumbnail: 'https://picsum.photos/seed/yt/1280/720',
            publishedAt: new Date().toISOString(),
            url: '#'
          },
          {
            id: 'mock2',
            type: 'INSTAGRAM',
            title: 'STUDIO_VIBES: MIDNIGHT_ONYX',
            thumbnail: 'https://picsum.photos/seed/ig/1080/1080',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            url: '#'
          }
        ];
      }

      res.json(feedItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feed" });
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
