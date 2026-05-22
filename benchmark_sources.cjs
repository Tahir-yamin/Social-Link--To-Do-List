const Benchmark = require('benchmark');

const suite = new Benchmark.Suite;

const groundingChunks = Array.from({ length: 1000 }, (_, i) => ({
    web: i % 2 === 0 ? { uri: `https://example.com/${i}`, title: `Title ${i}` } : null
}));

suite.add('map + filter', function() {
    const sources = groundingChunks
      .map(chunk => chunk.web && chunk.web.uri && chunk.web.title ? { uri: chunk.web.uri, title: chunk.web.title } : null)
      .filter((source) => source !== null);
})
.add('reduce', function() {
    const sources = groundingChunks.reduce((acc, chunk) => {
      if (chunk.web && chunk.web.uri && chunk.web.title) {
        acc.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
      return acc;
    }, []);
})
.add('flatMap', function() {
    const sources = groundingChunks.flatMap(chunk =>
      (chunk.web && chunk.web.uri && chunk.web.title)
        ? [{ uri: chunk.web.uri, title: chunk.web.title }]
        : []
    );
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run({ 'async': false });
