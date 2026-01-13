import { FaWhatsapp, FaInstagram, FaFacebook, FaTelegram } from "react-icons/fa";
import { RiTwitterXLine } from "react-icons/ri";
import toast from "react-hot-toast";

export const getShareOptions = (postUrl, shareText, copyToClipboard) => [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: FaWhatsapp,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    action: () => {
      const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`;
      window.open(url, '_blank');
    }
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: FaTelegram,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    action: () => {
      const url = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`;
      window.open(url, '_blank');
    }
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: RiTwitterXLine,
    color: 'bg-black',
    hoverColor: 'hover:bg-black/90',
    action: () => {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
      window.open(url, '_blank');
    }
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    action: () => {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
      window.open(url, '_blank');
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500',
    hoverColor: 'hover:opacity-90',
    action: () => {
      toast.info('Instagram\'da paylaşmak için linki kopyalayıp uygulamada kullanabilirsiniz');
      copyToClipboard();
    }
  },
];
