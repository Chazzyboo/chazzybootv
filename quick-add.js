import { execSync } from 'child_process';

const envs = {
    YOUTUBE_API_KEY: 'AIzaSyBlj5wB_10mMF5Gve_w203SSwv-MxnZyf0',
    YOUTUBE_CHANNEL_ID: 'UC7lR4s4Nco2WKJGfcP7kOmg',
    VITE_EMAILJS_SERVICE_ID: 'service_4b0w8bs',
    VITE_EMAILJS_TEMPLATE_ID: 'template_qnf6ggv',
    VITE_EMAILJS_PUBLIC_KEY: 'Kx3pJR9RKIlev8C8N'
};

for (const [k, v] of Object.entries(envs)) {
    console.log(`Adding ${k}...`);
    try {
        // We pass the exact string v (no newlines) as stdin
        execSync(`npx vercel env add ${k} production`, {
            input: v,
            stdio: ['pipe', 'inherit', 'inherit']
        });
        console.log(`Successfully added ${k}`);
    } catch (err) {
        console.error(`Failed to add ${k}`, err.message);
    }
}
