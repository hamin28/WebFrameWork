import { useState } from 'react';
import './PublicAuthPanel.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const emptyForm = { userId: '', name: '', email: '', phone: '', address: '', password: '', passwordConfirm: '' };

export default function PublicAuthPanel({ mode, onClose, onModeChange, onFindId, onFindPassword, onLoginSuccess }) {
  const signup = mode === 'signup';
  const [form, setForm] = useState(emptyForm);
  const [agreed, setAgreed] = useState({ terms: false, privacy: false, marketing: false });
  const [duplicate, setDuplicate] = useState({ userId: '', result: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === 'userId') setDuplicate({ userId: '', result: '' });
    setMessage('');
  }

  async function checkId() {
    const userId = form.userId.trim();
    if (!/^[A-Za-z0-9]{4,20}$/.test(userId)) {
      setMessage('아이디는 영문과 숫자 4~20자로 입력해 주세요.');
      return;
    }
    setBusy(true);
    setMessage('중복 확인 중입니다.');
    try {
      const response = await fetch(`${API_BASE_URL}/api/check-userid?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error('중복 확인 실패');
      const exists = await response.json();
      if (typeof exists !== 'boolean') throw new Error('응답 형식 오류');
      setDuplicate({ userId, result: exists ? 'taken' : 'available' });
      setMessage(exists ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.');
    } catch {
      setMessage('중복 확인 서버에 연결할 수 없습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const userId = form.userId.trim();
    if (!userId || !form.password) {
      setMessage('아이디와 비밀번호를 입력해 주세요.');
      return;
    }
    if (signup) {
      if (!/^[A-Za-z0-9]{4,20}$/.test(userId)) return setMessage('아이디는 영문과 숫자 4~20자로 입력해 주세요.');
      if (duplicate.userId !== userId || duplicate.result !== 'available') return setMessage('아이디 중복 확인을 해 주세요.');
      if (!form.name.trim()) return setMessage('이름을 입력해 주세요.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setMessage('이메일 주소를 확인해 주세요.');
      if (!/^0\d{8,10}$/.test(form.phone.replace(/[\s-]/g, ''))) return setMessage('전화번호를 확인해 주세요.');
      if (!form.address.trim()) return setMessage('주소를 입력해 주세요.');
      if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/.test(form.password)) return setMessage('비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상 입력해 주세요.');
      if (form.password !== form.passwordConfirm) return setMessage('비밀번호가 일치하지 않습니다.');
      if (!agreed.terms || !agreed.privacy) return setMessage('필수 약관에 동의해 주세요.');
    }
    setBusy(true);
    setMessage(signup ? '회원가입 요청 중입니다.' : '로그인 요청 중입니다.');
    try {
      const response = await fetch(`${API_BASE_URL}/api/${signup ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signup ? { ...form, userId, email: form.email.trim(), phone: form.phone.replace(/[\s-]/g, '') } : { userId, password: form.password }),
      });
      if (!response.ok) {
        setMessage(signup ? '회원가입에 실패했습니다. 입력 내용을 확인해 주세요.' : '아이디 또는 비밀번호를 확인해 주세요.');
        return;
      }
      if (signup) {
        setMessage('회원가입이 완료되었습니다. 로그인해 주세요.');
        onModeChange('login');
      } else {
        const data = await response.json();
        if (typeof data.token !== 'string' || typeof data.name !== 'string') throw new Error('로그인 응답 오류');
        onLoginSuccess({ token: data.token, name: data.name });
      }
    } catch {
      setMessage('서버와 연결할 수 없습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="public-auth-panel" aria-label={signup ? '회원가입' : '로그인'}>
      <button type="button" className="public-auth-back" onClick={onClose}>← 홈으로</button>
      <form className="public-auth-form" onSubmit={submit} noValidate>
        <div className="public-auth-brand">모이자<span aria-hidden="true" /></div>
        <p className="public-auth-intro">{signup ? '취향 맞는 사람들과 가볍게 만나봐요.' : '아이디와 비밀번호로 로그인해 주세요.'}</p>
        {signup && <label className="public-auth-field">이름<input name="name" value={form.name} onChange={update} autoComplete="name" placeholder="이름을 입력해 주세요" /></label>}
        <div className="public-auth-field">
          <label htmlFor="public-auth-user-id">아이디</label>
          <div className="public-auth-id-row">
            <input id="public-auth-user-id" name="userId" value={form.userId} onChange={update} autoComplete="username" placeholder="아이디를 입력해 주세요" />
            {signup && <button type="button" onClick={checkId} disabled={busy}>중복 확인</button>}
          </div>
        </div>
        {signup && <>
          <label className="public-auth-field">이메일<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" placeholder="이메일을 입력해 주세요" /></label>
          <label className="public-auth-field">전화번호<input name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" placeholder="전화번호를 입력해 주세요" /></label>
          <label className="public-auth-field">주소<input name="address" value={form.address} onChange={update} autoComplete="street-address" placeholder="주소를 입력해 주세요" /></label>
        </>}
        <label className="public-auth-field">비밀번호<input name="password" type="password" value={form.password} onChange={update} autoComplete={signup ? 'new-password' : 'current-password'} placeholder="비밀번호를 입력해 주세요" /></label>
        {signup ? <>
          <label className="public-auth-field">비밀번호 확인<input name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={update} autoComplete="new-password" placeholder="비밀번호를 다시 입력해 주세요" /></label>
          <div className="public-auth-agreements">
            <label><input type="checkbox" checked={agreed.terms} onChange={(event) => setAgreed((current) => ({ ...current, terms: event.target.checked }))} />[필수] 이용약관에 동의합니다.</label>
            <label><input type="checkbox" checked={agreed.privacy} onChange={(event) => setAgreed((current) => ({ ...current, privacy: event.target.checked }))} />[필수] 개인정보 안내를 확인하고 동의합니다.</label>
            <label><input type="checkbox" checked={agreed.marketing} onChange={(event) => setAgreed((current) => ({ ...current, marketing: event.target.checked }))} />[선택] 모임 추천 및 소식 알림을 받습니다.</label>
          </div>
        </> : <div className="public-auth-help"><button type="button" onClick={onFindId}>아이디 찾기</button><span>·</span><button type="button" onClick={onFindPassword}>비밀번호 찾기</button></div>}
        <p className="public-auth-message" role="status">{message}</p>
        <button className="public-auth-submit" type="submit" disabled={busy}>{signup ? '계정 만들기' : '로그인'}</button>
        <p className="public-auth-switch">{signup ? '이미 계정이 있나요?' : '아직 계정이 없나요?'} <button type="button" onClick={() => { setMessage(''); onModeChange(signup ? 'login' : 'signup'); }}>{signup ? '로그인' : '회원가입'}</button></p>
      </form>
    </section>
  );
}
