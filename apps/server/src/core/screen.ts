/** Route sans paramètres de requête ni identifiants (UUID, nombres) : `/boss/3f2…` devient `/boss/:id`. */
export function normalizeScreen(path: string): string {
  const clean = (path.split(/[?#]/)[0] ?? '').slice(0, 200) || '/';
  return clean
    .split('/')
    .map((seg) => (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(seg) || /^\d+$/.test(seg) ? ':id' : seg))
    .join('/');
}
