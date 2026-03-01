import Pusher from 'pusher';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { user, text } = req.body;

        if (!user || !text) {
            return res.status(400).json({ message: 'User and text are required' });
        }

        const pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.VITE_PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.VITE_PUSHER_CLUSTER,
            useTLS: true,
        });

        const payload = {
            id: Math.random().toString(36).substr(2, 9),
            user: user || "ANON_SIGNAL",
            text: text,
            timestamp: new Date().toISOString(),
        };

        await pusher.trigger('chat-room', 'message', payload);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Pusher trigger error", error);
        return res.status(500).json({ message: 'Failed to broadcast message' });
    }
}
