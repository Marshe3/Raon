import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* 프로젝트 정보 */}
          <div className="footer-section">
            <h3 className="footer-title">RAON</h3>
            <p className="footer-description">
              AI 기반 면접 준비 플랫폼<br/>
              당신의 성공적인 면접을 함께합니다
            </p>
          </div>

          {/* 서비스 */}
          <div className="footer-section">
            <h4 className="footer-heading">서비스</h4>
            <ul className="footer-links">
              <li><button onClick={() => navigate('/avatar')} className="footer-link">AI 면접 연습</button></li>
              <li><button onClick={() => navigate('/resume')} className="footer-link">이력서/자소서 작성</button></li>
              <li><button onClick={() => navigate('/history')} className="footer-link">학습 기록</button></li>
            </ul>
          </div>

          {/* 프로젝트 */}
          <div className="footer-section">
            <h4 className="footer-heading">프로젝트</h4>
            <ul className="footer-links">
              <li><span className="footer-text">팀명: 콩국수는 설탕EZ</span></li>
              <li><span className="footer-text">개발 기간: 2025</span></li>
              <li><span className="footer-text">기술 스택: React, Spring Boot</span></li>
            </ul>
          </div>

          {/* 팀 정보 */}
          <div className="footer-section">
            <h4 className="footer-heading">팀 구성</h4>
            <ul className="footer-links">
              <li><span className="footer-text"> 밍</span></li>
              <li><span className="footer-text"> 푹신한마시멜로</span></li>
              <li><span className="footer-text"> 오공</span></li>
			  <li><span className="footer-text"> 미용실말티즈</span></li>
			  <li><span className="footer-text"> 유녕</span></li>
            </ul>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2025 RAON. 콩국수는 설탕EZ Team Project.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;