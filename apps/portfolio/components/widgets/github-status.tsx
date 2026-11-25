"use client";

import { trackOutboundClick } from "@httpjpg/analytics";
import { FooterStatusLine, FooterStatusLineText, FooterStatusLineThumb } from "@httpjpg/ui";

import type { GithubActivity, GithubProfile } from "@/lib/integrations/github";

export interface GithubStatusProps {
  profile: GithubProfile | null;
  activity: GithubActivity | null;
  /** False while the request is in flight, so the line holds instead of collapsing. */
  loaded: boolean;
}

export function GithubStatus({ profile, activity, loaded }: GithubStatusProps) {
  if (!profile || !activity) {
    return loaded ? null : <FooterStatusLine label="github" loading />;
  }

  return (
    <FooterStatusLine
      label="github"
      href={activity.url}
      onClick={() =>
        trackOutboundClick({
          destination: "github",
          href: activity.url,
          label: `${activity.verb} ${activity.repo}`,
        })
      }
    >
      {profile.avatar && <FooterStatusLineThumb src={profile.avatar} shape="circle" />}
      <FooterStatusLineText fixed dim>
        {activity.verb}
      </FooterStatusLineText>
      <FooterStatusLineText>{activity.repo}</FooterStatusLineText>
      {activity.detail && (
        <FooterStatusLineText fixed dim>
          {activity.detail}
        </FooterStatusLineText>
      )}
    </FooterStatusLine>
  );
}
