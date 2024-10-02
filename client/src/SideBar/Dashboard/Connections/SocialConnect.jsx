import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, List, ListItem, ListItemText, 
  Avatar, Paper, Grid, Card, CardContent, CardMedia, CardActions,
  IconButton
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MessageIcon from '@mui/icons-material/Message';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';

// Reusable components
const SectionCard = ({ title, children }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    {children}
  </Paper>
);

const UserListItem = ({ user, onConnect, onMessage }) => (
  <ListItem>
    <Avatar src={user.avatar} sx={{ mr: 2 }} />
    <ListItemText primary={user.name} />
    <Button onClick={() => onConnect(user.id)} startIcon={<PersonAddIcon />} size="small">Connect</Button>
    <Button onClick={() => onMessage(user.id)} startIcon={<MessageIcon />} size="small">Message</Button>
  </ListItem>
);

const FeedPost = ({ post }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={post.avatar} sx={{ mr: 2 }} />
        <Typography variant="subtitle1">{post.userName}</Typography>
      </Box>
      <Typography variant="body1" gutterBottom>{post.content}</Typography>
    </CardContent>
    {post.image && <CardMedia component="img" height="200" image={post.image} alt="Post image" />}
    <CardActions>
      <Button startIcon={<ThumbUpIcon />} size="small">Like</Button>
      <Button startIcon={<CommentIcon />} size="small">Comment</Button>
      <Button startIcon={<ShareIcon />} size="small">Share</Button>
    </CardActions>
  </Card>
);

export const SocialPage = () => {
    const [suggestedUsers, setSuggestedUsers] = useState([
      { id: 1, name: 'John Doe', avatar: '/path/to/avatar1.jpg' },
      { id: 2, name: 'Jane Smith', avatar: '/path/to/avatar2.jpg' }
    ]);
  
    const [feedPosts, setFeedPosts] = useState([
      { id: 1, userName: 'Alice Johnson', avatar: '/path/to/avatar3.jpg', content: 'Just finished a great run!', image: '/path/to/run.jpg' },
      { id: 2, userName: 'Bob Smith', avatar: '/path/to/avatar4.jpg', content: 'Check out this new gear I got!', image: '/path/to/gear.jpg' },
    ]);
  
    const [newPost, setNewPost] = useState('');
  
    const handleConnect = (userId) => {
      console.log(`Connect with user ID: ${userId}`);
    };
  
    const handleMessage = (userId) => {
      console.log(`Send message to user ID: ${userId}`);
    };
  
    const importFriends = (platform) => {
      console.log(`Importing friends from ${platform}`);
    };
  
    const handlePostSubmit = () => {
      if (newPost.trim()) {
        const post = {
          id: Date.now(),
          userName: 'Current User',
          avatar: '/path/to/current-user-avatar.jpg',
          content: newPost,
        };
        setFeedPosts([post, ...feedPosts]);
        setNewPost('');
      }
    };
  
    return (
      <Box sx={{ p: 3 }}>
        {/* Banner Image */}
        <Box sx={{ height: 200, width: '100%', overflow: 'hidden', mb: 3 }}>
          <img src="/path/to/banner-image.jpg" alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
        <Typography variant="h4" gutterBottom>Welcome Back!</Typography>
        
        <Grid container spacing={3}>
          {/* Create a Post */}
          <Grid item xs={12} md={6}>
            <SectionCard title="Create a Post">
              <TextField 
                label="What's on your mind?" 
                variant="outlined" 
                fullWidth 
                multiline
                rows={3}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                sx={{ mb: 2 }} 
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <IconButton color="primary">
                  <ImageIcon />
                </IconButton>
                <Button 
                  variant="contained" 
                  color="primary" 
                  endIcon={<SendIcon />}
                  onClick={handlePostSubmit}
                >
                  Post
                </Button>
              </Box>
            </SectionCard>
          </Grid>
  
          {/* Import Friends */}
          <Grid item xs={12} md={6}>
            <SectionCard title="Import Friends">
              <Button onClick={() => importFriends('Facebook')} startIcon={<ImportContactsIcon />} sx={{ mr: 1 }}>
                Facebook
              </Button>
              <Button onClick={() => importFriends('Strava')} startIcon={<ImportContactsIcon />}>
                Strava
              </Button>
            </SectionCard>
          </Grid>
  
          {/* Connect with Users */}
          <Grid item xs={12} md={4}>
            <SectionCard title="Connect with Others">
              <List>
                {suggestedUsers.map((user) => (
                  <UserListItem 
                    key={user.id} 
                    user={user} 
                    onConnect={handleConnect} 
                    onMessage={handleMessage} 
                  />
                ))}
              </List>
            </SectionCard>
          </Grid>
  
          {/* Social Feed */}
          <Grid item xs={12} md={8}>
            <SectionCard title="Your Feed">
              {feedPosts.map((post) => (
                <FeedPost key={post.id} post={post} />
              ))}
            </SectionCard>
          </Grid>
        </Grid>
      </Box>
    );
  };