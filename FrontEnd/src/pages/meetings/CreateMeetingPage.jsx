import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlignLeft, CalendarDays, Check, ChevronDown, Clock3, ImagePlus,
  MapPin, Minus, Plus, Search, Tag, Upload, Users, X,
} from 'lucide-react';
import { createMeeting } from '../../api/meetings.js';
import { createCategoryMarkerImage } from '../../components/map/categoryMarker.js';
import './CreateMeetingPage.css';

const CATEGORIES = ['운동', '맛집', '카페', '전시', '보드게임', '스터디', '기타'];

function hasCoordinates(location) {
  return location?.latitude != null && location?.longitude != null &&
    Number.isFinite(Number(location.latitude)) &&
    Number.isFinite(Number(location.longitude));
}

// 생성 화면 전용 지도입니다. 기존 홈 화면의 MeetingMap은 변경하지 않습니다.
function LocationPreview({ location, category }) {
  const container = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(!window.kakao?.maps);

  useEffect(() => {
    const maps = window.kakao?.maps;
    if (!maps) return undefined;
    let active = true;
    try {
      maps.load(() => {
        if (!active || !container.current) return;
        try {
          map.current = new maps.Map(container.current, {
            center: new maps.LatLng(37.581789, 127.010369),
            level: 3,
          });
          map.current.addControl(
            new maps.ZoomControl(), maps.ControlPosition.RIGHT,
          );
          setReady(true);
        } catch {
          setFailed(true);
        }
      });
    } catch {
      queueMicrotask(() => { if (active) setFailed(true); });
    }
    const mapElement = container.current;
    const resizeObserver = new ResizeObserver(() => {
      if (!map.current) return;
      const center = map.current.getCenter();
      map.current.relayout();
      map.current.setCenter(center);
    });
    if (mapElement) resizeObserver.observe(mapElement);
    return () => {
      active = false;
      resizeObserver.disconnect();
      marker.current?.setMap(null);
      marker.current = null;
      map.current = null;
      mapElement?.replaceChildren();
    };
  }, []);

  useEffect(() => {
    if (!ready || !map.current) return;
    marker.current?.setMap(null);
    marker.current = null;
    if (!hasCoordinates(location)) return;
    const maps = window.kakao.maps;
    const position = new maps.LatLng(
      Number(location.latitude), Number(location.longitude),
    );
    map.current.relayout();
    map.current.setCenter(position);
    marker.current = new maps.Marker({
      map: map.current,
      position,
      image: createCategoryMarkerImage(maps, category),
    });
  }, [location, category, ready]);

  return (
    <div className="cm-map-wrap">
      <div ref={container} className="cm-map" aria-label="모임 장소 지도" />
      {(!ready || failed) && (
        <p className="cm-map-message" role="status">
          {failed ? '지도를 불러오지 못했어요. 연결과 지도 설정을 확인해주세요.' : '지도를 불러오는 중입니다.'}
        </p>
      )}
    </div>
  );
}

function ImagePreview({ file, onRemove, disabled }) {
  const image = useRef(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    const element = image.current;
    element.src = objectUrl;
    return () => {
      element.removeAttribute('src');
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);
  return (
    <div className="cm-image-preview">
      <img ref={image} alt={file.name} />
      <button type="button" onClick={onRemove} disabled={disabled}
        aria-label={file.name + ' 삭제'}><X size={14} /></button>
    </div>
  );
}

export default function CreateMeetingPage({
  onBack, onCreated, userName, token, selectedLocation,
}) {
  const dialog = useRef(null);
  const placeInput = useRef(null);
  const imageInput = useRef(null);
  const searchTimer = useRef(null);
  const searchSequence = useRef(0);
  const submitting = useRef(false);
  const mounted = useRef(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [count, setCount] = useState(4);
  const [place, setPlace] = useState(selectedLocation?.placeName ?? '');
  const [location, setLocation] = useState(selectedLocation ?? null);
  const [results, setResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [images, setImages] = useState([]);
  const [imageMessage, setImageMessage] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    mounted.current = true;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      mounted.current = false;
      clearTimeout(searchTimer.current);
      searchSequence.current += 1;
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function changePlace(event) {
    const value = event.target.value;
    const sequence = ++searchSequence.current;
    clearTimeout(searchTimer.current);
    setPlace(value);
    setLocation(null);
    setResults([]);
    setSearchMessage('');
    if (value.trim().length < 2) return;
    searchTimer.current = setTimeout(() => {
      if (!window.kakao?.maps?.services) {
        setSearchMessage('장소 검색 서비스를 불러오지 못했어요.');
        return;
      }
      setSearchMessage('장소를 검색하고 있어요.');
      const maps = window.kakao.maps;
      new maps.services.Places().keywordSearch(value.trim(), (data, status) => {
        if (!mounted.current || sequence !== searchSequence.current) return;
        setResults(status === maps.services.Status.OK ? data.slice(0, 6) : []);
        setSearchMessage(status === maps.services.Status.OK ? '' :
          status === maps.services.Status.ZERO_RESULT ? '검색 결과가 없습니다.' :
          '장소 검색에 실패했어요. 다시 시도해주세요.');
      });
    }, 250);
  }

  function selectPlace(result) {
    clearTimeout(searchTimer.current);
    searchSequence.current += 1;
    setPlace(result.place_name);
    setLocation({
      placeName: result.place_name,
      address: result.road_address_name || result.address_name,
      latitude: Number(result.y),
      longitude: Number(result.x),
    });
    setResults([]);
    setSearchMessage('');
  }

  function addImages(event) {
    const selected = Array.from(event.target.files || []);
    const valid = selected.filter((file) =>
      ['image/jpeg', 'image/png'].includes(file.type) && file.size <= 10 * 1024 * 1024,
    );
    const remaining = 3 - images.length;
    setImages((current) => [...current, ...valid.slice(0, remaining)]);
    setImageMessage(valid.length !== selected.length ?
      'JPG, PNG 파일만 선택할 수 있고, 파일당 최대 10MB입니다.' :
      valid.length > remaining ? '사진은 최대 3장까지 선택할 수 있어요.' : '');
    event.target.value = '';
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    if (!title.trim() || !description.trim()) {
      setMessage('모임 이름과 소개를 입력해주세요.');
      return;
    }
    if (!category) { setMessage('카테고리를 선택해주세요.'); return; }
    if (!hasCoordinates(location)) {
      setMessage('오른쪽 검색 결과에서 모임 장소를 선택해주세요.');
      placeInput.current?.focus();
      return;
    }
    const startsAt = date + 'T' + time + ':00';
    if (!date || !time || !Number.isFinite(new Date(startsAt).getTime()) ||
        new Date(startsAt).getTime() <= Date.now()) {
      setMessage('현재 시간 이후의 모임 일시를 선택해주세요.');
      return;
    }
    if (!token) { setMessage('로그인 정보가 없습니다. 다시 로그인해주세요.'); return; }
    submitting.current = true;
    setIsSubmitting(true);
    setMessage('모임을 생성하고 있습니다.');
    try {
      const result = await createMeeting({
        token,
        meeting: {
          title: title.trim(), category, description: description.trim(),
          placeName: location.placeName,
          latitude: Number(location.latitude), longitude: Number(location.longitude),
          startsAt, maxMembers: count,
        },
        images,
      });
      if (mounted.current) {
        if (onCreated) onCreated(result);
        else onBack();
      }
    } catch (error) {
      if (mounted.current) setMessage(error instanceof Error ?
        error.message : '모임 생성에 실패했습니다.');
    } finally {
      submitting.current = false;
      if (mounted.current) setIsSubmitting(false);
    }
  }

  return createPortal(
    <dialog ref={dialog} className="cm-dialog" aria-labelledby="cm-title"
      aria-describedby="cm-subtitle"
      onCancel={(event) => {
        event.preventDefault();
        if (!submitting.current) onBack();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !submitting.current) onBack();
      }}>
      <div className="cm-shell">
        <header className="cm-header">
          <div>
            <h1 id="cm-title">모임 만들기</h1>
            <p id="cm-subtitle">좋은 사람들과, 좋은 시간을 만들어보세요.</p>
          </div>
          <button type="button" className="cm-close" onClick={onBack}
            disabled={isSubmitting} aria-label="모임 만들기 닫기"><X /></button>
        </header>

        <form onSubmit={submit} className="cm-form" aria-busy={isSubmitting}>
          <fieldset className="cm-fields" disabled={isSubmitting}>
            <legend className="cm-sr-only">모임 생성 정보</legend>
            <div className="cm-columns">
              <div className="cm-left">
                <div className="cm-row">
                  <label htmlFor="cm-name">모임 이름 <em>*</em></label>
                  <div>
                    <input id="cm-name" className="cm-input" value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="예) 한강 주말 러닝 모임" maxLength={50} required />
                    <p className="cm-counter">{title.length}/50</p>
                  </div>
                </div>
                <div className="cm-row">
                  <label htmlFor="cm-category">카테고리 <em>*</em></label>
                  <div className="cm-input-icon">
                    <Tag size={19} />
                    <select id="cm-category" value={category} required
                      onChange={(event) => setCategory(event.target.value)}>
                      <option value="" disabled>카테고리를 선택하세요</option>
                      {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </div>
                <div className="cm-row">
                  <label htmlFor="cm-date">모임 일시 <em>*</em></label>
                  <div className="cm-datetime">
                    <div className="cm-input-icon">
                      <CalendarDays size={18} />
                      <input id="cm-date" aria-label="모임 날짜" type="date"
                        value={date} onChange={(event) => setDate(event.target.value)} required />
                    </div>
                    <div className="cm-input-icon">
                      <Clock3 size={18} />
                      <input aria-label="모임 시간" type="time" value={time}
                        onChange={(event) => setTime(event.target.value)} required />
                    </div>
                  </div>
                </div>
                <div className="cm-row">
                  <span className="cm-label">모임 장소 <em>*</em></span>
                  <div>
                    <button type="button" className="cm-location-link"
                      onClick={() => placeInput.current?.focus()}>
                      <MapPin size={18} />
                      <span>{location?.placeName || '오른쪽에서 장소를 검색해주세요'}</span>
                      <Search size={16} />
                    </button>
                    <p className="cm-help">검색 결과를 선택하면 지도에 위치가 표시돼요.</p>
                  </div>
                </div>
                <div className="cm-row">
                  <span id="cm-members-label" className="cm-label">최대 인원 <em>*</em></span>
                  <div>
                    <div className="cm-member-control">
                      <Users size={19} />
                      <output aria-labelledby="cm-members-label" aria-live="polite">{count}명</output>
                      <button type="button" aria-label="모집 인원 줄이기"
                        disabled={isSubmitting || count <= 2}
                        onClick={() => setCount((value) => Math.max(2, value - 1))}><Minus size={16} /></button>
                      <button type="button" aria-label="모집 인원 늘리기"
                        disabled={isSubmitting || count >= 50}
                        onClick={() => setCount((value) => Math.min(50, value + 1))}><Plus size={16} /></button>
                    </div>
                    <p className="cm-help">주최자 {userName || '회원'} 포함 · 2~50명</p>
                  </div>
                </div>
                <div className="cm-row cm-description-row">
                  <label htmlFor="cm-description">모임 소개 <em>*</em></label>
                  <div>
                    <div className="cm-description">
                      <AlignLeft size={18} />
                      <textarea id="cm-description" value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="모임의 목적, 어떤 활동을 하는지 소개해주세요. 함께할 분들에게 좋은 정보를 제공해 보세요."
                        maxLength={300} required />
                    </div>
                    <p className="cm-counter">{description.length}/300</p>
                  </div>
                </div>
                <p className="cm-required-note"><em>*</em> 표시된 항목은 필수 입력사항입니다.</p>
              </div>

              <div className="cm-right">
                <section className="cm-panel">
                  <h2><MapPin size={19} /> 모임 위치</h2>
                  <p className="cm-help">장소를 검색하고 결과에서 정확한 위치를 선택해주세요.</p>
                  <div className="cm-place-search">
                    <div className="cm-input-icon">
                      <Search size={19} />
                      <input ref={placeInput} aria-label="모임 장소 검색"
                        value={place} onChange={changePlace}
                        placeholder="장소를 검색하세요." autoComplete="off"
                        aria-describedby="cm-search-status" />
                    </div>
                    {results.length > 0 && (
                      <ul className="cm-search-results" aria-label="장소 검색 결과">
                        {results.map((result) => (
                          <li key={result.id}>
                            <button type="button" onClick={() => selectPlace(result)}>
                              <strong>{result.place_name}</strong>
                              <span>{result.road_address_name || result.address_name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p id="cm-search-status" className="cm-help" role="status">{searchMessage}</p>
                  </div>
                  <LocationPreview location={location} category={category} />
                  <div className="cm-selected-place">
                    <MapPin size={18} />
                    <div>
                      <strong>{location?.placeName || '모임 장소를 선택해주세요'}</strong>
                      <p>{location?.address || '선택한 장소의 주소가 표시됩니다.'}</p>
                    </div>
                    {hasCoordinates(location) && <Check size={18} className="cm-location-check" />}
                  </div>
                </section>
                <section className="cm-panel">
                  <h2><ImagePlus size={19} /> 모임 대표 이미지 <small>(선택)</small></h2>
                  <p className="cm-help">모임을 잘 표현하는 사진을 골라보세요.</p>
                  <input ref={imageInput} type="file" accept="image/jpeg,image/png"
                    multiple hidden onChange={addImages} aria-label="모임 이미지 선택" />
                  <button type="button" className="cm-upload"
                    onClick={() => imageInput.current?.click()}
                    disabled={isSubmitting || images.length >= 3}>
                    <Upload size={26} />
                    <strong>이미지를 선택하세요.</strong>
                    <span>JPG, PNG · 장당 최대 10MB · 최대 3장</span>
                  </button>
                  {images.length > 0 && (
                    <div className="cm-image-list">
                      {images.map((file, index) => (
                        <ImagePreview key={file.name + '-' + file.lastModified + '-' + index}
                          file={file} disabled={isSubmitting}
                          onRemove={() => setImages((current) => current.filter((_, i) => i !== index))} />
                      ))}
                    </div>
                  )}
                  <p className="cm-help">선택한 이미지는 미리보기용이며, 모임 생성 시 저장되지 않습니다.</p>
                  {imageMessage && <p className="cm-image-message" role="status">{imageMessage}</p>}
                </section>
              </div>
            </div>
          </fieldset>
          <footer className="cm-footer">
            {message && <p className="cm-message" role="status">{message}</p>}
            <button type="submit" className="cm-submit" disabled={isSubmitting}>
              {isSubmitting ? '모임 생성 중…' : '모임 생성'}
            </button>
          </footer>
        </form>
      </div>
    </dialog>,
    document.body,
  );
}
