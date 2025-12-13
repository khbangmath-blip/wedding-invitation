import React, { useEffect, useState, useRef } from 'react';
import { Copy, Share2, X, ChevronDown, ChevronUp, Navigation, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';

// ★★★ 수정 완료: 온라인/오프라인 호환 코드 ★★★
// process.env.PUBLIC_URL을 제거하여 브라우저 오류를 해결했습니다.
// 사진 파일 위치: public/images/ 폴더

export default function App() {
  // --- 상태 관리 ---
  const [isCopied, setIsCopied] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [slideDirection, setSlideDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // --- 데이터 수정 ---
  const weddingData = {
    date: "2026년 6월 6일 토요일",
    time: "오후 1시",
    location: "천안 비렌티웨딩홀",
    hall: "비렌티빌 3F 베르테홀",
    address: "충남 천안시 서북구 천안대로 1198-30",
    groom: {
      name: "정승환",
      phone: "010-1234-5678",
      father: "정지형",
      mother: "신희영",
      bank: "카카오뱅크 3333-00-0000000",
      fatherBank: "국민은행 000-000-000000",
      motherBank: "신한은행 000-000-000000",
    },
    bride: {
      name: "방경희",
      phone: "010-9876-5432",
      father: "방치남",
      mother: "송은경",
      bank: "토스뱅크 1000-00-0000000",
      fatherBank: "우리은행 000-000-000000",
      motherBank: "하나은행 000-000-000000",
    },
  };

  // --- 이미지 데이터 (썸네일/원본 동일 경로) ---
  const baseUrl = process.env.PUBLIC_URL || '';
  const images = Array.from({ length: 17 }, (_, i) => ({
    id: i,
    src: `${baseUrl}/images/photo_${i + 1}.jpg`,
    thumb: `${baseUrl}/images/photo_${i + 1}.jpg`
  }));

  // --- 공유 처리 ---
  const shareInvitation = async () => {
    const shareUrl = window.location.href;
    const title = '승환♥경희의 결혼식에 초대합니다';
    const description = title;
    const imageUrl = `${baseUrl}/images/og-image.jpg`;

    try {
      // 1) Kakao SDK가 초기화되어 있으면 Kakao 공유 시도
      if (window.Kakao && window.Kakao.isInitialized && window.Kakao.Share) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title,
            description,
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
        await navigator.share({ title, text: description, url: shareUrl });
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

  // --- 이미지 모달 & 슬라이드 ---
  const openImage = (index) => setSelectedIndex(index);
  const closeImage = () => setSelectedIndex(null);
  
  const slideToImage = (newIndex, direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection(direction);
    
    setTimeout(() => {
      setSelectedIndex(newIndex);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 300);
  };
  
  const handlePrev = (e) => {
    e.stopPropagation();
    const newIndex = (selectedIndex - 1 + images.length) % images.length;
    slideToImage(newIndex, 'right');
  };
  
  const handleNext = (e) => {
    e.stopPropagation();
    const newIndex = (selectedIndex + 1) % images.length;
    slideToImage(newIndex, 'left');
  };

  // 터치/드래그 스와이프 감지
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;
    
    // 수평 스와이프가 수직보다 크고, 최소 거리 이상 시에만 반응
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      deltaX > 0 ? handleNext({ stopPropagation: () => {} }) : handlePrev({ stopPropagation: () => {} });
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // 마우스 드래그도 지원 (PC)
  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
  };

  const handleMouseUp = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const deltaX = touchStartX.current - e.clientX;
    const deltaY = touchStartY.current - e.clientY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      deltaX > 0 ? handleNext({ stopPropagation: () => {} }) : handlePrev({ stopPropagation: () => {} });
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // 다음/이전 이미지 미리 로드하여 체감 속도 개선
  useEffect(() => {
    if (selectedIndex === null) return;
    const preload = (idx) => {
      const img = new Image();
      img.src = images[idx].src;
    };
    preload((selectedIndex + 1) % images.length);
    preload((selectedIndex - 1 + images.length) % images.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

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
    <div className="relative w-full h-[600px] bg-stone-100 overflow-hidden">
      {/* GitHub Pages 호환: PUBLIC_URL 기준 경로 사용 */}
      <img 
        src={`${baseUrl}/images/main.jpg`} 
        alt="Main Wedding" 
        className="w-full h-full object-cover opacity-90"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.style.backgroundColor = '#ddd';
          // 에러 메시지가 더 잘 보이도록 스타일 수정
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
          <p className="mt-1">{weddingData.time}</p>
          <p className="mt-1">{weddingData.location}</p>
        </div>
      </div>
    </div>
  );

  const GreetingSection = () => (
    <section className="py-16 px-6 text-center bg-white">
      <div className="mb-8">
        <h2 className="text-xl font-serif text-stone-700 tracking-widest mb-2">초대합니다</h2>
        <div className="w-8 h-[1px] bg-stone-300 mx-auto"></div>
      </div>
      <p className="text-stone-600 leading-8 font-light text-sm whitespace-pre-line">
        각자의 수식으로 가득했던 저희 두 사람이{'\n'}
        인생의 가장 아름다운 공통해를 찾았습니다.{'\n'}
        더하고 나누며 사랑을 키워온 저희{'\n'}
        이제 무한히 발산하는 사랑으로 함께하려 합니다.{'\n\n'}
        저희의 첫 공개수업에 귀한 분들을 초대합니다.{'\n'}
        부디 오셔서 따뜻한 격려와 박수를 보내주세요.{'\n'}
      </p>
      
      <div className="mt-12 flex flex-col items-center gap-4 text-stone-700">
        <div className="flex items-center gap-2">
          <span className="font-medium">{weddingData.groom.father} · {weddingData.groom.mother}</span>
          <span className="text-xs text-stone-400">의 장남</span>
          <span className="font-medium">{weddingData.groom.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{weddingData.bride.father} · {weddingData.bride.mother}</span>
          <span className="text-xs text-stone-400">의 장녀</span>
          <span className="font-medium">{weddingData.bride.name}</span>
        </div>
      </div>
    </section>
  );

  const CalendarSection = () => (
    <section className="py-16 px-6 bg-stone-50">
      <div className="max-w-xs mx-auto text-center">
        <h3 className="text-3xl font-serif text-stone-800 mb-2">6월</h3>
        <p className="text-stone-500 text-sm mb-8">June, 2026</p>
        
        <div className="grid grid-cols-7 gap-4 text-sm text-stone-600 mb-8 font-light">
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

        <div className="bg-white py-4 px-6 rounded-full shadow-sm inline-block">
          <span className="text-stone-800 font-medium">예식일이 <span className="text-pink-600 font-bold">{calculateDday()}</span> 남았습니다</span>
        </div>
      </div>
    </section>
  );

  const GallerySection = () => {
    return (
      <section className="py-16 bg-white">
        <div className="text-center mb-10">
          <h2 className="text-xl font-serif text-stone-700 tracking-widest mb-2">GALLERY</h2>
          <p className="text-xs text-stone-400">사진을 클릭하시면 확대해서 보실 수 있습니다</p>
        </div>
        
        <div className="grid grid-cols-3 gap-1 px-1">
          {images.map((img, idx) => (
            <div 
              key={img.id} 
              className="aspect-[2/3] overflow-hidden cursor-pointer relative group bg-gray-100 border border-white"
              onClick={() => openImage(idx)}
            >
              <img 
                src={img.thumb} 
                alt={`${img.id + 1}번`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 33vw, 200px"
                onError={(e) => {
                   e.target.style.display = 'none';
                   // 텍스트 표시
                   const span = document.createElement('span');
                   span.className = "absolute inset-0 flex items-center justify-center text-gray-400 text-[10px] text-center p-1 break-all";
                   span.innerText = `photo_${img.id + 1}.jpg`;
                   e.target.parentElement.appendChild(span);
                }}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const LocationSection = () => (
    <section className="py-16 px-6 bg-stone-50 text-center">
      <h2 className="text-xl font-serif text-stone-700 tracking-widest mb-8">LOCATION</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto">
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
                 // 대체 텍스트 표시
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
          <button onClick={() => handleMapLink('tmap')} className="flex-1 py-3 px-2 bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 whitespace-nowrap">
            <Navigation size={14} className="flex-shrink-0" /> <span>티맵</span>
          </button>
        </div>

        <div className="mt-8 text-left space-y-6 border-t border-stone-100 pt-6">
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

  const AccountSection = () => {
    const AccountGroup = ({ title, type }) => {
      const isExpanded = activeAccordion === type;
      const data = type === 'groom' ? weddingData.groom : weddingData.bride;
      
      return (
        <div className="mb-4 bg-stone-50 rounded-lg overflow-hidden">
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
                  <div className="text-stone-700">{data.bank}</div>
                  <div className="text-stone-600 font-medium">{data.name}</div>
                </div>
                <button onClick={() => handleCopy(data.bank)} className="px-3 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-600 hover:bg-stone-50 flex items-center gap-1">
                  <Copy size={12} /> 복사
                </button>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone-200/50">
                <div>
                  <div className="text-xs text-stone-400 mb-1">혼주 (부)</div>
                  <div className="text-stone-700">{data.fatherBank}</div>
                  <div className="text-stone-600 font-medium">{data.father}</div>
                </div>
                <button onClick={() => handleCopy(data.fatherBank)} className="px-3 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-600 hover:bg-stone-50 flex items-center gap-1">
                  <Copy size={12} /> 복사
                </button>
              </div>
               <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-stone-400 mb-1">혼주 (모)</div>
                  <div className="text-stone-700">{data.motherBank}</div>
                  <div className="text-stone-600 font-medium">{data.mother}</div>
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
    return (
      <section className="py-16 px-6 bg-white">
         <div className="text-center mb-10">
          <h2 className="text-xl font-serif text-stone-700 tracking-widest mb-2">마음 전하실 곳</h2>
          <p className="text-xs text-stone-400">참석이 어려우신 분들을 위해 계좌번호를 기재하였습니다.</p>
        </div>
        <div className="max-w-md mx-auto">
          <AccountGroup title="신랑측 계좌번호" type="groom" />
          <AccountGroup title="신부측 계좌번호" type="bride" />
        </div>
      </section>
    );
  };

  const FooterSection = () => (
    <footer className="py-12 px-6 bg-stone-100 text-center">
      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={shareInvitation}
          className="w-12 h-12 bg-[#FAE100] rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        >
          <Share2 size={20} className="text-[#371D1E]" />
        </button>
        <button onClick={() => handleCopy(window.location.href)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
          <Copy size={20} className="text-stone-600" />
        </button>
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
          title={isMuted ? "음악 재생" : "음악 멈춤"}
        >
          {isMuted ? (
            <VolumeX size={20} className="text-stone-600" />
          ) : (
            <Volume2 size={20} className="text-stone-600" />
          )}
        </button>
      </div>
      <p className="text-xs text-stone-400">Copyright 2026. All rights reserved.</p>
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
        <HeroSection />
        <GreetingSection />
        <CalendarSection />
        <GallerySection />
        <LocationSection />
        <AccountSection />
        <FooterSection />
        {selectedIndex !== null && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" 
            onClick={(e) => { if (e.target === e.currentTarget) closeImage(); }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >            <button className="absolute top-4 right-4 text-white p-2 z-10" onClick={closeImage} aria-label="닫기">
              <X size={32} />
            </button>
            
            {/* 캐러셀 컨테이너 */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {/* 이전 사진 미리보기 (왼쪽) */}
              {images.length > 1 && (
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-3/5 flex items-center justify-center cursor-pointer opacity-30 hover:opacity-50 transition-opacity"
                  onClick={handlePrev}
                >
                  <img 
                    src={images[(selectedIndex - 1 + images.length) % images.length].src} 
                    alt="이전" 
                    className="max-w-full max-h-full object-contain"
                    decoding="async"
                  />
                </div>
              )}
              
              {/* 메인 사진 (중앙) - 좌우 슬라이드 애니메이션 */}
              <div className="relative z-10 max-w-[70%] max-h-[90vh] flex items-center justify-center overflow-hidden">
                <img 
                  key={selectedIndex}
                  src={images[selectedIndex].src} 
                  alt={`${selectedIndex + 1}번`} 
                  className="max-w-full max-h-full object-contain shadow-2xl"
                  style={{
                    transform: 
                      slideDirection === 'left' ? 'translateX(-100%)' :
                      slideDirection === 'right' ? 'translateX(100%)' :
                      'translateX(0)',
                    transition: isAnimating ? 'transform 0.3s ease-in-out' : 'none'
                  }}
                  decoding="async"
                />
              </div>
              
              {/* 다음 사진 미리보기 (오른쪽) */}
              {images.length > 1 && (
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-3/5 flex items-center justify-center cursor-pointer opacity-30 hover:opacity-50 transition-opacity"
                  onClick={handleNext}
                >
                  <img 
                    src={images[(selectedIndex + 1) % images.length].src} 
                    alt="다음" 
                    className="max-w-full max-h-full object-contain"
                    decoding="async"
                  />
                </div>
              )}
              
              {/* 화살표 버튼 */}
              {images.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white p-3 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all" 
                    onClick={handlePrev} 
                    aria-label="이전"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white p-3 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all" 
                    onClick={handleNext} 
                    aria-label="다음"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
              
              {/* 페이지 인디케이터 */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        )}
        {isCopied && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm z-50 animate-fade-in-up">복사되었습니다.</div>
        )}
      </div>
      <style>{`.pb-safe { padding-bottom: env(safe-area-inset-bottom); } @keyframes fade-in-up { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
}