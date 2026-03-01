import path from 'path';

export default async function handler(req, res) {
    try {
        // Direct Local Folder Implementation 
        const portfolioDir = path.join(process.cwd(), 'public', 'portfolio');
        let portfolioItems = [];
        const fs = await import('fs/promises');

        try {
            const files = await fs.readdir(portfolioDir);
            const imageFiles = files.filter(file =>
                file.toLowerCase().endsWith('.jpg') ||
                file.toLowerCase().endsWith('.jpeg') ||
                file.toLowerCase().endsWith('.png') ||
                file.toLowerCase().endsWith('.webp')
            );

            // Sort files by modification time descending (newest first)
            const fileStats = await Promise.all(
                imageFiles.map(async (file) => {
                    const stat = await fs.stat(path.join(portfolioDir, file));
                    return { file, mtime: stat.mtime.getTime() };
                })
            );
            fileStats.sort((a, b) => b.mtime - a.mtime);

            portfolioItems = fileStats.map(({ file }, index) => {
                const isos = [100, 200, 400, 800, 1600, 3200];
                const shutters = ['1/30', '1/60', '1/125', '1/250', '1/500', '1/1000', '1/4000', '1/15'];
                const lenses = ['24mm f/1.4', '35mm f/1.4', '50mm f/1.2', '85mm f/1.8', '50mm f/1.8', '24mm f/2.8'];

                // Clean up the filename for the aesthetic title (removing extensions and hyphens)
                const cleanName = file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').substring(0, 20).toUpperCase();

                return {
                    id: index + 1,
                    src: `/portfolio/${file}`,
                    label: cleanName || `ARCHIVE ${index + 1}`,
                    iso: isos[index % isos.length],
                    shutter: shutters[index % shutters.length],
                    lens: lenses[index % lenses.length],
                    url: `/portfolio/${file}`
                };
            });

        } catch (e) {
            console.error("Local portfolio scan error", e);
        }

        // If no files are placed in the folder yet, fallback to the placeholder assets
        if (portfolioItems.length === 0) {
            portfolioItems = [
                { id: 1, src: '/cbtv-theme/assets/vision_1.png', label: 'BRUTALIST ARCHIVE', iso: 400, shutter: '1/125', lens: '35mm f/1.4' },
                { id: 2, src: '/cbtv-theme/assets/vision_2.png', label: 'SYSTEM GLITCH', iso: 800, shutter: '1/60', lens: '50mm f/1.8' },
                { id: 3, src: '/cbtv-theme/assets/vision_3.png', label: 'STUDIO MIX BOARD', iso: 100, shutter: '1/1000', lens: '85mm f/1.2' },
                { id: 4, src: '/cbtv-theme/assets/vision_4.png', label: 'URBAN NOIR 01', iso: 1600, shutter: '1/30', lens: '24mm f/2.8' },
                { id: 5, src: '/cbtv-theme/assets/vision_5.png', label: 'SERVER NODE 1A', iso: 200, shutter: '1/250', lens: '35mm f/1.4' },
            ];
        }

        res.status(200).json(portfolioItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch portfolio feed" });
    }
}
