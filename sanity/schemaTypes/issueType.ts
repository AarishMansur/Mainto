import { defineField, defineType } from 'sanity'

export const issueType = defineType({
  name: 'issue',
  title: 'GitHub Issue',
  type: 'document',
  fields: [
    defineField({
      name: 'githubId',
      title: 'GitHub Issue Number',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'repoOwner',
      title: 'Repository Owner',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'repoName',
      title: 'Repository Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      options: {
        list: [
          { title: 'Open', value: 'open' },
          { title: 'Closed', value: 'closed' },
        ],
      },
    }),
    defineField({
      name: 'labels',
      title: 'Labels',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'commentsCount',
      title: 'Comments Count',
      type: 'number',
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
    }),
    defineField({
      name: 'fetchedAt',
      title: 'Fetched At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'repoOwner',
      media: 'labels',
    },
    prepare(select) {
      return {
        title: select.title,
        subtitle: `${select.subtitle} · #${select.title}`,
      }
    },
  },
})
