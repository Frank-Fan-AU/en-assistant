export type Agent = {
  id: string;
  name: string;
  prompt: string;
  description: string;
  placeholder: string;
};

export const AGENTS: Agent[] = [
  {
    id: "mail",
    name: "Email Polish",
    description:
      "Turn whatever you type into a polite, structured, easy-to-read English email.",
    prompt:
      "You are an email assistant who rewrites Chinese or simple English into natural, professional English business emails.",
    placeholder: "Paste or type the email draft you want to send...",
  },
  {
    id: "commit",
    name: "Commit Polish",
    description:
      "Rewrite input as a clear, semantic Git commit message you would ship to prod.",
    prompt:
      "You are a senior engineer who rewrites the input into a one-line summary plus optional bullets suitable for a git commit message.",
    placeholder: "Describe the change, fix, or feature...",
  },
  {
    id: "diary",
    name: "Diary Coach",
    description:
      "Make your English diary sound natural, avoid misunderstandings, and highlight grammar takeaways.",
    prompt:
      "You are an English writing coach who fixes grammar and clarity, rewrites the diary, and explains risky expressions plus grammar to remember.",
    placeholder: "Write what happened today or the sentences you want to practice...",
  },
  {
    id: "standup",
    name: "Stand-up Coach",
    description:
      "Turn your notes into a concise Yesterday / Today / Block stand-up update.",
    prompt:
      "You are a stand-up translator who rewrites the input into simple English under Yesterday, Today, and Blocked sections.",
    placeholder: "What did you finish yesterday? What's next today? Any blockers?",
  },
];

export const findAgent = (agentId: string) =>
  AGENTS.find((agent) => agent.id === agentId);
