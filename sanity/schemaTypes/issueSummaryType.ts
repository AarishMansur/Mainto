import { defineField, defineType } from 'sanity'

export const issueSummaryType = defineType({
  name: 'issueSummary',
  title: 'Issue Summary',
  type: 'document',
  fields: [
    defineField({
      name: 'issueRef',
      title: 'Issue',
      type: 'reference',
      to: [{ type: 'issue' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'urgencyScore',
      title: 'Urgency Score',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(10).required(),
    }),
    defineField({
      name: 'keyPoints',
      title: 'Key Points',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'suggestedActions',
      title: 'Suggested Actions',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'model',
      title: 'AI Model Used',
      type: 'string',
    }),
    defineField({
      name: 'generatedAt',
      title: 'Generated At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'summary',
      subtitle: 'urgencyScore',
      issueTitle: 'issueRef.title',
    },
    prepare(select) {
      return {
        title: select.issueTitle || select.title?.slice(0, 50),
        subtitle: `Urgency: ${select.subtitle}/10`,
      }
    },
  },
})
