import { performance } from 'perf_hooks';

const LinkStatus = { PENDING: 'PENDING', COMPLETED: 'COMPLETED' };
const categories = ['Work', 'Personal', 'Study', 'Uncategorized', 'Misc', 'Reading', 'Finance', 'Health'];

function generateLinks(count) {
    const links = [];
    for (let i = 0; i < count; i++) {
        links.push({
            id: `link-${i}`,
            title: `Link ${i}`,
            url: `https://example.com/${i}`,
            status: i % 3 === 0 ? LinkStatus.COMPLETED : LinkStatus.PENDING,
            category: categories[i % categories.length]
        });
    }
    return links;
}

const links = generateLinks(100000);

function originalStats(links) {
    const total = links.length;
    const pending = links.filter(l => l.status === LinkStatus.PENDING).length;
    const completed = total - pending;
    const categoryCounts = links.reduce((acc, link) => {
        const category = link.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    return { total, pending, completed, categoryCounts };
}

function optimizedStatsFor(links) {
    const total = links.length;
    let pending = 0;
    const categoryCounts = {};

    for (let i = 0; i < total; i++) {
        const link = links[i];
        if (link.status === LinkStatus.PENDING) {
            pending++;
        }
        const category = link.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
    const completed = total - pending;
    return { total, pending, completed, categoryCounts };
}

function optimizedStatsReduce(links) {
    const { pending, categoryCounts } = links.reduce(
        (acc, link) => {
            if (link.status === LinkStatus.PENDING) {
                acc.pending++;
            }
            const category = link.category || 'Uncategorized';
            acc.categoryCounts[category] = (acc.categoryCounts[category] || 0) + 1;
            return acc;
        },
        { pending: 0, categoryCounts: {} }
    );
    const total = links.length;
    const completed = total - pending;
    return { total, pending, completed, categoryCounts };
}

function runBenchmark(name, fn, iterations = 100) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn(links);
    }
    const end = performance.now();
    console.log(`${name}: ${((end - start) / iterations).toFixed(2)} ms per run`);
}

// Warmup
originalStats(links);
optimizedStatsFor(links);
optimizedStatsReduce(links);

console.log('--- Benchmarking Dashboard Stats (100k links) ---');
runBenchmark('Original', originalStats);
runBenchmark('Optimized (for loop)', optimizedStatsFor);
runBenchmark('Optimized (reduce)', optimizedStatsReduce);
