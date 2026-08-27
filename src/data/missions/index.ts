import type { Mission } from '../../engine/types';
import { metaAdsMission } from './metaAds';
import { metaAdsChallengeMission } from './metaAdsChallenge';
import { campaignBuildMission } from './campaignBuild';

/**
 * The mission registry. Adding a mission to the product means adding one data
 * file and one line here — no UI changes, because the engine renders whatever
 * the data describes.
 */
export const MISSIONS: Mission[] = [metaAdsMission, metaAdsChallengeMission, campaignBuildMission];

export const missionById = (id: string): Mission | undefined => MISSIONS.find((m) => m.id === id);

export { metaAdsMission, metaAdsChallengeMission, campaignBuildMission };
