import { defineField, defineType } from 'sanity'

const priorityOptions = [
  { title: 'P0 - Critical', value: 'P0' },
  { title: 'P1 - High', value: 'P1' },
  { title: 'P2 - Medium', value: 'P2' },
  { title: 'P3 - Low', value: 'P3' },
  { title: 'P4 - Backlog', value: 'P4' },
]

export const triageDecisionType = defineType({
  name: 'triageDecision',
  title: 'Triage Decision',
  type: 'document',
  fields: [
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
      name: 'issueRef',
      title: 'Issue',
      type: 'reference',
      to: [{ type: 'issue' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'decidedBy',
      title: 'Decided By',
      type: 'string',
      description: 'Maintainer who made this decision',
    }),
    defineField({
      name: 'assignedPriority',
      title: 'Assigned Priority',
      type: 'string',
      description: 'Priority suggested to the maintainer for this repository',
      options: { list: priorityOptions },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'modelPriority',
      title: 'Model Priority',
      type: 'string',
      description: 'Priority the model produced. Model output is not precedent.',
      options: { list: priorityOptions },
    }),
    defineField({
      name: 'precedentPriority',
      title: 'Precedent Priority',
      type: 'string',
      description: 'Maintainer decision later triage in this repository may learn from.',
      options: { list: priorityOptions },
    }),
    defineField({
      name: 'resolution',
      title: 'Resolution',
      type: 'text',
      description: 'How this issue was resolved or should be resolved',
    }),
    defineField({
      name: 'resolutionTime',
      title: 'Resolution Time (days)',
      type: 'number',
      description: 'Days from issue creation to resolution',
    }),
    defineField({
      name: 'matchedPatterns',
      title: 'Matched Patterns',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'triagePattern' }] }],
      description: 'Historical patterns that matched this issue',
    }),
    defineField({
      name: 'agentSuggestion',
      title: 'Agent Suggestion',
      type: 'string',
      description: 'What the agent suggested vs what was actually decided',
    }),
    defineField({
      name: 'humanPriority',
      title: 'Human Priority',
      type: 'string',
      description: 'Priority the maintainer confirmed or corrected to',
      options: { list: priorityOptions },
    }),
    defineField({
      name: 'agentAccuracy',
      title: 'Agent Accuracy',
      type: 'number',
      description: 'How accurate the agent suggestion was (0-100%)',
    }),
    defineField({
      name: 'decidedAt',
      title: 'Decided At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'issueRef.title',
      subtitle: 'assignedPriority',
    },
    prepare(select) {
      return {
        title: select.title || 'Untitled',
        subtitle: select.subtitle,
      }
    },
  },
})
