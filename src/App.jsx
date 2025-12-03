import React, { useState, useEffect } from 'react';
import { Instagram, LayoutGrid, Globe, Plus, Trash2, List, X } from 'lucide-react';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Modal ve Komut State'leri
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });
  const [urlInput, setUrlInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [platformInput, setPlatformInput] = useState('Instagram');
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [commandStatus, setCommandStatus] = useState({ loading: false, message: null, type: null });

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

      if (Array.isArray(data)) {
        setPosts(data);
      } else if (data && typeof data === 'object') {
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

  // Komut Gönderme Fonksiyonu
  const handleCommand = async () => {
    if (!urlInput) {
      setCommandStatus({ loading: false, message: 'Lütfen gerekli alanları doldurun.', type: 'error' });
      return;
    }

    setCommandStatus({ loading: true, message: null, type: null });

    try {
      const webhookUrl = import.meta.env.VITE_COMMAND_WEBHOOK_URL || import.meta.env.VITE_WEBHOOK_URL;
      const action = modalConfig.type === 'add' ? 'addurl' : 'removeurl';

      // Construct URL from username for both add and remove
      const cleanUsername = urlInput.replace('@', '').trim().toLowerCase();
      let finalUrl;
      if (platformInput === 'Instagram') {
        finalUrl = `https://www.instagram.com/${cleanUsername}/`;
      } else if (platformInput === 'X') {
        finalUrl = `https://x.com/${cleanUsername}/`;
      }

      const payload = {
        action: action,
        url: finalUrl,
        category: modalConfig.type === 'add' ? (categoryInput || null) : null,
        platform: platformInput
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (response.ok) {
        setCommandStatus({
          loading: false,
          message: responseData.message || `İşlem başarılı: ${action === 'addurl' ? 'Eklendi' : 'Silindi'}`,
          type: 'success'
        });
        setTimeout(() => {
          closeModal();
        }, 3000);
      } else {
        throw new Error(responseData.message || 'İşlem başarısız oldu.');
      }

    } catch (err) {
      console.error('Komut Hatası:', err);
      setCommandStatus({ loading: false, message: 'Bir hata oluştu: ' + err.message, type: 'error' });
    }
  };

  const openModal = (type) => {
    setModalConfig({ isOpen: true, type });
    setUrlInput('');
    setCategoryInput('');
    setPlatformInput('Instagram');
    setIsPlatformDropdownOpen(false);
    setCommandStatus({ loading: false, message: null, type: null });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null });
    setIsPlatformDropdownOpen(false);
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => {
      console.log('Yeni gönderiler kontrol ediliyor...');
      fetchPosts();
    }, (60 * 60 * 1000));
    return () => clearInterval(interval);
  }, []);

  const rootClasses = darkMode
    ? 'min-h-screen bg-[#0F172A]'
    : 'min-h-screen bg-[#e8e8e8]';

  const counts = {
    all: posts.length,
    instagram: posts.filter(p => p.platform === 'Instagram').length,
    x: posts.filter(p => p.platform !== 'Instagram').length
  };

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

  const ActionButton = ({ label, icon: Icon, onClick, disabled, variant = 'default' }) => {
    const baseClasses = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm";
    const variants = {
      default: darkMode
        ? "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E2E8F0]"
        : "text-gray-500 hover:bg-white hover:text-gray-900",
      danger: darkMode
        ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
        : "text-red-500 hover:bg-red-50 hover:text-red-600",
      disabled: "opacity-50 cursor-not-allowed " + (darkMode ? "text-gray-600" : "text-gray-400")
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${disabled ? variants.disabled : (variant === 'danger' ? variants.danger : variants.default)}`}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </button>
    );
  };

  const XIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  return (
    <div className={rootClasses}>
      <header
        className={darkMode ? 'bg-[#1E293B] shadow-sm' : 'bg-white shadow-sm'}
        style={{ transition: 'background-color 0.3s' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black"></div>
            <h1 className={darkMode ? 'text-[#E2E8F0] text-3xl font-bold' : 'text-black text-3xl font-bold'}>
              Monitoring
            </h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${darkMode ? 'bg-[#334155]' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-sm font-medium text-black ${darkMode ? 'translate-x-8 bg-[#1E293B]' : 'translate-x-0 bg-white'}`}>
              {darkMode ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        <aside className={`lg:w-72 flex-shrink-0 border-r ${darkMode ? 'bg-[#1E293B]/30 border-[#334155]' : 'bg-white/50 border-gray-200'}`}>
          <div className="sticky top-0 p-6 space-y-8">
            <div>
              <div className="flex items-center gap-3 px-2 mb-6">
                <Globe className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-black'}`} />
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Platformlar</h2>
              </div>
              <div className={`space-y-2 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <FilterButton id="all" label="Tümü" icon={LayoutGrid} count={counts.all} />
                <FilterButton id="Instagram" label="Instagram" icon={Instagram} count={counts.instagram} />
                <FilterButton id="X" label="X" icon={XIcon} count={counts.x} />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 py-8 px-4">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className={darkMode ? 'text-[#94A3B8]' : 'text-gray-600'}>Yükleniyor...</div>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className={darkMode ? 'text-red-400 text-lg' : 'text-red-600 text-lg'}>⚠️ {error}</div>
                <button
                  onClick={() => { setLoading(true); fetchPosts(); }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${darkMode ? 'bg-[#334155] text-[#E2E8F0] hover:bg-[#475569]' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                >
                  Tekrar Dene
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className={darkMode ? 'text-[#94A3B8] text-lg' : 'text-gray-500 text-lg'}>Bu kategoride gönderi bulunamadı</div>
              </div>
            ) : (
              <div className="space-y-6 w-full flex flex-col items-center">
                {filteredPosts.map((post, index) => (
                  <PostCard key={index} post={post} index={index} darkMode={darkMode} />
                ))}
              </div>
            )}
          </div>
        </main>

        <aside className={`lg:w-72 flex-shrink-0 border-l ${darkMode ? 'bg-[#1E293B]/30 border-[#334155]' : 'bg-white/50 border-gray-200'}`}>
          <div className="sticky top-0 p-6 space-y-8">
            <div>
              <h2 className={`px-2 text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>Yönetim</h2>
              <div className={`space-y-2 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <ActionButton label="Add Url" icon={Plus} onClick={() => openModal('add')} />
                <ActionButton label="Remove Url" icon={Trash2} variant="danger" onClick={() => openModal('remove')} />
                <ActionButton label="List Url" icon={List} disabled={true} onClick={() => { }} />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {modalConfig.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl p-6 relative ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-[#334155] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
              {modalConfig.type === 'add' ? 'Yeni Bağlantı Ekle' : 'Bağlantı Kaldır'}
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
                      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all flex items-center justify-center ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white' : 'bg-white border-gray-300 text-black'}`}
                    >
                      {platformInput === 'Instagram' ? <Instagram className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
                    </button>

                    {isPlatformDropdownOpen && (
                      <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-10 ${darkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-gray-300'}`}>
                        <button
                          type="button"
                          onClick={() => { setPlatformInput('Instagram'); setIsPlatformDropdownOpen(false); }}
                          className={`w-full px-4 py-2 flex items-center gap-2 transition-colors rounded-t-lg ${platformInput === 'Instagram' ? (darkMode ? 'bg-[#334155]' : 'bg-blue-50') : (darkMode ? 'hover:bg-[#1E293B]' : 'hover:bg-gray-50')} ${darkMode ? 'text-white' : 'text-black'}`}
                        >
                          <Instagram className="w-5 h-5" />
                          <span>Instagram</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPlatformInput('X'); setIsPlatformDropdownOpen(false); }}
                          className={`w-full px-4 py-2 flex items-center gap-2 transition-colors rounded-b-lg ${platformInput === 'X' ? (darkMode ? 'bg-[#334155]' : 'bg-blue-50') : (darkMode ? 'hover:bg-[#1E293B]' : 'hover:bg-gray-50')} ${darkMode ? 'text-white' : 'text-black'}`}
                        >
                          <XIcon className="w-5 h-5" />
                          <span>X</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-2/3">
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="kullanıcı adı"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white placeholder-gray-500' : 'bg-white border-gray-300 text-black'}`}
                  />
                </div>
              </div>

              {modalConfig.type === 'add' && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kategori (İsteğe Bağlı)</label>
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="Örn: Sfw"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white placeholder-gray-500' : 'bg-white border-gray-300 text-black'}`}
                  />
                </div>
              )}

              {commandStatus.message && (
                <div className={`p-3 rounded-lg text-sm ${commandStatus.type === 'success' ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700') : (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')}`}>
                  {commandStatus.message}
                </div>
              )}

              <button
                onClick={handleCommand}
                disabled={commandStatus.loading}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all ${modalConfig.type === 'add' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} ${commandStatus.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {commandStatus.loading ? 'İşleniyor...' : (modalConfig.type === 'add' ? 'Ekle' : 'Kaldır')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, index, darkMode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index, post]);

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    let truncated = text.substring(0, maxLength);
    truncated = truncated.replace(/[\s\.,;:!?]*$/, '');
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 10) truncated = truncated.substring(0, lastSpace);
    truncated = truncated.replace(/[\.,;:!?]+$/, '');
    return truncated + '...';
  };

  return (
    <div className={`rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${darkMode ? 'bg-[#1E293B]' : 'bg-white'} w-[468px] max-w-full`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <a href={post.profile_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <img src={post.profile_image} alt={post.profile_name} className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
            </a>
            <div className="min-w-0">
              <a href={post.profile_url} target="_blank" rel="noopener noreferrer" className={`font-bold text-base block truncate transition-colors ${darkMode ? 'text-[#E2E8F0] hover:text-white' : 'text-black hover:text-gray-700'}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                {post.profile_name}
              </a>
              <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-gray-400'}`}>{post.timestamp}</p>
            </div>
          </div>
          <div className={darkMode ? 'text-[#E2E8F0]' : 'text-gray-800'}>
            {post.platform === 'Instagram' ? (
              <Instagram className="w-6 h-6 flex-shrink-0" />
            ) : (
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            )}
          </div>
        </div>
        {post.post_image && (
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="block mb-4">
            <img src={post.post_image} alt="Post" className="w-full h-[621px] rounded-xl object-cover hover:opacity-95 transition-opacity" />
          </a>
        )}
        {post.post_text && (
          <a href={post.url} target="_blank" rel="noopener noreferrer" className={`inline-block text-sm leading-relaxed ${darkMode ? 'text-[#E2E8F0]' : 'text-black'}`} style={{ wordBreak: 'break-word', textDecoration: 'none', pointerEvents: post.post_image ? 'none' : 'auto' }}>
            {truncateText(post.post_text, post.post_image ? 60 : 570)}
          </a>
        )}
      </div>
    </div>
  );
}

export default App;