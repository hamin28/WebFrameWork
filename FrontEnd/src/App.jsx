// src/App.jsx — 로그인 상태와 화면 전환 및 선택 장소를 관리하는 앱 컴포넌트
import { useEffect, useState } from 'react';
import './App.css';
import {
  addFavoriteMeeting,
  getFavoriteMeetings,
  removeFavoriteMeeting,
} from './api/favorites.js';
import { getMeetingById } from './api/meetings.js';
import LoginPage from './pages/auth/LoginPage.jsx';
import FindIdPage from './pages/auth/FindIdPage.jsx';
import FindPasswordPage from './pages/auth/FindPasswordPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import HomePage from './pages/home/HomePage.jsx';
import PublicHomePage from './pages/home/PublicHomePage.jsx';
import CreateMeetingPage from './pages/meetings/CreateMeetingPage.jsx';
import MeetingDetail from './pages/meetings/MeetingDetail.jsx';
import MyPage from './pages/MyPage/MyPage.jsx';

const LOGIN_STORAGE_KEY = 'moyeo.web.loginInfo';

function readStoredLoginInfo() {
  try {
    const stored = sessionStorage.getItem(LOGIN_STORAGE_KEY);
    if (!stored) return null;
    const loginInfo = JSON.parse(stored);
    if (typeof loginInfo?.token !== 'string' || !loginInfo.token) {
      sessionStorage.removeItem(LOGIN_STORAGE_KEY);
      return null;
    }
    return loginInfo;
  } catch {
    return null;
  }
}

function getSharedMeetingId() {
  return new URLSearchParams(window.location.search).get('meetingId');
}

function clearSharedMeetingId() {
  const url = new URL(window.location.href);
  url.searchParams.delete('meetingId');
  window.history.replaceState(window.history.state, '', url);
}

export default function App() {
  const [loginInfo, setLoginInfo] = useState(readStoredLoginInfo);
  const [screen, setScreen] = useState(() =>
    readStoredLoginInfo()
      ? getSharedMeetingId() ? 'loadingShared' : 'home'
      : 'public',
  );
  const [publicAuthMode, setPublicAuthMode] = useState(() =>
    getSharedMeetingId() && !readStoredLoginInfo() ? 'login' : null,
  );
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [detailReturnScreen, setDetailReturnScreen] = useState('home');
  const [favoriteMeetings, setFavoriteMeetings] = useState([]);
  const [favoritesError, setFavoritesError] = useState('');
  const [homeVersion, setHomeVersion] = useState(0);
  const sharedMeetingId = getSharedMeetingId();

  // 로그인 상태와 이름 변경을 현재 브라우저 탭에 보관합니다.
  useEffect(() => {
    try {
      if (loginInfo?.token) {
        sessionStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(loginInfo));
      } else {
        sessionStorage.removeItem(LOGIN_STORAGE_KEY);
      }
    } catch {
      // 브라우저 저장소를 사용할 수 없어도 현재 화면의 로그인은 유지합니다.
    }
  }, [loginInfo]);

  // 링크를 받은 사람이 로그인하면 모임 상세를 바로 엽니다.
  // 이미 로그인한 탭에서 공유 URL을 새로 열어도 같은 방식으로 처리합니다.
  useEffect(() => {
    if (!loginInfo?.token || !sharedMeetingId) return undefined;
    let active = true;

    getMeetingById(sharedMeetingId)
      .then((meeting) => {
        if (!active) return;
        setSelectedMeeting(meeting);
        setDetailReturnScreen('home');
        setScreen('detail');
        clearSharedMeetingId();
      })
      .catch(() => {
        if (!active) return;
        setScreen('home');
        clearSharedMeetingId();
      });

    return () => { active = false; };
  }, [loginInfo?.token, sharedMeetingId]);

  const goHome = () => {
    if (getSharedMeetingId()) clearSharedMeetingId();
    setPublicAuthMode(null);
    setScreen(loginInfo ? 'home' : 'public');
  };

  const handleLoginSuccess = (info) => {
    setLoginInfo(info);
    setPublicAuthMode(null);
    setScreen(sharedMeetingId ? 'loadingShared' : 'home');
  };

  useEffect(() => {
    const token = loginInfo?.token;
    if (!token) return undefined;

    let isCurrent = true;
    getFavoriteMeetings(token)
      .then((meetings) => {
        if (isCurrent) {
          setFavoriteMeetings(Array.isArray(meetings) ? meetings : []);
          setFavoritesError('');
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setFavoritesError(
            error instanceof Error
              ? error.message
              : '찜 목록을 불러오지 못했어요.',
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [loginInfo?.token]);

  const toggleFavorite = async (meeting) => {
    const token = loginInfo?.token;
    if (!token || meeting?.id == null)
      throw new Error('로그인 정보 또는 모임 정보가 없습니다.');

    const alreadySaved = favoriteMeetings.some(
      (saved) => saved.id === meeting.id,
    );
    setFavoritesError('');
    try {
      if (alreadySaved) {
        await removeFavoriteMeeting(token, meeting.id);
        setFavoriteMeetings((current) =>
          current.filter((saved) => saved.id !== meeting.id),
        );
      } else {
        await addFavoriteMeeting(token, meeting.id);
        // 오래된 상세 화면의 인원 수 대신 백엔드의 최신 모임 정보를 담습니다.
        let latestMeeting = meeting;
        try {
          latestMeeting = { ...meeting, ...(await getMeetingById(meeting.id)) };
        } catch {
          // 찜 저장 자체는 성공했으므로 현재 모임 정보를 사용합니다.
        }
        setFavoriteMeetings((current) =>
          current.some((saved) => saved.id === meeting.id)
            ? current.map((saved) =>
                saved.id === meeting.id ? latestMeeting : saved,
              )
            : [latestMeeting, ...current],
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '찜 상태를 저장하지 못했어요.';
      setFavoritesError(message);
      throw error;
    }
  };

  if (screen === 'loadingShared') {
    return <main role="status" style={{ padding: 32 }}>모임을 불러오는 중이에요…</main>;
  }

  if (screen === 'public') {
    return (
      <PublicHomePage
        isLoggedIn={Boolean(loginInfo)}
        userName={loginInfo?.name}
        authMode={publicAuthMode}
        onLogin={() => setPublicAuthMode('login')}
        onSignup={() => setPublicAuthMode('signup')}
        onCloseAuth={() => setPublicAuthMode(null)}
        onAuthModeChange={setPublicAuthMode}
        onFindId={() => setScreen('findId')}
        onFindPassword={() => setScreen('findPassword')}
        onLoginSuccess={handleLoginSuccess}
        onHome={goHome}
        onProfile={() => setScreen('mypage')}
        onExplore={() => setScreen(loginInfo ? 'home' : 'login')}
        onFavorites={() => setScreen(loginInfo ? 'fav' : 'login')}
        onCreate={() => setScreen(loginInfo ? 'create' : 'login')}
      />
    );
  }

  // 로그인 페이지로 돌아가는 함수
  if (screen === 'findId') {
    return <FindIdPage onHome={goHome} onBack={() => { setPublicAuthMode('login'); setScreen('public'); }} />;
  }

  if (screen === 'findPassword') {
    return <FindPasswordPage onHome={goHome} onBack={() => { setPublicAuthMode('login'); setScreen('public'); }} />;
  }

  if (screen === 'signup') {
    return <SignupPage onHome={goHome} onBack={() => setScreen('public')} />;
  }

  if (screen === 'mypage' && loginInfo) {
    return (
      <>
        <MyPage
          userName={loginInfo.name}
          token={loginInfo.token}
          savedCount={favoriteMeetings.length}
          onOpenSaved={() => setScreen('fav')}
          onBackHome={goHome}
          onMeetingSelect={(meeting) => {
            setSelectedMeeting(meeting);
            setDetailReturnScreen('mypage');
            setScreen('detail');
          }}
          onNameChange={(name) =>
            setLoginInfo((current) => ({ ...current, name }))
          }
          onLogout={() => {
            setLoginInfo(null);
            try { sessionStorage.removeItem(LOGIN_STORAGE_KEY); } catch { /* unavailable */ }
            if (getSharedMeetingId()) clearSharedMeetingId();
            setFavoriteMeetings([]);
            setFavoritesError('');
            setScreen('public');
          }}
        />
      </>
    );
  }

  if (screen === 'detail' && loginInfo) {
    return (
      <>
        {detailReturnScreen === 'mypage' ? (
          <MyPage
            userName={loginInfo.name}
            token={loginInfo.token}
            savedCount={favoriteMeetings.length}
            onOpenSaved={() => setScreen('fav')}
            onBackHome={goHome}
            onMeetingSelect={(meeting) => {
              setSelectedMeeting(meeting);
              setDetailReturnScreen('mypage');
            }}
            onNameChange={(name) =>
              setLoginInfo((current) => ({ ...current, name }))
            }
            onLogout={() => {
              setLoginInfo(null);
              try { sessionStorage.removeItem(LOGIN_STORAGE_KEY); } catch { /* unavailable */ }
              if (getSharedMeetingId()) clearSharedMeetingId();
              setFavoriteMeetings([]);
              setFavoritesError('');
              setScreen('public');
            }}
          />
        ) : (
          <HomePage
            key={homeVersion}
            userName={loginInfo.name}
            token={loginInfo.token}
            onCreateTap={() => setScreen('create')}
            onOpenMyPage={() => setScreen('mypage')}
            onOpenFavorites={() => setScreen('fav')}
            onHome={goHome}
            onLocationSelect={setSelectedLocation}
            onMeetingSelect={(meeting) => {
              setSelectedMeeting(meeting);
              setDetailReturnScreen(detailReturnScreen);
            }}
            favoritesOpen={detailReturnScreen === 'fav'}
            favoriteMeetings={favoriteMeetings}
            favoritesError={favoritesError}
            onCloseFavorites={() => setScreen('home')}
            onToggleFavorite={toggleFavorite}
          />
        )}
        <MeetingDetail
          meeting={selectedMeeting}
          token={loginInfo.token}
          isFavorite={favoriteMeetings.some(
            (meeting) => meeting.id === selectedMeeting?.id,
          )}
          onToggleFavorite={() => toggleFavorite(selectedMeeting)}
          onMeetingUpdate={(meetingId, updates) => {
            setSelectedMeeting((current) =>
              current?.id === meetingId ? { ...current, ...updates } : current,
            );
            setFavoriteMeetings((current) =>
              current.map((item) =>
                item.id === meetingId ? { ...item, ...updates } : item,
              ),
            );
          }}
          onMeetingDeleted={(meetingId) => {
            setSelectedMeeting(null);
            setFavoriteMeetings((current) =>
              current.filter((item) => item.id !== meetingId),
            );
            setScreen(detailReturnScreen);
          }}
          onBack={() => setScreen(detailReturnScreen)}
        />
      </>
    );
  }

  if (['home', 'fav', 'create'].includes(screen) && loginInfo) {
    return (
      <>
        <HomePage
          key={homeVersion}
          userName={loginInfo.name}
          token={loginInfo.token}
          onCreateTap={() => setScreen('create')}
          onOpenMyPage={() => setScreen('mypage')}
          onOpenFavorites={() => setScreen('fav')}
          onHome={goHome}
          onLocationSelect={setSelectedLocation}
          onMeetingSelect={(meeting) => {
            setSelectedMeeting(meeting);
            setDetailReturnScreen(screen);
            setScreen('detail');
          }}
          favoritesOpen={screen === 'fav'}
          favoriteMeetings={favoriteMeetings}
          favoritesError={favoritesError}
          onCloseFavorites={() => setScreen('home')}
          onToggleFavorite={toggleFavorite}
        />
        {screen === 'create' && (
          <CreateMeetingPage
            onBack={() => setScreen('home')}
            onCreated={() => {
              setHomeVersion((version) => version + 1);
              setScreen('home');
            }}
            userName={loginInfo.name}
            token={loginInfo.token}
            selectedLocation={selectedLocation}
          />
        )}
      </>
    );
  }

  return (
    <LoginPage
      onHome={goHome}
      onBack={() => setScreen('public')}
      onLoginSuccess={handleLoginSuccess}
      onSignup={() => setScreen('signup')}
      onFindId={() => setScreen('findId')}
      onFindPassword={() => setScreen('findPassword')}
    />
  );
}
