const { performance } = require('perf_hooks');

const LinkStatus = {
  ALL: 'ALL',
  PENDING: 'PENDING',
  DONE: 'DONE',
};

// Generate test data
const links = Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  status: Math.random() > 0.5 ? 'PENDING' : 'DONE',
  category: ['work', 'personal', 'hobby'][Math.floor(Math.random() * 3)],
  createdAt: Date.now() - Math.floor(Math.random() * 100000),
  title: `Link ${i}`,
}));

const filter = 'PENDING';
const categoryFilter = 'work';

function oldWay() {
  const statusFiltered = filter === 'ALL'
    ? links
    : links.filter(link => link.status === filter);

  const categoryFiltered = categoryFilter === 'ALL'
    ? statusFiltered
    : statusFiltered.filter(link => link.category === categoryFilter);

  return [...categoryFiltered].sort((a, b) => a.title.localeCompare(b.title));
}

function newWay() {
  const filteredLinks = (filter === 'ALL' && categoryFilter === 'ALL')
    ? links
    : links.filter(link =>
        (filter === 'ALL' || link.status === filter) &&
        (categoryFilter === 'ALL' || link.category === categoryFilter)
      );

  return [...filteredLinks].sort((a, b) => a.title.localeCompare(b.title));
}

// Warm up
for (let i = 0; i < 5; i++) {
  oldWay();
  newWay();
}

const runs = 20;

let oldTotal = 0;
for (let i = 0; i < runs; i++) {
  const start = performance.now();
  oldWay();
  oldTotal += performance.now() - start;
}
console.log(`Old way average: ${oldTotal / runs}ms`);

let newTotal = 0;
for (let i = 0; i < runs; i++) {
  const start = performance.now();
  newWay();
  newTotal += performance.now() - start;
}
console.log(`New way average: ${newTotal / runs}ms`);
