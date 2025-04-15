/**
 * data.js
 * 데이터 관련 기능들을 처리하는 모듈
 * Supabase 연동을 통한 데이터 로드 및 필터링 기능
 */

// 전역 데이터 저장소
const dataStore = {
    allDeals: [],       // 모든 거래 데이터 (원본)
    filteredDeals: [],  // 필터링된 거래 데이터
    isLoading: false,   // 로딩 상태
    hasError: false,    // 오류 상태
    errorMessage: '',   // 오류 메시지
    dateRange: null,    // 선택된 날짜 범위
    statusFilter: null, // 선택된 상태 필터
    sourceFilter: null, // 선택된 소스 필터
    searchQuery: '',    // 검색어
    lastUpdate: null,   // 마지막 업데이트 시간
};

// 데이터 로드 함수
async function loadDealsData() {
    try {
        dataStore.isLoading = true;
        dataStore.hasError = false;
        dataStore.errorMessage = '';
        
        updateUIState();
        
        // Supabase 초기화 확인
        if (!window.supabaseClient) {
            await initSupabase();
        }
        
        const { data, error } = await window.supabaseClient
            .from(appConfig.supabase.tables.deals)
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        // 데이터 변환 및 저장
        dataStore.allDeals = data.map(deal => ({
            ...deal,
            // 날짜 포맷 변환
            created_at: new Date(deal.created_at),
            updated_at: deal.updated_at ? new Date(deal.updated_at) : null,
            // 금액 숫자 변환
            amount: parseFloat(deal.amount || 0)
        }));
        
        // 기본 필터링 적용
        applyAllFilters();
        
        // 마지막 업데이트 시간 기록
        dataStore.lastUpdate = new Date();
        
        // UI 업데이트
        updateDashboardUI();
        
    } catch (err) {
        console.error('데이터 로드 오류:', err);
        dataStore.hasError = true;
        dataStore.errorMessage = err.message || '데이터를 불러오는 중 오류가 발생했습니다.';
        
        // 오류 UI 표시
        showErrorMessage(dataStore.errorMessage);
    } finally {
        dataStore.isLoading = false;
        updateUIState();
    }
}

// 샘플 데이터 생성 함수
function generateSampleDeals() {
    // 실제 스키마에 맞는 샘플 데이터 생성
    const managers = ['김대표', '이사원', '박부장', '최과장', '홍과장'];
    const owners = ['김소유', '이담당', '박책임', '최임원', '정직원'];
    const branches = ['서울본사', '부산지사', '대구지사', '인천지사', '광주지사'];
    const statuses = ['진행중', '성사됨', '실패', '보류'];
    const stages = ['초기상담', '견적제출', '계약검토', '최종협상', '계약완료'];
    const leadTypes = ['직접문의', '소개', '웹사이트', '전화', '이메일', 'SNS'];
    const consulTypes = ['일반상담', '법률자문', '세무상담', '부동산', '기업자문'];
    const bizTypes = ['개인사업자', '법인', '프리랜서', '스타트업', '대기업', '중소기업'];
    const labels = ['중요', '긴급', '장기고객', '신규', 'VIP'];
    const failReasons = ['가격 불만족', '경쟁사 선택', '조건 불일치', '시기 부적절', '연락 두절'];
    const customerReactions = ['매우 만족', '만족', '보통', '불만족', '매우 불만족'];
    const recommenders = ['기존 고객', '직원 소개', '파트너사', '지인', '없음'];
    
    const deals = [];
    console.log('실제 스키마에 맞는 샘플 데이터 생성 시작');
    
    // 최근 24개월에 대한 샘플 데이터 생성
    const today = new Date();
    const startDate = new Date(today.getFullYear() - 2, today.getMonth(), 1); // 2년 전 시작일
    
    // 각 담당자별로 데이터 생성
    managers.forEach(manager => {
        // 각 담당자마다 월별 5-15개의 딜 생성
        for (let m = 0; m < 24; m++) {
            const month = new Date(today.getFullYear(), today.getMonth() - m, 1);
            if (month < startDate) continue;
            
            // 해당 월에 생성할 딜의 수
            const dealsPerMonth = Math.floor(Math.random() * 11) + 5; // 5-15개
            
            for (let i = 0; i < dealsPerMonth; i++) {
                // 해당 월 내 랜덤 날짜
                const day = Math.floor(Math.random() * 28) + 1;
                const dealDate = new Date(month.getFullYear(), month.getMonth(), day);
                
                // 랜덤 상태 선택
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                
                // 랜덤 소유자 및 지점
                const owner = owners[Math.floor(Math.random() * owners.length)];
                const branch = branches[Math.floor(Math.random() * branches.length)];
                
                // 딜 ID 생성
                const dealId = `DEAL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
                
                // 새 리드 여부 (30% 확률로 true)
                const isNew = Math.random() < 0.3;
                
                // 랜덤 전화번호 생성
                const generatePhone = () => {
                    const prefix = ['010', '02', '031', '032', '051'][Math.floor(Math.random() * 5)];
                    const mid = Math.floor(Math.random() * 9000) + 1000;
                    const suffix = Math.floor(Math.random() * 9000) + 1000;
                    return `${prefix}-${mid}-${suffix}`;
                };
                
                // 실패 이유 (상태가 '실패'인 경우만)
                const failReason = status === '실패' ? 
                    failReasons[Math.floor(Math.random() * failReasons.length)] : null;
                
                // 거래 금액 (연간 매출)
                const annualRevenue = (Math.floor(Math.random() * 9000) + 1000) + '만원';
                
                // 딜 객체 생성 (실제 스키마 필드에 맞춤)
                deals.push({
                    deal_id: dealId,
                    lead_type: leadTypes[Math.floor(Math.random() * leadTypes.length)],
                    is_new: isNew,
                    deal_name: `거래 ${dealId}`,
                    phone_work: generatePhone(),
                    phone_home: Math.random() > 0.5 ? generatePhone() : null,
                    phone_mobile: generatePhone(),
                    phone_other: Math.random() > 0.7 ? generatePhone() : null,
                    deal_note: `${manager}님이 담당하는 ${status} 상태의 거래입니다.`,
                    stage: stages[Math.floor(Math.random() * stages.length)],
                    status: status,
                    owner: owner,
                    branch: branch,
                    manager: manager,
                    label: Math.random() > 0.5 ? labels[Math.floor(Math.random() * labels.length)] : null,
                    consult_type: consulTypes[Math.floor(Math.random() * consulTypes.length)],
                    biz_type: bizTypes[Math.floor(Math.random() * bizTypes.length)],
                    annual_revenue: annualRevenue,
                    customer_reaction: status === '성사됨' ? customerReactions[Math.floor(Math.random() * 3)] : 
                                     (status === '실패' ? customerReactions[Math.floor(Math.random() * 2) + 3] : null),
                    recommender: Math.random() > 0.5 ? recommenders[Math.floor(Math.random() * recommenders.length)] : null,
                    fail_reason: failReason,
                    created_at: dealDate.toISOString()
                });
            }
        }
    });
    
    console.log(`실제 스키마에 맞는 샘플 데이터 ${deals.length}개 생성 완료`);
    return deals;
}

// 랜덤 카테고리 생성 함수
function getRandomCategory() {
    const categories = ['SaaS', 'Cloud', 'AI', 'Analytics', 'IoT', 'Finance', '기타', '컨설팅', '교육'];
    return categories[Math.floor(Math.random() * categories.length)];
}

// 랜덤 미래 날짜 생성 함수
function getRandomFutureDate(baseDate, maxDays) {
    const futureDays = Math.floor(Math.random() * maxDays) + 1;
    const futureDate = new Date(baseDate);
    futureDate.setDate(futureDate.getDate() + futureDays);
    return futureDate.toISOString().split('T')[0];
}

// 집계 데이터 로드 함수 (최적화된 버전)
async function loadAggregatedData() {
    try {
        console.log('집계 데이터 로드 시작');
        
        // 차트 및 카드 컨테이너에 로딩 상태 표시
        showLoader();
        
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
            throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
        }
        
        // 1. 전체 레코드 수 조회
        const { count: totalCount, error: countError } = await window.supabaseClient
            .from('deals')
            .select('*', { count: 'exact', head: true });
            
        if (countError) {
            throw countError;
        }
        
        console.log(`전체 거래 수: ${totalCount}건`);
        
        // 2. 상태별 레코드 수 조회
        const promises = [];
        const statusTypes = ['성사됨', '진행중', '실패', '보류'];
        
        for (const status of statusTypes) {
            promises.push(
                window.supabaseClient
                    .from('deals')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', status)
            );
        }
        
        const statusResults = await Promise.all(promises);
        const statusCounts = {};
        
        statusTypes.forEach((status, index) => {
            if (statusResults[index].error) {
                console.error(`${status} 상태 카운트 오류:`, statusResults[index].error);
                statusCounts[status] = 0;
            } else {
                statusCounts[status] = statusResults[index].count || 0;
            }
        });
        
        console.log('상태별 거래 수:', statusCounts);
        
        // 3. 최근 N개월 월별 거래 수 (샘플 12개월)
        const monthsToShow = 12;
        const monthlyDeals = [];
        
        for (let i = 0; i < monthsToShow; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const { count, error } = await window.supabaseClient
                .from('deals')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfMonth.toISOString())
                .lte('created_at', endOfMonth.toISOString());
                
            if (error) {
                console.error(`${startOfMonth.toISOString()} 월별 집계 오류:`, error);
                monthlyDeals.push({ month: formatYearMonth(startOfMonth), count: 0 });
            } else {
                monthlyDeals.push({ 
                    month: formatYearMonth(startOfMonth), 
                    count: count || 0,
                    monthDate: new Date(startOfMonth)
                });
            }
        }
        
        console.log('월별 거래 수:', monthlyDeals);
        
        // 4. 성사된 거래 비율 계산
        const conversionRate = totalCount > 0 ? ((statusCounts['성사됨'] || 0) / totalCount * 100).toFixed(1) : '0.0';
        console.log(`전환율: ${conversionRate}%`);
        
        // 5. 담당자별 집계 (30명 이내의 담당자만 조회)
        const { data: managersData, error: managersError } = await window.supabaseClient
            .from('deals')
            .select('manager')
            .limit(1000);
            
        if (managersError) {
            throw managersError;
        }
        
        // 고유 담당자 추출
        const uniqueManagers = [...new Set(managersData.map(item => item.manager).filter(Boolean))];
        console.log('담당자 목록:', uniqueManagers);

        // 필터 드롭다운 업데이트 추가
        populateFilterDropdowns(uniqueManagers, statusTypes);
        
        // 각 담당자별 전환율 계산
        const managerStats = [];
        
        for (const manager of uniqueManagers.slice(0, 30)) { // 최대 30명까지만
            const { count: managerTotal } = await window.supabaseClient
                .from('deals')
                .select('*', { count: 'exact', head: true })
                .eq('manager', manager);
                
            const { count: managerSuccess } = await window.supabaseClient
                .from('deals')
                .select('*', { count: 'exact', head: true })
                .eq('manager', manager)
                .eq('status', '성사됨');
                
            managerStats.push({
                manager: manager,
                total: managerTotal || 0,
                success: managerSuccess || 0,
                rate: managerTotal > 0 ? ((managerSuccess / managerTotal) * 100).toFixed(1) : '0.0'
            });
        }
        
        console.log('담당자별 통계:', managerStats);
        
        // 6. 월별 담당자별 분석 데이터 구조 만들기
        const managerMonthlyData = [];
        
        // 데이터를 UI 업데이트 함수로 전달
        updateDashboardFromAggregatedData({
            totalCount,
            statusCounts,
            monthlyDeals,
            conversionRate,
            managerStats
        });
        
        // 차트 업데이트
        updateChartsFromAggregatedData({
            monthlyDeals,
            statusCounts,
            managerStats
        });
        
        return {
            totalCount,
            statusCounts,
            monthlyDeals,
            conversionRate,
            managerStats
        };
    } catch (error) {
        console.error('집계 데이터 로드 오류:', error);
        showError(`데이터 집계 오류: ${error.message || '알 수 없는 오류'}`);
        return null;
    } finally {
        hideLoader();
    }
}

// 필터 드롭다운 메뉴 업데이트
function populateFilterDropdowns(managers, statuses) {
    try {
        // 담당자 필터 드롭다운 업데이트
        const ownerFilter = document.getElementById('ownerFilter');
        if (ownerFilter) {
            // 기존 옵션 초기화 (첫 번째 '전체' 옵션 유지)
            while (ownerFilter.options.length > 1) {
                ownerFilter.remove(1);
            }
            
            // 담당자 옵션 추가
            managers.forEach(manager => {
                if (manager) {
                    const option = document.createElement('option');
                    option.value = manager;
                    option.textContent = manager;
                    ownerFilter.appendChild(option);
                }
            });
            
            console.log(`담당자 필터가 ${managers.length}명의 담당자로 업데이트되었습니다.`);
            
            // 필터 변경 시 이벤트 리스너 추가
            if (!ownerFilter.hasListener) {
                ownerFilter.addEventListener('change', function() {
                    // 필터가 변경되면 첫 페이지부터 다시 로드
                    loadSampleDealsForTable(1, 20);
                });
                ownerFilter.hasListener = true;
            }
        } else {
            console.warn('담당자 필터 요소를 찾을 수 없습니다.');
        }
        
        // 상태 필터 드롭다운 업데이트
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            // 기존 옵션 초기화 (첫 번째 '전체' 옵션 유지)
            while (statusFilter.options.length > 1) {
                statusFilter.remove(1);
            }
            
            // 상태 옵션 추가
            statuses.forEach(status => {
                if (status) {
                    const option = document.createElement('option');
                    option.value = status;
                    option.textContent = status;
                    statusFilter.appendChild(option);
                }
            });
            
            console.log(`상태 필터가 ${statuses.length}개의 상태로 업데이트되었습니다.`);
            
            // 필터 변경 시 이벤트 리스너 추가
            if (!statusFilter.hasListener) {
                statusFilter.addEventListener('change', function() {
                    // 필터가 변경되면 첫 페이지부터 다시 로드
                    loadSampleDealsForTable(1, 20);
                });
                statusFilter.hasListener = true;
            }
        } else {
            console.warn('상태 필터 요소를 찾을 수 없습니다.');
        }
        
        // 날짜 범위 필터에도 이벤트 리스너 추가
        const dateFilter = document.getElementById('dateRangeFilter');
        if (dateFilter && !dateFilter.hasListener) {
            dateFilter.addEventListener('change', function() {
                // 필터가 변경되면 첫 페이지부터 다시 로드
                loadSampleDealsForTable(1, 20);
            });
            dateFilter.hasListener = true;
        }
        
        // 검색창 이벤트 리스너 추가
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput && !searchInput.hasListener) {
            // 검색어 입력 시 디바운스 적용 (300ms)
            searchInput.addEventListener('input', debounce(function() {
                loadSampleDealsForTable(1, 20);
            }, 300));
            searchInput.hasListener = true;
        }
        
        if (searchBtn && !searchBtn.hasListener) {
            searchBtn.addEventListener('click', function() {
                loadSampleDealsForTable(1, 20);
            });
            searchBtn.hasListener = true;
        }
    } catch (err) {
        console.error('필터 드롭다운 업데이트 오류:', err);
    }
}

// 테이블 표시용으로 적은 수의 샘플 데이터만 로드 (페이지네이션 추가)
async function loadSampleDealsForTable(page = 1, limit = 20) {
    try {
        const offset = (page - 1) * limit;
        
        // 총 레코드 수 먼저 조회 (페이지네이션용)
        const { count: totalCount, error: countError } = await window.supabaseClient
            .from('deals')
            .select('*', { count: 'exact', head: true });
            
        if (countError) throw countError;
        
        // 페이지 데이터 조회
        const { data, error } = await window.supabaseClient
            .from('deals')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
            
        if (error) throw error;
        
        if (data && data.length > 0) {
            // 테이블 및 페이지네이션 업데이트
            updateDealsTable(data, page, limit, totalCount);
            return { data, totalCount };
        } else {
            console.log('표시할 거래 데이터가 없습니다');
            updateDealsTable([], page, limit, 0);
            return { data: [], totalCount: 0 };
        }
    } catch (err) {
        console.error('샘플 거래 데이터 로드 오류:', err);
        showError(`거래 목록 로드 오류: ${err.message}`);
        updateDealsTable([], 1, limit, 0);
        return { data: [], totalCount: 0 };
    }
}

// 거래 테이블 업데이트 (페이지네이션 포함)
function updateDealsTable(deals, currentPage = 1, limit = 20, totalCount = 0) {
    const tableBody = document.getElementById('deals-table-body');
    const noDealsMessage = document.getElementById('no-deals-message');
    const paginationContainer = document.getElementById('deals-pagination');
    
    if (!tableBody) {
        console.error('거래 테이블의 tbody 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 테이블 초기화
    tableBody.innerHTML = '';
    
    // 데이터가 없는 경우 메시지 표시
    if (!deals || deals.length === 0) {
        if (noDealsMessage) {
            noDealsMessage.style.display = 'block';
        }
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        return;
    }
    
    // 메시지 숨기기
    if (noDealsMessage) {
        noDealsMessage.style.display = 'none';
    }
    
    // 테이블 행 생성
    deals.forEach(deal => {
        const row = document.createElement('tr');
        
        // 주의: 필드명이 실제 데이터와 일치해야 함
        row.innerHTML = `
            <td>${deal.deal_id || ''}</td>
            <td>${escapeHtml(deal.deal_name || '')}</td>
            <td>${escapeHtml(deal.manager || '')}</td>
            <td>${formatCurrency(deal.annual_revenue || 0)}</td>
            <td><span class="badge badge-${getStatusBadgeClass(deal.status)}">${escapeHtml(deal.status || '')}</span></td>
            <td>${escapeHtml(deal.lead_type || '')}</td>
            <td>${formatDate(deal.created_at || new Date())}</td>
            <td>
                <button class="btn btn-sm btn-outline-info view-deal" data-id="${deal.deal_id || ''}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        // 상세 보기 버튼 클릭 이벤트
        const viewButton = row.querySelector('.view-deal');
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                viewDealDetails(deal.deal_id);
            });
        }
        
        tableBody.appendChild(row);
    });
    
    // 페이지네이션 생성
    if (paginationContainer) {
        createPagination(paginationContainer, currentPage, limit, totalCount);
    } else {
        console.warn('페이지네이션 컨테이너를 찾을 수 없습니다.');
        
        // 페이지네이션 컨테이너 동적 생성
        const tableContainer = document.querySelector('.table-responsive');
        if (tableContainer) {
            const newPaginationContainer = document.createElement('div');
            newPaginationContainer.id = 'deals-pagination';
            newPaginationContainer.className = 'pagination-container d-flex justify-content-center mt-3';
            tableContainer.appendChild(newPaginationContainer);
            
            createPagination(newPaginationContainer, currentPage, limit, totalCount);
        }
    }
}

// 상태에 따른 배지 클래스 반환
function getStatusBadgeClass(status) {
    const statusMap = {
        '성사됨': 'success',
        '진행중': 'primary',
        '실패': 'danger',
        '보류': 'warning',
        'won': 'success',
        'active': 'primary',
        'lost': 'danger',
        'pending': 'warning'
    };
    
    return statusMap[status] || 'secondary';
}

// 페이지네이션 생성
function createPagination(container, currentPage, limit, totalCount) {
    container.innerHTML = '';
    
    if (totalCount <= 0) return;
    
    const totalPages = Math.ceil(totalCount / limit);
    const paginationNav = document.createElement('nav');
    paginationNav.setAttribute('aria-label', '거래 목록 페이지네이션');
    
    const pageList = document.createElement('ul');
    pageList.className = 'pagination';
    
    // 이전 페이지 버튼
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.innerHTML = '&laquo;';
    prevLink.setAttribute('aria-label', '이전');
    
    if (currentPage > 1) {
        prevLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadSampleDealsForTable(currentPage - 1, limit);
        });
    }
    
    prevItem.appendChild(prevLink);
    pageList.appendChild(prevItem);
    
    // 페이지 숫자 버튼
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // 첫 페이지 버튼 (시작 페이지가 1보다 크면 표시)
    if (startPage > 1) {
        const firstPageItem = document.createElement('li');
        firstPageItem.className = 'page-item';
        
        const firstPageLink = document.createElement('a');
        firstPageLink.className = 'page-link';
        firstPageLink.href = '#';
        firstPageLink.textContent = '1';
        
        firstPageLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadSampleDealsForTable(1, limit);
        });
        
        firstPageItem.appendChild(firstPageLink);
        pageList.appendChild(firstPageItem);
        
        // 시작 페이지가 2보다 크면 생략 표시
        if (startPage > 2) {
            const ellipsisItem = document.createElement('li');
            ellipsisItem.className = 'page-item disabled';
            
            const ellipsisLink = document.createElement('a');
            ellipsisLink.className = 'page-link';
            ellipsisLink.href = '#';
            ellipsisLink.textContent = '...';
            
            ellipsisItem.appendChild(ellipsisLink);
            pageList.appendChild(ellipsisItem);
        }
    }
    
    // 페이지 번호 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        
        if (i !== currentPage) {
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadSampleDealsForTable(i, limit);
            });
        }
        
        pageItem.appendChild(pageLink);
        pageList.appendChild(pageItem);
    }
    
    // 마지막 페이지 버튼 (끝 페이지가 총 페이지 수보다 작으면 표시)
    if (endPage < totalPages) {
        // 끝 페이지가 총 페이지 수 - 1보다 작으면 생략 표시
        if (endPage < totalPages - 1) {
            const ellipsisItem = document.createElement('li');
            ellipsisItem.className = 'page-item disabled';
            
            const ellipsisLink = document.createElement('a');
            ellipsisLink.className = 'page-link';
            ellipsisLink.href = '#';
            ellipsisLink.textContent = '...';
            
            ellipsisItem.appendChild(ellipsisLink);
            pageList.appendChild(ellipsisItem);
        }
        
        const lastPageItem = document.createElement('li');
        lastPageItem.className = 'page-item';
        
        const lastPageLink = document.createElement('a');
        lastPageLink.className = 'page-link';
        lastPageLink.href = '#';
        lastPageLink.textContent = totalPages;
        
        lastPageLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadSampleDealsForTable(totalPages, limit);
        });
        
        lastPageItem.appendChild(lastPageLink);
        pageList.appendChild(lastPageItem);
    }
    
    // 다음 페이지 버튼
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.innerHTML = '&raquo;';
    nextLink.setAttribute('aria-label', '다음');
    
    if (currentPage < totalPages) {
        nextLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadSampleDealsForTable(currentPage + 1, limit);
        });
    }
    
    nextItem.appendChild(nextLink);
    pageList.appendChild(nextItem);
    
    paginationNav.appendChild(pageList);
    container.appendChild(paginationNav);
    
    // 페이지네이션 정보 추가
    const paginationInfo = document.createElement('div');
    paginationInfo.className = 'mt-2 text-center text-muted small';
    paginationInfo.textContent = `전체 ${totalCount}건 중 ${(currentPage - 1) * limit + 1}-${Math.min(currentPage * limit, totalCount)}건 표시`;
    container.appendChild(paginationInfo);
}

// 연-월 형식 포맷팅 (YYYY-MM)
function formatYearMonth(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// UI 카드 및 테이블 업데이트 (집계 데이터 사용)
function updateDashboardFromAggregatedData(aggregatedData) {
    try {
        const { totalCount, statusCounts, monthlyDeals, conversionRate, managerStats } = aggregatedData;
        
        // 1. 대시보드 카드 업데이트
        // 총 거래 수
        const totalDealsCounter = document.querySelector('#total-deals-card .counter');
        if (totalDealsCounter) {
            totalDealsCounter.textContent = totalCount.toLocaleString();
        }
        
        // 전환율
        const conversionRateCounter = document.querySelector('#conversion-rate-card .counter');
        if (conversionRateCounter) {
            conversionRateCounter.textContent = `${conversionRate}%`;
        }
        
        // 2. 월별 담당자 테이블 업데이트 (샘플)
        const tableBody = document.querySelector('#dailyOwnerStatsTable tbody');
        if (tableBody) {
            tableBody.innerHTML = ''; // 테이블 초기화
            
            // 관리자별 행 추가
            managerStats.forEach(managerData => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${managerData.manager}</td>
                    <td>${managerData.total}</td>
                    <td>${managerData.success}</td>
                    <td>${managerData.rate}%</td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        // 3. 추가 UI 업데이트 가능...
        
        console.log('대시보드 UI가 집계 데이터로 업데이트되었습니다');
    } catch (err) {
        console.error('집계 데이터로 UI 업데이트 오류:', err);
    }
}

// 차트 업데이트 (집계 데이터 사용)
function updateChartsFromAggregatedData(aggregatedData) {
    try {
        const { monthlyDeals, statusCounts } = aggregatedData;
        
        // 전환율 차트 업데이트
        const conversionRateChart = document.getElementById('conversionRateChart');
        if (conversionRateChart) {
            // 차트 데이터 준비
            const months = monthlyDeals.map(item => item.month).reverse();
            const monthlyCounts = monthlyDeals.map(item => item.count).reverse();
            
            // 성공 거래 데이터 (샘플, 실제로는 월별 집계 필요)
            const monthlySuccessCounts = monthlyCounts.map(count => 
                Math.round(count * (Math.random() * 0.3 + 0.2))
            );
            
            // 전환율 계산
            const conversionRates = monthlyCounts.map((total, idx) => 
                total > 0 ? (monthlySuccessCounts[idx] / total * 100) : 0
            );
            
            // 새 차트 생성
            if (window.conversionRateChart instanceof Chart) {
                window.conversionRateChart.destroy();
            }
            
            window.conversionRateChart = new Chart(conversionRateChart, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: '총 리드 수',
                            data: monthlyCounts,
                            backgroundColor: 'rgba(74, 144, 226, 0.1)',
                            borderColor: '#4a90e2',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.1,
                            yAxisID: 'y'
                        },
                        {
                            label: '성사된 딜 수',
                            data: monthlySuccessCounts,
                            backgroundColor: 'rgba(80, 200, 120, 0.1)',
                            borderColor: '#50c878',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.1,
                            yAxisID: 'y'
                        },
                        {
                            label: '전환율 (%)',
                            data: conversionRates,
                            backgroundColor: 'rgba(243, 156, 18, 0.1)',
                            borderColor: '#f39c12',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.1,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        },
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: '월'
                            }
                        },
                        y: {
                            position: 'left',
                            title: {
                                display: true,
                                text: '건수'
                            },
                            beginAtZero: true
                        },
                        y1: {
                            position: 'right',
                            title: {
                                display: true,
                                text: '전환율 (%)'
                            },
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                drawOnChartArea: false
                            }
                        }
                    }
                }
            });
        }
        
        console.log('차트가 집계 데이터로 업데이트되었습니다');
    } catch (err) {
        console.error('차트 업데이트 오류:', err);
    }
}

// 기존 loadData 함수를 집계 데이터 로드 함수로 대체 (원본 함수는 보존)
async function loadData(forceRefresh = false) {
    try {
        console.log('데이터 로드 시작 (최적화된 방식)');
        
        // 집계 데이터를 사용한 최적화된 로드
        await loadAggregatedData();
        
        // 필요한 경우 샘플 거래 목록 로드 (한정된 개수만)
        await loadSampleDealsForTable(1, 20);
        
        console.log('데이터 로드 및 차트 업데이트 완료 (최적화됨)');
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        showError(`데이터 로드 오류: ${error.message}`);
    }
}

// 거래 상세 보기
async function viewDealDetails(dealId) {
    try {
        showLoader();
        
        console.log('거래 상세 정보 조회 중:', dealId);
        
        // Supabase 클라이언트 확인
        if (!window.supabaseClient) {
            console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
            throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
        }
        
        // Supabase에서 거래 정보 직접 가져오기
        const { data, error } = await window.supabaseClient
            .from('deals')
            .select('*')
            .eq('deal_id', dealId)
            .single();
            
        if (error) {
            throw error;
        }
        
        if (!data) {
            showError('거래 정보를 찾을 수 없습니다.');
            return;
        }
        
        console.log('거래 상세 정보:', data);
        
        // 기존 모달이 있으면 제거
        const existingModal = document.getElementById('dealDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 모달 HTML 생성
        const modalHTML = `
            <div class="modal fade" id="dealDetailsModal" tabindex="-1" role="dialog" aria-labelledby="dealDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="dealDetailsModalLabel">거래 상세 정보: ${escapeHtml(data.deal_name || '')}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>ID:</strong> ${data.deal_id || ''}</p>
                                    <p><strong>이름:</strong> ${escapeHtml(data.deal_name || '')}</p>
                                    <p><strong>담당자:</strong> ${escapeHtml(data.manager || '')}</p>
                                    <p><strong>금액:</strong> ${data.annual_revenue || '정보 없음'}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>상태:</strong> <span class="badge badge-${getStatusBadgeClass(data.status)}">${escapeHtml(data.status || '')}</span></p>
                                    <p><strong>리드 유형:</strong> ${escapeHtml(data.lead_type || '정보 없음')}</p>
                                    <p><strong>생성일:</strong> ${formatDate(data.created_at)}</p>
                                    <p><strong>스테이지:</strong> ${escapeHtml(data.stage || '정보 없음')}</p>
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-md-12">
                                    <h6>연락처 정보:</h6>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <p><strong>업무:</strong> ${escapeHtml(data.phone_work || '정보 없음')}</p>
                                            <p><strong>자택:</strong> ${escapeHtml(data.phone_home || '정보 없음')}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <p><strong>휴대폰:</strong> ${escapeHtml(data.phone_mobile || '정보 없음')}</p>
                                            <p><strong>기타:</strong> ${escapeHtml(data.phone_other || '정보 없음')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-12">
                                    <h6>비고:</h6>
                                    <p>${escapeHtml(data.deal_note || '정보 없음')}</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">닫기</button>
                            <button type="button" class="btn btn-primary" id="edit-deal-btn">수정</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 모달 DOM에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // jQuery로 모달 표시
        $('#dealDetailsModal').modal('show');
        
        // 수정 버튼 이벤트 리스너 추가
        const editButton = document.getElementById('edit-deal-btn');
        if (editButton) {
            editButton.addEventListener('click', () => {
                $('#dealDetailsModal').modal('hide');
                alert(`거래 ID ${dealId}의 수정 기능은 개발 중입니다.`);
            });
        }
        
    } catch (error) {
        console.error('거래 상세 정보 조회 오류:', error);
        showError('거래 상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
        hideLoader();
    }
}

// 거래 수정 함수 (임시)
function editDeal(dealId) {
    alert(`거래 ID ${dealId}의 수정 기능은 개발 중입니다.`);
}

// 상태에 따른 배지 클래스 반환
function getStatusClass(status) {
    switch(status) {
        case '성사됨':
            return 'bg-success';
        case '진행중':
            return 'bg-primary';
        case '실패':
            return 'bg-danger';
        case '보류':
            return 'bg-warning';
        default:
            return 'bg-secondary';
    }
}

// 대시보드 통계 업데이트
function updateDashboardStats() {
    // 전체 거래 수
    const totalDeals = dataStore.filteredDeals.length;
    
    // 전체 금액
    const totalValue = dataStore.filteredDeals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0);
    
    // 성사된 거래 수
    const wonDeals = dataStore.filteredDeals.filter(deal => deal.status === '성사됨').length;
    
    // 통계 객체
    const stats = {
        totalDeals: totalDeals,
        totalValue: totalValue,
        wonDeals: wonDeals
    };
    
    // 대시보드 카드 업데이트
    updateDashboardCards(stats);
    
    // 차트 업데이트 (차트 모듈에 구현)
    if (typeof updateCharts === 'function') {
        updateCharts(dataStore.filteredDeals);
    }
}

// 데이터 모듈 초기화
async function initData() {
    console.log('데이터 모듈 초기화 시작');
    
    // 데이터 로드
    await loadDeals();
    
    console.log('데이터 모듈 초기화 완료');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    console.log('데이터 모듈이 로드되었습니다.');
    await initData();
});

// 전역으로 loadData 함수 노출
window.loadData = loadData;

// 로딩 표시
function showLoader() {
    const loader = document.getElementById('loader');
    const loaderOverlay = document.getElementById('loader-overlay');
    
    if (loader) {
        loader.style.display = 'flex';
    }
    
    if (loaderOverlay) {
        loaderOverlay.style.display = 'block';
    }
}

// 로딩 숨기기
function hideLoader() {
    const loader = document.getElementById('loader');
    const loaderOverlay = document.getElementById('loader-overlay');
    
    if (loader) {
        loader.style.display = 'none';
    }
    
    if (loaderOverlay) {
        loaderOverlay.style.display = 'none';
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
        errorToast.style.position = 'fixed';
        errorToast.style.top = '15px';
        errorToast.style.right = '15px';
        errorToast.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        errorToast.style.color = 'white';
        errorToast.style.padding = '10px 15px';
        errorToast.style.borderRadius = '4px';
        errorToast.style.zIndex = '9999';
        errorToast.style.maxWidth = '350px';
        errorToast.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
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