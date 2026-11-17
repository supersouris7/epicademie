import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { Profile } from '@questeo/shared';
import { buildApp } from './app.ts';
import { openDb } from './db/client.ts';

const migrationsDir = path.resolve(import.meta.dirname, '../drizzle');
const avatar = { style: 'fun-emoji', seed: 'abc' } as const;

let app: FastifyInstance;
let close: () => void;

beforeEach(async () => {
  const opened = openDb(':memory:', migrationsDir);
  close = opened.close;
  app = await buildApp({ db: opened.db, port: 3000, webDir: null, publicUrl: 'http://test:3000' });
});
afterEach(async () => {
  await app.close();
  close();
});

const create = async (name: string) => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/profiles',
    payload: { name, avatar, gender: 'fille', birthDate: '2014-03-09', grade: '5e' },
  });
  return { res, profile: res.json<Profile>() };
};

describe('API profils', () => {
  it('crée puis liste des profils avec les valeurs par défaut', async () => {
    const { res, profile } = await create('  Léa  ');
    expect(res.statusCode).toBe(201);
    expect(profile).toMatchObject({
      name: 'Léa',
      xp: 0,
      coins: 0,
      soundOn: true,
      avatar,
      gender: 'fille',
      birthDate: '2014-03-09',
      grade: '5e',
      hero: 'alex',
      ammo: null,
    });
    const list = await app.inject('/api/profiles');
    expect(list.json<Profile[]>()).toHaveLength(1);
  });

  it('rejette un prénom vide ou un avatar inconnu', async () => {
    expect((await create('   ')).res.statusCode).toBe(400);
    const bad = await app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: {
        name: 'Tom',
        avatar: { ...avatar, style: 'inconnu' },
        gender: 'garcon',
        birthDate: '2014-01-01',
        grade: '5e',
      },
    });
    expect(bad.statusCode).toBe(400);
    const noGender = await app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: { name: 'Tom', avatar, birthDate: '2014-01-01', grade: '5e' },
    });
    expect(noGender.statusCode).toBe(400);
    const future = await app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: { name: 'Tom', avatar, gender: 'garcon', birthDate: '2099-01-01', grade: '5e' },
    });
    expect(future.statusCode).toBe(400);
    const noGrade = await app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: { name: 'Tom', avatar, gender: 'garcon', birthDate: '2014-01-01' },
    });
    expect(noGrade.statusCode).toBe(400);
  });

  it('modifie un profil', async () => {
    const { profile } = await create('Tom');
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/profiles/${profile.id}`,
      payload: { soundOn: false, hero: 'ayla' },
    });
    expect(res.json<Profile>()).toMatchObject({ soundOn: false, name: 'Tom', hero: 'ayla' });
    const bad = await app.inject({ method: 'PATCH', url: `/api/profiles/${profile.id}`, payload: { hero: 'ninja' } });
    expect(bad.statusCode).toBe(400);
  });

  it('ignore les champs non modifiables (xp)', async () => {
    const { profile } = await create('Tom');
    const res = await app.inject({ method: 'PATCH', url: `/api/profiles/${profile.id}`, payload: { xp: 9999 } });
    expect(res.json<Profile>().xp).toBe(0);
  });

  it('supprime un profil et renvoie 404 ensuite', async () => {
    const { profile } = await create('Tom');
    expect((await app.inject({ method: 'DELETE', url: `/api/profiles/${profile.id}` })).statusCode).toBe(204);
    expect((await app.inject(`/api/profiles/${profile.id}`)).statusCode).toBe(404);
  });

  it('renvoie 404 sur un identifiant mal formé', async () => {
    expect((await app.inject('/api/profiles/pas-un-uuid')).statusCode).toBe(404);
  });
});

describe('API système', () => {
  it('expose la santé et l’URL publique', async () => {
    expect((await app.inject('/api/health')).json()).toEqual({ status: 'ok' });
    expect((await app.inject('/api/network')).json()).toEqual({ publicUrl: 'http://test:3000' });
  });
});
