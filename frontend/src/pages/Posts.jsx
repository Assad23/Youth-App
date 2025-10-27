import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyContent, setReplyContent] = useState({});

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:4000/posts');
      setPosts(res.data);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:4000/posts', { content, imageUrl });
      setContent('');
      setImageUrl('');
      fetchPosts();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Failed to create post');
    }
    setSubmitting(false);
  };

  const handleReply = async (postId, reply) => {
    if (!reply) return;
    try {
      await axios.post(`http://localhost:4000/posts/${postId}/reply`, { content: reply });
      setReplyContent({ ...replyContent, [postId]: '' });
      fetchPosts();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Failed to reply');
    }
  };

  return (
    <div className="container">
      <h2>Posts</h2>
      <form onSubmit={handleCreatePost}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
        />
        <button type="submit" disabled={submitting}>Post</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="card" style={{ animation: 'fadeIn 0.5s' }}>
            <p>
              <strong>{post.username}</strong> •{' '}
              <small>{new Date(post.createdAt).toLocaleString()}</small>
            </p>
            <p>{post.content}</p>
            {post.imageUrl && <img src={post.imageUrl} alt="post" style={{ maxWidth: '100%' }} />}
            <div style={{ marginTop: '1rem' }}>
              {post.comments.map(comment => (
                <div key={comment.id} style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
                  <p>
                    <strong>{comment.username}</strong> •{' '}
                    <small>{new Date(comment.createdAt).toLocaleString()}</small>
                  </p>
                  <p>{comment.content}</p>
                </div>
              ))}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleReply(post.id, replyContent[post.id]);
                }}
              >
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyContent[post.id] || ''}
                  onChange={e => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                />
                <button type="submit">Reply</button>
              </form>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Posts;
