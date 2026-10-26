import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Like } from '../models/Like.js';
import { Follow } from '../models/Follow.js';
import { Bookmark } from '../models/Bookmark.js';
import { Notification } from '../models/Notification.js';

const DEMO_PASSWORD = 'Password123!';

const SAMPLE_USERS = [
  {
    username: 'alex_rivers',
    displayName: 'Alex Rivers',
    email: 'alex@connectify.dev',
    bio: 'Lead Frontend Architect & Design Systems obsessive. Building the future of social computing with React and Vite. 🚀',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    website: 'https://alexrivers.design',
    location: 'San Francisco, CA',
    isVerified: true,
  },
  {
    username: 'sophia_chen',
    displayName: 'Sophia Chen',
    email: 'sophia@connectify.dev',
    bio: 'AI researcher, generative artist & creative coder. Exploring latent spaces and human-computer symbiosis. ✨',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    website: 'https://sophiachen.ai',
    location: 'Seattle, WA',
    isVerified: true,
  },
  {
    username: 'marcus_v',
    displayName: 'Marcus Vance',
    email: 'marcus@connectify.dev',
    bio: 'Full-stack craftsman & open source enthusiast. TypeScript, Node.js, distributed databases, and mechanical keyboards. ☕💻',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    website: 'https://marcusv.dev',
    location: 'Austin, TX',
    isVerified: false,
  },
  {
    username: 'elena_rostova',
    displayName: 'Elena Rostova',
    email: 'elena@connectify.dev',
    bio: 'Creative Director at Studio Prism. Passionate about brutalist typography, micro-interactions, and high-fashion aesthetics. 🎨',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
    website: 'https://studioprism.co',
    location: 'Berlin, Germany',
    isVerified: true,
  },
  {
    username: 'dev_demo',
    displayName: 'Connectify Explorer',
    email: 'demo@connectify.dev',
    bio: 'Official demo test account. Feel free to post, like, comment, follow, and customize settings! 🌟',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    website: 'https://connectify.app',
    location: 'Cyberspace',
    isVerified: false,
  },
];

const SAMPLE_POSTS = [
  {
    authorUsername: 'alex_rivers',
    content: 'Just deployed our new component design system! The harmony between electric violet accents, glassmorphic card borders, and fluid 60fps animations feels incredible. What does your dream social platform look like? #design #webdev #react #frontend',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
      },
    ],
    hashtags: ['design', 'webdev', 'react', 'frontend'],
  },
  {
    authorUsername: 'sophia_chen',
    content: 'Experimenting with neural diffusion rendering in the browser using WebGPU. It is astonishing how fast modern web standards have evolved over the last 12 months. #ai #innovation #tech #webgpu',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
      },
      {
        url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
      },
    ],
    hashtags: ['ai', 'innovation', 'tech', 'webgpu'],
  },
  {
    authorUsername: 'elena_rostova',
    content: 'Morning inspiration from the architectural exhibition in Berlin. The interplay of brutalist concrete curves with translucent glass lights up the soul. 🏛️✨ #architecture #design #art #inspiration',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
      },
    ],
    hashtags: ['architecture', 'design', 'art', 'inspiration'],
  },
  {
    authorUsername: 'marcus_v',
    content: 'Late night debugging session conquered! Turned out a stale websocket room subscription was causing duplicated events on connection flap. Always test client reconnect logic thoroughly folks! ⚡🛠️ #coding #javascript #nodejs #debugging',
    media: [],
    hashtags: ['coding', 'javascript', 'nodejs', 'debugging'],
  },
  {
    authorUsername: 'alex_rivers',
    content: 'Hot take: 90% of user interface delight comes from getting the micro-interactions, subtle button states, and font line-height right before adding any heavy 3D assets. Keep it crisp, fast, and tactile. ⚡ #ui #ux #webdev',
    media: [],
    hashtags: ['ui', 'ux', 'webdev'],
  },
  {
    authorUsername: 'sophia_chen',
    content: 'Sunset walk after a long research sprint. Nature always has the best color palettes. 🌅 #nature #sunset #mindfulness #colors',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
      },
    ],
    hashtags: ['nature', 'sunset', 'mindfulness', 'colors'],
  },
];

export async function seedDatabase() {
  console.log('🌱 Starting Connectify Seed Process...');
  await connectDB();

  try {
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Follow.deleteMany({}),
      Bookmark.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('👤 Creating users...');
    const userDocs = {};
    for (const u of SAMPLE_USERS) {
      const created = await User.create({
        ...u,
        password: DEMO_PASSWORD,
      });
      userDocs[u.username] = created;
    }
    console.log(`✅ Created ${Object.keys(userDocs).length} users. (Default password: ${DEMO_PASSWORD})`);

    console.log('📝 Creating posts...');
    const createdPosts = [];
    for (const p of SAMPLE_POSTS) {
      const author = userDocs[p.authorUsername];
      const post = await Post.create({
        author: author._id,
        content: p.content,
        media: p.media,
        hashtags: p.hashtags,
      });
      author.postsCount += 1;
      await author.save();
      createdPosts.push(post);
    }
    console.log(`✅ Created ${createdPosts.length} posts.`);

    console.log('🤝 Establishing follow relationships...');
    const usersList = Object.values(userDocs);
    for (let i = 0; i < usersList.length; i++) {
      for (let j = 0; j < usersList.length; j++) {
        if (i !== j && (i + j) % 2 === 0) {
          const follower = usersList[i];
          const following = usersList[j];
          await Follow.create({ follower: follower._id, following: following._id });
          follower.followingCount += 1;
          following.followersCount += 1;
          await follower.save();
          await following.save();
        }
      }
    }
    console.log('✅ Established follows and updated stats.');

    console.log('💬 Creating comments and likes...');
    const commentTexts = [
      'This is stunning! Loving the typography and attention to detail. 🔥',
      'Totally agree with this perspective. Micro-animations make all the difference.',
      'Super clean implementation! What state management library are you using?',
      'Incredible colors here. Bookmarked for inspiration! ✨',
      'Great points Marcus. Reconnection handling is so often overlooked.',
    ];

    for (let i = 0; i < createdPosts.length; i++) {
      const post = createdPosts[i];
      // Add likes from 2-3 users
      const likers = usersList.slice(0, (i % 3) + 2);
      for (const liker of likers) {
        await Like.create({ user: liker._id, post: post._id });
        post.likesCount += 1;
      }

      // Add a comment
      const commenter = usersList[(i + 1) % usersList.length];
      const comment = await Comment.create({
        post: post._id,
        author: commenter._id,
        content: commentTexts[i % commentTexts.length],
      });
      post.commentsCount += 1;

      // Add a bookmark for demo user
      if (i % 2 === 0) {
        await Bookmark.create({ user: userDocs['dev_demo']._id, post: post._id });
        post.bookmarksCount += 1;
      }

      await post.save();
    }
    console.log('✅ Added likes, comments, and bookmarks.');

    console.log('🔔 Creating sample notifications for demo user...');
    const demoUser = userDocs['dev_demo'];
    await Notification.create({
      recipient: demoUser._id,
      sender: userDocs['alex_rivers']._id,
      type: 'follow',
      read: false,
    });
    if (createdPosts[0]) {
      await Notification.create({
        recipient: demoUser._id,
        sender: userDocs['sophia_chen']._id,
        type: 'like',
        post: createdPosts[0]._id,
        read: false,
      });
      await Notification.create({
        recipient: demoUser._id,
        sender: userDocs['elena_rostova']._id,
        type: 'comment',
        post: createdPosts[0]._id,
        read: true,
      });
    }
    console.log('✅ Created sample notifications.');

    console.log('\n🎉 Seed process completed successfully!');
    console.log('--------------------------------------------------');
    console.log('Credentials for all accounts:');
    console.log('Password:', DEMO_PASSWORD);
    console.log('Usernames:');
    SAMPLE_USERS.forEach((u) => console.log(`  - @${u.username} (${u.email})`));
    console.log('--------------------------------------------------\n');
  } catch (err) {
    console.error('Seed Error:', err);
  } finally {
    await disconnectDB();
  }
}

// Run directly if invoked from command line
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
