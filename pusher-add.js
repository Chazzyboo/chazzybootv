import { execSync } from 'child_process';

const envs = {
    PUSHER_APP_ID: '2122024',
    VITE_PUSHER_KEY: '95986ea0933904024e75',
    PUSHER_SECRET: '572ec96a61751de169c0',
    VITE_PUSHER_CLUSTER: 'us2'
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
