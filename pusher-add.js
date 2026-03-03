import { spawn } from 'child_process';

async function addEnv(name, value) {
    console.log(`Setting ${name}...`);
    return new Promise((resolve) => {
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
    await addEnv('PUSHER_APP_ID', '2122024');
    await addEnv('VITE_PUSHER_KEY', '95986ea0933904024e75');
    await addEnv('PUSHER_SECRET', '572ec96a61751de169c0');
    await addEnv('VITE_PUSHER_CLUSTER', 'us2');
    console.log('All Pusher variables configured!');
})();
