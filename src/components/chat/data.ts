import type { ImageSourcePropType } from 'react-native';

export type ChatMessage = {
  id: string;
  author: 'me' | 'coach';
  text: string;
  time: string;
  image?: string;
};

export type ChatConversation = {
  id: string;
  name: string;
  status: string;
  avatar?: ImageSourcePropType;
  lastMessage: string;
  time: string;
  isActive?: boolean;
  messages: ChatMessage[];
};

export const CHAT_COLORS = {
  white: '#FFFFFF',
  primary: '#F3742D',
  primary200: '#FFCFA9',
  textPlaceholder: '#808080',
  antiFlashWhite: '#F1F1F1',
  gray100: '#E5E8EC',
  gray200: '#CAD1D9',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray600: '#64748B',
  gray700: '#334155',
  gray1000: '#282F38',
  green500: '#32AD31',
  textError: '#D9100A',
} as const;

export const CHAT_BACKGROUND = require('../../assets/chat/chatBg.png') as ImageSourcePropType;
export const KINIS_AI_AVATAR = require('../../assets/chat/ava_Kinis_chat.png') as ImageSourcePropType;

const currentTime = () =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());

export const chatConversations: ChatConversation[] = [
  {
    id: 'kinis-ai',
    name: 'Kinis.ai Chatbot',
    status: 'Active now',
    avatar: KINIS_AI_AVATAR,
    time: currentTime(),
    lastMessage: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    isActive: true,
    messages: [
      {
        id: 'ai-1',
        author: 'coach',
        text: 'Hello developer',
        time: '08:12',
      },
      {
        id: 'ai-2',
        author: 'me',
        text: 'Tôi muốn xem lại lịch tập hôm nay.',
        time: '08:16',
      },
      {
        id: 'ai-3',
        author: 'coach',
        text: 'Plan hôm nay là push day. Giữ nhịp kiểm soát, nghỉ 90 giây giữa các set.',
        time: '08:18',
      },
    ],
  },
  {
    id: 'bethany-russell',
    name: 'Bethany Russell PT, DPT',
    status: 'Active now',
    time: currentTime(),
    lastMessage: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    isActive: true,
    messages: [
      {
        id: 'b1',
        author: 'coach',
        text: 'Hello developer',
        time: '09:30',
      },
      {
        id: 'b2',
        author: 'me',
        text: 'Vai phải hơi căng khi chest press.',
        time: '09:32',
      },
      {
        id: 'b3',
        author: 'coach',
        text: 'Giảm tải set đầu và tập thêm warm-up cho vai. Nếu còn đau thì dừng bài đó lại.',
        time: '09:34',
      },
    ],
  },
  {
    id: 'trainer-hannah',
    name: 'Hannah Lee Coach',
    status: 'Active now',
    time: currentTime(),
    lastMessage: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    isActive: true,
    messages: [
      {
        id: 'h1',
        author: 'coach',
        text: 'Hôm nay bạn muốn chạy easy hay interval nhẹ?',
        time: '13:10',
      },
      {
        id: 'h2',
        author: 'me',
        text: 'Easy thôi, mai còn tập chân.',
        time: '13:12',
      },
      {
        id: 'h3',
        author: 'coach',
        text: 'Ok, giữ pace thoải mái và kết thúc dưới 6km.',
        time: '13:13',
      },
    ],
  },
  {
    id: 'nutrition-team',
    name: 'Nutrition Team',
    status: '12m ago',
    time: '12m',
    lastMessage: 'Bữa trưa thêm 25g protein là đủ mục tiêu hôm nay.',
    messages: [
      {
        id: 'n1',
        author: 'coach',
        text: 'Mục tiêu hôm nay là 145g protein. Sáng bạn đã có khoảng 38g.',
        time: '11:03',
      },
      {
        id: 'n2',
        author: 'me',
        text: 'Trưa ăn cơm gà được không?',
        time: '11:05',
      },
      {
        id: 'n3',
        author: 'coach',
        text: 'Được. Bữa trưa thêm 25g protein là đủ mục tiêu hôm nay.',
        time: '11:07',
      },
    ],
  },
];

export const getConversationById = (id?: string | string[]) => {
  const normalizedId = Array.isArray(id) ? id[0] : id;
  return chatConversations.find(conversation => conversation.id === normalizedId) ?? chatConversations[0];
};
