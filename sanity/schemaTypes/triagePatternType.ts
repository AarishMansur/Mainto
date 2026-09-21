import { defineField, defineType } from 'sanity'

export const triagePatternType = defineType({
  name: 'triagePattern',
  title: 'Triage Pattern',
  type: 'document',
  fields: [
    defineField({
      name: 'patternName',
      title: 'Pattern Name',
      type: 'string',
      description: 'e.g. "performance issues", "security vulnerabilities", "UI bugs"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Words/phrases that identify this pattern in issues',
    }),
    defineField({
      name: 'labelPatterns',
      title: 'Label Patterns',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'GitHub labels that typically match this pattern',
    }),
    defineField({
      name: 'avgUrgency',
      title: 'Average Urgency Score',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(10),
    }),
    defineField({
      name: 'typicalResolution',
      title: 'Typical Resolution',
      type: 'text',
      description: 'How these issues are usually resolved',
    }),
    defineField({
      name: 'avgResolutionDays',
      title: 'Avg Resolution Time (days)',
      type: 'number',
    }),
    defineField({
      name: 'exampleIssueIds',
      title: 'Example Issue IDs',
      type: 'array',
      of: [{ type: 'number' }],
      description: 'GitHub issue numbers that match this pattern',
    }),
    defineField({
      name: 'learnedFrom',
      title: 'Learned From',
      type: 'number',
      description: 'Number of past issues used to learn this pattern',
    }),
  ],
  preview: {
    select: {
      title: 'patternName',
      subtitle: 'avgUrgency',
    },
    prepare(select) {
      return {
        title: select.title,
        subtitle: `Urgency: ${select.subtitle}/10`,
      }
    },
  },
})
