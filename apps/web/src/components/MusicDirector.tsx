import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useProfile } from '../api/profiles.ts';
import { setMusicEnabled, setTrack, trackOf, useMusicMoment } from '../lib/music.ts';
import { useSession } from '../store/session.ts';

/** Choisit la musique de fond : moment imposé par l'écran, sinon celle de l'adresse ; respecte « Musique ». */
export function MusicDirector() {
  const { pathname } = useLocation();
  const profileId = useSession((s) => s.profileId);
  const { data: profile } = useProfile(profileId);
  const moment = useMusicMoment();
  const on = profile?.musicOn ?? false;
  const track = trackOf(pathname) === null ? null : (moment ?? trackOf(pathname));
  useEffect(() => {
    setMusicEnabled(on);
  }, [on]);
  useEffect(() => {
    setTrack(track);
  }, [track]);
  return null;
}
