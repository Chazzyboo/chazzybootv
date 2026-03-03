export default async function handler(req, res) {
    try {
        // Support both prefixed and unprefixed key names
        const youtubeKey = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
        const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID || process.env.VITE_YOUTUBE_CHANNEL_ID || "UC7lR4s4Nco2WKJGfcP7kOmg";
        const instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN;

        let feedItems = [];

        // Fetch YouTube Latest
        if (youtubeKey && youtubeChannelId) {
            try {
                const ytRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?key=${youtubeKey}&channelId=${youtubeChannelId}&part=snippet,id&order=date&maxResults=12&type=video`
                );
                const ytData = await ytRes.json();
                if (ytData.items) {
                    const ytItems = ytData.items.map((item) => ({
                        id: item.id.videoId,
                        type: 'YOUTUBE',
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
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
                const igRes = await fetch(
                    `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${instagramToken}`
                );
                const igData = await igRes.json();
                if (igData.data) {
                    const igItems = igData.data.map((item) => ({
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

        // If no keys provided, return real ChazzyBooTV videos as fallback
        if (feedItems.length === 0) {
            const mockVideos = [
                { id: 'pZK2ZwUKV7w', title: "EverySingleDay" },
                { id: 'LsYfFNs31Kc', title: "Chazzy Boo - EverySingleDay (Official Music Video)" },
                { id: 'EX77cZd9dGc', title: "Unreleased Interview With Chazzy Boo" },
                { id: 'V9YVzPQC7iw', title: "DawgEatDawg" },
                { id: 'x6ZOmTS_AxE', title: "CHAZZY BOO - BOOL'N (Official Music Video)" },
                { id: 'pZK2ZwUKV7w', title: "EverySingleDay (Audio)" },
            ];

            feedItems = mockVideos.map((video, index) => ({
                id: video.id,
                type: 'YOUTUBE',
                title: video.title,
                thumbnail: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
                publishedAt: new Date(Date.now() - index * 86400000).toISOString(),
                url: `https://www.youtube.com/watch?v=${video.id}`
            }));
        }

        res.status(200).json(feedItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch feed" });
    }
}
