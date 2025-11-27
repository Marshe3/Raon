import React, { useState } from "react";
import "./CustomDate.css";

const MIN_YEAR = 1900;
const MAX_YEAR = 2030;
const YEARS_PER_PAGE = 6;

const CustomDate = ({ value, onChange, placeholder = "날짜 선택", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isYearMode, setIsYearMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

  // === 유틸 함수들 ===
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // 이전 달 빈칸
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // 현재 달 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isCurrentMonth: true });
    }

    return days;
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 특정 연도가 몇 번째 페이지인지
  const getPageIndexForYear = (year) => {
    const clamped = Math.min(Math.max(year, MIN_YEAR), MAX_YEAR);
    const indexFromMax = MAX_YEAR - clamped; // 0부터 시작
    return Math.floor(indexFromMax / YEARS_PER_PAGE);
  };

  const [yearPageIndex, setYearPageIndex] = useState(() =>
    getPageIndexForYear(new Date().getFullYear())
  );

  const totalYearPages = Math.ceil((MAX_YEAR - MIN_YEAR + 1) / YEARS_PER_PAGE);

  const getYearsForPage = (pageIndex) => {
    const years = [];
    const startYear = MAX_YEAR - pageIndex * YEARS_PER_PAGE; // 2030, 2024, ...

    for (let i = 0; i < YEARS_PER_PAGE; i++) {
      const year = startYear - i; // 2030, 2029, ...
      if (year < MIN_YEAR) break;
      years.push(year);
    }

    return years;
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
    onChange({ target: { value: formatDate(newDate) } });
    setIsOpen(false);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isYearMode) {
      // 연도 페이지 이동 - 왼쪽 화살표는 과거로 (페이지 증가)
      setYearPageIndex((prev) => Math.min(prev + 1, totalYearPages - 1));
    } else {
      // 월 이동
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isYearMode) {
      // 연도 페이지 이동 - 오른쪽 화살표는 미래로 (페이지 감소)
      setYearPageIndex((prev) => Math.max(prev - 1, 0));
    } else {
      // 월 이동
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    }
  };

  const handleToday = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onChange({ target: { value: formatDate(today) } });
    setIsYearMode(false);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDate(null);
    onChange({ target: { value: "" } });
    setIsYearMode(false);
    // ✅ 지우기 후 현재 달로 리셋
    setCurrentDate(new Date());
    setIsOpen(false);
  };

  const handleToggleYearMode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextMode = !isYearMode;
    if (nextMode) {
      // 연도 모드 들어갈 때 현재 연도가 포함된 페이지부터 보이게
      const year = currentDate.getFullYear();
      setYearPageIndex(getPageIndexForYear(year));
    }
    setIsYearMode(nextMode);
  };

  const handleYearClick = (e, year) => {
    e.preventDefault();
    e.stopPropagation();
    const newDate = new Date(year, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
    setIsYearMode(false);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate || !day) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월"
  ];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const yearsForCurrentPage = getYearsForPage(yearPageIndex);

  // ✅ 달력 열 때 현재 달로 리셋하는 함수
  const handleOpenCalendar = () => {
    if (!disabled) {
      setCurrentDate(new Date()); // 항상 현재 달로 리셋
      setIsOpen(true);
      setIsYearMode(false);
    }
  };

  // ✅ 달력 닫는 함수
  const handleCloseCalendar = () => {
    setIsOpen(false);
    setIsYearMode(false);
  };

  return (
    <div className="modern-datepicker">
      <div
        className="datepicker-input-wrapper"
        onClick={handleOpenCalendar}
      >
        <span className="input-icon-calendar">📅</span>
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ""}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className="field-input"
        />
        <span className="dropdown-arrow-calendar">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && !disabled && (
        <>
          <div
            className="datepicker-overlay-modern"
            onClick={handleCloseCalendar}
          />
          <div className="datepicker-popup-modern">
            <div className="datepicker-header-modern">
              <button className="nav-btn-modern" onClick={handlePrev}>
                <span>◀</span>
              </button>

              <div
                className="current-month-modern"
                onClick={handleToggleYearMode}
              >
                <span className="year-month-modern">
                  {isYearMode && yearsForCurrentPage.length > 0
                    ? `${yearsForCurrentPage[0]}년 ~ ${
                        yearsForCurrentPage[yearsForCurrentPage.length - 1]
                      }년`
                    : `${currentDate.getFullYear()}년 ${
                        monthNames[currentDate.getMonth()]
                      }`}
                </span>
              </div>

              <button className="nav-btn-modern" onClick={handleNext}>
                <span>▶</span>
              </button>
            </div>

            <div className="datepicker-body-modern">
              {isYearMode ? (
                <div className="year-grid-modern">
                  {yearsForCurrentPage.map((year) => (
                    <button
                      key={year}
                      className={
                        "year-cell-modern" +
                        (currentDate.getFullYear() === year
                          ? " year-current"
                          : "") +
                        (selectedDate &&
                        selectedDate.getFullYear() === year
                          ? " year-selected"
                          : "")
                      }
                      onClick={(e) => handleYearClick(e, year)}
                    >
                      {year}년
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="day-names-modern">
                    {dayNames.map((name, index) => (
                      <div
                        key={name}
                        className={`day-name-modern ${
                          index === 0
                            ? "sunday"
                            : index === 6
                            ? "saturday"
                            : ""
                        }`}
                      >
                        {name}
                      </div>
                    ))}
                  </div>

                  <div className="days-grid-modern">
                    {days.map((item, index) => (
                      <div
                        key={index}
                        className={`day-cell-modern ${
                          !item.isCurrentMonth ? "disabled" : ""
                        } ${isToday(item.date) ? "today" : ""} ${
                          isSelected(item.date) ? "selected" : ""
                        }`}
                        onClick={() =>
                          item.isCurrentMonth && handleDateClick(item.date)
                        }
                      >
                        {item.date || ""}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="datepicker-footer-modern">
              <button
                className="footer-btn-modern today-btn-modern"
                onClick={handleToday}
              >
                오늘
              </button>
              <button
                className="footer-btn-modern clear-btn-modern"
                onClick={handleClear}
              >
                지우기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDate;