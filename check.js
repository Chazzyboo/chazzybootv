async function check() {
    const r1 = await fetch('https://chazzyboo.com/');
    const html = await r1.text();
    const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (match) {
        const js = await (await fetch('https://chazzyboo.com' + match[1])).text();
        console.log('Key found:', js.includes('Kx3pJR9RKIlev8C8N'));
    } else {
        console.log('JS not found');
    }
}
check();
