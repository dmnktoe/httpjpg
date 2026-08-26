import { Box, Link } from "@httpjpg/ui";
import { css } from "styled-system/css";

import { APP_LOCALES, type AppLocale, localizedPath } from "@/lib/locale";

export interface LanguagePickerProps {
  locale: AppLocale;
  slug: string;
}

const LABELS: Record<AppLocale, string> = { en: "EN", de: "DE" };

const navClass = css({
  display: "inline-flex",
  alignItems: "center",
  m: 0,
  color: "inherit",
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
});

const optionCss = {
  px: "1",
  py: "1",
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
} as const;

const glyphClass = css({ opacity: 0.45, userSelect: "none" });

export function LanguagePicker({ locale, slug }: LanguagePickerProps) {
  return (
    <Box as="nav" aria-label="Language" data-testid="language-picker" className={navClass}>
      <Box as="span" aria-hidden="true" className={glyphClass}>
        [
      </Box>
      {APP_LOCALES.map((option, index) => {
        const isActive = option === locale;
        const label = LABELS[option];
        return (
          <Box as="span" key={option} css={{ display: "inline-flex", alignItems: "center" }}>
            {index > 0 && (
              <Box as="span" aria-hidden="true" className={glyphClass} css={{ mx: "1" }}>
                |
              </Box>
            )}
            {isActive ? (
              <Box as="span" aria-current="page" lang={option} css={{ ...optionCss, opacity: 1 }}>
                {label}
              </Box>
            ) : (
              <Link
                href={localizedPath(option, slug)}
                hrefLang={option}
                lang={option}
                css={{ ...optionCss, opacity: 0.45 }}
              >
                {label}
              </Link>
            )}
          </Box>
        );
      })}
      <Box as="span" aria-hidden="true" className={glyphClass}>
        ]
      </Box>
    </Box>
  );
}
