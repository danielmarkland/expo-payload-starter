# Practical site layouts

All layout controls are implemented in the shared publishing packages and work in the starter without GroovePost. GroovePost supplies tenant-scoped adapters.

## Screenshot mappings

| Reference          | CMS configuration                                                                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Daniel Markland    | Text hero with accent headline; stacked feature grid with accent left border; split content with portrait on right; two-column link and portfolio grids; combined-name contact form.                                                                     |
| Code Assassins     | Centered text hero with two actions; numbered three/four-column feature grids; plain columns with individual hex-colored rules; testimonials; footer newsletter and recent posts.                                                                        |
| Strick Biz home    | Full-width background hero with focal position and dark overlay; two latest-post blocks filtered to mixes/remixes or manually curated, three columns, square artwork, image-only presentation, centered headings/actions; accent footer booking section. |
| Strick Biz archive | Site settings → Archives: page size 12, three columns, square artwork, simple cards, dark title surface and light list surface; footer booking form with separate names and optional company.                                                            |

Hero variants are Split (existing default), Text, and Background. Height choices are Compact (280px), Standard (existing 480px), and Tall (680px desktop/480px mobile). Focal X/Y are percentages; dark overlay is 0–100%. Background heroes retain headline accents and both actions. Set section width Full for edge-to-edge hero sections.

Section appearance controls heading/action alignment and automatic or explicit two/three/four-column grids. Explicit grids collapse to two columns at 900px and one at 600px. Existing cards and stacked services remain available; plain feature columns support optional numbering and colored top rules. Light/dark surfaces control local text and card contrast independently of the visitor theme.

Latest posts supports Latest, Category, and Selected sources. Selected posts preserve editor order and omit unavailable/unpublished records; empty or incomplete selections never fall back to unrelated posts. Square artwork uses contain rather than crop. Image-only cards retain accessible linked artwork; missing artwork falls back to a visible title. Existing full cards remain the default. An optional action follows the grid.

Archive settings apply to categories, tags and authors. Pagination uses `?page=` and previous/next links. Missing page means page 1; malformed, repeated, nonpositive and out-of-range page numbers return 404. Empty archives show the existing empty state. Footer recent posts defaults to two; count can be configured from one to twelve.

Contact blocks and footer forms support Combined or Separate names and an optional company field. Existing combined-name submissions remain supported; separate mode requires both names. Delivery includes company in escaped HTML and plain text. Turnstile replaces the old sites' reCAPTCHA. Configure the public site key and server secret, contact email delivery, and MailerLite group/API credentials for enabled forms; no provider credentials enter portable site archives.

## Rollout

Apply each application's checked-in Payload migration before serving content with the new fields. Existing page and footer records retain their previous rendering defaults. Archive presentation defaults remain unchanged except that archives now show twelve posts per page with pagination.

Release the publishing-contracts, publishing-core and publishing-ui changesets together. After the packages are published, update GroovePost's exact dependency versions and lockfile together and regenerate the design kit's package compatibility metadata. Package publication, commits and deployments are separate operations.

The current GroovePost integration is verified using locally staged builds of the shared packages. Its registry dependency pins remain unchanged until publication; do not deploy the integration with the old packages.

## Section width inheritance

Site settings offer **Full** and **Padded**, defaulting to Padded. Pages offer
**Site**, Full and Padded, defaulting to Site. Each block's Appearance offers
**Page**, Full and Padded, defaulting to Page. Missing values inherit too.
A full page makes inherited blocks full; either explicit block choice overrides
its page. Site width also sizes the header and footer.

Full spans the available viewport. Padded uses `layout.content` and a responsive
16–24px gutter, shared by sections and site navigation. The page shell has no
horizontal padding; the outer block owns its container, so children cannot add a
second gutter. Paragraphs and lists retain `layout.copy` as their reading measure.

Design kits set site `width`, page `width`, and block `appearance.width`. These
fields are described by the shared CMS factories and included in portable
exports/imports. Use the same three-level choices in external design tools.
