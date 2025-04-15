// 보안을 위해 실제 배포 시에는 이 값들은 서버 측에서 관리해야 합니다.
// 이 방식은 테스트 환경에서만 사용하세요.

// 주의: 실제 프로덕션 환경에서는 이러한 민감한 정보를 클라이언트 코드에 저장하면 안 됩니다.
// 서버 사이드 렌더링이나 환경 변수를 통해 안전하게 관리하세요.

// 애플리케이션 설정 및 환경 변수

// Supabase 설정
const SUPABASE_URL = 'https://zthihjyrifsbssbsaaky.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0aGloanlyaWZzYnNzYnNhYWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0Nzc5NzgsImV4cCI6MjA2MDA1Mzk3OH0.27a9HrNmT89ZoRExQUSpMkUNRmnawN1poJnYV0rXTHE';

// 차트 색상 테마
const CHART_COLORS = {
    primary: '#4e73df',
    success: '#1cc88a',
    info: '#36b9cc',
    warning: '#f6c23e',
    danger: '#e74a3b',
    secondary: '#858796',
    light: '#f8f9fc',
    dark: '#5a5c69'
};

// 상태 색상 매핑
const STATUS_COLORS = {
    'won': CHART_COLORS.success,
    'lost': CHART_COLORS.danger,
    'pending': CHART_COLORS.warning,
    'negotiation': CHART_COLORS.info,
    'qualified': CHART_COLORS.primary,
    'default': CHART_COLORS.secondary
};

// 소스 색상 매핑
const SOURCE_COLORS = {
    'referral': '#4e73df',
    'website': '#1cc88a',
    'phone': '#36b9cc',
    'email': '#f6c23e',
    'social': '#e74a3b',
    'event': '#858796',
    'default': '#5a5c69'
};

// 날짜 범위 옵션
const DATE_RANGE_OPTIONS = [
    { value: 3, label: '최근 3개월' },
    { value: 6, label: '최근 6개월' },
    { value: 12, label: '최근 1년' },
    { value: 24, label: '최근 2년' },
    { value: 36, label: '최근 3년' }
];

// 전역 변수 초기화
window.supabaseClient = null;
window.originalData = null;



// 애플리케이션 설정
const appConfig = {
    // 애플리케이션 이름
    appName: 'CRM 대시보드',
    
    // Supabase 설정
    supabase: {
        url: SUPABASE_URL,
        key: SUPABASE_ANON_KEY,
        tables: {
            deals: 'deals'
        }
    },
    
    // UI 설정
    ui: {
        theme: 'light',
        dateFormat: 'YYYY-MM-DD',
        currency: 'KRW',
        showFilters: true,
        defaultDateRange: 'all'
    },
    
    // 차트 설정
    charts: {
        colors: [
            '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
            '#858796', '#5a5c69', '#6610f2', '#6f42c1', '#fd7e14'
        ],
        backgroundColor: 'rgba(78, 115, 223, 0.05)',
        borderColor: 'rgba(78, 115, 223, 1)'
    },
    
    // 상태 설정
    status: {
        options: ['active', 'pending', 'won', 'lost'],
        colors: {
            active: 'primary',
            pending: 'warning',
            won: 'success',
            lost: 'danger'
        }
    },
    
    // 소스 설정
    sources: {
        options: ['직접 문의', '웹사이트', '소개', '광고', '기타']
    }
};

// Supabase 초기화
async function initSupabase() {
    if (window.supabaseClient) {
        console.log('Supabase가 이미 초기화되었습니다.');
        return window.supabaseClient;
    }
    
    try {
        console.log('Supabase 초기화 시작');
        console.log('Supabase 전역 객체 확인:', typeof supabase);
        console.log('createClient 함수 확인:', typeof createClient);
        
        // Supabase 클라이언트 초기화 (다양한 방법 시도)
        if (typeof supabase !== 'undefined') {
            console.log('supabase 전역 객체 발견, createClient 메서드 확인:', typeof supabase.createClient);
            
            if (typeof supabase.createClient === 'function') {
                // 표준 방법 - 전역 supabase 객체
                window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('Supabase 클라이언트 생성 성공 (supabase.createClient 사용)');
            } else {
                // 대체 방법 - UMD 번들
                console.log('createClient 메서드가 없습니다. 대체 방법 시도...');
                
                if (typeof supabase === 'object' && supabase !== null) {
                    try {
                        if (typeof supabase.SupabaseClient === 'function') {
                            window.supabaseClient = new supabase.SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                            console.log('Supabase 클라이언트 생성 성공 (SupabaseClient 생성자 사용)');
                        } else {
                            throw new Error('SupabaseClient 생성자를 찾을 수 없습니다');
                        }
                    } catch (innerError) {
                        console.error('대체 방법 시도 오류:', innerError);
                        throw innerError;
                    }
                } else {
                    throw new Error('Supabase 객체가 유효하지 않습니다');
                }
            }
        } else if (typeof createClient === 'function') {
            // ES 모듈/NPM 패키지 스타일
            window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase 클라이언트 생성 성공 (createClient 함수 사용)');
        } else {
            // 마지막 수단 - 직접 URL로 호출하는 래퍼 생성
            console.warn('Supabase 라이브러리를 찾을 수 없습니다. 간단한 래퍼를 생성합니다.');
            
            // 간단한 Supabase 클라이언트 래퍼 생성
            window.supabaseClient = {
                from: function(table) {
                    return {
                        select: function(columns) {
                            return {
                                order: function(column, options) {
                                    return {
                                        limit: function(limitCount) {
                                            // 실제 API 호출 (fetch 사용)
                                            return fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns || '*'}&order=${column}.${options.ascending ? 'asc' : 'desc'}&limit=${limitCount}`, {
                                                headers: {
                                                    'apikey': SUPABASE_ANON_KEY,
                                                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                                                    'Content-Type': 'application/json'
                                                }
                                            })
                                            .then(response => response.json())
                                            .then(data => ({ data, error: null }))
                                            .catch(error => ({ data: null, error }));
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
            console.log('간단한 Supabase 클라이언트 래퍼가 생성되었습니다.');
        }
        
        if (!window.supabaseClient) {
            throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
        }
        
        // 연결 테스트
        console.log('Supabase 연결 테스트 중...');
        const { data, error } = await window.supabaseClient.from('deals').select('deal_id').limit(1);
        
        if (error) {
            console.error('Supabase 연결 테스트 실패:', error);
            throw error;
        }
        
        console.log('Supabase 연결 성공:', data);
        console.log('Supabase 초기화 완료');
        return window.supabaseClient;
    } catch (error) {
        console.error('Supabase 초기화 최종 오류:', error);
        // 오류 발생 시 표시
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '10px';
        errorDiv.style.left = '10px';
        errorDiv.style.right = '10px';
        errorDiv.style.padding = '10px';
        errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        errorDiv.style.color = 'white';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '9999';
        errorDiv.textContent = `Supabase 연결 오류: ${error.message || '알 수 없는 오류'}`;
        document.body.appendChild(errorDiv);
        
        // 5초 후 오류 메시지 제거
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
        
        throw error;
    }
}

// 애플리케이션 설정 가져오기
function getConfig() {
    return appConfig;
}

// 애플리케이션 설정 업데이트
function updateConfig(newConfig) {
    Object.assign(appConfig, newConfig);
    
    // 로컬 스토리지에 설정 저장
    try {
        localStorage.setItem('crmConfig', JSON.stringify(appConfig));
    } catch (error) {
        console.error('설정 저장 오류:', error);
    }
    
    return appConfig;
}

// 초기화 함수
function initConfig() {
    console.log('설정 모듈 초기화 시작');
    
    // 로컬 스토리지에서 설정 불러오기
    try {
        const savedConfig = localStorage.getItem('crmConfig');
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            // 안전하게 업데이트 (기본 구조 유지)
            updateConfig(parsedConfig);
            console.log('저장된 설정을 불러왔습니다.');
        }
    } catch (error) {
        console.error('설정 불러오기 오류:', error);
    }
    
    // 테마 적용
    applyTheme(appConfig.ui.theme);
    
    console.log('설정 모듈 초기화 완료');
    
    // Supabase 초기화 후 데이터 로드
    return initSupabase().then(supabaseClient => {
        window.supabaseClient = supabaseClient;
        console.log('Supabase 초기화 완료, 데이터 로드 시작');
        
        // 데이터 로드 함수가 있으면 호출
        if (typeof window.loadData === 'function') {
            console.log('loadData 함수 호출');
            return window.loadData();
        } else {
            console.warn('loadData 함수가 정의되지 않았습니다.');
        }
    }).catch(error => {
        console.error('초기화 중 오류:', error);
    });
}

// 테마 적용
function applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
    } else {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
    }
    
    // 테마 상태 저장
    appConfig.ui.theme = theme;
    updateConfig(appConfig);
}

// 테마 토글
function toggleTheme() {
    const currentTheme = appConfig.ui.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    return newTheme;
}

// DOM 로드 시 설정 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('설정 모듈이 로드되었습니다.');
    initConfig().then(() => {
        console.log('설정 및 데이터 초기화 완료');
    }).catch(error => {
        console.error('초기화 중 오류:', error);
    });
    
    // 테마 토글 버튼 이벤트 리스너 추가
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            toggleTheme();
        });
    }
}); 