import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Flame,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  PenSquare,
  Search,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

const categories = [
  'AI Product Manager Community',
  'Foundation Models',
  'AI Hardware',
  'Product Strategy',
  'Ethics & Governance',
  'User Research',
  'Launch & GTM',
];

const trendingTopics = [
  { title: 'ChatGPT-4o', tag: 'GPT-4o', trend: '+32%', category: 'Foundation Models' },
  { title: 'Claude 3.5 Sonnet', tag: 'Claude', trend: '+21%', category: 'Multimodal LLMs' },
  { title: 'AI Agent', tag: 'AI Agent', trend: '+18%', category: 'Autonomous Systems' },
  { title: 'Multimodal LLMs', tag: 'MM LLMs', trend: '+15%', category: 'AIGC' },
  { title: 'AIGC', tag: 'AIGC', trend: '+11%', category: 'Generative AI' },
];

const communityActivity = [
  {
    user: 'Mike Design',
    action: 'joined Foundational Models track',
    time: '2m ago',
  },
  {
    user: 'Jordan AI',
    action: 'shared a new post in Product Strategy',
    time: '12m ago',
  },
  {
    user: 'Sarah ProductOps',
    action: 'commented on “GPT-4o Product Strategy”',
    time: '24m ago',
  },
  {
    user: 'Ava Metrics',
    action: 'started a poll in Research Insights',
    time: '42m ago',
  },
];

const basePosts = [
  {
    id: '1',
    category: 'Product Strategy',
    type: 'Text Post',
    title: 'Building AI Products: Lessons from 5 Years in the Trenches',
    author: 'Jordan AI',
    time: '3 days ago',
    description:
      'Sharing key insights from building AI-powered products at scale. These are the lessons I wish I had known when starting my journey as an AI Product Manager — start with the problem, not the technology.',
    comments: 31,
    shares: 12,
    saves: 54,
  },
  {
    id: '2',
    category: 'Foundation Models',
    type: 'Link Post',
    title: 'OpenAI GPT-4o vs Anthropic Claude: Technical Deep Dive',
    author: 'Foundation Mods',
    time: '1 day ago',
    description:
      'Detailed comparison across reasoning, latency, and enterprise readiness. Includes benchmark results and recommended product use cases. “GPT-4o Strengths” + “Superior code generation”, etc.',
    comments: 19,
    shares: 9,
    saves: 37,
  },
  {
    id: '3',
    category: 'AI Hardware',
    type: 'Image Post',
    title: 'Latest GPU Benchmark Results for AI Training',
    author: 'Ava Metrics',
    time: '5 hours ago',
    description:
      'Initial cross-foundation benchmark comparing RTX 4090, H100, and MI300 for large-parallel training loads. Charts include power usage and throughput data for comparable workloads.',
    comments: 12,
    shares: 7,
    saves: 29,
  },
];

const communityStats = [
  { label: 'Community Stats', value: '12.5K', subLabel: 'Professional Members' },
  { label: 'Active Users', value: '8.9K', subLabel: 'Monthly Active' },
  { label: 'Quality Posts', value: '45.6K', subLabel: 'Verified Insights' },
];

const PostTypeTabs = ['Text Post', 'Link Post', 'Image Post'];

function Navigation({ current, onNavigate, onCreatePost }) {
  return (
    <aside className="hidden h-full w-64 flex-col gap-6 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-rose-100/60 lg:flex">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Navigation</p>
        {['Home', 'Hot', 'New', 'Top'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onNavigate(item.toLowerCase())}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-rose-50/80 ${
              current === item.toLowerCase() ? 'bg-rose-100/80 text-rose-600' : 'text-slate-600'
            }`}
          >
            <span>{item}</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-rose-400 via-rose-500 to-amber-400 p-4 text-white shadow-lg">
          <Sparkles className="h-9 w-9" />
          <div>
            <p className="text-sm font-semibold">Ready to share an insight?</p>
            <p className="text-xs text-white/80">Post your AI product discovery.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCreatePost}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
        >
          <PenSquare className="h-4 w-4" />
          Create Post
        </button>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Categories</p>
        <ul className="space-y-2 text-sm text-slate-600">
          {categories.map((category) => (
            <li key={category} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-rose-50/70">
              <span>{category}</span>
              <ArrowUpRight className="h-4 w-4 text-rose-400" />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function HeroBanner({ onCreatePost }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 via-white to-amber-50 p-8 shadow-sm ring-1 ring-rose-100/60">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/80 p-3 shadow-sm">
              <Users className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
                AI Product Manager Community
              </p>
              <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                Welcome to the AI Product Manager Community!
              </h1>
            </div>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 lg:text-base">
            Connect with AI product managers worldwide to discuss technology trends and share insights.
            Dive into curated conversations, benchmark data, and best practices from builders at scale.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm">
              <Sparkles className="h-4 w-4 text-rose-500" />12.5K+ Professional Members
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm">
              <Flame className="h-4 w-4 text-amber-500" />8.9K+ Active Sessions
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm">
              <Star className="h-4 w-4 text-rose-400" />45.6K+ Quality Posts
            </span>
          </div>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-3 rounded-2xl bg-white/80 p-6 shadow-inner ring-1 ring-rose-100">
          <p className="text-sm font-semibold text-slate-700">Ready to contribute?</p>
          <p className="text-xs text-slate-500">
            Share your product updates, experiments, and lessons learned with thousands of peers.
          </p>
          <button
            type="button"
            onClick={onCreatePost}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
          >
            <PenSquare className="h-4 w-4" /> Start a post
          </button>
        </div>
      </div>
    </section>
  );
}

function PostCard({ post }) {
  return (
    <article className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-rose-100/60">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-rose-400">
        <span>{post.category}</span>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] text-rose-500">{post.type}</span>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-900">{post.title}</h3>
        <p className="text-sm text-slate-500">
          by <span className="font-semibold text-rose-500">{post.author}</span> · {post.time}
        </p>
        <p className="text-sm leading-relaxed text-slate-600">{post.description}</p>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 font-medium text-rose-500">
          <MessageCircle className="h-4 w-4" /> {post.comments} Comments
        </div>
        <button type="button" className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
          <Share2 className="h-4 w-4 text-rose-400" /> Share
        </button>
        <button type="button" className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
          <Bookmark className="h-4 w-4 text-rose-400" /> Save
        </button>
      </div>
    </article>
  );
}

function RightRail({ onSignIn, onSignUp, onHome }) {
  return (
    <aside className="flex w-full flex-col gap-6 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-rose-100/60 lg:w-72">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Community Stats</p>
          <TrendingUp className="h-4 w-4 text-rose-400" />
        </div>
        <ul className="space-y-3">
          {communityStats.map((stat) => (
            <li key={stat.label} className="rounded-2xl bg-rose-50/60 p-4">
              <p className="text-xs font-semibold text-rose-400">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.subLabel}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Trending Topics</p>
          <Flame className="h-4 w-4 text-amber-500" />
        </div>
        <ul className="space-y-3">
          {trendingTopics.map((topic) => (
            <li key={topic.title} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-slate-700">{topic.title}</p>
                <p className="text-xs text-slate-400">#{topic.tag} · {topic.category}</p>
              </div>
              <span className="text-xs font-semibold text-rose-500">{topic.trend}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Community Activity</p>
        <ul className="space-y-2 text-xs text-slate-500">
          {communityActivity.map((activity) => (
            <li key={`${activity.user}-${activity.time}`} className="rounded-xl bg-rose-50/60 px-4 py-3">
              <p>
                <span className="font-semibold text-slate-700">{activity.user}</span> {activity.action}
              </p>
              <p className="mt-1 text-[11px] text-rose-400">{activity.time}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onSignIn}
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-rose-600"
        >
          <LogIn className="h-4 w-4" /> Sign In
        </button>
        <button
          type="button"
          onClick={onSignUp}
          className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50"
        >
          <Users className="h-4 w-4" /> Sign Up Free
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2 text-xs font-medium text-slate-400 hover:text-rose-400"
        >
          <Home className="h-4 w-4" /> Back to Home
        </button>
      </div>
    </aside>
  );
}

function AuthLayout({ mode, onBack, onSwitch }) {
  const isSignIn = mode === 'signin';
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-xl flex-col gap-8 rounded-[36px] bg-white/80 p-10 shadow-xl ring-1 ring-rose-100/70">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </button>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-amber-300 to-rose-500 text-4xl font-bold text-white shadow-lg">
          AI
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">AI Product Manager Community</h2>
          <p className="mt-2 text-sm text-slate-500">{isSignIn ? 'Welcome back!' : 'Join our professional platform'}</p>
        </div>
      </div>
      <div className="rounded-2xl bg-rose-50/60 p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSwitch('signin')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              isSignIn ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => onSwitch('signup')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              !isSignIn ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>
      <form className="space-y-5">
        {!isSignIn ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Email Address</label>
          <input
            type="email"
            placeholder="Enter email address"
            className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Password</label>
          <input
            type="password"
            placeholder={isSignIn ? 'Enter password' : 'At least 6 characters'}
            className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
          />
        </div>
        {!isSignIn ? (
          <p className="text-xs text-slate-400">By signing up you agree to our community guidelines.</p>
        ) : null}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 hover:bg-rose-600"
        >
          {isSignIn ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      {isSignIn ? (
        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitch('signup')}
            className="font-semibold text-rose-500 hover:text-rose-600"
          >
            Sign Up Free
          </button>
        </p>
      ) : (
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitch('signin')}
            className="font-semibold text-rose-500 hover:text-rose-600"
          >
            Sign In
          </button>
        </p>
      )}
    </div>
  );
}

function CreatePost({ categories, onBack, onSubmit }) {
  const [activeType, setActiveType] = useState('Text Post');
  const [form, setForm] = useState({ category: '', title: '', content: '' });

  const isDisabled = !form.category || !form.title || !form.content;

  const handleSubmit = () => {
    if (isDisabled) return;
    onSubmit({ ...form, type: activeType });
    setForm({ category: '', title: '', content: '' });
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-[32px] bg-white/80 p-10 shadow-xl ring-1 ring-rose-100/70">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </button>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Create Post</h2>
        <p className="text-sm text-slate-500">Share your thoughts and experiences with the community.</p>
      </div>
      <div className="space-y-6 rounded-3xl bg-rose-50/60 p-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Select Post Type</p>
          <div className="grid gap-3 md:grid-cols-3">
            {PostTypeTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveType(tab)}
                className={`flex flex-col items-start gap-1 rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                  activeType === tab
                    ? 'border-rose-300 bg-white shadow-sm text-rose-500'
                    : 'border-transparent bg-white/60 text-slate-500 hover:border-rose-200'
                }`}
              >
                <span>{tab}</span>
                <span className="text-xs font-normal text-slate-400">
                  {tab === 'Text Post' && 'Share stories, strategies, or insights.'}
                  {tab === 'Link Post' && 'Highlight interesting websites or articles.'}
                  {tab === 'Image Post' && 'Share images or screenshots.'}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Select Category *</label>
            <select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            >
              <option value="">Please select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Post Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Enter an engaging title..."
              className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Post Details *</label>
          <textarea
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            placeholder="Enter detailed content, Markdown supported..."
            rows={6}
            className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-3xl bg-white/70 p-6 shadow-inner">
        <p className="text-sm font-semibold text-slate-600">Posts will appear in the selected category</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition ${
              isDisabled ? 'cursor-not-allowed bg-rose-200/70' : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            Publish Post
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [feedFilter, setFeedFilter] = useState('hot');
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState(basePosts);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (!normalizedSearch) return true;
      return (
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.description.toLowerCase().includes(normalizedSearch) ||
        post.category.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [posts, search]);

  const handlePublish = (payload) => {
    const newPost = {
      id: String(Date.now()),
      category: payload.category,
      type: payload.type,
      title: payload.title,
      author: 'You',
      time: 'Just now',
      description: payload.content,
      comments: 0,
      shares: 0,
      saves: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
    setActivePage('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-amber-50 to-white px-4 pb-20 pt-10 text-slate-900">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-rose-100/60 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-rose-500 to-amber-400 p-3 text-white shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI Product Manager Community</h1>
            <p className="text-xs text-slate-500">Professional Platform</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-3 lg:justify-end">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-300" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              placeholder="Search posts, users, or content..."
              className="w-full rounded-2xl border border-rose-100 bg-white py-3 pl-12 pr-4 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePage('signin')}
              className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActivePage('signup')}
              className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-200 hover:bg-rose-600"
            >
              <LogOut className="h-4 w-4 rotate-180" /> Sign Up
            </button>
          </div>
        </div>
      </header>

      {activePage === 'home' ? (
        <main className="mx-auto mt-10 flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
          <Navigation current={feedFilter} onNavigate={setFeedFilter} onCreatePost={() => setActivePage('create')} />
          <div className="flex-1 space-y-6">
            <HeroBanner onCreatePost={() => setActivePage('create')} />
            <section className="flex items-center justify-between rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-rose-100/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
                <Sparkles className="h-4 w-4" /> Community Posts
              </div>
              <div className="flex gap-2">
                {['Hot', 'New', 'Top'].map((label) => {
                  const value = label.toLowerCase();
                  const isActive = feedFilter === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFeedFilter(value)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-500 hover:bg-rose-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {filteredPosts.length === 0 ? (
                <div className="rounded-3xl bg-white/70 p-8 text-center text-sm text-slate-500 shadow-inner">
                  No posts found. Try adjusting your search.
                </div>
              ) : null}
            </div>
          </div>
          <RightRail
            onSignIn={() => setActivePage('signin')}
            onSignUp={() => setActivePage('signup')}
            onHome={() => setActivePage('home')}
          />
        </main>
      ) : null}

      {activePage === 'signin' || activePage === 'signup' ? (
        <div className="mx-auto mt-14 flex w-full max-w-4xl justify-center">
          <AuthLayout
            mode={activePage === 'signin' ? 'signin' : 'signup'}
            onBack={() => setActivePage('home')}
            onSwitch={(mode) => setActivePage(mode)}
          />
        </div>
      ) : null}

      {activePage === 'create' ? (
        <div className="mx-auto mt-14 flex w-full max-w-5xl justify-center">
          <CreatePost categories={categories} onBack={() => setActivePage('home')} onSubmit={handlePublish} />
        </div>
      ) : null}
    </div>
  );
}
