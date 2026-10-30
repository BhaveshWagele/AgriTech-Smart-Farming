import express from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

// Get Community Posts
router.get('/posts', (req, res) => {
  try {
    const { category, search } = req.query;
    let posts = db.communityPosts.all();

    if (category && category !== 'All') {
      posts = posts.filter((p: any) => p.category === category);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      posts = posts.filter((p: any) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q)
      );
    }

    // Attach comments to each post
    const postsWithComments = posts.map((post: any) => {
      const comments = db.comments.find((c: any) => c.postId === post._id);
      return {
        ...post,
        comments,
        commentsCount: comments.length
      };
    });

    return res.json({ success: true, count: postsWithComments.length, data: postsWithComments });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create Post
router.post('/posts', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { title, content, category = 'General Farming', tags = [], imageUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Post title and description are required.' });
    }

    const newPost = db.communityPosts.create({
      userId: req.user!._id,
      authorName: req.user!.name,
      authorRole: req.user!.role,
      title: title.trim(),
      content: content.trim(),
      category,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      likes: [],
      likesCount: 0,
      commentsCount: 0,
      imageUrl: imageUrl || '',
      isModerated: false
    });

    return res.status(201).json({ success: true, message: 'Discussion post published!', data: newPost });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Like / Upvote Toggle
router.post('/posts/:id/like', authenticate, (req: AuthenticatedRequest, res) => {
  const post = db.communityPosts.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  const userId = req.user!._id;
  let likes: string[] = post.likes || [];

  if (likes.includes(userId)) {
    likes = likes.filter(id => id !== userId);
  } else {
    likes.push(userId);
  }

  const updated = db.communityPosts.findByIdAndUpdate(req.params.id, {
    likes,
    likesCount: likes.length
  });

  return res.json({ success: true, data: updated });
});

// Add Comment
router.post('/posts/:id/comments', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const post = db.communityPosts.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const newComment = db.comments.create({
      postId: req.params.id,
      userId: req.user!._id,
      authorName: req.user!.name,
      authorRole: req.user!.role,
      content: content.trim()
    });

    const currentComments = db.comments.find((c: any) => c.postId === req.params.id);
    db.communityPosts.findByIdAndUpdate(req.params.id, {
      commentsCount: currentComments.length
    });

    return res.status(201).json({ success: true, message: 'Comment added.', data: newComment });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Post (Author or Admin)
router.delete('/posts/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const post = db.communityPosts.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  if (post.userId !== req.user!._id && req.user!.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this discussion post.' });
  }

  db.communityPosts.findByIdAndDelete(req.params.id);
  return res.json({ success: true, message: 'Post deleted successfully.' });
});

export default router;
