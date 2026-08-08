import { Link } from "react-router-dom";

type Props = {
  video: {
    id: string;
    title: string;
    thumbnail_url?: string | null;
    category?: string | null;
    created_at?: string;
    view_count?: number;
    like_count?: number;
    comments_count?: number;
  };
};

const VideoCard = ({ video }: Props) => {
  return (
    <Link to={`/videos/${video.id}`} className="block rounded-lg overflow-hidden border border-border hover:shadow-md">
      <div className="relative w-full h-44 bg-muted overflow-hidden">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No thumbnail</div>
        )}
        <div className="absolute inset-2 flex items-start justify-end">
          <div className="bg-black/40 text-white px-2 py-1 rounded">▶</div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2">{video.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{video.category ?? "Uncategorized"} • {video.created_at ? new Date(video.created_at).toLocaleDateString() : ''}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
          <span>👁 {video.view_count ?? 0}</span>
          <span>❤️ {video.like_count ?? 0}</span>
          <span>💬 {video.comments_count ?? 0}</span>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
