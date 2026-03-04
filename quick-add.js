import { spawn } from 'child_process';

async function addEnv(name, value) {
    console.log(`Setting ${name}...`);
    return new Promise((resolve) => {
        const cp = spawn('npx.cmd', ['vercel', 'env', 'add', name, 'production'], { shell: true });

        // We capture both stdout and stderr and aggregate them
        let buf = '';

        const handleData = (data) => {
            const out = data.toString();
            buf += out;
            process.stdout.write(out);

            const bufLower = buf.toLowerCase();

            // Wait until it asks "What's the value of"
            if (bufLower.includes('value of')) {
                cp.stdin.write(value + '\n');
                buf = ''; // Clear buffer to catch the next prompt clearly
            }
            // Wait until it asks "Mark as sensitive?"
            else if (bufLower.includes('sensitive')) {
                cp.stdin.write('N\n');
                cp.stdin.end();
                buf = '';
            }
            // Wait until it asks "starts with VITE_"
            else if (bufLower.includes('starts with') || bufLower.includes('leave as is')) {
                cp.stdin.write('\n');
                buf = '';
            }
        };

        cp.stdout.on('data', handleData);
        cp.stderr.on('data', handleData);

        cp.on('close', (code) => {
            console.log(`\nFinished ${name} (exit code: ${code})`);
            resolve();
        });
    });
}

(async () => {
    await addEnv('YOUTUBE_API_KEY', 'AIzaSyBlj5wB_10mMF5Gve_w203SSwv-MxnZyf0');
    await addEnv('YOUTUBE_CHANNEL_ID', 'UC7lR4s4Nco2WKJGfcP7kOmg');
    await addEnv('PUSHER_APP_ID', '2122024');
    await addEnv('VITE_PUSHER_KEY', '95986ea0933904024e75');
    await addEnv('PUSHER_SECRET', '572ec96a61751de169c0');
    await addEnv('VITE_PUSHER_CLUSTER', 'us2');
    console.log('All variables configured!');
})();
