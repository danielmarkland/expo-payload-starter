import { describe, expect, it } from 'vitest'
import {
  createAuthorsFields,
  createCategoriesFields,
  createTagsFields,
  createPostsFields,
} from './payloadEditorial.js'

describe('editorial field factories', () => {
  it.each([
    createAuthorsFields,
    createCategoriesFields,
    createTagsFields,
    createPostsFields,
  ])(
    'lets applications own slug uniqueness and returns independent definitions',
    (create) => {
      const standalone = create()
      const scoped = create({ uniqueSlug: false })
      expect(
        standalone.find((field) => 'name' in field && field.name === 'slug'),
      ).toMatchObject({ required: true, index: true, unique: true })
      expect(
        scoped.find((field) => 'name' in field && field.name === 'slug'),
      ).toMatchObject({ required: true, index: true, unique: false })
      expect(scoped[0]).not.toBe(create({ uniqueSlug: false })[0])
    },
  )
  it('preserves author, taxonomy and article relationship fields', () => {
    expect(createPostsFields()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'author', relationTo: 'authors' }),
        expect.objectContaining({
          name: 'categories',
          relationTo: 'categories',
          hasMany: true,
        }),
        expect.objectContaining({
          name: 'tags',
          relationTo: 'tags',
          hasMany: true,
        }),
        expect.objectContaining({
          name: 'body',
          type: 'richText',
          required: true,
        }),
      ]),
    )
    expect(createAuthorsFields()).toContainEqual({
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    })
    expect(createCategoriesFields()).toContainEqual({
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
    })
  })
})
