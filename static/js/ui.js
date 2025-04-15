/**
 * ui.js
 * UI 관련 기능 모듈
 * 대시보드 차트, 테이블 및 사용자 인터페이스 요소 업데이트 처리
 */

// UI 상태 데이터
const uiState = {
    isLoading: false,
    sidebarOpen: true,
    darkMode: false,
    currentPage: 'dashboard',
};

// UI 요소 캐시
const uiElements = {
    // 로딩 요소
    loader: document.getElementById('loader'),
    loaderOverlay: document.getElementById('loader-overlay'),
    
    // 대시보드 요소
    dashboardCards: {},
    dealsTableBody: document.getElementById('deals-table-body'),
    noDealsMessage: document.getElementById('no-deals-message'),
    
    // 필터 요소
    statusFilter: document.getElementById('status-filter'),
    sourceFilter: document.getElementById('source-filter'),
    dateRangeFilter: document.getElementById('date-range-filter'),
    searchInput: document.getElementById('search-input'),
    
    // 사이드바
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    
    // 테마 토글
    themeToggle: document.getElementById('theme-toggle'),
};

// UI 초기화
async function initUI() {
    console.log('UI 모듈 초기화 중...');
    
    try {
        // DOM 요소 캐시 업데이트
        cacheUIElements();
        
        // 이벤트 리스너 연결
        attachEventListeners();
        
        // 사용자 인터페이스 환경설정 로드
        loadUIPreferences();
        
        // 테마 적용
        applyTheme();
        
        // config.js의 Supabase 클라이언트 사용
        // window.supabaseClient는 config.js의 initConfig 함수에서 초기화됨
        if (!window.supabaseClient) {
            console.log('Supabase 클라이언트가 초기화되지 않았습니다. config.js가 먼저 로드되었는지 확인하세요.');
            // config.js의 initSupabase 함수 활용
            if (typeof initSupabase === 'function') {
                await initSupabase();
            } else {
                throw new Error('Supabase 초기화 함수를 찾을 수 없습니다.');
            }
        } else {
            console.log('Supabase 클라이언트가 이미 초기화되어 있습니다.');
        }
        
        // 필터 초기화
        initFilters();
        
        // 데이터 로드
        await loadDashboardData();
        
        console.log('UI 모듈 초기화 완료');
    } catch (error) {
        console.error('UI 초기화 오류:', error);
        showError('UI 초기화 중 오류가 발생했습니다.');
    }
}

// UI 요소 캐시
function cacheUIElements() {
    // 대시보드 카드 요소
    uiElements.dashboardCards = {
        totalDeals: document.getElementById('total-deals-card'),
        totalValue: document.getElementById('total-value-card'),
        conversionRate: document.getElementById('conversion-rate-card'),
        avgDealSize: document.getElementById('avg-deal-size-card')
    };
    
    // 추가 요소 캐시
    uiElements.dealsTableBody = document.getElementById('deals-table-body');
    uiElements.noDealsMessage = document.getElementById('no-deals-message');
    
    // 필터 요소
    uiElements.statusFilter = document.getElementById('status-filter');
    uiElements.sourceFilter = document.getElementById('source-filter');
    uiElements.dateRangeFilter = document.getElementById('date-range-filter');
    uiElements.searchInput = document.getElementById('search-input');
    
    // 사이드바 및 테마 요소
    uiElements.sidebar = document.getElementById('sidebar');
    uiElements.sidebarToggle = document.getElementById('sidebar-toggle');
    uiElements.themeToggle = document.getElementById('theme-toggle');
}

// 이벤트 리스너 연결
function attachEventListeners() {
    // 사이드바 토글
    if (uiElements.sidebarToggle) {
        uiElements.sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // 테마 토글
    if (uiElements.themeToggle) {
        uiElements.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // 필터 변경 이벤트
    if (uiElements.statusFilter) {
        uiElements.statusFilter.addEventListener('change', applyFilters);
    }
    
    if (uiElements.sourceFilter) {
        uiElements.sourceFilter.addEventListener('change', applyFilters);
    }
    
    if (uiElements.dateRangeFilter) {
        uiElements.dateRangeFilter.addEventListener('change', applyFilters);
    }
    
    // 검색 필드
    if (uiElements.searchInput) {
        uiElements.searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
}

// 사용자 인터페이스 환경설정 로드
function loadUIPreferences() {
    // 로컬 스토리지에서 UI 환경설정 로드
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const sidebarOpen = localStorage.getItem('sidebarOpen') !== 'false'; // 기본값은 열림
    
    // 상태 업데이트
    uiState.darkMode = darkMode;
    uiState.sidebarOpen = sidebarOpen;
    
    console.log('UI 환경설정 로드:', { darkMode, sidebarOpen });
}

// 테마 적용
function applyTheme() {
    if (uiState.darkMode) {
        document.body.classList.add('dark-mode');
        if (uiElements.themeToggle) {
            uiElements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            uiElements.themeToggle.setAttribute('title', '밝은 테마로 변경');
        }
    } else {
        document.body.classList.remove('dark-mode');
        if (uiElements.themeToggle) {
            uiElements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            uiElements.themeToggle.setAttribute('title', '어두운 테마로 변경');
        }
    }
    
    // 사이드바 상태 적용
    if (uiElements.sidebar) {
        if (uiState.sidebarOpen) {
            uiElements.sidebar.classList.remove('collapsed');
            document.body.classList.remove('sidebar-collapsed');
        } else {
            uiElements.sidebar.classList.add('collapsed');
            document.body.classList.add('sidebar-collapsed');
        }
    }
}

// 테마 토글
function toggleTheme() {
    uiState.darkMode = !uiState.darkMode;
    
    // 로컬 스토리지에 저장
    localStorage.setItem('darkMode', uiState.darkMode);
    
    // 테마 적용
    applyTheme();
}

// 사이드바 토글
function toggleSidebar() {
    uiState.sidebarOpen = !uiState.sidebarOpen;
    
    // 로컬 스토리지에 저장
    localStorage.setItem('sidebarOpen', uiState.sidebarOpen);
    
    // 사이드바 상태 적용
    applyTheme();
}

// 로딩 표시
function showLoader() {
    uiState.isLoading = true;
    
    if (uiElements.loader) {
        uiElements.loader.style.display = 'flex';
    }
    
    if (uiElements.loaderOverlay) {
        uiElements.loaderOverlay.style.display = 'block';
    }
}

// 로딩 숨기기
function hideLoader() {
    uiState.isLoading = false;
    
    if (uiElements.loader) {
        uiElements.loader.style.display = 'none';
    }
    
    if (uiElements.loaderOverlay) {
        uiElements.loaderOverlay.style.display = 'none';
    }
}

// 오류 메시지 표시
function showError(message, duration = 5000) {
    console.error('오류:', message);
    
    // 이미 표시된 오류 메시지 확인
    let errorToast = document.getElementById('error-toast');
    
    // 없으면 생성
    if (!errorToast) {
        errorToast = document.createElement('div');
        errorToast.id = 'error-toast';
        errorToast.className = 'error-toast';
        document.body.appendChild(errorToast);
    }
    
    // 메시지 설정
    errorToast.textContent = message;
    errorToast.style.display = 'block';
    
    // 일정 시간 후 숨기기
    setTimeout(() => {
        errorToast.style.display = 'none';
    }, duration);
}

// 성공 메시지 표시
function showSuccess(message, duration = 3000) {
    // 이미 표시된 성공 메시지 확인
    let successToast = document.getElementById('success-toast');
    
    // 없으면 생성
    if (!successToast) {
        successToast = document.createElement('div');
        successToast.id = 'success-toast';
        successToast.className = 'success-toast';
        document.body.appendChild(successToast);
    }
    
    // 메시지 설정
    successToast.textContent = message;
    successToast.style.display = 'block';
    
    // 일정 시간 후 숨기기
    setTimeout(() => {
        successToast.style.display = 'none';
    }, duration);
}

// 필터 초기화
function initFilters() {
    // 상태 필터 옵션 생성
    if (uiElements.statusFilter) {
        const statusOptions = ['all', 'open', 'won', 'lost', 'pending'];
        const statusLabels = {
            'all': '모든 상태',
            'open': '진행 중',
            'won': '성사됨',
            'lost': '실패',
            'pending': '보류'
        };
        
        // 옵션 추가
        statusOptions.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = statusLabels[status] || status;
            uiElements.statusFilter.appendChild(option);
        });
    }
    
    // 소스 필터 옵션 생성
    if (uiElements.sourceFilter) {
        const sourceOptions = ['all', 'website', 'referral', 'cold-call', 'social-media', 'event'];
        const sourceLabels = {
            'all': '모든 소스',
            'website': '웹사이트',
            'referral': '소개',
            'cold-call': '콜드콜',
            'social-media': '소셜미디어',
            'event': '이벤트'
        };
        
        // 옵션 추가
        sourceOptions.forEach(source => {
            const option = document.createElement('option');
            option.value = source;
            option.textContent = sourceLabels[source] || source;
            uiElements.sourceFilter.appendChild(option);
        });
    }
    
    // 날짜 범위 필터 옵션 생성
    if (uiElements.dateRangeFilter) {
        const dateRangeOptions = ['all', 'today', 'week', 'month', 'quarter', 'year'];
        const dateRangeLabels = {
            'all': '전체 기간',
            'today': '오늘',
            'week': '이번 주',
            'month': '이번 달',
            'quarter': '이번 분기',
            'year': '올해'
        };
        
        // 옵션 추가
        dateRangeOptions.forEach(range => {
            const option = document.createElement('option');
            option.value = range;
            option.textContent = dateRangeLabels[range] || range;
            uiElements.dateRangeFilter.appendChild(option);
        });
    }
}

// 대시보드 데이터 로드
async function loadDashboardData() {
    try {
        showLoader();
        
        // 데이터 모듈에서 데이터 로드
        if (typeof loadDeals === 'function') {
            await loadDeals();
        } else {
            console.error('loadDeals 함수를 찾을 수 없습니다. data.js가 로드되었는지 확인하세요.');
        }
    } catch (error) {
        console.error('대시보드 데이터 로드 오류:', error);
        showError('데이터를 로드하는 중 오류가 발생했습니다.');
    } finally {
        hideLoader();
    }
}

// 필터 적용
function applyFilters() {
    if (typeof window.applyDataFilters === 'function') {
        // data.js의 필터 함수를 다른 이름으로 호출
        window.applyDataFilters();
    } else {
        console.error('applyDataFilters 함수를 찾을 수 없습니다. data.js가 로드되었는지 확인하세요.');
    }
}

// 필터 값 가져오기
function getFilterValues() {
    return {
        status: uiElements.statusFilter ? uiElements.statusFilter.value : null,
        source: uiElements.sourceFilter ? uiElements.sourceFilter.value : null,
        dateRange: uiElements.dateRangeFilter ? uiElements.dateRangeFilter.value : null,
        search: uiElements.searchInput ? uiElements.searchInput.value.toLowerCase() : ''
    };
}

// 대시보드 카드 업데이트
function updateDashboardCards(stats) {
    const { totalDeals, totalValue, wonDeals } = stats;
    
    // 거래 수 카드
    if (uiElements.dashboardCards.totalDeals) {
        const card = uiElements.dashboardCards.totalDeals;
        const counterElement = card.querySelector('.counter');
        if (counterElement) {
            counterElement.textContent = totalDeals.toLocaleString();
        }
    }
    
    // 총 금액 카드
    if (uiElements.dashboardCards.totalValue) {
        const card = uiElements.dashboardCards.totalValue;
        const counterElement = card.querySelector('.counter');
        if (counterElement) {
            counterElement.textContent = formatCurrency(totalValue);
        }
    }
    
    // 전환율 카드
    if (uiElements.dashboardCards.conversionRate) {
        const card = uiElements.dashboardCards.conversionRate;
        const counterElement = card.querySelector('.counter');
        if (counterElement) {
            const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals * 100).toFixed(1) : 0;
            counterElement.textContent = `${conversionRate}%`;
        }
    }
    
    // 평균 거래 규모 카드
    if (uiElements.dashboardCards.avgDealSize) {
        const card = uiElements.dashboardCards.avgDealSize;
        const counterElement = card.querySelector('.counter');
        if (counterElement) {
            const avgSize = totalDeals > 0 ? (totalValue / totalDeals) : 0;
            counterElement.textContent = formatCurrency(avgSize);
        }
    }
}

// HTML 이스케이프
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return unsafe;
    }
    
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 상태 배지 생성
function createStatusBadge(status) {
    const statusColors = {
        'open': 'info',
        'won': 'success',
        'lost': 'danger',
        'pending': 'warning'
    };
    
    const color = statusColors[status] || 'secondary';
    
    return `<span class="badge badge-${color}">${escapeHtml(status)}</span>`;
}

// 디바운스 함수
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// 금액 포맷팅
function formatCurrency(amount) {
    return '₩' + Math.round(amount).toLocaleString();
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 페이지 로드 시 UI 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('UI 모듈이 로드되었습니다.');
    initUI();
}); 