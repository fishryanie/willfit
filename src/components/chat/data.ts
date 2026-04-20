export type ChatAuthor = 'me' | 'coach';

export type ChatMessage = {
  id: string;
  author: ChatAuthor;
  body: string;
  time: string;
};

export type ChatConversation = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  accent: string;
  status: 'online' | 'active' | 'offline';
  lastActive: string;
  lastMessage: string;
  unread: number;
  tags: string[];
  messages: ChatMessage[];
};

export const chatConversations: ChatConversation[] = [
  {
    id: 'coach-linh',
    name: 'Coach Linh',
    role: 'Strength coach',
    avatar: 'CL',
    color: '#FF8A00',
    accent: '#FFE2C2',
    status: 'online',
    lastActive: 'Online',
    lastMessage: 'Tối nay giữ RPE 7, đừng đẩy max ở set cuối.',
    unread: 2,
    tags: ['Push day', 'Recovery'],
    messages: [
      {
        id: 'm1',
        author: 'coach',
        body: 'Hôm nay ngực và tay sau vẫn theo plan cũ. Warm-up kỹ vai trước khi chest press nhé.',
        time: '08:12',
      },
      {
        id: 'm2',
        author: 'me',
        body: 'Set đầu thấy ổn, nhưng vai phải hơi căng.',
        time: '08:16',
      },
      {
        id: 'm3',
        author: 'coach',
        body: 'Giảm 5-10 lbs ở 2 set đầu. Nếu hết căng thì tăng lại từ từ.',
        time: '08:18',
      },
      {
        id: 'm4',
        author: 'coach',
        body: 'Tối nay giữ RPE 7, đừng đẩy max ở set cuối.',
        time: '08:20',
      },
    ],
  },
  {
    id: 'nutrition-team',
    name: 'Nutrition Team',
    role: 'Meal support',
    avatar: 'NT',
    color: '#5BD67D',
    accent: '#D9FBE2',
    status: 'active',
    lastActive: '12m ago',
    lastMessage: 'Bữa trưa thêm 25g protein là đủ mục tiêu hôm nay.',
    unread: 0,
    tags: ['Protein', 'Lunch'],
    messages: [
      {
        id: 'n1',
        author: 'coach',
        body: 'Mục tiêu hôm nay là 145g protein. Sáng bạn đã có khoảng 38g.',
        time: '11:03',
      },
      {
        id: 'n2',
        author: 'me',
        body: 'Trưa ăn cơm gà được không?',
        time: '11:05',
      },
      {
        id: 'n3',
        author: 'coach',
        body: 'Được. Bữa trưa thêm 25g protein là đủ mục tiêu hôm nay.',
        time: '11:07',
      },
    ],
  },
  {
    id: 'run-club',
    name: 'WillFit Run Club',
    role: 'Community',
    avatar: 'RC',
    color: '#4DA3FF',
    accent: '#D9ECFF',
    status: 'online',
    lastActive: 'Online',
    lastMessage: 'Route 5.2 km quanh công viên đã lưu cho sáng mai.',
    unread: 1,
    tags: ['5K', 'Route'],
    messages: [
      {
        id: 'r1',
        author: 'coach',
        body: 'Bạn muốn chạy easy hay interval nhẹ?',
        time: '17:30',
      },
      {
        id: 'r2',
        author: 'me',
        body: 'Easy thôi, mai còn tập chân.',
        time: '17:35',
      },
      {
        id: 'r3',
        author: 'coach',
        body: 'Route 5.2 km quanh công viên đã lưu cho sáng mai.',
        time: '17:36',
      },
    ],
  },
  {
    id: 'recovery',
    name: 'Recovery Check',
    role: 'Mobility',
    avatar: 'RX',
    color: '#B86BFF',
    accent: '#EBD9FF',
    status: 'offline',
    lastActive: 'Yesterday',
    lastMessage: 'Foam roll 6 phút rồi ngủ sớm hơn thường ngày.',
    unread: 0,
    tags: ['Sleep', 'Mobility'],
    messages: [
      {
        id: 'x1',
        author: 'coach',
        body: 'HRV hơi thấp. Tối nay ưu tiên phục hồi.',
        time: 'Yesterday',
      },
      {
        id: 'x2',
        author: 'coach',
        body: 'Foam roll 6 phút rồi ngủ sớm hơn thường ngày.',
        time: 'Yesterday',
      },
    ],
  },
];

export const getConversationById = (id?: string | string[]) => {
  const normalizedId = Array.isArray(id) ? id[0] : id;
  return chatConversations.find(conversation => conversation.id === normalizedId) ?? chatConversations[0];
};
