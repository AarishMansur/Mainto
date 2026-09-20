import type { DocumentLocationResolver } from "sanity/presentation";

export const resolve: DocumentLocationResolver = (params) => {
  if (params.type === "issue") {
    return {
      locations: [
        {
          title: "View Issue",
          href: `/app/issues/${params.id}`,
        },
      ],
    };
  }

  return { locations: [] };
};
