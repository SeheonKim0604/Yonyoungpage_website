import './Recruiting.css'

export default function Recruiting() {
  return (
    <div className="recruiting-page">
      <div className="container">
        <section className="recruiting-hero">
          <h1>RECRUITING</h1>
          <p className="subtitle">연영회 모집 안내</p>
        </section>

        <section className="recruiting-content">
          <div className="recruiting-section">
            <h2>모집 안내</h2>
            <p>
              연영회는 연 1회, 3월 중 리크루팅을 실시합니다.
            </p>
          </div>

          <div className="recruiting-section">
            <h2>지원 자격</h2>
            <ul className="qualification-list">
              <li>사진에 대한 열정과 관심</li>
              <li>정기적인 활동 참여 가능</li>
              <li>다른 멤버들과의 협력과 소통</li>
            </ul>
          </div>

          <div className="recruiting-section">
            <h2>지원 방법</h2>
            <div className="application-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>지원서 작성</h3>
                  <p>지원서를 작성하여 제출해주세요.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>면접</h3>
                  <p>지원서 검토 후 면접을 진행합니다.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>합격 통보</h3>
                  <p>합격자에게 개별적으로 연락드립니다.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="recruiting-section">
            <h2>문의</h2>
            <p>
              기타 문의사항이 있으시면 언제든지 연락주세요.
            </p>
            <div className="contact-info">
              <p>이메일: kimse0604@naver.com</p>
              <p>전화: 010-6814-1800</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
