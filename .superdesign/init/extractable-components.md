# Extractable Components

## SiteHeader
- Source: `build.mjs`
- Category: layout
- Description: Shared navigation, social links, and theme control.
- Extractable props: active page, localized URLs
- Hardcoded: icons and CSS class structure

## SiteFooter
- Source: `build.mjs`
- Category: layout
- Description: Language navigation and update metadata.
- Extractable props: active language, localized URLs
- Hardcoded: layout and typography

## EditorialOpener
- Source: `src/style.css`
- Category: basic
- Description: Lead paragraph with a Times drop cap aligned to the opening text block.
- Extractable props: text
- Hardcoded: font families and responsive type tokens
