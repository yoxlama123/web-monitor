import React, { useState, useEffect } from 'react';
import { Instagram, LayoutGrid, Globe } from 'lucide-react';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // n8n'den veri çekme fonksiyonu
  const fetchPosts = async () => {
    console.log('--- FETCH POSTS ÇALIŞTIRILDI ---');
    try {
      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Webhook URL tanımlanmamış. Lütfen .env dosyasını kontrol edin.');
      }

      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (!response.ok) {
        throw new Error('Veri alınamadı');
      }

      const data = await response.json();

      // n8n'den gelen veriyi kontrol et
      if (Array.isArray(data)) {
        setPosts(data);
      } else if (data && typeof data === 'object') {
        // Tek bir gönderi gelirse array'e çevir
        setPosts([data]);
      }

      setError(null);
    } catch (err) {
      console.error('Hata:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // İlk yüklemede veri çek
    fetchPosts();

    // Her 5 dakikada bir yeni veri kontrolü yap
    const interval = setInterval(() => {
      console.log('Yeni gönderiler kontrol ediliyor...');
      fetchPosts();
    }, (60 * 60 * 1000)); // 60 dakika

    return () => clearInterval(interval);
  }, []);

  const rootClasses = darkMode
    ? 'min-h-screen bg-[#0F172A]'
    : 'min-h-screen bg-[#e8e8e8]';

  // Counts calculation
  const counts = {
    all: posts.length,
    instagram: posts.filter(p => p.platform === 'Instagram').length,
    x: posts.filter(p => p.platform !== 'Instagram').length
  };

  // Filter logic
  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'Instagram') return post.platform === 'Instagram';
    if (filter === 'X') return post.platform !== 'Instagram';
    return true;
  });

  const FilterButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setFilter(id)}
      className={`
        w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
        ${filter === id
          ? (darkMode ? 'bg-[#334155] text-white shadow-lg' : 'bg-white text-black shadow-md')
          : (darkMode ? 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E2E8F0]' : 'text-gray-500 hover:bg-white hover:text-gray-900')
        }
      `}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${filter === id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
        <span className="font-medium">{label}</span>
      </div>
      <span className={`
        text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center
        ${filter === id
          ? (darkMode ? 'bg-[#0F172A] text-white' : 'bg-gray-100 text-black')
          : (darkMode ? 'bg-[#1E293B] text-[#94A3B8]' : 'bg-gray-200 text-gray-600')
        }
      `}>
        {count}
      </span>
    </button>
  );

  const XIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  return (
    <div className={rootClasses}>
      {/* Header */}
      <header
        className={darkMode ? 'bg-[#1E293B] shadow-sm' : 'bg-white shadow-sm'}
        style={{ transition: 'background-color 0.3s' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black"></div>
            <h1
              className={darkMode ? 'text-[#E2E8F0] text-3xl font-bold' : 'text-black text-3xl font-bold'}
            >
              Monitoring
            </h1>
          </div>

          {/* TOGGLE SWITCH */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`
              relative w-16 h-8 rounded-full transition-colors duration-300
              ${darkMode ? 'bg-[#334155]' : 'bg-gray-200'}
            `}
          >
            <div
              className={`
                absolute top-1 w-6 h-6 rounded-full shadow-md transition-all duration-300
                flex items-center justify-center text-sm font-medium text-black
                ${darkMode ? 'translate-x-8 bg-[#1E293B]' : 'translate-x-0 bg-white'}
              `}
            >
              {darkMode ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">

        {/* Sidebar Filter - Far Left */}
        <aside className={`
          lg:w-72 flex-shrink-0 border-r
          ${darkMode ? 'bg-[#1E293B]/30 border-[#334155]' : 'bg-white/50 border-gray-200'}
        `}>
          <div className="sticky top-0 p-6 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Globe className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-black'}`} />
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                Platformlar
              </h2>
            </div>

            <div className={`space-y-2 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <FilterButton
                id="all"
                label="Tümü"
                icon={LayoutGrid}
                count={counts.all}
              />
              <FilterButton
                id="Instagram"
                label="Instagram"
                icon={Instagram}
                count={counts.instagram}
              />
              <FilterButton
                id="X"
                label="X"
                icon={XIcon}
                count={counts.x}
              />
            </div>
          </div>
        </aside>

        {/* Feed Area - Centered */}
        <main className="flex-1 min-w-0 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className={darkMode ? 'text-[#94A3B8]' : 'text-gray-600'}>
                    Yükleniyor...
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className={darkMode ? 'text-red-400 text-lg' : 'text-red-600 text-lg'}>
                  ⚠️ {error}
                </div>
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchPosts();
                  }}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-colors
                    ${darkMode
                      ? 'bg-[#334155] text-[#E2E8F0] hover:bg-[#475569]'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                    }
                  `}
                >
                  Tekrar Dene
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className={darkMode ? 'text-[#94A3B8] text-lg' : 'text-gray-500 text-lg'}>
                  Bu kategoride gönderi bulunamadı
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post, index) => (
                  <PostCard key={index} post={post} index={index} darkMode={darkMode} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function PostCard({ post, index, darkMode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset visibility when filter changes or new posts load
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index, post]); // Added post dependency to re-animate on filter change

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;

    let truncated = text.substring(0, maxLength);
    truncated = truncated.replace(/[\s\.,;:!?]*$/, '');

    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 10) {
      truncated = truncated.substring(0, lastSpace);
    }

    truncated = truncated.replace(/[\.,;:!?]+$/, '');

    return truncated + '...';
  };

  return (
    <div
      className={`
        rounded-2xl shadow-lg overflow-hidden transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${darkMode ? 'bg-[#1E293B]' : 'bg-white'}
        w-[468px] max-w-full
      `}
    >
      <div className="p-5">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* PROFİL RESMİ */}
            <a
              href={post.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={post.profile_image}
                alt={post.profile_name}
                className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
              />
            </a>

            {/* PROFİL ADI */}
            <div className="min-w-0">
              <a
                href={post.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  font-bold text-base block truncate transition-colors
                  ${darkMode
                    ? 'text-[#E2E8F0] hover:text-white'
                    : 'text-black hover:text-gray-700'
                  }
                `}
                onClick={(e) => e.stopPropagation()}
                style={{ textDecoration: 'none' }}
              >
                {post.profile_name}
              </a>
              <p
                className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-gray-400'
                  }`}
              >
                {post.timestamp}
              </p>
            </div>
          </div>

          {/* Platform İkonu */}
          <div className={darkMode ? 'text-[#E2E8F0]' : 'text-gray-800'}>
            {post.platform === 'Instagram' ? (
              <Instagram className="w-6 h-6 flex-shrink-0" />
            ) : (
              <svg
                className="w-6 h-6 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            )}
          </div>
        </div>

        {/* RESİM */}
        {post.post_image && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-4"
          >
            <img
              src={post.post_image}
              alt="Post"
              className="w-full h-[621px] rounded-xl object-cover hover:opacity-95 transition-opacity"
            />
          </a>
        )}

        {/* METİN */}
        {post.post_text && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              inline-block text-sm leading-relaxed
              ${darkMode ? 'text-[#E2E8F0]' : 'text-black'}
            `}
            style={{
              wordBreak: 'break-word',
              textDecoration: 'none',
              pointerEvents: post.post_image ? 'none' : 'auto'
            }}
          >
            {truncateText(post.post_text, post.post_image ? 60 : 570)}
          </a>
        )}
      </div>
    </div>
  );
}

export default App;