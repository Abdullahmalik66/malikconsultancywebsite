export const animationTypes = ['blobs', 'waves', 'particles', 'grid', 'neon-lines', 'radial-pulse'];
export const colors = ['#6d55a7', '#1a3c1a', '#1a3c5a', '#2a1a3c', '#3c1a1a', '#1a3c3c', '#3c3c1a', '#1a1a3c', '#3c1a3c', '#1a3a1a', '#2a2a0a', '#0a2a2a'];

export function getDeterministicFormatting(id: string) {
  // Simple hash function for string
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  return {
    color: colors[hash % colors.length],
    animationType: animationTypes[hash % animationTypes.length] as any
  };
}
