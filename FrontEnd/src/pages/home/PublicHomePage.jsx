import { useMemo, useState } from 'react';
import {
  FiMessageCircle, FiHeart, FiSearch, FiSliders, FiPlus,
  FiUser, FiMapPin, FiArrowUpRight,
} from 'react-icons/fi';
import './PublicHomePage.css';

const SAMPLE_MEETINGS = [
  { category: '카페', title: '주말에 새로 생긴 카페 같이 가요', place: '성수동 · 4명 모집', tone: 'peach' },
  { category: '운동', title: '퇴근 후 한강 러닝 크루', place: '뚝섬한강공원 · 3명 모집', tone: 'green' },
  { category: '전시', title: '사진전 보고 감상 나눠요', place: '서울숲 갤러리아포레 · 2명 모집', tone: 'blue' },
];

export default function PublicHomePage({ isLoggedIn = false, userName = '', onLogin, onProfile, onExplore }) {
  const [activeNav, setActiveNav] = useState('모임');
  const [query, setQuery] = useState('');
  const meetings = useMemo(() => SAMPLE_MEETINGS.filter((meeting) =>
    `${meeting.category} ${meeting.title} ${meeting.place}`.toLowerCase().includes(query.toLowerCase()),
  ), [query]);

  return (
    <main className="public-home">
      <header className="site-header">
        <a className="site-logo" href="#top" aria-label="모이자 홈">MUNTO</a>
        <nav className="site-nav" aria-label="주 메뉴">
          {['모임', '라운지', '카테고리'].map((item) => (
            <button key={item} className={activeNav === item ? 'is-active' : ''} onClick={() => setActiveNav(item)}>{item}</button>
          ))}
        </nav>
        <div className="site-tools">
          <label className="site-search">
            <FiSearch aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="관심사, 태그, 지역명을 검색" aria-label="모임 검색" />
          </label>
          <button className="site-icon-button" aria-label="검색 필터" onClick={() => setActiveNav('카테고리')}><FiSliders /></button>
          <button className="site-icon-button" aria-label="찜한 모임" onClick={onExplore}><FiHeart /></button>
          <button className="site-icon-button" aria-label="메시지" onClick={onLogin}><FiMessageCircle /></button>
          <button className="site-create" onClick={onExplore}><FiPlus /> 열기</button>
          {isLoggedIn ? (
            <button className="site-profile" onClick={onProfile} aria-label={`${userName || '내'} 프로필`} title="마이페이지"><FiUser /></button>
          ) : (
            <button className="site-login" onClick={onLogin}>로그인</button>
          )}
        </div>
        <div className="site-mobile-actions">
          {isLoggedIn ? <button className="site-profile" onClick={onProfile} aria-label="마이페이지"><FiUser /></button> : <button className="site-login" onClick={onLogin}>로그인</button>}
        </div>
      </header>

      <section className="public-hero" id="top">
        <div className="hero-copy">
          <span className="hero-eyebrow"><FiMapPin /> 가까운 곳에서 시작하는 새로운 인연</span>
          <h1>좋아하는 순간을<br /><em>함께</em> 나눠요</h1>
          <p>관심사가 맞는 사람들과 동네에서 만나고,<br className="desktop-break" /> 오늘의 작은 즐거움을 함께 만들어보세요.</p>
          <button className="hero-cta" onClick={onExplore}>모임 둘러보기 <FiArrowUpRight /></button>
          <div className="hero-note"><span className="hero-avatars"><i>지</i><i>민</i><i>서</i></span><span>이미 많은 이웃이 함께하고 있어요</span></div>
        </div>
        <div className="hero-art" aria-label="사람들이 함께 모여 대화하는 모습">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-sun" />
          <div className="hero-person person-one"><span>☺</span></div>
          <div className="hero-person person-two"><span>☺</span></div>
          <div className="hero-person person-three"><span>☺</span></div>
          <div className="hero-chat chat-one">같이 가요! <FiHeart /></div>
          <div className="hero-chat chat-two">새 친구를 만났어요</div>
          <div className="hero-sticker">좋은 만남<br />좋은 하루</div>
        </div>
      </section>

      <section className="public-meetings" aria-labelledby="meetings-heading">
        <div className="section-heading">
          <div><span className="section-kicker">TODAY'S PICK</span><h2 id="meetings-heading">지금 함께할 모임</h2><p>당신의 관심사와 가까운 모임을 찾아보세요.</p></div>
          <button onClick={onExplore}>전체 보기 <FiArrowUpRight /></button>
        </div>
        <div className="public-meeting-grid">
          {meetings.length ? meetings.map((meeting) => (
            <button key={meeting.title} className="public-meeting-card" onClick={onExplore}>
              <span className={`meeting-art ${meeting.tone}`}><span>{meeting.category}</span><FiArrowUpRight /></span>
              <span className="meeting-card-title">{meeting.title}</span>
              <span className="meeting-card-place"><FiMapPin />{meeting.place}</span>
            </button>
          )) : <p className="empty-search">검색 결과가 없습니다.</p>}
        </div>
      </section>
      <footer className="public-footer"><span>MUNTO</span><span>가까운 만남, 함께하는 즐거움</span></footer>
    </main>
  );
}
