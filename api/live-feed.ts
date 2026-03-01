export default async function handler(req, res) {
    try {
        const youtubeKey = process.env.YOUTUBE_API_KEY;
        const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID;
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

        // If no keys provided, return mock data for demo purposes
        if (feedItems.length === 0) {
            const mockVideos = [
                { id: 'x6ZOmTS_AxE', title: 'CHAZZY BOO - BOOL\'N (OFFICIAL MUSIC VIDEO)' },
                { id: 'dQw4w9WgXcQ', title: 'CHAZZY BOO - LATE NIGHT STUDIO SESSIONS' },
                { id: 'x6ZOmTS_AxE', title: 'CHAZZY BOO - ONYX VIBES (LIVE SET)' },
                { id: 'dQw4w9WgXcQ', title: 'CHAZZY BOO - SATELLITE DREAM' },
                { id: 'x6ZOmTS_AxE', title: 'CHAZZY BOO - BEHIND THE SCENES: BOOL\'N' },
                { id: 'dQw4w9WgXcQ', title: 'CHAZZY BOO - INDUSTRIAL TEXTURES VOL. 1' },
            ];

            feedItems = mockVideos.map((video, index) => ({
                id: video.id + index,
                type: 'YOUTUBE',
                title: video.title,
                thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
                publishedAt: new Date(Date.now() - index * 86400000).toISOString(),
                url: `https://www.youtube.com/watch?v=${video.id}`
            }));
        }

        res.status(200).json(feedItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch feed" });
    }
}
