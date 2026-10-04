# Content API consumer audit

The frontend consumes shared API contracts; Payload-generated types belong to
CMS adapters and collection configuration.

| Consumer                | Validated fields                                                                                                                                                 | Former validation gap                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| getPage / PageRenderer  | ID, slug, title, status, custom CSS, metadata, layout                                                                                                            | Page was cast from blocks validating only blockType               |
| PageRenderer            | All 14 block discriminators; headings, rich text, images, actions, grid items, form settings, anchors, appearance                                                | Block fields were unknown                                         |
| getPost / post detail   | Title, summary, body, publication date, SEO title/description/image, table of contents                                                                           | Body was an arbitrary record; post was cast to Payload type       |
| Post detail / archives  | Author name, slug, bio, website and image; category/tag IDs, titles, slugs, descriptions                                                                         | Relationships were unvalidated; archive consumers cast the result |
| Navigation / LinkAction | Header items, sticky/search controls; footer forms, social/legal links, latest posts and copyright; link targets, labels, icons, new-tab and button presentation | Empty loose navigation objects and duplicate link interfaces      |
| Proxy                   | Redirect source, status, custom URL or page/post reference                                                                                                       | Only source validated; redirect array cast to Payload type        |
| Post headings           | Recursive Lexical node type/version, children, text and heading tag                                                                                              | Arbitrary input cast into a duplicate node shape                  |

Contracts retain additive fields, nullable or omitted optional values, numeric
or string relationship IDs, populated documents, and draft/published status.
Navigation relationships validate the document identity and slug without
requiring a recursively populated content tree. URL safety remains enforced by
the existing navigation and redirect resolvers. Draft secret checks and access
functions remain in the application.

Validation covers all blocks, malformed trees and responses, relationship forms,
missing optional fields, preview headers, rendered markup, database documents at
depths 0 and 2, and the generated OpenAPI document.
