const root = new URL('../', import.meta.url);
export const pageLinks = {
  home: root.href,
  founder: new URL('u/1agejames/', root).href,
  tools: new URL('application.html', root).href,
  logo: new URL('shared/1age-logo.svg', root).href,
};

export const founder = {
  name: '1AGE James',
  handle: '@1agejames',
  bio: 'Founder · 1AGEthe3rd Virtual Studio. Building a 3D-first discovery ecosystem.',
  status: 'Demo profile',
  accent: 0x1bfd9c,
  avatar: null,
  destinations: [
    { id: 'github', name: 'GitHub', kind: 'Studio social link', url: 'https://github.com/1AGEthe3rd', icon: 'github', tint: 0xbaacf8 },
    { id: 'search', name: 'Search', kind: '1AGE ecosystem', url: 'https://1age.com/', icon: 'search', tint: 0x72e8b6 },
    { id: 'world', name: 'World', kind: '1AGE ecosystem', url: 'https://1age.world/', icon: 'world', tint: 0x79d8ff },
    { id: 'plus', name: 'Plus', kind: '1AGE ecosystem', url: 'https://1age.plus/', icon: 'plus', tint: 0xfad697 },
  ],
};

export function findPreviews(query) {
  const terms = query.normalize('NFKC').trim().toLowerCase().split(/\s+/);
  const index = [founder.name, founder.handle, founder.bio, ...founder.destinations.flatMap(({ name, url }) => [name, url])]
    .join(' ').toLowerCase();
  return terms.every(term => index.includes(term)) ? [founder] : [];
}
