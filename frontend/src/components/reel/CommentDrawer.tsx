// src/components/reel/CommentDrawer.tsx
import { X } from 'lucide-react';
import type { Comment } from '../../types/reel.types';

interface ReplyTarget {
  id: string;
  name: string;
}

interface CommentDrawerProps {
  comments: Comment[];
  loading: boolean;
  commentInput: string;
  adding: boolean;
  error: string;
  replyingTo: ReplyTarget | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (val: string) => void;
  onReply: (comment: Comment) => void;
  onCancelReply: () => void;
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  onReply: (comment: Comment) => void;
}

function CommentItem({ comment, replies, onReply }: CommentItemProps) {
  return (
    <div className="flex gap-3 mb-4">
      <img
        src={comment.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'U')}&background=374151&color=fff`}
        className="w-8 h-8 rounded-full object-cover shrink-0"
        alt={comment.user?.name}
      />
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-400">
          {comment.user?.name}
          {comment.createdAt && (
            <span className="text-gray-600 font-normal ml-2">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          )}
        </p>
        <p className="text-sm text-white leading-tight mt-0.5">{comment.text}</p>
        <button
          onClick={() => onReply(comment)}
          className="text-[10px] font-semibold text-gray-500 mt-1 hover:text-white"
        >
          Reply
        </button>

        {replies.length > 0 && (
          <div className="mt-2 pl-2 border-l-2 border-gray-800">
            {replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} replies={[]} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentDrawer({
  comments,
  loading,
  commentInput,
  adding,
  error,
  replyingTo,
  inputRef,
  onClose,
  onSubmit,
  onInputChange,
  onReply,
  onCancelReply,
}: CommentDrawerProps) {
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId?.toString() === parentId);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900/95 rounded-t-2xl w-full max-w-md mx-auto h-[70vh] flex flex-col shadow-2xl animate-slideUp border-t border-white/10 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>

        <h2 className="text-sm font-bold mb-2 text-center text-white border-b border-gray-700 pb-2">
          {comments.length} comments
        </h2>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Be the first to comment!</div>
          ) : (
            rootComments.map((c) => (
              <CommentItem key={c._id} comment={c} replies={getReplies(c._id)} onReply={onReply} />
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-700 bg-black/20">
          {replyingTo && (
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2 px-2">
              <span>
                Replying to <b>{replyingTo.name}</b>
              </span>
              <button onClick={onCancelReply} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {error && <p className="text-red-400 text-xs mb-2 px-2">{error}</p>}
          <form onSubmit={onSubmit} className="flex gap-2 items-center">
            <input
              ref={inputRef}
              value={commentInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : 'Add a comment...'}
              className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
            <button
              type="submit"
              className="text-pink-500 font-bold text-sm px-2 disabled:opacity-50"
              disabled={!commentInput.trim() || adding}
            >
              {adding ? '...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
