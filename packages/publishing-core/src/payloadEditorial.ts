import type { Field } from 'payload'

export interface EditorialFieldOptions {
  uniqueSlug?: boolean
}

export function createAuthorsFields({
  uniqueSlug = true,
}: EditorialFieldOptions = {}): Field[] {
  return [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: uniqueSlug,
      index: true,
    },
    { name: 'bio', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'website', type: 'text' },
  ]
}

export function createCategoriesFields({
  uniqueSlug = true,
}: EditorialFieldOptions = {}): Field[] {
  return [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: uniqueSlug,
      index: true,
    },
    { name: 'description', type: 'textarea' },
    { name: 'parent', type: 'relationship', relationTo: 'categories' },
  ]
}

export function createTagsFields({
  uniqueSlug = true,
}: EditorialFieldOptions = {}): Field[] {
  return [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: uniqueSlug,
      index: true,
    },
    { name: 'description', type: 'textarea' },
  ]
}

export function createPostsFields({
  uniqueSlug = true,
}: EditorialFieldOptions = {}): Field[] {
  return [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: uniqueSlug,
    },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'body', type: 'richText', required: true },
    { name: 'author', type: 'relationship', relationTo: 'authors' },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'publishedAt', type: 'date' },
    {
      name: 'showTableOfContents',
      type: 'checkbox',
      admin: {
        description:
          'Show links to level-two and level-three headings in this article.',
      },
      defaultValue: false,
      label: 'Show table of contents',
    },
  ]
}
