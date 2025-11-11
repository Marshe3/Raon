// frontend/src/components/DebugPage.jsx
import { useState } from 'react';

function DebugPage() {
  const [config, setConfig] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [rawData, setRawData] = useState({});
  const [parsedData, setParsedData] = useState({});

  // API 설정 확인
  const checkConfig = async () => {
    const response = await fetch('/raon/api/debug/config');
    const data = await response.json();
    setConfig(data);
    console.log('API Config:', data);
  };

  // 전체 테스트
  const testAll = async () => {
    const response = await fetch('/raon/api/debug/test-all');
    const data = await response.json();
    setTestResults(data);
    console.log('Test Results:', data);
  };

  // 원본 응답 확인
  const checkRaw = async (endpoint) => {
    const response = await fetch(`/raon/api/debug/raw/${endpoint}`);
    const data = await response.json();
    setRawData(prev => ({ ...prev, [endpoint]: data }));
    console.log(`Raw ${endpoint}:`, data);
  };

  // 파싱된 데이터 확인
  const checkParsed = async (type) => {
    const response = await fetch(`/raon/api/debug/parsed/${type}`);
    const data = await response.json();
    setParsedData(prev => ({ ...prev, [type]: data }));
    console.log(`Parsed ${type}:`, data);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔍 PersoAI API 디버그</h1>

      {/* API 설정 */}
      <section style={{ marginBottom: '30px' }}>
        <h2>1️⃣ API 설정</h2>
        <button onClick={checkConfig} style={buttonStyle}>
          설정 확인
        </button>
        {config && (
          <pre style={preStyle}>{JSON.stringify(config, null, 2)}</pre>
        )}
      </section>

      {/* 전체 테스트 */}
      <section style={{ marginBottom: '30px' }}>
        <h2>2️⃣ 전체 엔드포인트 테스트</h2>
        <button onClick={testAll} style={buttonStyle}>
          전체 테스트 실행
        </button>
        {testResults && (
          <div>
            <pre style={preStyle}>{JSON.stringify(testResults, null, 2)}</pre>
            
            {/* 시각적 결과 */}
            <div style={{ marginTop: '10px' }}>
              <TestResult label="Prompts" status={testResults.prompts_status} count={testResults.prompts_count} />
              <TestResult label="Documents" status={testResults.documents_status} count={testResults.documents_count} />
              <TestResult label="Backgrounds" status={testResults.backgrounds_status} count={testResults.backgrounds_count} />
              <TestResult label="Model Styles" status={testResults.model_styles_status} count={testResults.model_styles_count} />
              <TestResult label="AI Models" status={testResults.models_status} count={testResults.models_count} />
            </div>
          </div>
        )}
      </section>

      {/* 원본 응답 */}
      <section style={{ marginBottom: '30px' }}>
        <h2>3️⃣ 원본 API 응답</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => checkRaw('prompt')} style={buttonStyle}>Prompts</button>
          <button onClick={() => checkRaw('document')} style={buttonStyle}>Documents</button>
          <button onClick={() => checkRaw('background_image')} style={buttonStyle}>Backgrounds</button>
          <button onClick={() => checkRaw('models')} style={buttonStyle}>Models</button>
        </div>
        {Object.entries(rawData).map(([key, value]) => (
          <details key={key} style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              {key} - Status: {value.status}
            </summary>
            <pre style={preStyle}>{value.body}</pre>
          </details>
        ))}
      </section>

      {/* 파싱된 데이터 */}
      <section style={{ marginBottom: '30px' }}>
        <h2>4️⃣ 파싱된 데이터</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => checkParsed('prompts')} style={buttonStyle}>Prompts</button>
          <button onClick={() => checkParsed('documents')} style={buttonStyle}>Documents</button>
          <button onClick={() => checkParsed('backgrounds')} style={buttonStyle}>Backgrounds</button>
          <button onClick={() => checkParsed('model-styles')} style={buttonStyle}>Model Styles</button>
          <button onClick={() => checkParsed('models')} style={buttonStyle}>Models</button>
        </div>
        {Object.entries(parsedData).map(([key, value]) => (
          <details key={key} style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              {key} ({Array.isArray(value) ? value.length : 0} items)
            </summary>
            <pre style={preStyle}>{JSON.stringify(value, null, 2)}</pre>
          </details>
        ))}
      </section>

      {/* 콘솔 안내 */}
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '30px'
      }}>
        <p><strong>💡 팁:</strong> 브라우저 콘솔(F12)을 열어서 더 자세한 로그를 확인하세요!</p>
        <p>모든 데이터는 콘솔에도 출력됩니다.</p>
      </div>
    </div>
  );
}

// 테스트 결과 표시 컴포넌트
function TestResult({ label, status, count }) {
  const isOk = status === 'OK';
  return (
    <div style={{
      padding: '10px',
      margin: '5px 0',
      background: isOk ? '#d4edda' : '#f8d7da',
      border: `1px solid ${isOk ? '#c3e6cb' : '#f5c6cb'}`,
      borderRadius: '5px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>
        <strong>{label}:</strong> {status}
      </span>
      {count !== undefined && (
        <span style={{ 
          background: isOk ? '#28a745' : '#dc3545',
          color: 'white',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '14px'
        }}>
          {count} items
        </span>
      )}
    </div>
  );
}

// 스타일
const buttonStyle = {
  padding: '10px 20px',
  background: '#667eea',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
};

const preStyle = {
  background: '#f5f5f5',
  padding: '15px',
  borderRadius: '5px',
  overflow: 'auto',
  fontSize: '12px',
  maxHeight: '400px',
  marginTop: '10px'
};

export default DebugPage;