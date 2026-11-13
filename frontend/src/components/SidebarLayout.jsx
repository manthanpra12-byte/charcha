import TopicSidebar from './TopicSidebar';

// Two columns on large screens: topic sidebar + page content. On mobile the sidebar is hidden
// (the "Topics" link in the navbar replaces it).
export default function SidebarLayout({ children }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <div className="hidden lg:block">
        <div className="sticky top-20">
          <TopicSidebar />
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}