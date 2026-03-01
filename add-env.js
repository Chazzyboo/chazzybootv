import { spawn } from 'child_process';

async function addEnv(name, value) {
    console.log(`Setting ${name}...`);
    return new Promise((resolve) => {
        // We use npx.cmd on Windows
        const cp = spawn('npx.cmd', ['vercel', 'env', 'add', name, 'production'], {
            stdio: ['pipe', 'pipe', 'inherit'],
            shell: true
        });

        let outputBuf = "";

        cp.stdout.on('data', (data) => {
            const out = data.toString();
            outputBuf += out;

            if (out.toLowerCase().includes('what’s the value of') || out.includes('value of')) {
                cp.stdin.write(value + '\n');
            }
            if (out.toLowerCase().includes('mark as sensitive') || out.includes('(y/N)')) {
                cp.stdin.write('y\n');
                cp.stdin.end();
            }
        });

        cp.on('close', (code) => {
            console.log(`Finished ${name} (exit code: ${code})`);
            resolve();
        });
    });
}

(async () => {
    await addEnv('YOUTUBE_API_KEY', 'AIzaSyBlj5wB_10mMF5Gve_w203SSwv-MxnZyf0');
    await addEnv('YOUTUBE_CHANNEL_ID', 'UC7lR4s4Nco2WKJGfcP7kOmg');
    await addEnv('VITE_EMAILJS_SERVICE_ID', 'service_4b0w8bs');
    await addEnv('VITE_EMAILJS_TEMPLATE_ID', 'template_qnf6ggv');
    await addEnv('VITE_EMAILJS_PUBLIC_KEY', 'Kx3pJR9RKIlev8C8N');
    console.log('All variables configured!');
})();
