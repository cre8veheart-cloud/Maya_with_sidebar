"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ProviderControls from "@/components/ProviderControls";
import {
  getProviderModel,
  loadProviderSettings,
  saveProviderSettings,
} from "@/lib/maya/providerStorage";
import type { MayaMessage, ProviderSettings } from "@/lib/maya/types";

type PostType = "suggestion" | "issue" | "praise" | "community";
type PostStatus = "open" | "reviewing" | "resolved" | "celebrating";
type ReactionType = "boost" | "helpful" | "love";

interface CommunityReply {
  id: string;
  author: string;
  content: string;
}

interface CommunityPost {
  id: string;
  author: string;
  type: PostType;
  title: string;
  content: string;
  status: PostStatus;
  flagged: boolean;
  pinned: boolean;
  createdAt: string;
  reactions: Record<ReactionType, number>;
  replies: CommunityReply[];
}

const COMMUNITY_STORAGE_KEY = "maya-community-posts-v1";

const TYPE_META: Record<PostType, { label: string; badge: string; accent: string }> = {
  suggestion: {
    label: "Blog Suggestion",
    badge: "bg-[#1e2e2b] text-[#a6e3a1]",
    accent: "border-[#a6e3a1]/40",
  },
  issue: {
    label: "Issue",
    badge: "bg-[#3a1f28] text-[#f38ba8]",
    accent: "border-[#f38ba8]/40",
  },
  praise: {
    label: "Positive Feedback",
    badge: "bg-[#332a1a] text-[#f9e2af]",
    accent: "border-[#f9e2af]/40",
  },
  community: {
    label: "Community",
    badge: "bg-[#1e2333] text-[#89b4fa]",
    accent: "border-[#89b4fa]/40",
  },
};

const STATUS_META: Record<PostStatus, string> = {
  open: "Open",
  reviewing: "Reviewing",
  resolved: "Resolved",
  celebrating: "Celebrating",
};

const FILTERS: Array<{ key: "all" | PostType; label: string }> = [
  { key: "all", label: "All posts" },
  { key: "suggestion", label: "Suggestions" },
  { key: "issue", label: "Issues" },
  { key: "praise", label: "Positive feedback" },
  { key: "community", label: "Community" },
];

const QUICK_PROMPTS = [
  "Summarize what this feed is telling us.",
  "Turn the selected suggestion into a blog outline.",
  "Help troubleshoot the selected issue.",
  "Suggest a response that keeps the community engaged.",
];

const SEED_POSTS: CommunityPost[] = [
  {
    id: "seed-1",
    author: "Ava",
    type: "suggestion",
    title: "Need stronger weekly blog prompts",
    content:
      "Would love a recurring suggestion stream for founders who need fast topic ideas tied to launches, customer pain points, and SEO wins.",
    status: "open",
    flagged: false,
    pinned: true,
    createdAt: "Just now",
    reactions: { boost: 8, helpful: 5, love: 3 },
    replies: [
      { id: "seed-1-r1", author: "Milo", content: "A launch-calendar prompt pack would help a lot." },
    ],
  },
  {
    id: "seed-2",
    author: "Jordan",
    type: "issue",
    title: "Suggestions feel too broad",
    content:
      "When I ask Maya for blog ideas, I want tighter recommendations for my audience instead of generic top-funnel topics.",
    status: "reviewing",
    flagged: false,
    pinned: false,
    createdAt: "12m ago",
    reactions: { boost: 6, helpful: 9, love: 1 },
    replies: [
      { id: "seed-2-r1", author: "Nia", content: "Same — I need industry-specific angles and better hooks." },
    ],
  },
  {
    id: "seed-3",
    author: "Chris",
    type: "praise",
    title: "Loved the draft intro help",
    content:
      "The intro suggestion flow helped me move from a blank page to a usable first paragraph in under five minutes.",
    status: "celebrating",
    flagged: false,
    pinned: false,
    createdAt: "28m ago",
    reactions: { boost: 4, helpful: 3, love: 12 },
    replies: [],
  },
  {
    id: "seed-4",
    author: "Rin",
    type: "community",
    title: "Anyone using Maya for customer story posts?",
    content:
      "I’m trying to turn support wins into blog posts. Curious how others collect quotes, structure the story, and keep the post authentic.",
    status: "open",
    flagged: false,
    pinned: false,
    createdAt: "43m ago",
    reactions: { boost: 5, helpful: 6, love: 2 },
    replies: [
      { id: "seed-4-r1", author: "Elle", content: "I ask Maya for a customer arc: problem, turning point, outcome, takeaway." },
    ],
  },
];

function loadCommunityPosts(): CommunityPost[] {
  if (typeof window === "undefined") return SEED_POSTS;
  try {
    const raw = window.localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!raw) return SEED_POSTS;
    const parsed = JSON.parse(raw) as CommunityPost[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_POSTS;
  } catch {
    return SEED_POSTS;
  }
}

function summarizePosts(posts: CommunityPost[]): string {
  if (posts.length === 0) return "No active community posts.";
  const counts = posts.reduce<Record<PostType, number>>(
    (acc, post) => {
      acc[post.type] += 1;
      return acc;
    },
    { suggestion: 0, issue: 0, praise: 0, community: 0 }
  );

  return [
    `${posts.length} visible posts`,
    `${counts.suggestion} suggestions`,
    `${counts.issue} issues`,
    `${counts.praise} positive feedback items`,
    `${counts.community} community discussions`,
  ].join(" · ");
}

export default function ChatPage() {
  const [providerSettings, setProviderSettings] = useState<ProviderSettings>({
    provider: "anthropic",
    anthropicModel: "",
    openClawModel: "",
    openAiModel: "",
    ludicrousMode: false,
  });
  const [posts, setPosts] = useState<CommunityPost[]>(SEED_POSTS);
  const [filter, setFilter] = useState<"all" | PostType>("all");
  const [selectedPostId, setSelectedPostId] = useState<string>(SEED_POSTS[0].id);
  const [moderatorView, setModeratorView] = useState(false);
  const [author, setAuthor] = useState("You");
  const [postType, setPostType] = useState<PostType>("suggestion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<MayaMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProviderSettings(loadProviderSettings());
    setPosts(loadCommunityPosts());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filter !== "all" && post.type !== filter) return false;
      if (!moderatorView && post.flagged) return false;
      return true;
    });
  }, [filter, moderatorView, posts]);

  const selectedPost =
    filteredPosts.find((post) => post.id === selectedPostId) ?? filteredPosts[0] ?? null;

  useEffect(() => {
    if (
      filteredPosts.length > 0 &&
      !filteredPosts.some((p) => p.id === selectedPostId)
    ) {
      setSelectedPostId(filteredPosts[0].id);
    }
  }, [filteredPosts, selectedPostId]);

  function updateProviderSettings(next: ProviderSettings) {
    setProviderSettings(next);
    saveProviderSettings(next);
  }

  function addPost(e: FormEvent) {
    e.preventDefault();
    const nextTitle = title.trim();
    const nextContent = content.trim();
    if (!nextTitle || !nextContent) return;

    const newPost: CommunityPost = {
      id: `${Date.now()}`,
      author: author.trim() || "You",
      type: postType,
      title: nextTitle,
      content: nextContent,
      status: postType === "praise" ? "celebrating" : "open",
      flagged: false,
      pinned: false,
      createdAt: "Just now",
      reactions: { boost: 0, helpful: 0, love: 0 },
      replies: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setSelectedPostId(newPost.id);
    setTitle("");
    setContent("");
  }

  function updateReaction(postId: string, reaction: ReactionType) {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [reaction]: post.reactions[reaction] + 1,
              },
            }
          : post
      )
    );
  }

  function addReply(postId: string) {
    const draft = (replyDrafts[postId] || "").trim();
    if (!draft) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: [
                ...post.replies,
                { id: `${postId}-${Date.now()}`, author: author.trim() || "You", content: draft },
              ],
            }
          : post
      )
    );
    setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
  }

  function cycleStatus(postId: string) {
    const order: PostStatus[] = ["open", "reviewing", "resolved", "celebrating"];
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const nextIndex = (order.indexOf(post.status) + 1) % order.length;
        return { ...post, status: order[nextIndex] };
      })
    );
  }

  function toggleFlag(postId: string) {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, flagged: !post.flagged } : post
      )
    );
  }

  async function send(e: FormEvent | React.KeyboardEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: MayaMessage = { role: "user", content: text };
    const thread = [...messages, userMsg];
    setMessages([...thread, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace: "community",
          messages: thread,
          provider: providerSettings.provider,
          model: getProviderModel(providerSettings),
          ludicrousMode: providerSettings.ludicrousMode,
          communityContext: {
            selectedTopic: selectedPost
              ? `${selectedPost.title} (${TYPE_META[selectedPost.type].label})`
              : "No selected post",
            activeFilter: FILTERS.find((item) => item.key === filter)?.label,
            summary: selectedPost
              ? `${summarizePosts(filteredPosts)}. Selected post by ${selectedPost.author}: ${selectedPost.content}`
              : summarizePosts(filteredPosts),
          },
        }),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const payload = (await res.json()) as { error?: string };
          throw new Error(payload.error || "Provider request failed");
        }
        throw new Error((await res.text()) || "Provider request failed");
      }

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages([...thread, { role: "assistant", content: full }]);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Connection error. Check your provider configuration.";
      setMessages([...thread, { role: "assistant", content: message }]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_400px]">
      <section className="space-y-5">
        <div className="rounded-2xl border border-[#313244] bg-[#1e1e2e] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#89b4fa]">
                Community + Suggestions
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-[#cdd6f4]">
                Capture blog ideas, issues, praise, and peer input in one space.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#a6adc8]">
                Maya helps shape content, troubleshoot user pain, and surface what the
                community is telling you.
              </p>
            </div>
            <div className="rounded-xl border border-[#313244] bg-[#181825] px-4 py-3 text-xs text-[#a6adc8]">
              <p>{summarizePosts(filteredPosts)}</p>
              <button
                type="button"
                onClick={() => setModeratorView((value) => !value)}
                className={`mt-3 rounded-lg px-3 py-2 font-semibold transition-colors ${
                  moderatorView
                    ? "bg-[#f38ba8] text-[#1e1e2e]"
                    : "bg-[#313244] text-[#cdd6f4] hover:bg-[#45475a]"
                }`}
              >
                {moderatorView ? "Moderator view on" : "Moderator view off"}
              </button>
            </div>
          </div>
        </div>

        <form
          onSubmit={addPost}
          className="rounded-2xl border border-[#313244] bg-[#1e1e2e] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#cdd6f4]">Share with the community</h2>
              <p className="mt-1 text-xs text-[#6c7086]">
                Post a suggestion, report an issue, celebrate a win, or start a discussion.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[160px_180px_minmax(0,1fr)]">
            <label className="text-xs text-[#a6adc8]">
              <span className="mb-1 block font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                Name
              </span>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-xl border border-[#45475a] bg-[#313244] px-3 py-2 text-sm text-[#cdd6f4] focus:border-[#89b4fa] focus:outline-none"
              />
            </label>
            <label className="text-xs text-[#a6adc8]">
              <span className="mb-1 block font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                Type
              </span>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
                className="w-full rounded-xl border border-[#45475a] bg-[#313244] px-3 py-2 text-sm text-[#cdd6f4] focus:border-[#89b4fa] focus:outline-none"
              >
                {Object.entries(TYPE_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-[#a6adc8]">
              <span className="mb-1 block font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
                Title
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What should Maya or the community help with?"
                className="w-full rounded-xl border border-[#45475a] bg-[#313244] px-3 py-2 text-sm text-[#cdd6f4] placeholder-[#585b70] focus:border-[#89b4fa] focus:outline-none"
              />
            </label>
          </div>
          <label className="mt-3 block text-xs text-[#a6adc8]">
            <span className="mb-1 block font-semibold uppercase tracking-[0.07em] text-[#6c7086]">
              Post
            </span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Describe the suggestion, issue, feedback, or discussion you want the community to see."
              className="w-full rounded-2xl border border-[#45475a] bg-[#313244] px-3 py-3 text-sm text-[#cdd6f4] placeholder-[#585b70] focus:border-[#89b4fa] focus:outline-none"
            />
          </label>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-[#585b70]">
              Community posts stay local in this prototype workspace.
            </p>
            <button
              type="submit"
              className="rounded-xl bg-[#89b4fa] px-4 py-2 text-sm font-semibold text-[#1e1e2e] transition-colors hover:bg-[#b4d0fb]"
            >
              Publish post
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === item.key
                  ? "bg-[#89b4fa] text-[#1e1e2e]"
                  : "bg-[#313244] text-[#cdd6f4] hover:bg-[#45475a]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const selected = selectedPostId === post.id;
            return (
              <article
                key={post.id}
                className={`rounded-2xl border bg-[#1e1e2e] p-5 transition-colors ${
                  selected ? "border-[#89b4fa]" : `border-[#313244] ${TYPE_META[post.type].accent}`
                }`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedPostId(post.id)}
                    className="text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TYPE_META[post.type].badge}`}>
                        {TYPE_META[post.type].label}
                      </span>
                      <span className="rounded-full bg-[#313244] px-2.5 py-1 text-[11px] text-[#a6adc8]">
                        {STATUS_META[post.status]}
                      </span>
                      {post.pinned && (
                        <span className="rounded-full bg-[#45475a] px-2.5 py-1 text-[11px] text-[#f9e2af]">
                          Pinned
                        </span>
                      )}
                      {post.flagged && (
                        <span className="rounded-full bg-[#3a1f28] px-2.5 py-1 text-[11px] text-[#f38ba8]">
                          Flagged
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-[#cdd6f4]">{post.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#a6adc8]">{post.content}</p>
                    <p className="mt-3 text-xs text-[#6c7086]">
                      {post.author} · {post.createdAt}
                    </p>
                  </button>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {(["boost", "helpful", "love"] as ReactionType[]).map((reaction) => (
                      <button
                        key={reaction}
                        type="button"
                        onClick={() => updateReaction(post.id, reaction)}
                        className="rounded-full bg-[#313244] px-3 py-1.5 text-xs font-semibold text-[#cdd6f4] transition-colors hover:bg-[#45475a]"
                      >
                        {reaction} · {post.reactions[reaction]}
                      </button>
                    ))}
                    {moderatorView && (
                      <>
                        <button
                          type="button"
                          onClick={() => cycleStatus(post.id)}
                          className="rounded-full bg-[#1e2333] px-3 py-1.5 text-xs font-semibold text-[#89b4fa]"
                        >
                          Advance status
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFlag(post.id)}
                          className="rounded-full bg-[#3a1f28] px-3 py-1.5 text-xs font-semibold text-[#f38ba8]"
                        >
                          {post.flagged ? "Unflag" : "Flag"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-[#313244] pt-4">
                  <div className="space-y-3">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="rounded-xl bg-[#181825] px-3 py-2.5">
                        <p className="text-xs font-semibold text-[#89b4fa]">{reply.author}</p>
                        <p className="mt-1 text-sm text-[#cdd6f4]">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={replyDrafts[post.id] || ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      placeholder="Reply to this post"
                      className="flex-1 rounded-xl border border-[#45475a] bg-[#313244] px-3 py-2 text-sm text-[#cdd6f4] placeholder-[#585b70] focus:border-[#89b4fa] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addReply(post.id)}
                      className="rounded-xl bg-[#313244] px-3 py-2 text-sm font-semibold text-[#cdd6f4] transition-colors hover:bg-[#45475a]"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {filteredPosts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#313244] bg-[#1e1e2e] p-8 text-center text-sm text-[#6c7086]">
              No posts match this view yet.
            </div>
          )}
        </div>
      </section>

      <aside className="flex min-h-[720px] flex-col rounded-2xl border border-[#313244] bg-[#1e1e2e]">
        <div className="border-b border-[#313244] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#89b4fa]">
            Maya Assistant
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[#cdd6f4]">
            Respond to the feed and shape the next post.
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#a6adc8]">
            Ask Maya to turn a signal into a blog idea, diagnose an issue, or draft a thoughtful community reply.
          </p>
        </div>
        <div className="border-b border-[#313244] px-5 py-4">
          <ProviderControls
            settings={providerSettings}
            onChange={updateProviderSettings}
            compact
          />
        </div>
        <div className="border-b border-[#313244] px-5 py-4 text-sm text-[#a6adc8]">
          <p className="font-semibold text-[#cdd6f4]">Selected context</p>
          <p className="mt-2 text-xs text-[#6c7086]">{summarizePosts(filteredPosts)}</p>
          {selectedPost ? (
            <div className="mt-3 rounded-xl bg-[#181825] p-3">
              <p className="text-xs font-semibold text-[#89b4fa]">
                {selectedPost.author} · {TYPE_META[selectedPost.type].label}
              </p>
              <p className="mt-1 text-sm text-[#cdd6f4]">{selectedPost.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-[#a6adc8]">{selectedPost.content}</p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-[#6c7086]">Select a post to give Maya more context.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-full bg-[#313244] px-3 py-1.5 text-[11px] font-semibold text-[#cdd6f4] transition-colors hover:bg-[#45475a]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="max-w-xs text-center text-sm leading-relaxed text-[#585b70]">
                Ask Maya to summarize trends, sharpen a suggestion, or help respond to a user issue.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[92%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-[#89b4fa] text-[#1e1e2e]"
                        : "border border-[#313244] bg-[#181825] text-[#cdd6f4]"
                    }`}
                  >
                    {message.content || (
                      <span className="inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-[#89b4fa] align-middle" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
        <form onSubmit={send} className="border-t border-[#313244] px-5 py-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  send(e);
                }
              }}
              rows={3}
              placeholder="Ask Maya about the community, a suggestion, or a user issue…"
              className="flex-1 rounded-2xl border border-[#45475a] bg-[#313244] px-3 py-3 text-sm text-[#cdd6f4] placeholder-[#585b70] focus:border-[#89b4fa] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="rounded-2xl bg-[#89b4fa] px-4 py-3 text-sm font-semibold text-[#1e1e2e] transition-colors hover:bg-[#b4d0fb] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[#585b70]">
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </aside>
    </div>
  );
}
