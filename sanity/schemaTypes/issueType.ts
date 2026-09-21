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
    defineField({
      name: 'workflowStatus',
      title: 'Workflow Status',
      type: 'string',
      initialValue: 'new',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Summarized', value: 'summarized' },
          { title: 'Prioritized', value: 'prioritized' },
          { title: 'In Review', value: 'in_review' },
          { title: 'Resolved', value: 'resolved' },
        ],
      },
    }),
    defineField({
      name: 'agentPriority',
      title: 'Agent Assigned Priority',
      type: 'string',
      options: {
        list: [
          { title: 'P0 - Critical', value: 'P0' },
          { title: 'P1 - High', value: 'P1' },
          { title: 'P2 - Medium', value: 'P2' },
          { title: 'P3 - Low', value: 'P3' },
          { title: 'P4 - Backlog', value: 'P4' },
        ],
      },
    }),
    defineField({
      name: 'agentReasoning',
      title: 'Agent Reasoning',
      type: 'text',
      description: 'Why the agent assigned this priority',
    }),
    defineField({
      name: 'matchedPatternIds',
      title: 'Matched Patterns',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'triagePattern' }] }],
    }),
    defineField({
      name: 'maintainerDecision',
      title: 'Maintainer Decision',
      type: 'string',
      options: {
        list: [
          { title: 'Accepted Agent Suggestion', value: 'accepted' },
          { title: 'Overridden - Higher Priority', value: 'overridden_higher' },
          { title: 'Overridden - Lower Priority', value: 'overridden_lower' },
          { title: 'Pending Review', value: 'pending' },
        ],
      },
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
