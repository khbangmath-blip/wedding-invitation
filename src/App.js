import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Copy, Share2, ChevronDown, ChevronUp, Navigation, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  // --- 상태 관리 ---
  const [isCopied, setIsCopied] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showAudioNotice, setShowAudioNotice] = useState(true);
  const [isNoticeHiding, setIsNoticeHiding] = useState(false);
  const [gallerySlideIndex, setGallerySlideIndex] = useState(0);
  const [galleryDragOffset, setGalleryDragOffset] = useState(0);
  const [galleryIsDragging, setGalleryIsDragging] = useState(false);
  const [galleryContainerWidth, setGalleryContainerWidth] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const galleryContainerRef = useRef(null);
  const audioRef = useRef(null);
  const greetingSectionRef = useRef(null);
  const calendarSectionRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);
  const locationSectionRef = useRef(null);
  const accountSectionRef = useRef(null);
  const footerSectionRef = useRef(null);

  // --- 슬라이드업 애니메이션 헬퍼 ---
  const ani = useCallback((sectionName, index, delayMs) => {
    const delay = delayMs !== undefined ? delayMs : index * 100;
    const isVisible = visibleSections.has(sectionName);
    if (isVisible) {
      return {
        style: {
          opacity: 1,
          transform: 'translateY(0)',
          transition: `opacity 2s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 2s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        },
      };
    }
    return { style: { opacity: 0, transform: 'translateY(30px)' } };
  }, [visibleSections]);

  // --- 스크롤 애니메이션 설정 (data-section 기반) ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const names = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target.dataset.section)
          .filter(Boolean);
        if (names.length > 0) {
          setVisibleSections((prev) => {
            const next = new Set(prev);
            names.forEach((n) => next.add(n));
            return next;
          });
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );

    document.querySelectorAll('[data-section]').forEach((el) => {
      if (!visibleSections.has(el.dataset.section)) observer.observe(el);
    });

    return () => observer.disconnect();
  });

  // --- 데이터 수정 ---
  const weddingData = {
    date: "2026년 6월 6일 토요일 오후 1시",
    location: "천안 비렌티웨딩홀",
    hall: "비렌티빌 3F 베르테홀",
    address: "충남 천안시 서북구 천안대로 1198-30",
    groom: {
      name: "정승환",
      father: "정지형",
      mother: "신희영",
      bank: "우체국 50406805010841",
      fatherBank: "우리은행 1002-232-877411",
      motherBank: "신협 36925814700",
    },
    bride: {
      name: "방경희",
      father: "방치남",
      mother: "송은경",
      bank: "농협 352-1012-8584-03",
      fatherBank: "농협 312-4757-8824-61",
      motherBank: "농협 356-0781-1131-53",
    },
  };

  const baseUrl = process.env.PUBLIC_URL || '';
  const images = [
    ...Array.from({ length: 17 }, (_, i) => ({
      id: i,
      jpg: `${baseUrl}/images/photo_${i + 1}.jpg`
    })),
    {
      id: 17,
      jpg: `${baseUrl}/images/main.jpg`
    }
  ];

  const aboutImages = {
    groom: `${baseUrl}/images/about_groom.jpg`,
    bride: `${baseUrl}/images/about_bride.jpg`,
  };

  const timelineItems = [
    {
      id: 1,
      title: '2019년 봄날의 캠퍼스',
      description: '예쁘게 개나리가 핀 응용과학관에서 승환이는 경희를 졸졸 따라다녔습니다.',
      image: `${baseUrl}/images/timeline_1.jpg`,
    },
    {
      id: 2,
      title: '7년의 연애',
      description: '승환이와 경희는 서로에게 가장 따뜻하고 든든한 버팀목이 되었습니다.',
      image: `${baseUrl}/images/timeline_2.jpg`,
    },
    {
      id: 3,
      title: '나란히 걷는 길',
      description: '나란히 꿈을 이룬 두 사람은, 알콩달콩 일상을 그려가고 있습니다.',
      image: `${baseUrl}/images/timeline_3.jpg`,
    },
    {
      id: 4,
      title: '2026년 6월 6일',
      description: '승환이와 경희는 이제 평생의 짝꿍이 되기로 약속합니다.',
      image: `${baseUrl}/images/timeline_4.jpg`,
    },
  ];

  // --- 공유 처리 ---
  const shareInvitation = async () => {
    const shareUrl = window.location.href;
    const title = '🎉승환❤️경희의 결혼식에 초대합니다🎉';
    const imageUrl = `${baseUrl}/images/og-image.jpg`;

    try {
      // 1) Kakao SDK가 초기화되어 있으면 Kakao 공유 시도 (썸네일만 공유)
      if (window.Kakao && window.Kakao.isInitialized && window.Kakao.Share) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title,
            imageUrl,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: '모바일에서 보기',
              link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
            },
            {
              title: '웹에서 보기',
              link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
            },
          ],
        });
        return;
      }

      // 2) Web Share API 지원 시 (모바일 브라우저 등)
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        return;
      }

      // 3) 마지막 fallback: URL 복사
      handleCopy(shareUrl);
    } catch (err) {
      console.error('공유 실패:', err);
      handleCopy(shareUrl);
    }
  };

  // --- 지도 링크 처리 ---
  const handleMapLink = (type) => {
    const placeName = weddingData.location;
    const query = encodeURIComponent(placeName);

    if (type === 'kakao') {
      // 카카오맵: 앱 실행 시도 -> 실패 시 웹
      window.location.href = `kakaomap://search?q=${query}`;
      setTimeout(() => {
        window.location.href = `https://map.kakao.com/link/search/${query}`;
      }, 1000);
    } else if (type === 'naver') {
      // 네이버지도: 앱 실행 시도 -> 실패 시 웹
      window.location.href = `nmap://search?query=${query}&appname=com.wedding.invitation`;
      setTimeout(() => {
        window.location.href = `https://map.naver.com/v5/search/${query}`;
      }, 1000);
    } else if (type === 'tmap') {
      // 티맵: 앱 실행 시도 -> 실패 시 구글맵
      window.location.href = `tmap://search?name=${query}`;
      setTimeout(() => {
        window.location.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
      }, 1000);
    }
  };

  // --- 갤러리 슬라이드 ---
  const handleGalleryPrev = (e) => {
    e?.stopPropagation?.();
    setGallerySlideIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleGalleryNext = (e) => {
    e?.stopPropagation?.();
    setGallerySlideIndex((prev) => (prev + 1) % images.length);
  };

  // 터치 이벤트를 ref로 직접 등록 (non-passive)
  const galleryTouchRef = useRef({ startX: 0, startY: 0, isDragging: false, isHorizontal: null });

  useEffect(() => {
    const el = galleryContainerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      const t = e.touches[0];
      galleryTouchRef.current = { startX: t.clientX, startY: t.clientY, isDragging: true, isHorizontal: null };
      setGalleryDragOffset(0);
      setGalleryIsDragging(true);
    };

    const onTouchMove = (e) => {
      const ref = galleryTouchRef.current;
      if (!ref.isDragging) return;
      const t = e.touches[0];
      const dx = t.clientX - ref.startX;
      const dy = t.clientY - ref.startY;

      // 첫 10px 이동으로 수평/수직 판별
      if (ref.isHorizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        ref.isHorizontal = Math.abs(dx) > Math.abs(dy);
      }

      if (ref.isHorizontal) {
        e.preventDefault();
        setGalleryDragOffset(dx);
      }
    };

    const onTouchEnd = (e) => {
      const ref = galleryTouchRef.current;
      if (!ref.isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const distance = endX - ref.startX;

      ref.isDragging = false;
      setGalleryIsDragging(false);
      setGalleryDragOffset(0);

      if (ref.isHorizontal) {
        const MIN_SWIPE = 40;
        if (distance < -MIN_SWIPE) {
          setGallerySlideIndex((prev) => (prev + 1) % images.length);
        } else if (distance > MIN_SWIPE) {
          setGallerySlideIndex((prev) => (prev - 1 + images.length) % images.length);
        }
      }
      ref.isHorizontal = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (!galleryContainerRef.current) return;
      setGalleryContainerWidth(galleryContainerRef.current.getBoundingClientRect().width);
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  // 배경음악 제어
  useEffect(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.log('음악 자동 재생 실패 (브라우저 정책):', err);
      });
    }
  }, [isMuted]);

  // 페이지 로드 후 자동으로 음악 재생 (브라우저 정책 우회)
  useEffect(() => {
    const playAudio = async () => {
      if (!audioRef.current) return;
      audioRef.current.muted = true;
      try {
        await audioRef.current.play();
        // 약간의 지연 후 음소거 해제
        setTimeout(() => {
          audioRef.current.muted = false;
        }, 100);
      } catch (err) {
        console.log('초기 음악 재생 실패:', err);
      }
    };
    playAudio();
  }, []);

  useEffect(() => {
    const hideTimeout = setTimeout(() => {
      setIsNoticeHiding(true);
    }, 5000);
    const removeTimeout = setTimeout(() => {
      setShowAudioNotice(false);
      setIsNoticeHiding(false);
    }, 5350);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  // --- 헬퍼 함수 ---
  const handleCopy = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        console.error('복사 실패:', err);
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Fallback 복사 실패', err);
    }
    document.body.removeChild(textArea);
  };

  const calculateDday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weddingDate = new Date('2026-06-06T00:00:00');
    const diff = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `D-${diffDays}` : diffDays === 0 ? "D-Day" : `D+${Math.abs(diffDays)}`;
  };

  // --- 컴포넌트 섹션 ---

  const HeroSection = () => (
    <div className="relative w-full h-[600px] bg-stone-100 overflow-hidden animate-hero-fade-in">
      {/* GitHub Pages 호환: PUBLIC_URL 기준 경로 사용 */}
      <img 
        src={`${baseUrl}/images/main.jpg`} 
          alt="Main Wedding" 
          className="w-full h-full object-cover opacity-90"
        loading="eager"
        fetchPriority="high"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.style.backgroundColor = '#ddd';
          const msg = document.createElement('div');
          msg.className = "absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-center p-4";
          msg.innerHTML = `<p class="font-bold mb-2">이미지 없음</p><p class="text-xs">프로젝트 폴더의<br/>public/images/main.jpg<br/>파일을 넣어주세요.</p>`;
          e.target.parentElement.appendChild(msg);
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white pb-10">
        <div className="text-lg tracking-[0.2em] mb-4 uppercase opacity-90">Wedding Invitation</div>
        <div className="text-4xl font-serif mb-6 flex items-center gap-3">
          <span>{weddingData.groom.name}</span>
          <span className="text-2xl font-light">&</span>
          <span>{weddingData.bride.name}</span>
        </div>
        <div className="text-center font-light tracking-wide text-sm opacity-90">
          <p>{weddingData.date}</p>
          <p className="mt-1">{weddingData.location}</p>
          <p className="mt-1">{weddingData.hall}</p>
        </div>
      </div>
    </div>
  );

  const greetingJSX = (
    <section ref={greetingSectionRef} data-section="greeting" className="py-16 px-6 text-center bg-white">
      <div style={ani('greeting', 0).style}>
        <h2 className="text-xl font-serif text-stone-700 tracking-widest mb-2">초대합니다</h2>
        <div className="w-8 h-[1px] bg-stone-300 mx-auto"></div>
      </div>
      <p className="text-stone-600 leading-8 font-light text-sm whitespace-pre-line" style={ani('greeting', 1).style}>
        각자의 수식으로 가득했던 저희 두 사람이{'\n'}
        인생의 가장 아름다운 공통해를 찾았습니다.{'\n'}
        더하고 나누며 사랑을 키워온 저희{'\n'}
        이제 무한히 발산하는 사랑으로 함께하려 합니다.{'\n\n'}
        저희의 첫 공개수업에 귀한 분들을 초대합니다.{'\n'}
        부디 오셔서 따뜻한 격려와 박수를 보내주세요.{'\n'}
      </p>
      <div className="mt-12 flex flex-col items-center gap-4 text-stone-700" style={ani('greeting', 2).style}>
        <div className="flex items-center gap-2">
          <span className="font-medium">{weddingData.groom.father} · {weddingData.groom.mother}</span>
          <span className="text-xs text-stone-400">의 장남</span>
          <span className="font-medium">{weddingData.groom.name.slice(1)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{weddingData.bride.father} · {weddingData.bride.mother}</span>
          <span className="text-xs text-stone-400">의 장녀</span>
          <span className="font-medium">{weddingData.bride.name.slice(1)}</span>
        </div>
      </div>
    </section>
  );

  const calendarJSX = (
    <section ref={calendarSectionRef} data-section="calendar" className="py-16 px-6 bg-stone-50">
      <div className="max-w-xs mx-auto text-center">
        <h3 className="text-3xl font-serif text-stone-800 mb-2" style={ani('calendar', 0).style}>6월</h3>
        <p className="text-stone-500 text-sm mb-8" style={ani('calendar', 1).style}>June, 2026</p>
        <div className="grid grid-cols-7 gap-4 text-sm text-stone-600 mb-8 font-light" style={ani('calendar', 2).style}>
          <div className="text-red-400">일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
          <div className="opacity-30">31</div>
          <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
          <div className="bg-stone-800 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-md">6</div>
          <div className="text-red-400">7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div><div>13</div>
          <div className="text-red-400">14</div><div>15</div><div>16</div><div>17</div><div>18</div><div>19</div><div>20</div>
          <div className="text-red-400">21</div><div>22</div><div>23</div><div>24</div><div>25</div><div>26</div><div>27</div>
          <div className="text-red-400">28</div><div>29</div><div>30</div>
          <div className="opacity-30">1</div><div className="opacity-30">2</div><div className="opacity-30">3</div><div className="opacity-30">4</div>
        </div>
        <div className="bg-white py-4 px-6 rounded-full shadow-sm inline-block" style={ani('calendar', 3).style}>
          <span className="text-stone-800 font-medium">예식일이 <span className="text-pink-600 font-bold">{calculateDday()}</span> 남았습니다</span>
        </div>
      </div>
    </section>
  );

  const aboutJSX = (
    <section ref={aboutSectionRef} data-section="about" className="py-16 px-6 bg-white">
      <div className="text-center mb-8" style={ani('about', 0).style}>
        <h2 className="text-xl font-serif text-stone-700 tracking-widest mb-2">ABOUT US</h2>
        <p className="text-sm text-stone-500">저희 커플을 소개합니다</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4" style={ani('about', 1).style}>
        <div className="rounded-3xl overflow-hidden bg-stone-100 aspect-[3/4] relative">
          <img src={aboutImages.groom} alt="신랑" className="w-full h-full object-cover" loading="lazy" decoding="async"
            onError={(e) => { e.target.style.display = 'none'; const span = document.createElement('span'); span.className = 'absolute inset-0 flex items-center justify-center text-[11px] text-stone-400'; span.innerText = 'about_groom.jpg'; e.target.parentElement.appendChild(span); }} />
        </div>
        <div className="rounded-3xl overflow-hidden bg-stone-100 aspect-[3/4] relative">
          <img src={aboutImages.bride} alt="신부" className="w-full h-full object-cover" loading="lazy" decoding="async"
            onError={(e) => { e.target.style.display = 'none'; const span = document.createElement('span'); span.className = 'absolute inset-0 flex items-center justify-center text-[11px] text-stone-400'; span.innerText = 'about_bride.jpg'; e.target.parentElement.appendChild(span); }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8 text-center" style={ani('about', 2).style}>
        <p className="text-stone-700 text-lg"><span className="text-stone-500 mr-1">신랑</span>{weddingData.groom.name}</p>
        <p className="text-stone-700 text-lg"><span className="text-stone-500 mr-1">신부</span>{weddingData.bride.name}</p>
      </div>
      <div className="mt-10 pt-2" style={ani('about', 3).style}>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-serif text-stone-700 tracking-wide">TIMELINE</h3>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-stone-200"></div>
          <div className="space-y-10">
            {timelineItems.map((item, idx) => {
              const isImageLeft = idx % 2 === 0;
              return (
                <div key={item.id} className="grid grid-cols-[1fr_24px_1fr] gap-3 items-center" style={ani('about', 4 + idx, 400 + idx * 1000).style}>
                  {isImageLeft ? (
                    <>
                      <div className="rounded-2xl overflow-hidden bg-stone-100 aspect-[3/4] relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" decoding="async"
                          onError={(e) => { e.target.style.display = 'none'; const span = document.createElement('span'); span.className = 'absolute inset-0 flex items-center justify-center text-[11px] text-stone-400'; span.innerText = `timeline_${item.id}.jpg`; e.target.parentElement.appendChild(span); }} />
                      </div>
                      <div className="relative flex items-center justify-center h-full">
                        <span className="w-3.5 h-3.5 rounded-full bg-stone-300 border-2 border-white z-10"></span>
                      </div>
                      <div className="text-left px-1">
                        <h4 className={`text-[17px] leading-snug font-semibold text-stone-700 mb-2 break-keep ${item.id === 2 ? 'whitespace-nowrap text-[15px]' : ''}`}>{item.title}</h4>
                        <p className="text-[14px] sm:text-sm text-stone-500 leading-5 tracking-[-0.02em] break-keep">{item.description}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-right px-1">
                        <h4 className={`text-[17px] leading-snug font-semibold text-stone-700 mb-2 break-keep ${item.id === 2 ? 'whitespace-nowrap text-[15px]' : ''}`}>{item.title}</h4>
                        <p className="text-[14px] sm:text-sm text-stone-500 leading-5 tracking-[-0.02em] break-keep">{item.description}</p>
                      </div>
                      <div className="relative flex items-center justify-center h-full">
                        <span className="w-3.5 h-3.5 rounded-full bg-stone-300 border-2 border-white z-10"></span>
                      </div>
                      <div className="rounded-2xl overflow-hidden bg-stone-100 aspect-[3/4] relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" decoding="async"
                          onError={(e) => { e.target.style.display = 'none'; const span = document.createElement('span'); span.className = 'absolute inset-0 flex items-center justify-center text-[11px] text-stone-400'; span.innerText = `timeline_${item.id}.jpg`; e.target.parentElement.appendChild(span); }} />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );

  const galleryJSX = (
      <section ref={gallerySectionRef} data-section="gallery" className="py-16 bg-white">
        <div className="text-center mb-8" style={ani('gallery', 0).style}>
          <h2 className="text-xl font-serif text-stone-700 tracking-widest mb-2">GALLERY</h2>
        </div>

        {/* 상단 슬라이드 */}
        <div
          ref={galleryContainerRef}
          className="relative bg-white overflow-hidden"
          style={{ touchAction: 'pan-y', ...ani('gallery', 1).style }}
        >
          <div className="overflow-hidden w-full">
            <div
              className="flex will-change-transform"
              style={{
                gap: '12px',
                transform: `translateX(${-gallerySlideIndex * (galleryContainerWidth + 12) + galleryDragOffset}px)`,
                transition: galleryIsDragging ? 'none' : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {images.map((img) => (
                <div
                  key={img.id}
                  className="flex-shrink-0 overflow-hidden flex items-center justify-center bg-white"
                  style={{ width: galleryContainerWidth > 0 ? galleryContainerWidth + 'px' : '100%' }}
                >
                  <img
                    src={img.jpg}
                    alt={`${img.id + 1}번`}
                    className="w-full"
                    decoding="async"
                    loading="eager"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 화살표 버튼 */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1"
                onClick={handleGalleryPrev}
                aria-label="이전"
              >
                <ChevronLeft size={28} className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1"
                onClick={handleGalleryNext}
                aria-label="다음"
              >
                <ChevronRight size={28} className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
              </button>
            </>
          )}

          {/* 페이지 인디케이터 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/40 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
            {gallerySlideIndex + 1} / {images.length}
          </div>
        </div>

        {/* 하단 썸네일 6칸 */}
        <div className="grid grid-cols-6 gap-0.5 px-1 mt-4" style={ani('gallery', 2).style}>
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`aspect-square overflow-hidden cursor-pointer relative bg-gray-100 ${gallerySlideIndex === idx ? 'ring-2 ring-stone-400' : ''}`}
              onClick={() => setGallerySlideIndex(idx)}
            >
              <img
                src={img.jpg}
                alt={`${img.id + 1}번`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </section>
  );

  const locationJSX = (
    <section ref={locationSectionRef} data-section="location" className="py-16 px-6 bg-stone-50 text-center">
      <h2 className="text-xl font-serif text-stone-700 tracking-widest mb-8" style={ani('location', 0).style}>LOCATION</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto" style={ani('location', 1).style}>
        <div className="font-bold text-lg text-stone-800 mb-1">{weddingData.location}</div>
        <div className="text-stone-500 text-sm mb-6">{weddingData.hall}</div>
        <div className="text-stone-500 text-sm mb-6">{weddingData.address}</div>
        
        <div className="w-full min-h-[200px] bg-gray-200 mb-6 rounded flex items-center justify-center text-gray-400 overflow-hidden relative">
           {/* GitHub Pages 호환: PUBLIC_URL 기준 경로 사용 */}
           <img 
             src={`${baseUrl}/images/map.jpg`} 
             alt="약도" 
             className="w-full h-auto"
             onError={(e) => {
                 e.target.style.display = 'none';
                 const div = document.createElement('div');
                 div.className = "absolute inset-0 flex flex-col items-center justify-center";
                 div.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2 opacity-50"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span class="text-xs">map.jpg 파일을 넣어주세요</span>`;
                 e.target.parentElement.appendChild(div);
             }}
           />
        </div>

        <div className="flex gap-2 justify-center">
          <button onClick={() => handleMapLink('kakao')} className="flex-1 py-3 px-2 bg-[#FAE100] text-black text-xs sm:text-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-1 whitespace-nowrap">
            <Navigation size={14} className="flex-shrink-0" /> <span>카카오맵</span>
          </button>
          <button onClick={() => handleMapLink('naver')} className="flex-1 py-3 px-2 bg-[#03C75A] text-white text-xs sm:text-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-1 whitespace-nowrap">
            <Navigation size={14} className="flex-shrink-0" /> <span>네이버지도</span>
          </button>
          <button onClick={() => handleMapLink('tmap')} className="flex-1 py-3 px-2 bg-sky-400 text-white text-xs sm:text-sm font-medium rounded hover:bg-sky-500 transition-colors flex items-center justify-center gap-1 whitespace-nowrap">
            <Navigation size={14} className="flex-shrink-0" /> <span>티맵</span>
          </button>
        </div>

        <div className="mt-8 text-left space-y-6 border-t border-stone-100 pt-6" style={ani('location', 2).style}>
          <div>
            <h4 className="font-bold text-stone-700 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
              버스 이용시
            </h4>
            <ul className="text-sm text-stone-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="min-w-[14px] text-stone-400">1)</span>
                <span>성환방면 100번대 버스 이용 후 천안 공주대학교에서 하차 후 도보 5분</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="min-w-[14px] text-stone-400">2)</span>
                <span>천안역(이태리안경) - 100번, 110번</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="min-w-[14px] text-stone-400">3)</span>
                <span>천안고속버스터미널(맥도날드앞) - 112번, 140번, 141번, 143번, 144번, 145번, 150번, 151번</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-stone-700 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
              셔틀버스 이용시
            </h4>
            <ul className="text-sm text-stone-600 space-y-2 mb-3">
              <li className="flex items-start gap-2">
                <span className="min-w-[14px] text-stone-400">1)</span>
                <span>천안종합터미널 - 신세계백화점(아라리오광장) - 올리브영&스타벅스 건물 앞 횡단보도</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="min-w-[14px] text-stone-400">2)</span>
                <span>두정역 - 1번 출구에서 나와서 오른쪽으로 50m 지점 파란색 셔틀버스 승강장</span>
              </li>
            </ul>
            <div className="bg-stone-50 p-3 rounded text-xs text-stone-500 space-y-1.5">
              <p>※ 예식시간 1시간 전부터 30분 간격으로 셔틀버스 이용 가능</p>
              <p>※ 시외버스터미널 → 두정역 → 비렌티웨딩홀</p>
              <p>※ 자세한 운영 시간은 문의 예약실 041-554-5500</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderAccountGroup = (title, type) => {
    const isExpanded = activeAccordion === type;
    const data = type === 'groom' ? weddingData.groom : weddingData.bride;
    return (
      <div key={type} className="mb-4 bg-stone-50 rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 bg-white border border-stone-100"
          onClick={() => setActiveAccordion(isExpanded ? null : type)}
        >
          <span className="font-medium text-stone-700">{title}</span>
          {isExpanded ? <ChevronUp size={20} className="text-stone-400" /> : <ChevronDown size={20} className="text-stone-400" />}
        </button>
        {isExpanded && (
          <div className="p-4 space-y-4 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-stone-200/50">
              <div>
                <div className="text-xs text-stone-400 mb-1">{type === 'groom' ? '신랑' : '신부'}</div>
                <div className="text-stone-600 font-medium">{data.name}</div>
                <div className="text-stone-700">{data.bank}</div>
              </div>
              <button onClick={() => handleCopy(data.bank)} className="px-3 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-600 hover:bg-stone-50 flex items-center gap-1">
                <Copy size={12} /> 복사
              </button>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-200/50">
              <div>
                <div className="text-xs text-stone-400 mb-1">혼주 (부)</div>
                <div className="text-stone-600 font-medium">{data.father}</div>
                <div className="text-stone-700">{data.fatherBank}</div>
              </div>
              <button onClick={() => handleCopy(data.fatherBank)} className="px-3 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-600 hover:bg-stone-50 flex items-center gap-1">
                <Copy size={12} /> 복사
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-stone-400 mb-1">혼주 (모)</div>
                <div className="text-stone-600 font-medium">{data.mother}</div>
                <div className="text-stone-700">{data.motherBank}</div>
              </div>
              <button onClick={() => handleCopy(data.motherBank)} className="px-3 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-600 hover:bg-stone-50 flex items-center gap-1">
                <Copy size={12} /> 복사
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const accountJSX = (
    <section ref={accountSectionRef} data-section="account" className="py-16 px-6 bg-white">
      <div className="text-center mb-10" style={ani('account', 0).style}>
        <h2 className="text-xl font-serif text-stone-700 tracking-widest mb-2">마음 전하실 곳</h2>
        <p className="text-xs text-stone-400">참석이 어려우신 분들을 위해 계좌번호를 기재하였습니다.</p>
      </div>
      <div className="max-w-md mx-auto" style={ani('account', 1).style}>
        {renderAccountGroup("신랑측 계좌번호", "groom")}
        {renderAccountGroup("신부측 계좌번호", "bride")}
      </div>
    </section>
  );

  const footerJSX = (
    <footer ref={footerSectionRef} data-section="footer" className="py-12 px-6 bg-stone-100 text-center">
      <div className="flex justify-center gap-4 mb-8" style={ani('footer', 0).style}>
        <button 
          onClick={shareInvitation}
          className="w-12 h-12 bg-[#FAE100] rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        >
          <Share2 size={20} className="text-[#371D1E]" />
        </button>
        <button onClick={() => handleCopy(window.location.href)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
          <Copy size={20} className="text-stone-600" />
        </button>
      </div>
      <p className="text-xs text-stone-400" style={ani('footer', 1).style}>Copyright 2026. All rights reserved.</p>
    </footer>
  );

  return (
    <div className="font-sans text-stone-800 bg-white min-h-screen pb-safe">
      <audio 
        ref={audioRef}
        src={`${baseUrl}/audio/background-music.mp3`}
        loop
        preload="auto"
      />
      <div className="max-w-md mx-auto shadow-2xl bg-white min-h-screen relative">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="fixed top-4 right-4 z-40 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white shadow-lg transition-all backdrop-blur-sm"
          aria-label={isMuted ? '음악 재생' : '음악 정지'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        {(showAudioNotice || isNoticeHiding) && (
          <div className={`fixed top-4 left-1/2 z-40 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm text-sm flex items-center gap-2 ${isNoticeHiding ? 'animate-slide-up' : 'animate-slide-down'}`}>
            <span>배경음악이 있습니다</span>
            <ChevronRight size={16} />
          </div>
        )}
        <HeroSection />
        {greetingJSX}
        {calendarJSX}
        {aboutJSX}
        {galleryJSX}
        {locationJSX}
        {accountJSX}
        {footerJSX}
        {isCopied && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm z-50 animate-fade-in-up">복사되었습니다.</div>
        )}
      </div>
      <style>{`.pb-safe { padding-bottom: env(safe-area-inset-bottom); } @keyframes fade-in-up { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } @keyframes notice-slide-down { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } } .animate-slide-down { animation: notice-slide-down 300ms ease-out forwards; } @keyframes notice-slide-up { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -10px); } } .animate-slide-up { animation: notice-slide-up 260ms ease-in forwards; } @keyframes hero-fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-hero-fade-in { animation: hero-fade-in 900ms ease-out forwards; }`}</style>
    </div>
  );
}