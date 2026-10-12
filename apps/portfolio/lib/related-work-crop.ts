// Client-safe: the related-work cards import these, so this module must not
// pull in the server query (and with it the Storyblok client and Sentry).

/** The crop the cards are laid out at, so the box and the cut file cannot drift. */
export const RELATED_CARD_ASPECT_RATIO = "4/3";

/** The crop the list thumbs are laid out at, so the box and the cut file cannot drift. */
export const RELATED_LIST_ASPECT_RATIO = "1/1";
