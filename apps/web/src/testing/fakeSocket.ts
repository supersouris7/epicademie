/**
 * Fausse connexion socket.io pour les tests : enregistre les écouteurs et les messages émis,
 * et permet de simuler les messages du serveur (`fire`).
 *
 * Dans un fichier de test :
 *   vi.mock('socket.io-client', async () => (await import('../testing/fakeSocket.ts')).socketModule);
 */
export class FakeSocket {
  readonly handlers = new Map<string, (arg: unknown) => void>();
  readonly emitted: [string, unknown][] = [];
  active = true;
  disconnected = false;
  constructor(readonly auth: { readonly profileId: string } | { readonly tv: true }) {}
  on(event: string, fn: (arg: unknown) => void) {
    this.handlers.set(event, fn);
    return this;
  }
  emit(event: string, arg?: unknown) {
    this.emitted.push([event, arg]);
  }
  disconnect() {
    this.disconnected = true;
  }
  /** Message reçu du serveur. */
  fire(event: string, arg?: unknown) {
    this.handlers.get(event)?.(arg);
  }
}

/** Connexions ouvertes pendant le test, de la plus ancienne à la plus récente. */
export const sockets: FakeSocket[] = [];

/** Module de remplacement de `socket.io-client`. */
export const socketModule = {
  io: (opts: { auth: { profileId: string } | { tv: true } }) => {
    const s = new FakeSocket(opts.auth);
    sockets.push(s);
    return s;
  },
};
