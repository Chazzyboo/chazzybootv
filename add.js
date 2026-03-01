import fs from 'fs';
import { execSync } from 'child_process';

const envs = {
    YOUTUBE_API_KEY: 'AIzaSyBlj5wB_10mMF5Gve_w203SSwv-MxnZyf0',
    YOUTUBE_CHANNEL_ID: 'UC7lR4s4Nco2WKJGfcP7kOmg',
    VITE_EMAILJS_SERVICE_ID: 'service_4b0w8bs',
    VITE_EMAILJS_TEMPLATE_ID: 'template_qnf6ggv',
    VITE_EMAILJS_PUBLIC_KEY: 'Kx3pJR9RKIlev8C8N'
};

for (const [k, v] of Object.entries(envs)) {
    try {
        execSync(`npx vercel env rm -y ${k} production`, { stdio: 'ignore' });
    } catch (e) { }

    fs.writeFileSync('temp.txt', `${v}\ny\n`);
    try {
        execSync(`cmd /c "npx vercel env add ${k} production < temp.txt"`, { stdio: 'inherit' });
        console.log(`Added ${k}`);
    } catch (e) {
        console.error(`Failed ${k}`);
    }
}
try { fs.unlinkSync('temp.txt'); } catch (e) { }
